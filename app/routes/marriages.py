from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId
import random
import string

bp = Blueprint('marriages', __name__, url_prefix='/api/marriages')

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
def create_marriage_record():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        db = current_app.db  # Get db from current_app
        
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        certificate_number = CertificateGenerator.generate_certificate_number(
            'marriage', 
            current_user.get('region', 'AD'), 
            current_user.get('woreda', '01')
        )
        
        # Calculate ages at marriage
        spouse1_age = None
        spouse2_age = None
        if data.get('spouse1_date_of_birth') and data.get('marriage_date'):
            try:
                birth_date = datetime.strptime(data['spouse1_date_of_birth'], '%Y-%m-%d')
                marriage_date = datetime.strptime(data['marriage_date'], '%Y-%m-%d')
                spouse1_age = marriage_date.year - birth_date.year
                if (marriage_date.month, marriage_date.day) < (birth_date.month, birth_date.day):
                    spouse1_age -= 1
            except:
                pass
        
        if data.get('spouse2_date_of_birth') and data.get('marriage_date'):
            try:
                birth_date = datetime.strptime(data['spouse2_date_of_birth'], '%Y-%m-%d')
                marriage_date = datetime.strptime(data['marriage_date'], '%Y-%m-%d')
                spouse2_age = marriage_date.year - birth_date.year
                if (marriage_date.month, marriage_date.day) < (birth_date.month, birth_date.day):
                    spouse2_age -= 1
            except:
                pass
        
        marriage_data = {
            'certificate_number': certificate_number,
            
            # Marriage Information
            'marriage_date': data['marriage_date'],
            'marriage_place': data.get('marriage_place'),
            'marriage_type': data.get('marriage_type', 'civil'),
            'marriage_region': data.get('marriage_region', current_user.get('region')),
            'marriage_zone': data.get('marriage_zone', current_user.get('zone')),
            'marriage_woreda': data.get('marriage_woreda', current_user.get('woreda')),
            'marriage_kebele': data.get('marriage_kebele', current_user.get('kebele')),
            
            # Spouse 1 Information
            'spouse1_full_name': data['spouse1_full_name'],
            'spouse1_father_name': data.get('spouse1_father_name'),
            'spouse1_grandfather_name': data.get('spouse1_grandfather_name'),
            'spouse1_nationality': data.get('spouse1_nationality', 'Ethiopian'),
            'spouse1_ethnicity': data.get('spouse1_ethnicity'),
            'spouse1_religion': data.get('spouse1_religion'),
            'spouse1_date_of_birth': data.get('spouse1_date_of_birth'),
            'spouse1_age_at_marriage': spouse1_age,
            'spouse1_previous_marital_status': data.get('spouse1_previous_marital_status', 'single'),
            'spouse1_occupation': data.get('spouse1_occupation'),
            'spouse1_education': data.get('spouse1_education'),
            'spouse1_id_number': data['spouse1_id_number'],
            'spouse1_phone': data.get('spouse1_phone'),
            'spouse1_region': data.get('spouse1_region'),
            'spouse1_zone': data.get('spouse1_zone'),
            'spouse1_woreda': data.get('spouse1_woreda'),
            'spouse1_kebele': data.get('spouse1_kebele'),
            'spouse1_city': data.get('spouse1_city'),
            'spouse1_house_number': data.get('spouse1_house_number'),
            
            # Spouse 2 Information
            'spouse2_full_name': data['spouse2_full_name'],
            'spouse2_father_name': data.get('spouse2_father_name'),
            'spouse2_grandfather_name': data.get('spouse2_grandfather_name'),
            'spouse2_nationality': data.get('spouse2_nationality', 'Ethiopian'),
            'spouse2_ethnicity': data.get('spouse2_ethnicity'),
            'spouse2_religion': data.get('spouse2_religion'),
            'spouse2_date_of_birth': data.get('spouse2_date_of_birth'),
            'spouse2_age_at_marriage': spouse2_age,
            'spouse2_previous_marital_status': data.get('spouse2_previous_marital_status', 'single'),
            'spouse2_occupation': data.get('spouse2_occupation'),
            'spouse2_education': data.get('spouse2_education'),
            'spouse2_id_number': data['spouse2_id_number'],
            'spouse2_phone': data.get('spouse2_phone'),
            'spouse2_region': data.get('spouse2_region'),
            'spouse2_zone': data.get('spouse2_zone'),
            'spouse2_woreda': data.get('spouse2_woreda'),
            'spouse2_kebele': data.get('spouse2_kebele'),
            'spouse2_city': data.get('spouse2_city'),
            'spouse2_house_number': data.get('spouse2_house_number'),
            
            # Witnesses
            'witness1_name': data.get('witness1_name'),
            'witness1_id_number': data.get('witness1_id_number'),
            'witness1_address': data.get('witness1_address'),
            'witness2_name': data.get('witness2_name'),
            'witness2_id_number': data.get('witness2_id_number'),
            'witness2_address': data.get('witness2_address'),
            
            # Officiant
            'officiant_name': data.get('officiant_name'),
            'officiant_title': data.get('officiant_title'),
            'officiant_registration_number': data.get('officiant_registration_number'),
            
            # System
            'registered_by': current_user_id,
            'status': 'draft',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Add Ethiopian date
        if data.get('marriage_date'):
            try:
                gregorian_date = datetime.strptime(data['marriage_date'], '%Y-%m-%d').date()
                marriage_data['ethiopian_marriage_date'] = CertificateGenerator.convert_to_ethiopian_date(gregorian_date)
            except:
                pass
        
        result = db.marriage_records.insert_one(marriage_data)
        
        return jsonify({
            'message': 'Marriage record created successfully',
            'marriage_id': str(result.inserted_id),
            'certificate_number': certificate_number
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['GET'])
@jwt_required()
def get_marriage_records():
    try:
        current_user_id = get_jwt_identity()
        
        db = current_app.db  # Get db from current_app
        
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        filters = {}
        if current_user['role'] in ['vms_officer', 'statistician']:
            if current_user.get('region'):
                filters['marriage_region'] = current_user['region']
            if current_user.get('woreda'):
                filters['marriage_woreda'] = current_user['woreda']
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        skip = (page - 1) * per_page
        records = list(db.marriage_records.find(filters).sort('created_at', -1).skip(skip).limit(per_page))
        total = db.marriage_records.count_documents(filters)
        
        records_data = []
        for record in records:
            registrar = find_user_by_id(db, record['registered_by']) if record.get('registered_by') else None
            
            records_data.append({
                'marriage_id': str(record['_id']),
                'certificate_number': record['certificate_number'],
                'spouse1_full_name': record['spouse1_full_name'],
                'spouse2_full_name': record['spouse2_full_name'],
                'marriage_date': record['marriage_date'],
                'marriage_place': record.get('marriage_place'),
                'marriage_region': record.get('marriage_region'),
                'marriage_woreda': record.get('marriage_woreda'),
                'status': record.get('status', 'draft'),
                'registration_date': record.get('created_at').isoformat() if record.get('created_at') else None,
                'registered_by_name': registrar['full_name'] if registrar else None
            })
        
        return jsonify({
            'marriage_records': records_data,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:marriage_id>', methods=['GET'])
@jwt_required()
def get_marriage_record(marriage_id):
    try:
        db = current_app.db  # Get db from current_app
        
        marriage_record = db.marriage_records.find_one({'_id': ObjectId(marriage_id)})
        if not marriage_record:
            return jsonify({'error': 'Marriage record not found'}), 404
        
        current_user_id = get_jwt_identity()
        current_user = find_user_by_id(db, current_user_id)
        
        if current_user['role'] not in ['admin'] and marriage_record.get('marriage_region') != current_user.get('region'):
            return jsonify({'error': 'Permission denied'}), 403
        
        registrar = find_user_by_id(db, marriage_record['registered_by']) if marriage_record.get('registered_by') else None
        approver = find_user_by_id(db, marriage_record['approved_by']) if marriage_record.get('approved_by') else None
        
        record_data = {
            'marriage_id': str(marriage_record['_id']),
            'certificate_number': marriage_record['certificate_number'],
            **marriage_record
        }
        
        record_data.pop('_id', None)
        record_data['registered_by_name'] = registrar['full_name'] if registrar else None
        record_data['approved_by_name'] = approver['full_name'] if approver else None
        
        return jsonify(record_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:marriage_id>', methods=['PUT'])
@jwt_required()
def update_marriage_record(marriage_id):
    try:
        current_user_id = get_jwt_identity()
        db = current_app.db  # Get db from current_app
        
        marriage_record = db.marriage_records.find_one({'_id': ObjectId(marriage_id)})
        if not marriage_record:
            return jsonify({'error': 'Marriage record not found'}), 404
        
        # Check permissions
        if marriage_record['registered_by'] != current_user_id:
            current_user = find_user_by_id(db, current_user_id)
            if current_user['role'] != 'admin':
                return jsonify({'error': 'Permission denied'}), 403
        
        data = request.get_json()
        
        # Update fields
        updatable_fields = [
            'marriage_date', 'marriage_place', 'marriage_type', 'marriage_region', 'marriage_zone', 
            'marriage_woreda', 'marriage_kebele', 'spouse1_full_name', 'spouse1_father_name', 
            'spouse1_grandfather_name', 'spouse1_nationality', 'spouse1_ethnicity', 'spouse1_religion', 
            'spouse1_date_of_birth', 'spouse1_previous_marital_status', 'spouse1_occupation', 
            'spouse1_education', 'spouse1_id_number', 'spouse1_phone', 'spouse1_region', 'spouse1_zone', 
            'spouse1_woreda', 'spouse1_kebele', 'spouse1_city', 'spouse1_house_number', 'spouse2_full_name', 
            'spouse2_father_name', 'spouse2_grandfather_name', 'spouse2_nationality', 'spouse2_ethnicity', 
            'spouse2_religion', 'spouse2_date_of_birth', 'spouse2_previous_marital_status', 
            'spouse2_occupation', 'spouse2_education', 'spouse2_id_number', 'spouse2_phone', 
            'spouse2_region', 'spouse2_zone', 'spouse2_woreda', 'spouse2_kebele', 'spouse2_city', 
            'spouse2_house_number', 'witness1_name', 'witness1_id_number', 'witness1_address', 
            'witness2_name', 'witness2_id_number', 'witness2_address', 'officiant_name', 'officiant_title', 
            'officiant_registration_number'
        ]
        
        update_data = {}
        for field in updatable_fields:
            if field in data:
                update_data[field] = data[field]
        
        # Recalculate ages if dates changed
        if ('spouse1_date_of_birth' in data or 'marriage_date' in data):
            dob1 = data.get('spouse1_date_of_birth') or marriage_record.get('spouse1_date_of_birth')
            marriage_date = data.get('marriage_date') or marriage_record.get('marriage_date')
            if dob1 and marriage_date:
                try:
                    birth_date = datetime.strptime(dob1, '%Y-%m-%d')
                    marriage_dt = datetime.strptime(marriage_date, '%Y-%m-%d')
                    age1 = marriage_dt.year - birth_date.year
                    if (marriage_dt.month, marriage_dt.day) < (birth_date.month, birth_date.day):
                        age1 -= 1
                    update_data['spouse1_age_at_marriage'] = age1
                except:
                    pass
        
        if ('spouse2_date_of_birth' in data or 'marriage_date' in data):
            dob2 = data.get('spouse2_date_of_birth') or marriage_record.get('spouse2_date_of_birth')
            marriage_date = data.get('marriage_date') or marriage_record.get('marriage_date')
            if dob2 and marriage_date:
                try:
                    birth_date = datetime.strptime(dob2, '%Y-%m-%d')
                    marriage_dt = datetime.strptime(marriage_date, '%Y-%m-%d')
                    age2 = marriage_dt.year - birth_date.year
                    if (marriage_dt.month, marriage_dt.day) < (birth_date.month, birth_date.day):
                        age2 -= 1
                    update_data['spouse2_age_at_marriage'] = age2
                except:
                    pass
        
        # Update Ethiopian date if marriage date changed
        if 'marriage_date' in data:
            try:
                gregorian_date = datetime.strptime(data['marriage_date'], '%Y-%m-%d').date()
                update_data['ethiopian_marriage_date'] = CertificateGenerator.convert_to_ethiopian_date(gregorian_date)
            except:
                pass
        
        update_data['updated_at'] = datetime.utcnow()
        
        db.marriage_records.update_one(
            {'_id': ObjectId(marriage_id)},
            {'$set': update_data}
        )
        
        return jsonify({'message': 'Marriage record updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:marriage_id>/status', methods=['PUT'])
@jwt_required()
def update_marriage_record_status(marriage_id):
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
        
        result = db.marriage_records.update_one(
            {'_id': ObjectId(marriage_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Marriage record not found'}), 404
        
        return jsonify({'message': f'Marriage record status updated to {new_status}'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500