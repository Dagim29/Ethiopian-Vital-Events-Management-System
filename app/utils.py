import os
import random
import string
from datetime import datetime
from werkzeug.utils import secure_filename

class CertificateGenerator:
    # Ethiopian Region Codes
    REGION_CODES = {
        'ADDIS ABABA': 'AD',
        'DIRE DAWA': 'DD',
        'AFAR': 'AF',
        'AMHARA': 'AM',
        'BENISHANGUL-GUMUZ': 'BG',
        'GAMBELLA': 'GM',
        'HARARI': 'HR',
        'OROMIA': 'OR',
        'SOMALI': 'SO',
        'SOUTHERN NATIONS': 'SN',
        'TIGRAY': 'TG'
    }

    @staticmethod
    def generate_certificate_number(record_type, region, woreda_code, year=None):
        """
        Generate Ethiopian-style certificate numbers
        Format: [TYPE]/[REGION]/[WOREDA]/[ET-YEAR]/[SEQUENCE]
        Example: BR/AD/01/2016/00001 
        """
        if not year:
            # Convert to Ethiopian year (Gregorian year - 8)
            gregorian_year = datetime.now().year
            ethiopian_year = gregorian_year - 8
            year = str(ethiopian_year)
        
        # Get region code
        region_code = CertificateGenerator.REGION_CODES.get(region.upper(), 'XX')
        
        # Generate sequence (in production, use database auto-increment)
        sequence = str(random.randint(1, 99999)).zfill(5)
        
        type_map = {
            'birth': 'BR',
            'death': 'DR', 
            'marriage': 'MR',
            'divorce': 'DV'
        }
        
        return f"{type_map.get(record_type, 'XX')}/{region_code}/{woreda_code.zfill(2)}/{year}/{sequence}"

    @staticmethod
    def convert_to_ethiopian_date(gregorian_date):
        """
        Convert Gregorian date to Ethiopian date (simplified)
        For production, use ethiopian_date package: pip install ethiopian-date
        """
        try:
            # Simple conversion (actual conversion needs proper library)
            eth_year = gregorian_date.year - 8
            eth_month = gregorian_date.month
            eth_day = gregorian_date.day
            
            # Ethiopian month names
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

class FileUpload:
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf', 'doc', 'docx'}
    
    @staticmethod
    def allowed_file(filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in FileUpload.ALLOWED_EXTENSIONS
    
    @staticmethod
    def save_file(file, upload_folder, subfolder=''):
        if file and FileUpload.allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Add timestamp to avoid filename conflicts
            name, ext = os.path.splitext(filename)
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            unique_filename = f"{name}_{timestamp}{ext}"
            
            folder_path = os.path.join(upload_folder, subfolder)
            os.makedirs(folder_path, exist_ok=True)
            
            file_path = os.path.join(folder_path, unique_filename)
            file.save(file_path)
            return unique_filename
        return None