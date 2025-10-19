from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId
import random
import string

bp = Blueprint('divorces', __name__, url_prefix='/api/divorces')

class CertificateGenerator:
    @staticmethod
    def generate_certificate_number(record_type, region, woreda_code, year=None):
        if not year:
            gregorian_year = datetime.now().year
            ethiopian_year = gregorian_year - 8
            year = str(ethiopian_year)
        
        sequence = str(random.randint(1, 99999)).zfill(5)
        
        type_map = {
            'birth': 'BR',
            'death': 'DR', 
            'marriage': 'MR',
            'divorce': 'DV'
        }
        
        return f"{type_map.get(record_type, 'XX')}/{region}/{woreda_code.zfill(2)}/{year}/{sequence}"

    @staticmethod
    def convert_to_ethiopian_date(gregorian_date):
        try:
            eth_year = gregorian_date.year - 8
            eth_month = gregorian_date.month
            eth_day = gregorian_date.day
            
            ethiopian_months = [
                'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
                'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'
            ]
            
            if 1 <= eth_month <= 13:
                month_name = ethiopian_months[eth_month - 1]
            else:
                month_name = 'Unknown'
                
            return f"{eth_year} {month_name} {eth_day}"
        except:
            return ""

def find_user_by_id(db, user_id):
    return db.users.find_one({'_id': ObjectId(user_id)})

@bp.route('/', methods=['POST'])
@jwt_required()
def create_divorce_record():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        db = current_app.db  # Get db from current_app
        
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        certificate_number = CertificateGenerator.generate_certificate_number(
            'divorce', 
            current_user.get('region', 'AD'), 
            current_user.get('woreda', '01')
        )
        
        # Calculate marriage duration
        marriage_duration = None
        if data.get('original_marriage_date') and data.get('divorce_date'):
            try:
                marriage_date = datetime.strptime(data['original_marriage_date'], '%Y-%m-%d')
                divorce_date = datetime.strptime(data['divorce_date'], '%Y-%m-%d')
                marriage_duration = divorce_date.year - marriage_date.year
                if (divorce_date.month, divorce_date.day) < (marriage_date.month, marriage_date.day):
                    marriage_duration -= 1
            except:
                pass
        
        divorce_data = {
            'certificate_number': certificate_number,
            
            # Divorce Information
            'divorce_date': data['divorce_date'],
            'divorce_case_number': data.get('divorce_case_number'),
            'divorce_type': data.get('divorce_type', 'court'),
            'divorce_region': data.get('divorce_region', current_user.get('region')),
            'divorce_zone': data.get('divorce_zone', current_user.get('zone')),
            'divorce_woreda': data.get('divorce_woreda', current_user.get('woreda')),
            
            # Court Information
            'court_name': data.get('court_name'),
            'court_case_number': data.get('court_case_number'),
            'judge_name': data.get('judge_name'),
            'decree_absolute_date': data.get('decree_absolute_date'),
            'divorce_reasons': data.get('divorce_reasons'),
            
            # Spouse 1 Information
            'spouse1_full_name': data['spouse1_full_name'],
            'spouse1_father_name': data.get('spouse1_father_name'),
            'spouse1_id_number': data['spouse1_id_number'],
            'spouse1_address': data.get('spouse1_address'),
            'spouse1_phone': data.get('spouse1_phone'),
            'spouse1_grounds_for_divorce': data.get('spouse1_grounds_for_divorce'),
            
            # Spouse 2 Information
            'spouse2_full_name': data['spouse2_full_name'],
            'spouse2_father_name': data.get('spouse2_father_name'),
            'spouse2_id_number': data['spouse2_id_number'],
            'spouse2_address': data.get('spouse2_address'),
            'spouse2_phone': data.get('spouse2_phone'),
            'spouse2_grounds_for_divorce': data.get('spouse2_grounds_for_divorce'),
            
            # Marriage Information
            'original_marriage_date': data.get('original_marriage_date'),
            'original_marriage_certificate_number': data.get('original_marriage_certificate_number'),
            'marriage_duration_years': marriage_duration,
            
            # Children Information
            'number_of_children': data.get('number_of_children', 0),
            'child_custody_details': data.get('child_custody_details'),
            'child_support_arrangements': data.get('child_support_arrangements'),
            'property_settlement': data.get('property_settlement'),
            
            # System
            'registered_by': current_user_id,
            'status': 'draft',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Add Ethiopian date
        if data.get('divorce_date'):
            try:
                gregorian_date = datetime.strptime(data['divorce_date'], '%Y-%m-%d').date()
                divorce_data['ethiopian_divorce_date'] = CertificateGenerator.convert_to_ethiopian_date(gregorian_date)
            except:
                pass
        
        result = db.divorce_records.insert_one(divorce_data)
        
        return jsonify({
            'message': 'Divorce record created successfully',
            'divorce_id': str(result.inserted_id),
            'certificate_number': certificate_number
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['GET'])
@jwt_required()
def get_divorce_records():
    try:
        current_user_id = get_jwt_identity()
        
        db = current_app.db  # Get db from current_app
        
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        filters = {}
        if current_user['role'] in ['vms_officer', 'statistician']:
            if current_user.get('region'):
                filters['divorce_region'] = current_user['region']
            if current_user.get('woreda'):
                filters['divorce_woreda'] = current_user['woreda']
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        skip = (page - 1) * per_page
        records = list(db.divorce_records.find(filters).sort('created_at', -1).skip(skip).limit(per_page))
        total = db.divorce_records.count_documents(filters)
        
        records_data = []
        for record in records:
            registrar = find_user_by_id(db, record['registered_by']) if record.get('registered_by') else None
            
            records_data.append({
                'divorce_id': str(record['_id']),
                'certificate_number': record['certificate_number'],
                'spouse1_full_name': record['spouse1_full_name'],
                'spouse2_full_name': record['spouse2_full_name'],
                'divorce_date': record['divorce_date'],
                'court_name': record.get('court_name'),
                'divorce_region': record.get('divorce_region'),
                'divorce_woreda': record.get('divorce_woreda'),
                'status': record.get('status', 'draft'),
                'registration_date': record.get('created_at').isoformat() if record.get('created_at') else None,
                'registered_by_name': registrar['full_name'] if registrar else None
            })
        
        return jsonify({
            'divorce_records': records_data,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:divorce_id>', methods=['GET'])
@jwt_required()
def get_divorce_record(divorce_id):
    try:
        db = current_app.db  # Get db from current_app
        
        divorce_record = db.divorce_records.find_one({'_id': ObjectId(divorce_id)})
        if not divorce_record:
            return jsonify({'error': 'Divorce record not found'}), 404
        
        current_user_id = get_jwt_identity()
        current_user = find_user_by_id(db, current_user_id)
        
        if current_user['role'] not in ['admin'] and divorce_record.get('divorce_region') != current_user.get('region'):
            return jsonify({'error': 'Permission denied'}), 403
        
        registrar = find_user_by_id(db, divorce_record['registered_by']) if divorce_record.get('registered_by') else None
        approver = find_user_by_id(db, divorce_record['approved_by']) if divorce_record.get('approved_by') else None
        
        record_data = {
            'divorce_id': str(divorce_record['_id']),
            'certificate_number': divorce_record['certificate_number'],
            **divorce_record
        }
        
        record_data.pop('_id', None)
        record_data['registered_by_name'] = registrar['full_name'] if registrar else None
        record_data['approved_by_name'] = approver['full_name'] if approver else None
        
        return jsonify(record_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:divorce_id>', methods=['PUT'])
@jwt_required()
def update_divorce_record(divorce_id):
    try:
        current_user_id = get_jwt_identity()
        db = current_app.db  # Get db from current_app
        
        divorce_record = db.divorce_records.find_one({'_id': ObjectId(divorce_id)})
        if not divorce_record:
            return jsonify({'error': 'Divorce record not found'}), 404
        
        # Check permissions
        if divorce_record['registered_by'] != current_user_id:
            current_user = find_user_by_id(db, current_user_id)
            if current_user['role'] != 'admin':
                return jsonify({'error': 'Permission denied'}), 403
        
        data = request.get_json()
        
        # Update fields
        updatable_fields = [
            'divorce_date', 'divorce_case_number', 'divorce_type', 'divorce_region', 'divorce_zone', 
            'divorce_woreda', 'court_name', 'court_case_number', 'judge_name', 'decree_absolute_date', 
            'divorce_reasons', 'spouse1_full_name', 'spouse1_father_name', 'spouse1_id_number', 
            'spouse1_address', 'spouse1_phone', 'spouse1_grounds_for_divorce', 'spouse2_full_name', 
            'spouse2_father_name', 'spouse2_id_number', 'spouse2_address', 'spouse2_phone', 
            'spouse2_grounds_for_divorce', 'original_marriage_date', 'original_marriage_certificate_number', 
            'number_of_children', 'child_custody_details', 'child_support_arrangements', 'property_settlement'
        ]
        
        update_data = {}
        for field in updatable_fields:
            if field in data:
                update_data[field] = data[field]
        
        # Recalculate marriage duration if dates changed
        if 'original_marriage_date' in data or 'divorce_date' in data:
            marriage_date = data.get('original_marriage_date') or divorce_record.get('original_marriage_date')
            divorce_date = data.get('divorce_date') or divorce_record.get('divorce_date')
            if marriage_date and divorce_date:
                try:
                    marriage_dt = datetime.strptime(marriage_date, '%Y-%m-%d')
                    divorce_dt = datetime.strptime(divorce_date, '%Y-%m-%d')
                    duration = divorce_dt.year - marriage_dt.year
                    if (divorce_dt.month, divorce_dt.day) < (marriage_dt.month, marriage_dt.day):
                        duration -= 1
                    update_data['marriage_duration_years'] = duration
                except:
                    pass
        
        # Update Ethiopian date if divorce date changed
        if 'divorce_date' in data:
            try:
                gregorian_date = datetime.strptime(data['divorce_date'], '%Y-%m-%d').date()
                update_data['ethiopian_divorce_date'] = CertificateGenerator.convert_to_ethiopian_date(gregorian_date)
            except:
                pass
        
        update_data['updated_at'] = datetime.utcnow()
        
        db.divorce_records.update_one(
            {'_id': ObjectId(divorce_id)},
            {'$set': update_data}
        )
        
        return jsonify({'message': 'Divorce record updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:divorce_id>/status', methods=['PUT'])
@jwt_required()
def update_divorce_record_status(divorce_id):
    try:
        current_user_id = get_jwt_identity()
        db = current_app.db  # Get db from current_app
        
        current_user = find_user_by_id(db, current_user_id)
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['draft', 'submitted', 'approved', 'rejected']:
            return jsonify({'error': 'Invalid status'}), 400
        
        update_data = {'status': new_status, 'updated_at': datetime.utcnow()}
        
        if new_status == 'approved':
            if current_user['role'] not in ['admin', 'vms_officer']:
                return jsonify({'error': 'Only admin or VMS officer can approve records'}), 403
            update_data['approved_by'] = current_user_id
        
        result = db.divorce_records.update_one(
            {'_id': ObjectId(divorce_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Divorce record not found'}), 404
        
        return jsonify({'message': f'Divorce record status updated to {new_status}'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500