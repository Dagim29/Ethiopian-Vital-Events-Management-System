from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId
import random
import string

bp = Blueprint('births', __name__, url_prefix='/api/births')

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
def create_birth_record():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        db = current_app.db
        
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        certificate_number = CertificateGenerator.generate_certificate_number(
            'birth', 
            current_user.get('region', 'AD'), 
            current_user.get('woreda', '01')
        )
        
        birth_data = {
            'certificate_number': certificate_number,
            'child_first_name': data['child_first_name'],
            'child_father_name': data['child_father_name'],
            'child_grandfather_name': data.get('child_grandfather_name'),
            'child_gender': data['child_gender'],
            'date_of_birth': data['date_of_birth'],
            'time_of_birth': data.get('time_of_birth'),
            'weight_kg': data.get('weight_kg'),
            'place_of_birth_type': data.get('place_of_birth_type', 'hospital'),
            'place_of_birth_name': data.get('place_of_birth_name'),
            'birth_region': data.get('birth_region', current_user.get('region')),
            'birth_zone': data.get('birth_zone', current_user.get('zone')),
            'birth_woreda': data.get('birth_woreda', current_user.get('woreda')),
            'birth_kebele': data.get('birth_kebele', current_user.get('kebele')),
            'father_full_name': data['father_full_name'],
            'father_nationality': data.get('father_nationality', 'Ethiopian'),
            'father_ethnicity': data.get('father_ethnicity'),
            'father_religion': data.get('father_religion'),
            'father_date_of_birth': data.get('father_date_of_birth'),
            'father_occupation': data.get('father_occupation'),
            'father_id_number': data.get('father_id_number'),
            'father_phone': data.get('father_phone'),
            'mother_full_name': data['mother_full_name'],
            'mother_nationality': data.get('mother_nationality', 'Ethiopian'),
            'mother_ethnicity': data.get('mother_ethnicity'),
            'mother_religion': data.get('mother_religion'),
            'mother_date_of_birth': data.get('mother_date_of_birth'),
            'mother_occupation': data.get('mother_occupation'),
            'mother_id_number': data.get('mother_id_number'),
            'mother_phone': data.get('mother_phone'),
            'registered_by': current_user_id,
            'status': 'draft',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        if data.get('date_of_birth'):
            try:
                gregorian_date = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
                birth_data['ethiopian_date_of_birth'] = CertificateGenerator.convert_to_ethiopian_date(gregorian_date)
            except:
                pass
        
        result = db.birth_records.insert_one(birth_data)
        
        return jsonify({
            'message': 'Birth record created successfully',
            'birth_id': str(result.inserted_id),
            'certificate_number': certificate_number
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['GET'])
@jwt_required()
def get_birth_records():
    try:
        current_user_id = get_jwt_identity()
        
        db = current_app.db
        
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        filters = {}
        if current_user['role'] in ['vms_officer', 'statistician']:
            if current_user.get('region'):
                filters['birth_region'] = current_user['region']
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        skip = (page - 1) * per_page
        records = list(db.birth_records.find(filters).sort('created_at', -1).skip(skip).limit(per_page))
        total = db.birth_records.count_documents(filters)
        
        records_data = []
        for record in records:
            registrar = find_user_by_id(db, record['registered_by']) if record.get('registered_by') else None
            
            records_data.append({
                'birth_id': str(record['_id']),
                'certificate_number': record['certificate_number'],
                'child_first_name': record['child_first_name'],
                'child_father_name': record['child_father_name'],
                'child_gender': record['child_gender'],
                'date_of_birth': record['date_of_birth'],
                'place_of_birth': record.get('place_of_birth_name'),
                'birth_region': record.get('birth_region'),
                'status': record.get('status', 'draft'),
                'registration_date': record.get('created_at').isoformat() if record.get('created_at') else None,
                'registered_by_name': registrar['full_name'] if registrar else None
            })
        
        return jsonify({
            'birth_records': records_data,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:birth_id>', methods=['GET'])
@jwt_required()
def get_birth_record(birth_id):
    try:
        db = current_app.db
        
        birth_record = db.birth_records.find_one({'_id': ObjectId(birth_id)})
        if not birth_record:
            return jsonify({'error': 'Birth record not found'}), 404
        
        current_user_id = get_jwt_identity()
        current_user = find_user_by_id(db, current_user_id)
        
        if current_user['role'] not in ['admin'] and birth_record.get('birth_region') != current_user.get('region'):
            return jsonify({'error': 'Permission denied'}), 403
        
        registrar = find_user_by_id(db, birth_record['registered_by']) if birth_record.get('registered_by') else None
        
        record_data = {
            'birth_id': str(birth_record['_id']),
            'certificate_number': birth_record['certificate_number'],
            **birth_record
        }
        
        record_data.pop('_id', None)
        record_data['registered_by_name'] = registrar['full_name'] if registrar else None
        
        return jsonify(record_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
