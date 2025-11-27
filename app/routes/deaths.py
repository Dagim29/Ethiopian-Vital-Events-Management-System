from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId
import random
import string
from .audit_logs import create_audit_log
from ..utils.validators import validate_request_data

bp = Blueprint('deaths', __name__, url_prefix='/api/deaths')

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
def create_death_record():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        
        # Clean empty strings to None
        for key, value in list(data.items()):
            if value == '' or value == 'null':
                data[key] = None
        
        print(f"DEBUG: Received death record data: {data}")
        
        db = current_app.db  # Get db from current_app
        
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate data
        is_valid, errors, warnings, quality_score = validate_request_data(db, 'death', data)
        print(f"DEBUG: Validation result - Valid: {is_valid}, Errors: {errors}, Warnings: {warnings}")
        if not is_valid:
            return jsonify({
                'success': False,
                'errors': errors,
                'warnings': warnings
            }), 400
        
        certificate_number = CertificateGenerator.generate_certificate_number(
            'death', 
            current_user.get('region', 'AD'), 
            current_user.get('woreda', '01')
        )
        
        # Calculate age if both birth and death dates are provided
        age_at_death = None
        if data.get('date_of_birth') and data.get('date_of_death'):
            try:
                birth_date = datetime.strptime(data['date_of_birth'], '%Y-%m-%d')
                death_date = datetime.strptime(data['date_of_death'], '%Y-%m-%d')
                age_at_death = death_date.year - birth_date.year
                if (death_date.month, death_date.day) < (birth_date.month, birth_date.day):
                    age_at_death -= 1
            except:
                pass
        
        death_data = {
            'certificate_number': certificate_number,
            
            # Deceased Information
            'deceased_first_name': data['deceased_first_name'],
            'deceased_father_name': data['deceased_father_name'],
            'deceased_grandfather_name': data.get('deceased_grandfather_name'),
            'deceased_gender': data['deceased_gender'],
            'date_of_birth': data.get('date_of_birth'),
            'date_of_death': data['date_of_death'],
            'time_of_death': data.get('time_of_death'),
            'age_at_death': age_at_death,
            'age_type': data.get('age_type', 'years'),
            
            # Death Place
            'place_of_death_type': data.get('place_of_death_type', 'hospital'),
            'place_of_death_name': data.get('place_of_death_name'),
            'death_region': data.get('death_region', current_user.get('region')),
            'death_zone': data.get('death_zone', current_user.get('zone')),
            'death_woreda': data.get('death_woreda', current_user.get('woreda')),
            'death_kebele': data.get('death_kebele', current_user.get('kebele')),
            'death_city': data.get('death_city'),
            'death_specific_location': data.get('death_specific_location'),
            
            # Cause of Death
            'cause_of_death': data.get('cause_of_death'),
            'cause_of_death_type': data.get('cause_of_death_type', 'natural'),
            'underlying_causes': data.get('underlying_causes'),
            
            # Personal Information
            'nationality': data.get('nationality', 'Ethiopian'),
            'ethnicity': data.get('ethnicity'),
            'religion': data.get('religion'),
            'marital_status': data.get('marital_status'),
            'occupation': data.get('occupation'),
            'education': data.get('education'),
            
            # Usual Residence
            'usual_region': data.get('usual_region'),
            'usual_zone': data.get('usual_zone'),
            'usual_woreda': data.get('usual_woreda'),
            'usual_kebele': data.get('usual_kebele'),
            'usual_city': data.get('usual_city'),
            'usual_house_number': data.get('usual_house_number'),
            
            # Medical Information
            'certifying_doctor': data.get('certifying_doctor'),
            'doctor_qualification': data.get('doctor_qualification'),
            'death_cause_verified': data.get('death_cause_verified', False),
            'medical_certificate_number': data.get('medical_certificate_number'),
            'health_facility_name': data.get('health_facility_name'),
            
            # Informant Information
            'informant_name': data.get('informant_name'),
            'informant_relationship': data.get('informant_relationship'),
            'informant_id_number': data.get('informant_id_number'),
            'informant_phone': data.get('informant_phone'),
            'informant_address': data.get('informant_address'),
            
            # Burial Information
            'burial_date': data.get('burial_date'),
            'burial_place': data.get('burial_place'),
            'burial_region': data.get('burial_region'),
            'burial_zone': data.get('burial_zone'),
            'burial_woreda': data.get('burial_woreda'),
            'undertaker_name': data.get('undertaker_name'),
            
            # System
            'registered_by': current_user_id,
            'status': 'draft',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'data_quality_score': quality_score,
            'validation_warnings': warnings if warnings else []
        }
        
        # Add Ethiopian date
        if data.get('date_of_death'):
            try:
                gregorian_date = datetime.strptime(data['date_of_death'], '%Y-%m-%d').date()
                death_data['ethiopian_date_of_death'] = CertificateGenerator.convert_to_ethiopian_date(gregorian_date)
            except:
                pass
        
        result = db.death_records.insert_one(death_data)
        death_id = str(result.inserted_id)
        
        # Create audit log
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action='create',
            record_type='death',
            record_id=death_id,
            details=f"Created death record for {data.get('deceased_first_name', 'Unknown')} {data.get('deceased_father_name', '')}"
        )
        
        return jsonify({
            'message': 'Death record created successfully',
            'death_id': death_id,
            'certificate_number': certificate_number
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['GET'])
@jwt_required()
def get_death_records():
    try:
        current_user_id = get_jwt_identity()
        
        db = current_app.db  # Get db from current_app
        
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Build filters based on user role
        role_filter = None
        if current_user['role'] not in ['admin', 'statistician']:
            role_filters = {}
            if current_user.get('region'):
                role_filters['death_region'] = current_user['region']
            if current_user.get('woreda'):
                role_filters['death_woreda'] = current_user['woreda']
            if role_filters:
                role_filter = role_filters
        
        # Search functionality
        search_query = request.args.get('search', '').strip()
        search_filter = None
        if search_query:
            search_regex = {'$regex': f'.*{search_query}.*', '$options': 'i'}
            search_filter = {
                '$or': [
                    {'certificate_number': search_regex},
                    {'deceased_first_name': search_regex},
                    {'deceased_father_name': search_regex},
                    {'deceased_grandfather_name': search_regex}
                ]
            }
        
        # Additional filters
        additional_filters = []
        
        # Gender filter
        gender = request.args.get('gender', '').strip()
        if gender:
            additional_filters.append({'deceased_gender': gender})
        
        # Region filter
        region = request.args.get('region', '').strip()
        if region:
            additional_filters.append({'death_region': region})
        
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
                additional_filters.append({'date_of_death': date_filter})
        
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
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        skip = (page - 1) * per_page
        records = list(db.death_records.find(filters).sort('created_at', -1).skip(skip).limit(per_page))
        total = db.death_records.count_documents(filters)
        
        records_data = []
        for record in records:
            registrar = find_user_by_id(db, record['registered_by']) if record.get('registered_by') else None
            
            records_data.append({
                'death_id': str(record['_id']),
                'certificate_number': record['certificate_number'],
                'deceased_first_name': record['deceased_first_name'],
                'deceased_father_name': record['deceased_father_name'],
                'deceased_gender': record['deceased_gender'],
                'date_of_death': record['date_of_death'],
                'age_at_death': record.get('age_at_death'),
                'place_of_death': record.get('place_of_death_name'),
                'death_region': record.get('death_region'),
                'death_woreda': record.get('death_woreda'),
                'cause_of_death': record.get('cause_of_death'),
                'status': record.get('status', 'draft'),
                'registration_date': record.get('created_at').isoformat() if record.get('created_at') else None,
                'registered_by_name': registrar['full_name'] if registrar else None
            })
        
        return jsonify({
            'death_records': records_data,
            'total': total,
            'pages': (total + per_page - 1) // per_page,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:death_id>', methods=['GET'])
@jwt_required()
def get_death_record(death_id):
    try:
        db = current_app.db  # Get db from current_app
        
        death_record = db.death_records.find_one({'_id': ObjectId(death_id)})
        if not death_record:
            return jsonify({'error': 'Death record not found'}), 404
        
        current_user_id = get_jwt_identity()
        current_user = find_user_by_id(db, current_user_id)
        
        # Permission check: Allow if user is admin/statistician, created the record, or record is in their region
        if current_user['role'] not in ['admin', 'statistician']:
            # Check if user created this record OR if record is in their region
            is_creator = death_record.get('registered_by') == ObjectId(current_user_id)
            is_same_region = death_record.get('death_region') == current_user.get('region')
            
            if not (is_creator or is_same_region):
                return jsonify({'error': 'Permission denied'}), 403
        
        registrar = find_user_by_id(db, death_record['registered_by']) if death_record.get('registered_by') else None
        approver = find_user_by_id(db, death_record['approved_by']) if death_record.get('approved_by') else None
        
        # Convert ObjectIds to strings for JSON serialization
        record_data = {}
        for key, value in death_record.items():
            if key == '_id':
                record_data['death_id'] = str(value)
            elif isinstance(value, ObjectId):
                record_data[key] = str(value)
            else:
                record_data[key] = value
        
        record_data['registered_by_name'] = registrar['full_name'] if registrar else None
        record_data['approved_by_name'] = approver['full_name'] if approver else None
        
        return jsonify(record_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:death_id>', methods=['PUT'])
@jwt_required()
def update_death_record(death_id):
    try:
        current_user_id = get_jwt_identity()
        db = current_app.db  # Get db from current_app
        
        death_record = db.death_records.find_one({'_id': ObjectId(death_id)})
        
        if not death_record:
            return jsonify({'error': 'Death record not found'}), 404
        
        # Check permissions
        # VMS Officers and admins can edit all records
        # Others can only edit their own records
        if death_record['registered_by'] != current_user_id:
            current_user = find_user_by_id(db, current_user_id)
            if current_user['role'] not in ['admin', 'vms_officer']:
                return jsonify({'error': 'Permission denied'}), 403
        
        data = request.get_json()
        
        # Update fields - Track only fields that actually changed
        updatable_fields = [
            'deceased_first_name', 'deceased_father_name', 'deceased_grandfather_name', 'deceased_gender',
            'date_of_birth', 'date_of_death', 'time_of_death', 'age_at_death', 'age_type',
            'place_of_death_type', 'place_of_death_name', 'death_region', 'death_zone', 'death_woreda',
            'death_kebele', 'death_city', 'death_specific_location', 'cause_of_death', 'cause_of_death_type',
            'underlying_causes', 'nationality', 'ethnicity', 'religion', 'marital_status', 'occupation',
            'education', 'usual_region', 'usual_zone', 'usual_woreda', 'usual_kebele', 'usual_city',
            'usual_house_number', 'certifying_doctor', 'doctor_qualification', 'death_cause_verified',
            'medical_certificate_number', 'health_facility_name', 'informant_name', 'informant_relationship',
            'informant_id_number', 'informant_phone', 'informant_address', 'burial_date', 'burial_place',
            'burial_region', 'burial_zone', 'burial_woreda', 'undertaker_name', 'deceased_photo'
        ]
        
        update_data = {}
        changed_fields_details = {}
        
        for field in updatable_fields:
            if field in data:
                old_value = death_record.get(field)
                new_value = data[field]
                
                # Only include if value actually changed
                if old_value != new_value:
                    update_data[field] = new_value
                    changed_fields_details[field] = {
                        'old': old_value,
                        'new': new_value
                    }
        
        # Recalculate age if dates changed
        if 'date_of_birth' in data or 'date_of_death' in data:
            dob = data.get('date_of_birth') or death_record.get('date_of_birth')
            dod = data.get('date_of_death') or death_record.get('date_of_death')
            if dob and dod:
                try:
                    birth_date = datetime.strptime(dob, '%Y-%m-%d')
                    death_date = datetime.strptime(dod, '%Y-%m-%d')
                    age = death_date.year - birth_date.year
                    if (death_date.month, death_date.day) < (birth_date.month, birth_date.day):
                        age -= 1
                    update_data['age_at_death'] = age
                except:
                    pass
        
        # Update Ethiopian date if death date changed
        if 'date_of_death' in update_data:
            try:
                gregorian_date = datetime.strptime(data['date_of_death'], '%Y-%m-%d').date()
                update_data['ethiopian_date_of_death'] = CertificateGenerator.convert_to_ethiopian_date(gregorian_date)
            except:
                pass
        
        # If no fields changed, return early
        if not update_data:
            return jsonify({
                'success': False,
                'error': 'No changes detected'
            }), 400
        
        update_data['updated_at'] = datetime.utcnow()
        
        result = db.death_records.update_one(
            {'_id': ObjectId(death_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({
                'success': False,
                'error': 'No changes made'
            }), 400
        
        # Create audit log with only changed fields
        changed_field_names = [k for k in update_data.keys() if k != 'updated_at' and k != 'ethiopian_date_of_death']
        
        # Create a more readable details message
        if len(changed_field_names) <= 3:
            details = f"Updated: {', '.join(changed_field_names)}"
        else:
            details = f"Updated {len(changed_field_names)} fields: {', '.join(changed_field_names[:3])}, ..."
        
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action='update',
            record_type='death',
            record_id=death_id,
            details=details,
            changes=changed_fields_details
        )
        
        return jsonify({'message': 'Death record updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:death_id>/status', methods=['PUT'])
@jwt_required()
def update_death_record_status(death_id):
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
            update_data['approved_at'] = datetime.utcnow()
        
        if new_status == 'rejected':
            rejection_reason = data.get('rejection_reason', '')
            update_data['rejection_reason'] = rejection_reason
            update_data['rejected_by'] = current_user_id
            update_data['rejected_at'] = datetime.utcnow()
        
        result = db.death_records.update_one(
            {'_id': ObjectId(death_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Death record not found'}), 404
        
        # Create audit log
        action = 'approve' if new_status == 'approved' else 'reject' if new_status == 'rejected' else 'status_change'
        details = f"Changed status to {new_status}"
        if new_status == 'rejected' and data.get('rejection_reason'):
            details += f" - Reason: {data.get('rejection_reason')}"
        
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action=action,
            record_type='death',
            record_id=death_id,
            details=details,
            changes={'status': new_status}
        )
        
        return jsonify({'message': f'Death record status updated to {new_status}'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<string:death_id>', methods=['DELETE'])
@jwt_required()
def delete_death_record(death_id):
    try:
        current_user_id = get_jwt_identity()
        
        db = current_app.db
        
        death_record = db.death_records.find_one({'_id': ObjectId(death_id)})
        if not death_record:
            return jsonify({'error': 'Death record not found'}), 404
        
        # Check permissions - only admin can delete
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
            
        if current_user['role'] != 'admin':
            return jsonify({'error': 'Only administrators can delete records'}), 403
        
        # Get record details before deletion for audit log
        death_record = db.death_records.find_one({'_id': ObjectId(death_id)})
        record_name = f"{death_record.get('deceased_first_name', 'Unknown')} {death_record.get('deceased_last_name', '')}"
        
        result = db.death_records.delete_one({'_id': ObjectId(death_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Death record not found'}), 404
        
        # Create audit log
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action='delete',
            record_type='death',
            record_id=death_id,
            details=f'Deleted death record: {record_name}',
            changes={'deleted': True}
        )
        
        return jsonify({'message': 'Death record deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500