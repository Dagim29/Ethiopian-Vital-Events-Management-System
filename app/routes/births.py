from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId
import random
import string
from .audit_logs import create_audit_log
from ..utils.validators import validate_request_data

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
        
        # Clean empty strings to None
        for key, value in list(data.items()):
            if value == '' or value == 'null':
                data[key] = None
        
        db = current_app.db
        
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate data
        is_valid, errors, warnings, quality_score = validate_request_data(db, 'birth', data)
        if not is_valid:
            return jsonify({
                'success': False,
                'errors': errors,
                'warnings': warnings
            }), 400
        
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
            'child_photo': data.get('child_photo'),
            'father_photo': data.get('father_photo'),
            'mother_photo': data.get('mother_photo'),
            'registered_by': ObjectId(current_user_id),
            'status': 'draft',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'data_quality_score': quality_score,
            'validation_warnings': warnings if warnings else []
        }
        
        if data.get('date_of_birth'):
            try:
                gregorian_date = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
                birth_data['ethiopian_date_of_birth'] = CertificateGenerator.convert_to_ethiopian_date(gregorian_date)
            except:
                pass
        
        result = db.birth_records.insert_one(birth_data)
        birth_id = str(result.inserted_id)
        
        # Create audit log
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action='create',
            record_type='birth',
            record_id=birth_id,
            details=f"Created birth record for {data['child_first_name']} {data['child_father_name']}"
        )
        
        return jsonify({
            'message': 'Birth record created successfully',
            'birth_id': birth_id,
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
        
        # Build filters based on user role and search query
        filters = {}
        role_filter = None
        
        # Role-based filtering
        # Admin and Statistician have full access to all records
        # VMS Officers see records in their region
        # Clerks see records they created OR in their region
        if current_user['role'] == 'clerk':
            # Clerks can see records they created OR records in their region
            clerk_filters = [{'registered_by': ObjectId(current_user_id)}]
            if current_user.get('region'):
                clerk_filters.append({'birth_region': current_user['region']})
            role_filter = {'$or': clerk_filters}
        elif current_user['role'] == 'vms_officer':
            # VMS Officers see all records in their region
            if current_user.get('region'):
                role_filter = {'birth_region': current_user['region']}
        # Admin and Statistician see all records (no role filter)
        
        # Search functionality
        search_query = request.args.get('search', '').strip()
        search_filter = None
        if search_query:
            # Create a regex pattern for case-insensitive search
            search_regex = {'$regex': f'.*{search_query}.*', '$options': 'i'}
            search_filter = {
                '$or': [
                    {'certificate_number': search_regex},
                    {'child_first_name': search_regex},
                    {'child_father_name': search_regex},
                    {'child_grandfather_name': search_regex},
                    {'father_full_name': search_regex},
                    {'mother_full_name': search_regex}
                ]
            }
        
        # Additional filters
        additional_filters = []
        
        # Gender filter
        gender = request.args.get('gender', '').strip()
        if gender:
            additional_filters.append({'child_gender': gender})
        
        # Region filter
        region = request.args.get('region', '').strip()
        if region:
            additional_filters.append({'birth_region': region})
        
        # Status filter
        status = request.args.get('status', '').strip()
        if status:
            additional_filters.append({'status': status})
        
        # Date range filter
        date_from = request.args.get('date_from', '').strip()
        date_to = request.args.get('date_to', '').strip()
        if date_from or date_to:
            date_filter = {}
            if date_from:
                date_filter['$gte'] = date_from
            if date_to:
                date_filter['$lte'] = date_to
            if date_filter:
                additional_filters.append({'date_of_birth': date_filter})
        
        # Combine all filters
        all_filters = []
        if role_filter:
            all_filters.append(role_filter)
        if search_filter:
            all_filters.append(search_filter)
        if additional_filters:
            all_filters.extend(additional_filters)
        
        # Build final filter
        if len(all_filters) > 1:
            filters = {'$and': all_filters}
        elif len(all_filters) == 1:
            filters = all_filters[0]
        else:
            filters = {}
        
        # Pagination
        page = max(1, int(request.args.get('page', 1)))
        per_page = min(50, max(1, int(request.args.get('per_page', 20))))
        skip = (page - 1) * per_page
        
        # Get total count and paginated records
        total = db.birth_records.count_documents(filters)
        records_cursor = db.birth_records.find(filters).sort('created_at', -1).skip(skip).limit(per_page)
        records = list(records_cursor)
        
        # Format response
        records_data = []
        for record in records:
            registrar = find_user_by_id(db, record['registered_by']) if record.get('registered_by') else None
            
            records_data.append({
                'birth_id': str(record['_id']),
                'certificate_number': record['certificate_number'],
                'child_first_name': record['child_first_name'],
                'child_father_name': record['child_father_name'],
                'child_grandfather_name': record.get('child_grandfather_name'),
                'child_gender': record['child_gender'],
                'date_of_birth': record['date_of_birth'],
                'place_of_birth': record.get('place_of_birth_name'),
                'birth_region': record.get('birth_region'),
                'birth_city': record.get('birth_city'),
                'birth_zone': record.get('birth_zone'),
                'birth_woreda': record.get('birth_woreda'),
                'birth_kebele': record.get('birth_kebele'),
                'father_full_name': record.get('father_full_name'),
                'mother_full_name': record.get('mother_full_name'),
                'status': record.get('status', 'draft'),
                'registration_date': record.get('created_at').isoformat() if record.get('created_at') else None,
                'registered_by_name': registrar['full_name'] if registrar else None
            })
        
        return jsonify({
            'success': True,
            'data': {
                'birth_records': records_data,
                'pagination': {
                    'total': total,
                    'pages': (total + per_page - 1) // per_page,
                    'current_page': page,
                    'per_page': per_page
                }
            }
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
        
        # Permission check: Allow if user is admin/statistician, created the record, or record is in their region
        if current_user['role'] not in ['admin', 'statistician']:
            # Check if user created this record OR if record is in their region
            is_creator = birth_record.get('registered_by') == ObjectId(current_user_id)
            is_same_region = birth_record.get('birth_region') == current_user.get('region')
            
            if not (is_creator or is_same_region):
                return jsonify({'error': 'Permission denied'}), 403
        
        registrar = find_user_by_id(db, birth_record['registered_by']) if birth_record.get('registered_by') else None
        
        # Convert ObjectIds to strings for JSON serialization
        record_data = {}
        for key, value in birth_record.items():
            if key == '_id':
                record_data['birth_id'] = str(value)
            elif isinstance(value, ObjectId):
                record_data[key] = str(value)
            else:
                record_data[key] = value
        
        record_data['registered_by_name'] = registrar['full_name'] if registrar else None
        
        return jsonify(record_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:birth_id>', methods=['PUT'])
@jwt_required()
def update_birth_record(birth_id):
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        db = current_app.db
        
        birth_record = db.birth_records.find_one({'_id': ObjectId(birth_id)})
        if not birth_record:
            return jsonify({'error': 'Birth record not found'}), 404
        
        # Check permissions
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        # Allow update if user is the creator, admin, or vms_officer
        if birth_record['registered_by'] != ObjectId(current_user_id):
            if current_user['role'] not in ['admin', 'vms_officer']:
                return jsonify({'error': 'Permission denied'}), 403
        
        # Update fields
        updatable_fields = [
            'child_first_name', 'child_father_name', 'child_grandfather_name', 'child_gender',
            'date_of_birth', 'time_of_birth', 'weight_kg', 'place_of_birth_type', 'place_of_birth_name',
            'birth_region', 'birth_zone', 'birth_woreda', 'birth_kebele', 'father_full_name',
            'father_nationality', 'father_ethnicity', 'father_religion', 'father_date_of_birth',
            'father_occupation', 'father_id_number', 'father_phone', 'mother_full_name',
            'mother_nationality', 'mother_ethnicity', 'mother_religion', 'mother_date_of_birth',
            'mother_occupation', 'mother_id_number', 'mother_phone', 'informant_name',
            'informant_relationship', 'informant_phone', 'notes',
            'child_photo', 'father_photo', 'mother_photo'
        ]
        
        # Track only fields that actually changed
        update_data = {}
        changed_fields_details = {}
        
        for field in updatable_fields:
            if field in data:
                old_value = birth_record.get(field)
                new_value = data[field]
                
                # Only include if value actually changed
                if old_value != new_value:
                    update_data[field] = new_value
                    changed_fields_details[field] = {
                        'old': old_value,
                        'new': new_value
                    }
        
        # Update Ethiopian date if birth date changed
        if 'date_of_birth' in update_data:
            try:
                gregorian_date = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
                update_data['ethiopian_date_of_birth'] = CertificateGenerator.convert_to_ethiopian_date(gregorian_date)
            except:
                pass
        
        # If no fields changed, return early
        if not update_data:
            return jsonify({
                'success': False,
                'error': 'No changes detected'
            }), 400
        
        update_data['updated_at'] = datetime.utcnow()
        
        result = db.birth_records.update_one(
            {'_id': ObjectId(birth_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({
                'success': False,
                'error': 'No changes made'
            }), 400
        
        # Create audit log with only changed fields
        changed_field_names = [k for k in update_data.keys() if k != 'updated_at' and k != 'ethiopian_date_of_birth']
        
        # Create a more readable details message
        if len(changed_field_names) <= 3:
            # If 3 or fewer fields, list them all
            details = f"Updated: {', '.join(changed_field_names)}"
        else:
            # If more than 3, show count and first few
            details = f"Updated {len(changed_field_names)} fields: {', '.join(changed_field_names[:3])}, ..."
        
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action='update',
            record_type='birth',
            record_id=birth_id,
            details=details,
            changes=changed_fields_details
        )
        
        return jsonify({
            'success': True,
            'message': 'Birth record updated successfully',
            'data': {
                'birth_id': birth_id,
                'updated_at': update_data['updated_at'].isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:birth_id>', methods=['DELETE'])
@jwt_required()
def delete_birth_record(birth_id):
    try:
        current_user_id = get_jwt_identity()
        
        db = current_app.db
        
        birth_record = db.birth_records.find_one({'_id': ObjectId(birth_id)})
        if not birth_record:
            return jsonify({'error': 'Birth record not found'}), 404
        
        # Check permissions - only admin can delete
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Only administrators can delete records'}), 403
        
        # Get record details before deletion for audit log
        birth_record = db.birth_records.find_one({'_id': ObjectId(birth_id)})
        record_name = f"{birth_record.get('child_first_name', 'Unknown')} {birth_record.get('child_father_name', '')}"
        
        result = db.birth_records.delete_one({'_id': ObjectId(birth_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Birth record not found'}), 404
        
        # Create audit log
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action='delete',
            record_type='birth',
            record_id=birth_id,
            details=f"Deleted birth record for {record_name}"
        )
        
        return jsonify({'message': 'Birth record deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:birth_id>/status', methods=['PUT', 'PATCH'])
@jwt_required()
def update_birth_record_status(birth_id):
    try:
        current_user_id = get_jwt_identity()
        db = current_app.db
        
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
            update_data['approved_at'] = datetime.utcnow()
        
        if new_status == 'rejected':
            rejection_reason = data.get('rejection_reason', '')
            update_data['rejection_reason'] = rejection_reason
            update_data['rejected_by'] = current_user_id
            update_data['rejected_at'] = datetime.utcnow()
        
        result = db.birth_records.update_one(
            {'_id': ObjectId(birth_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Birth record not found'}), 404
        
        # Create audit log
        action = 'approve' if new_status == 'approved' else 'reject' if new_status == 'rejected' else 'status_change'
        details = f"Changed status to {new_status}"
        if new_status == 'rejected' and data.get('rejection_reason'):
            details += f" - Reason: {data.get('rejection_reason')}"
        
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action=action,
            record_type='birth',
            record_id=birth_id,
            details=details,
            changes={'status': new_status}
        )
        
        return jsonify({
            'success': True,
            'message': f'Birth record status updated to {new_status}',
            'data': {
                'status': new_status,
                'updated_at': update_data['updated_at'].isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500