# 🇪🇹 Ethiopian Vital Events Management System (EVEMS)

A comprehensive, enterprise-grade web application for managing vital records (births, deaths, marriages, divorces) in Ethiopia with advanced statistical reporting, predictive analytics, and professional certificate generation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18.0+-61dafb.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/mongodb-4.4+-green.svg)](https://www.mongodb.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [User Roles](#user-roles)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

The Ethiopian Vital Events Management System (EVEMS) is a modern, full-stack web application designed to digitize and streamline the management of vital records across Ethiopia. The system supports multi-role access, automated workflows, advanced analytics, and professional report generation.

### **Why EVEMS?**

- 🚀 **Modern Architecture** - Built with React and Flask for performance and scalability
- 🔐 **Secure** - JWT authentication, role-based access control, and audit trails
- 📊 **Data-Driven** - Real-time analytics, predictive modeling, and professional reporting
- 🇪🇹 **Ethiopia-Focused** - Support for all 12 Ethiopian regions with localized features
- 📱 **Responsive** - Works seamlessly on desktop, tablet, and mobile devices
- ♿ **Accessible** - WCAG 2.1 compliant with keyboard navigation support

---

## ✨ Key Features

### 📝 **Record Management**

#### **Birth Records**
- Complete birth registration with parent information
- Photo upload for birth certificates
- Automatic certificate number generation
- Father and mother details tracking
- Birth location and hospital information

#### **Death Records**
- Comprehensive death record registration
- Cause of death documentation
- Next of kin information
- Death certificate generation
- Medical examiner details

#### **Marriage Records**
- Bride and groom information management
- Witness details tracking
- Marriage certificate generation
- Marriage type classification
- Photo upload support

#### **Divorce Records**
- Divorce petition tracking
- Court order documentation
- Asset division records
- Child custody information
- Legal representative details

### 👥 **User Role Management**

#### **Admin**
- Complete system oversight
- User management (create, update, delete, activate/deactivate)
- System-wide statistics dashboard
- Report review and approval
- Audit trail monitoring
- System configuration

#### **VMS Officer**
- Record registration (birth, death, marriage, divorce)
- Photo upload and management
- Record status tracking
- Certificate preview
- Regional data entry

#### **Clerk**
- Record approval workflow
- Document verification
- Status updates (pending, approved, rejected)
- Quality control checks
- Batch processing
- Filter and search capabilities

#### **Statistician**
- Advanced analytics dashboard
- Custom report generation (PDF/Excel)
- Predictive analytics and forecasting
- Regional breakdown analysis
- Data export (CSV, Excel, PDF)
- Chart and visualization creation
- Report submission to admin

### 📊 **Advanced Analytics & Reporting**

#### **Statistical Dashboard**
- Real-time record counts by type
- Regional distribution visualization
- Monthly trend analysis
- Year-over-year comparisons
- Data quality metrics
- Interactive charts (Chart.js)

#### **Professional Report Generation**
- **PDF Reports** with embedded charts
- **Excel Workbooks** with multiple sheets
- **Custom Filters** (region, record type, date range)
- **Predictive Analytics** (3-month forecasting)
- **Data Labels** on pie charts showing counts and percentages
- **Historical Trends** (12-month analysis)
- **Regional Breakdown** by Ethiopian regions

#### **Predictive Analytics**
- Linear regression-based forecasting
- 3-month future predictions
- Trend detection and pattern recognition
- Growth rate calculations
- Seasonal analysis

### 🔒 **Security Features**

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt encryption for passwords
- **Role-Based Access Control (RBAC)** - Granular permissions
- **Audit Trail** - Complete activity logging with timestamps
- **Session Management** - Automatic token refresh
- **Input Validation** - Server and client-side validation
- **CORS Protection** - Configured cross-origin policies
- **SQL Injection Prevention** - MongoDB parameterized queries

### 📄 **Certificate Generation**

- **Professional Templates** - Ethiopian flag and official seals
- **PDF Generation** - High-quality downloadable certificates
- **Unique Certificate Numbers** - Auto-generated with checksums
- **QR Code Integration** - For verification (future feature)
- **Multi-language Support** - Amharic and English (planned)

### 🔍 **Search & Filter**

- **Advanced Filters** - By region, status, date range, record type
- **Full-Text Search** - Search by name, certificate number
- **Export Filtered Data** - CSV, Excel, PDF
- **Saved Filters** - Quick access to common searches
- **Batch Operations** - Approve/reject multiple records

### 🎨 **User Interface**

- **Modern Design** - Clean, intuitive interface with TailwindCSS
- **Responsive Layout** - Mobile-first design
- **Dark Mode** - Eye-friendly theme (planned)
- **Ethiopian Theme** - Green, yellow, red color scheme
- **Toast Notifications** - Real-time feedback
- **Loading States** - Skeleton screens and spinners
- **Error Handling** - User-friendly error messages

---

## 🛠️ Technology Stack

### **Backend**

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.9+ | Core language |
| Flask | 2.3+ | Web framework |
| MongoDB | 4.4+ | Database |
| PyMongo | 4.0+ | MongoDB driver |
| Flask-JWT-Extended | 4.5+ | Authentication |
| Flask-CORS | 4.0+ | CORS handling |
| Bcrypt | 4.0+ | Password hashing |
| python-dateutil | 2.8+ | Date manipulation |

### **Frontend**

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2+ | UI framework |
| Vite | 4.4+ | Build tool |
| TailwindCSS | 3.3+ | Styling |
| React Query | 4.0+ | Data fetching |
| React Router | 6.0+ | Navigation |
| Chart.js | 4.0+ | Data visualization |
| chartjs-plugin-datalabels | 2.2+ | Chart labels |
| jsPDF | 2.5+ | PDF generation |
| jspdf-autotable | 3.6+ | PDF tables |
| XLSX | 0.18+ | Excel export |
| date-fns | 2.30+ | Date utilities |
| Heroicons | 2.0+ | Icons |
| React Toastify | 9.1+ | Notifications |

### **Development Tools**

- **Git** - Version control
- **VS Code** - IDE
- **Postman** - API testing
- **MongoDB Compass** - Database management
- **Chrome DevTools** - Debugging

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Admin   │  │   Clerk  │  │ Officer  │  │Statistic.│   │
│  │Dashboard │  │Dashboard │  │Dashboard │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                         │                                     │
│                    React Router                               │
│                         │                                     │
│                    API Service Layer                          │
│                         │                                     │
└─────────────────────────┼─────────────────────────────────────┘
                          │
                     HTTP/HTTPS (JWT)
                          │
┌─────────────────────────┼─────────────────────────────────────┐
│                    Backend (Flask)                            │
│                         │                                     │
│         ┌───────────────┴───────────────┐                    │
│         │                                │                    │
│    ┌────▼────┐  ┌──────────┐  ┌────────▼───┐               │
│    │  Auth   │  │  Users   │  │  Records   │               │
│    │  Routes │  │  Routes  │  │  Routes    │               │
│    └────┬────┘  └────┬─────┘  └────┬───────┘               │
│         │            │              │                        │
│         └────────────┴──────────────┘                        │
│                      │                                        │
│              JWT Middleware                                   │
│                      │                                        │
│              MongoDB Driver                                   │
│                      │                                        │
└──────────────────────┼────────────────────────────────────────┘
                       │
                  MongoDB Atlas
                       │
        ┌──────────────┼──────────────┐
        │              │               │
   ┌────▼────┐  ┌─────▼─────┐  ┌─────▼─────┐
   │  Users  │  │  Records  │  │  Reports  │
   │Collection│ │Collection │  │Collection │
   └─────────┘  └───────────┘  └───────────┘
```

---

## 📦 Installation

### **Prerequisites**

Before you begin, ensure you have the following installed:

- ✅ **Python 3.9+** - [Download](https://www.python.org/downloads/)
- ✅ **Node.js 16+** - [Download](https://nodejs.org/)
- ✅ **MongoDB 4.4+** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- ✅ **Git** - [Download](https://git-scm.com/)

### **1. Clone the Repository**

```bash
git clone https://github.com/Dagim29/Ethiopian-Vital-Events-Management-System.git
cd Ethiopian-Vital-Events-Management-System
```

### **2. Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Copy and edit with your configuration
```

**Create `.env` file in backend directory:**

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/vital_management
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vital_management

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES=3600

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-flask-secret-key-change-this

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216  # 16MB
```

**Initialize Database:**

```bash
python init_db.py
```

**Run Backend Server:**

```bash
python run.py
```

Backend will run on `http://localhost:5000`

### **3. Frontend Setup**

```bash
# Navigate to frontend directory (from project root)
cd frontend/frontend

# Install dependencies
npm install

# Create .env file
```

**Create `.env` file in frontend/frontend directory:**

```env
VITE_API_URL=http://localhost:5000/api
```

**Run Frontend Development Server:**

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### **4. Access the Application**

Open your browser and navigate to:
```
http://localhost:5173
```

**Default Admin Credentials:**
```
Email: admin@evms.gov.et
Password: admin123
```

⚠️ **Important:** Change the default admin password after first login!

---

## 👥 User Roles & Permissions

### **Admin** 👑
**Full system access and management**

✅ User Management (CRUD operations)  
✅ View all records across all regions  
✅ System-wide statistics and analytics  
✅ Review and approve statistician reports  
✅ Audit trail access  
✅ System configuration  
✅ User activation/deactivation  

### **VMS Officer** 📝
**Record registration and management**

✅ Register new records (birth, death, marriage, divorce)  
✅ Upload photos and documents  
✅ Edit pending records  
✅ View own registered records  
✅ Generate certificate previews  
✅ Regional data entry  
❌ Cannot approve/reject records  

### **Clerk** ✔️
**Record verification and approval**

✅ View pending records  
✅ Approve/reject records  
✅ Add approval comments  
✅ Filter and search records  
✅ Batch processing  
✅ Quality control checks  
❌ Cannot register new records  
❌ Cannot access analytics  

### **Statistician** 📊
**Analytics and reporting**

✅ View all approved records  
✅ Generate statistical reports  
✅ Create custom analytics  
✅ Export data (PDF, Excel, CSV)  
✅ Predictive analytics  
✅ Regional analysis  
✅ Submit reports to admin  
❌ Cannot modify records  
❌ Cannot approve/reject records  

---

## 🌍 Ethiopian Regions Supported

The system supports all **12 Ethiopian regions** with proper abbreviation mapping:

| Region | Code | Population (est.) |
|--------|------|-------------------|
| Addis Ababa | AD | 3.4M |
| Afar | AF | 1.8M |
| Amhara | AM | 21.1M |
| Benishangul-Gumuz | BG | 1.1M |
| Dire Dawa | DD | 0.5M |
| Gambela | GA | 0.4M |
| Harari | HA | 0.2M |
| Oromia | OR | 35.5M |
| Sidama | SI | 3.9M |
| Somali | SO | 5.7M |
| Southern Nations | SN | 15.0M |
| Tigray | TI | 5.2M |

---

## 📡 API Documentation

### **Base URL**
```
http://localhost:5000/api
```

### **Authentication Endpoints**

#### **Login**
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "admin",
    "full_name": "John Doe"
  }
}
```

#### **Register**
```http
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "Jane Doe",
  "role": "clerk",
  "region": "Addis Ababa"
}
```

#### **Get Current User**
```http
GET /auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "admin",
  "full_name": "John Doe",
  "region": "Addis Ababa"
}
```

### **Records Endpoints**

#### **Get Birth Records**
```http
GET /births?status=approved&region=Addis Ababa&page=1&limit=10
Authorization: Bearer <token>

Response: 200 OK
{
  "records": [...],
  "total": 150,
  "page": 1,
  "pages": 15
}
```

#### **Create Birth Record**
```http
POST /births
Authorization: Bearer <token>
Content-Type: application/json

{
  "child_first_name": "Abebe",
  "child_last_name": "Kebede",
  "date_of_birth": "2024-01-15",
  "birth_region": "AD",
  "father_name": "Kebede Alemu",
  "mother_name": "Tigist Haile",
  ...
}
```

#### **Approve/Reject Record**
```http
PUT /births/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "comment": "All documents verified"
}
```

### **Statistics Endpoints**

#### **Get Filtered Statistics**
```http
GET /users/filtered-stats?region=Addis Ababa&record_type=birth&start_date=2024-01-01&end_date=2024-12-31
Authorization: Bearer <token>

Response: 200 OK
{
  "totalRecords": 1250,
  "totalBirths": 500,
  "totalDeaths": 250,
  "totalMarriages": 300,
  "totalDivorces": 200,
  "historicalData": [...],
  "regionalBreakdown": [...]
}
```

### **User Management Endpoints**

#### **Get All Users (Admin)**
```http
GET /users
Authorization: Bearer <token>

Response: 200 OK
{
  "users": [...]
}
```

#### **Create User (Admin)**
```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "New User",
  "role": "clerk",
  "region": "Oromia"
}
```

---

## 📸 Screenshots

### **Landing Page**
Modern, responsive landing page with Ethiopian theme

### **Admin Dashboard**
System-wide statistics and user management

### **Statistician Reports**
Professional report generation with charts and predictions

### **Record Management**
Intuitive interface for record registration and approval

### **Certificate Generation**
Professional certificates with Ethiopian flag

---

## 🚀 Deployment

### **Backend Deployment (Heroku)**

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new app
heroku create evems-backend

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET_KEY=your-secret-key
heroku config:set FLASK_ENV=production

# Deploy
git push heroku main
```

### **Frontend Deployment (Netlify)**

```bash
# Build for production
npm run build

# Deploy to Netlify
# Drag and drop the 'dist' folder to Netlify
# Or use Netlify CLI
netlify deploy --prod
```

### **Environment Variables for Production**

**Backend:**
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET_KEY` - Strong secret key
- `FLASK_ENV=production`
- `CORS_ORIGINS` - Frontend URL

**Frontend:**
- `VITE_API_URL` - Backend API URL

---

## 🧪 Testing

### **Backend Tests**

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py
```

### **Frontend Tests**

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### **Coding Standards**

- **Python**: Follow PEP 8
- **JavaScript**: Follow Airbnb Style Guide
- **Commits**: Use conventional commits (feat, fix, docs, etc.)
- **Documentation**: Update README for new features

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **Dagim** - *Lead Developer* - [@Dagim29](https://github.com/Dagim29)

---

## 🙏 Acknowledgments

- Ethiopian Ministry of Health
- Ethiopian Civil Registration and Vital Statistics System
- Open source community
- All contributors and testers

---

## 📞 Support & Contact

- **Email**: support@evems.gov.et
- **GitHub Issues**: [Create an issue](https://github.com/Dagim29/Ethiopian-Vital-Events-Management-System/issues)
- **Documentation**: [Wiki](https://github.com/Dagim29/Ethiopian-Vital-Events-Management-System/wiki)

---

## 🔄 Version History

### **v1.2.0** (Current) - November 2025
- ✨ Added predictive analytics with linear regression
- ✨ Enhanced report generation with data labels on pie charts
- ✨ Implemented region abbreviation mapping
- ✨ Added 12-month historical trend analysis
- 🐛 Fixed region filtering issues
- 🐛 Fixed date range handling
- 📊 Improved chart visualizations

### **v1.1.0** - October 2025
- ✨ Added statistical reporting system
- ✨ Implemented PDF and Excel export
- ✨ Added custom filters (region, record type, date)
- ✨ Created statistician dashboard
- 🎨 Enhanced UI with TailwindCSS

### **v1.0.0** - September 2025
- 🎉 Initial release
- ✅ Birth, death, marriage, divorce record management
- ✅ User authentication and authorization
- ✅ Role-based access control
- ✅ Certificate generation
- ✅ Audit trail system

---

## 🗺️ Roadmap

### **Upcoming Features**

- [ ] Mobile application (React Native)
- [ ] QR code verification for certificates
- [ ] Multi-language support (Amharic, Oromo, Tigrinya)
- [ ] SMS notifications
- [ ] Email notifications
- [ ] Advanced search with Elasticsearch
- [ ] Real-time collaboration
- [ ] Blockchain integration for certificate verification
- [ ] AI-powered data validation
- [ ] Biometric integration
- [ ] Digital signatures
- [ ] API rate limiting
- [ ] GraphQL API
- [ ] Microservices architecture

---

## 📊 Project Statistics

- **Total Lines of Code**: ~15,000+
- **Backend Files**: 50+
- **Frontend Components**: 30+
- **API Endpoints**: 40+
- **Supported Regions**: 12
- **User Roles**: 4
- **Record Types**: 4

---

<div align="center">

### Made with ❤️ for Ethiopia

**⭐ Star this repo if you find it useful!**

[Report Bug](https://github.com/Dagim29/Ethiopian-Vital-Events-Management-System/issues) · [Request Feature](https://github.com/Dagim29/Ethiopian-Vital-Events-Management-System/issues) · [Documentation](https://github.com/Dagim29/Ethiopian-Vital-Events-Management-System/wiki)

</div>

