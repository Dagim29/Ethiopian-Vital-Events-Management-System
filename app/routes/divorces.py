from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson import ObjectId
import random
import string
from .audit_logs import create_audit_log
from ..utils.validators import validate_request_data

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
        
        # Clean empty strings to None
        for key, value in list(data.items()):
            if value == '' or value == 'null':
                data[key] = None
        
        db = current_app.db  # Get db from current_app
        
        current_user = find_user_by_id(db, current_user_id)
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate data
        is_valid, errors, warnings, quality_score = validate_request_data(db, 'divorce', data)
        if not is_valid:
            return jsonify({
                'success': False,
                'errors': errors,
                'warnings': warnings
            }), 400
        
        certificate_number = CertificateGenerator.generate_certificate_number(
            'divorce', 
            current_user.get('region', 'AD'), 
            current_user.get('woreda', '01')
        )
        
        # Calculate marriage duration
        marriage_duration = None
        if data.get('marriage_date') and data.get('divorce_date'):
            try:
                marriage_date = datetime.strptime(data['marriage_date'], '%Y-%m-%d')
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
            'divorce_reason': data.get('divorce_reason'),
            'case_number': data.get('case_number'),
            'court_name': data.get('court_name'),
            
            # Spouse 1 Information
            'spouse1_full_name': data['spouse1_full_name'],
            'spouse1_gender': data.get('spouse1_gender'),
            'spouse1_date_of_birth': data.get('spouse1_date_of_birth'),
            'spouse1_nationality': data.get('spouse1_nationality'),
            'spouse1_ethnicity': data.get('spouse1_ethnicity'),
            'spouse1_religion': data.get('spouse1_religion'),
            'spouse1_occupation': data.get('spouse1_occupation'),
            'spouse1_id_number': data.get('spouse1_id_number'),
            'spouse1_phone': data.get('spouse1_phone'),
            
            # Spouse 2 Information
            'spouse2_full_name': data['spouse2_full_name'],
            'spouse2_gender': data.get('spouse2_gender'),
            'spouse2_date_of_birth': data.get('spouse2_date_of_birth'),
            'spouse2_nationality': data.get('spouse2_nationality'),
            'spouse2_ethnicity': data.get('spouse2_ethnicity'),
            'spouse2_religion': data.get('spouse2_religion'),
            'spouse2_occupation': data.get('spouse2_occupation'),
            'spouse2_id_number': data.get('spouse2_id_number'),
            'spouse2_phone': data.get('spouse2_phone'),
            
            # Marriage Information
            'marriage_date': data.get('marriage_date'),
            'marriage_duration_years': marriage_duration,
            
            # Witnesses Information
            'witness1_name': data.get('witness1_name'),
            'witness1_phone': data.get('witness1_phone'),
            'witness2_name': data.get('witness2_name'),
            'witness2_phone': data.get('witness2_phone'),
            
            # Photos
            'husband_photo': data.get('husband_photo'),
            'wife_photo': data.get('wife_photo'),
            
            # Additional Notes
            'notes': data.get('notes'),
            
            # Location Information (from user or form data)
            'divorce_region': data.get('divorce_region', current_user.get('region')),
            'divorce_zone': data.get('divorce_zone', current_user.get('zone')),
            'divorce_woreda': data.get('divorce_woreda', current_user.get('woreda')),
            'divorce_kebele': data.get('divorce_kebele', current_user.get('kebele')),
            
            # System
            'registered_by': current_user_id,
            'status': 'draft',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'data_quality_score': quality_score,
            'validation_warnings': warnings if warnings else []
        }
        
        # Add Ethiopian date
        if data.get('divorce_date'):
            try:
                gregorian_date = datetime.strptime(data['divorce_date'], '%Y-%m-%d').date()
                divorce_data['ethiopian_divorce_date'] = CertificateGenerator.convert_to_ethiopian_date(gregorian_date)
            except:
                pass
        
        result = db.divorce_records.insert_one(divorce_data)
        divorce_id = str(result.inserted_id)
        
        # Create audit log
        spouse1_name = data.get('spouse1_full_name', 'Spouse 1')
        spouse2_name = data.get('spouse2_full_name', 'Spouse 2')
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action='create',
            record_type='divorce',
            record_id=divorce_id,
            details=f"Created divorce record for {spouse1_name} & {spouse2_name}"
        )
        
        return jsonify({
            'message': 'Divorce record created successfully',
            'divorce_id': divorce_id,
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
        
        # Build filters based on user role
        role_filter = None
        if current_user['role'] not in ['admin', 'statistician']:
            role_filters = {}
            if current_user.get('region'):
                role_filters['divorce_region'] = current_user['region']
            if current_user.get('woreda'):
                role_filters['divorce_woreda'] = current_user['woreda']
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
                    {'spouse1_full_name': search_regex},
                    {'spouse2_full_name': search_regex},
                    {'husband_full_name': search_regex},
                    {'wife_full_name': search_regex}
                ]
            }
        
        # Additional filters
        additional_filters = []
        
        # Region filter
        region = request.args.get('region', '').strip()
        if region:
            additional_filters.append({'divorce_region': region})
        
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
                additional_filters.append({'divorce_date': date_filter})
        
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
        
        # Permission check: Allow if user is admin/statistician, created the record, or record is in their region
        if current_user['role'] not in ['admin', 'statistician']:
            # Check if user created this record OR if record is in their region
            is_creator = divorce_record.get('registered_by') == ObjectId(current_user_id)
            is_same_region = divorce_record.get('divorce_region') == current_user.get('region')
            
            if not (is_creator or is_same_region):
                return jsonify({'error': 'Permission denied'}), 403
        
        registrar = find_user_by_id(db, divorce_record['registered_by']) if divorce_record.get('registered_by') else None
        approver = find_user_by_id(db, divorce_record['approved_by']) if divorce_record.get('approved_by') else None
        
        # Convert ObjectIds to strings for JSON serialization
        record_data = {}
        for key, value in divorce_record.items():
            if key == '_id':
                record_data['divorce_id'] = str(value)
            elif isinstance(value, ObjectId):
                record_data[key] = str(value)
            else:
                record_data[key] = value
        
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
        # VMS Officers and admins can edit all records
        # Others can only edit their own records
        if divorce_record['registered_by'] != current_user_id:
            current_user = find_user_by_id(db, current_user_id)
            if current_user['role'] not in ['admin', 'vms_officer']:
                return jsonify({'error': 'Permission denied'}), 403
        
        data = request.get_json()
        
        # Update fields - Track only fields that actually changed
        updatable_fields = [
            'divorce_date', 'divorce_reason', 'case_number', 'court_name',
            'spouse1_full_name', 'spouse1_gender', 'spouse1_date_of_birth', 'spouse1_nationality',
            'spouse1_ethnicity', 'spouse1_religion', 'spouse1_occupation', 'spouse1_id_number', 'spouse1_phone',
            'spouse2_full_name', 'spouse2_gender', 'spouse2_date_of_birth', 'spouse2_nationality',
            'spouse2_ethnicity', 'spouse2_religion', 'spouse2_occupation', 'spouse2_id_number', 'spouse2_phone',
            'marriage_date', 'witness1_name', 'witness1_phone', 'witness2_name', 'witness2_phone',
            'husband_photo', 'wife_photo', 'notes'
        ]
        
        update_data = {}
        changed_fields_details = {}
        
        for field in updatable_fields:
            if field in data:
                old_value = divorce_record.get(field)
                new_value = data[field]
                
                # Only include if value actually changed
                if old_value != new_value:
                    update_data[field] = new_value
                    changed_fields_details[field] = {
                        'old': old_value,
                        'new': new_value
                    }
        
        # Recalculate marriage duration if dates changed
        if 'marriage_date' in data or 'divorce_date' in data:
            marriage_date = data.get('marriage_date') or divorce_record.get('marriage_date')
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
        if 'divorce_date' in update_data:
            try:
                gregorian_date = datetime.strptime(data['divorce_date'], '%Y-%m-%d').date()
                update_data['ethiopian_divorce_date'] = CertificateGenerator.convert_to_ethiopian_date(gregorian_date)
            except:
                pass
        
        # If no fields changed, return early
        if not update_data:
            return jsonify({
                'success': False,
                'error': 'No changes detected'
            }), 400
        
        update_data['updated_at'] = datetime.utcnow()
        
        result = db.divorce_records.update_one(
            {'_id': ObjectId(divorce_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({
                'success': False,
                'error': 'No changes made'
            }), 400
        
        # Create audit log with only changed fields
        changed_field_names = [k for k in update_data.keys() if k != 'updated_at' and k != 'ethiopian_divorce_date' and k != 'marriage_duration_years']
        
        # Create a more readable details message
        if len(changed_field_names) <= 3:
            details = f"Updated: {', '.join(changed_field_names)}"
        else:
            details = f"Updated {len(changed_field_names)} fields: {', '.join(changed_field_names[:3])}, ..."
        
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action='update',
            record_type='divorce',
            record_id=divorce_id,
            details=details,
            changes=changed_fields_details
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
            update_data['approved_at'] = datetime.utcnow()
        
        if new_status == 'rejected':
            rejection_reason = data.get('rejection_reason', '')
            update_data['rejection_reason'] = rejection_reason
            update_data['rejected_by'] = current_user_id
            update_data['rejected_at'] = datetime.utcnow()
        
        result = db.divorce_records.update_one(
            {'_id': ObjectId(divorce_id)},
            {'$set': update_data}
        )
        
        if result.modified_count == 0:
            return jsonify({'error': 'Divorce record not found'}), 404
        
        # Create audit log
        action = 'approve' if new_status == 'approved' else 'reject' if new_status == 'rejected' else 'status_change'
        details = f"Changed status to {new_status}"
        if new_status == 'rejected' and data.get('rejection_reason'):
            details += f" - Reason: {data.get('rejection_reason')}"
        
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action=action,
            record_type='divorce',
            record_id=divorce_id,
            details=details,
            changes={'status': new_status}
        )
        
        return jsonify({'message': f'Divorce record status updated to {new_status}'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<string:divorce_id>', methods=['DELETE'])
@jwt_required()
def delete_divorce_record(divorce_id):
    try:
        current_user_id = get_jwt_identity()
        db = current_app.db
        
        divorce_record = db.divorce_records.find_one({'_id': ObjectId(divorce_id)})
        if not divorce_record:
            return jsonify({'error': 'Divorce record not found'}), 404
        
        # Check permissions - only admin, vms_officer, or record creator can delete
        current_user = find_user_by_id(db, current_user_id)
        if divorce_record['registered_by'] != current_user_id:
            if current_user['role'] not in ['admin', 'vms_officer']:
                return jsonify({'error': 'Permission denied'}), 403
        
        # Get record details before deletion for audit log
        spouse1_name = divorce_record.get('spouse1_full_name', 'Spouse 1')
        spouse2_name = divorce_record.get('spouse2_full_name', 'Spouse 2')
        
        result = db.divorce_records.delete_one({'_id': ObjectId(divorce_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Failed to delete divorce record'}), 500
        
        # Create audit log
        create_audit_log(
            db=db,
            user_id=current_user_id,
            action='delete',
            record_type='divorce',
            record_id=divorce_id,
            details=f"Deleted divorce record for {spouse1_name} & {spouse2_name}"
        )
        
        return jsonify({'message': 'Divorce record deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500