# 🇪🇹 Ethiopian Vital Management System (VMS)

A comprehensive digital platform for managing vital records (birth, death, marriage, divorce) across Ethiopia. Built with modern web technologies and designed for scalability, security, and accessibility.

## 🌟 Features

### Core Functionality
- **Birth Registration**: Digital birth certificate management with Ethiopian calendar support
- **Death Records**: Comprehensive death certificate processing and management
- **Marriage Records**: Marriage registration and certificate generation
- **Divorce Records**: Divorce documentation and legal record keeping
- **User Management**: Role-based access control for different user types
- **Certificate Generation**: Automatic certificate number generation with regional codes
- **Search & Filtering**: Advanced search capabilities across all record types
- **Data Export**: Export functionality for reporting and analysis

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Updates**: Live data synchronization across the platform
- **Security**: JWT authentication, role-based permissions, data encryption
- **Scalability**: MongoDB database with optimized indexing
- **API-First**: RESTful API design for easy integration
- **Multi-language Support**: Ready for Amharic and other local languages

## 🏗️ Architecture

### Backend (Flask + MongoDB)
```
backend/
├── app/
│   ├── __init__.py          # Flask app initialization
│   ├── models.py            # Data models and database operations
│   ├── utils.py             # Utility functions
│   └── routes/              # API endpoints
│       ├── auth.py          # Authentication routes
│       ├── births.py        # Birth record management
│       ├── deaths.py        # Death record management
│       ├── marriages.py     # Marriage record management
│       ├── divorces.py      # Divorce record management
│       └── users.py         # User management
├── config.py                # Configuration settings
├── run.py                   # Application entry point
├── init_database.py         # Database initialization script
└── requirements.txt         # Python dependencies
```

### Frontend (React + Vite)
```
frontend/frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common components (Button, Input, etc.)
│   │   ├── auth/            # Authentication components
│   │   ├── birth/           # Birth record components
│   │   ├── layout/          # Layout components
│   │   └── sections/        # Page sections
│   ├── pages/               # Main application pages
│   ├── context/             # React context providers
│   ├── services/            # API service layer
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Utility functions
├── public/                  # Static assets
└── package.json             # Node.js dependencies
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB 4.4+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vital-management-system
   ```

2. **Run the automated setup**
   ```bash
   python start_system.py
   ```

   This script will:
   - Check system requirements
   - Install all dependencies
   - Initialize the database with sample data
   - Start both backend and frontend servers

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Manual Setup

If you prefer to set up manually:

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python init_database.py  # Initialize database with sample data
python run.py            # Start the backend server
```

#### Frontend Setup
```bash
cd frontend/frontend
npm install
npm run dev              # Start the frontend development server
```

## 🔑 Default Login Credentials

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@vms.et | admin123 | System administrator |
| VMS Officer | officer1@vms.et | officer123 | Regional officer (Oromia) |
| VMS Officer | officer2@vms.et | officer123 | Regional officer (SNNP) |

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique),
  password_hash: String,
  full_name: String,
  role: String, // admin, vms_officer, statistician, clerk
  department: String,
  region: String,
  zone: String,
  woreda: String,
  kebele: String,
  phone: String,
  badge_number: String (unique),
  office_name: String,
  is_active: Boolean,
  permissions: Object,
  created_at: Date,
  updated_at: Date,
  last_login: Date
}
```

### Birth Records Collection
```javascript
{
  _id: ObjectId,
  certificate_number: String (unique),
  child_first_name: String,
  child_father_name: String,
  child_grandfather_name: String,
  child_gender: String,
  date_of_birth: Date,
  time_of_birth: String,
  weight_kg: Number,
  place_of_birth_type: String,
  place_of_birth_name: String,
  birth_region: String,
  birth_zone: String,
  birth_woreda: String,
  birth_kebele: String,
  father_full_name: String,
  father_nationality: String,
  father_ethnicity: String,
  father_religion: String,
  father_date_of_birth: Date,
  father_occupation: String,
  father_id_number: String,
  father_phone: String,
  mother_full_name: String,
  mother_nationality: String,
  mother_ethnicity: String,
  mother_religion: String,
  mother_date_of_birth: Date,
  mother_occupation: String,
  mother_id_number: String,
  mother_phone: String,
  informant_name: String,
  informant_relationship: String,
  informant_phone: String,
  notes: String,
  registered_by: ObjectId,
  status: String, // draft, submitted, approved, rejected
  created_at: Date,
  updated_at: Date,
  ethiopian_date_of_birth: String
}
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Birth Records
- `GET /api/births` - Get birth records (with pagination and search)
- `POST /api/births` - Create birth record
- `GET /api/births/:id` - Get specific birth record
- `PUT /api/births/:id` - Update birth record
- `DELETE /api/births/:id` - Delete birth record
- `PUT /api/births/:id/status` - Update record status

### Death Records
- `GET /api/deaths` - Get death records
- `POST /api/deaths` - Create death record
- `GET /api/deaths/:id` - Get specific death record
- `PUT /api/deaths/:id` - Update death record
- `PUT /api/deaths/:id/status` - Update record status

### Marriage Records
- `GET /api/marriages` - Get marriage records
- `POST /api/marriages` - Create marriage record
- `GET /api/marriages/:id` - Get specific marriage record
- `PUT /api/marriages/:id` - Update marriage record
- `PUT /api/marriages/:id/status` - Update record status

### Divorce Records
- `GET /api/divorces` - Get divorce records
- `POST /api/divorces` - Create divorce record
- `GET /api/divorces/:id` - Get specific divorce record
- `PUT /api/divorces/:id` - Update divorce record
- `PUT /api/divorces/:id/status` - Update record status

### User Management
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create user (admin only)
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permission levels for different user types
- **Password Hashing**: Bcrypt password hashing for security
- **CORS Protection**: Configured CORS for cross-origin requests
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: MongoDB with parameterized queries
- **XSS Protection**: Content Security Policy headers

## 🌍 Localization

The system is designed to support multiple languages:
- English (default)
- Amharic (ready for implementation)
- Other Ethiopian languages (extensible)

## 📱 Mobile Responsiveness

The frontend is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret-key
MONGODB_URI=mongodb://localhost:27017/ethiopian_vital_management
UPLOAD_FOLDER=./uploads
MAX_CONTENT_LENGTH=16777216
```

### Database Configuration

The system uses MongoDB with the following collections:
- `users` - User accounts and profiles
- `birth_records` - Birth registration data
- `death_records` - Death registration data
- `marriage_records` - Marriage registration data
- `divorce_records` - Divorce registration data

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend/frontend
npm test
```

## 📈 Performance Optimization

- **Database Indexing**: Optimized indexes for fast queries
- **Pagination**: Efficient pagination for large datasets
- **Caching**: Redis caching for frequently accessed data
- **CDN**: Static asset delivery optimization
- **Compression**: Gzip compression for API responses

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment**
   ```bash
   # Install production dependencies
   pip install -r requirements.txt
   
   # Set environment variables
   export FLASK_ENV=production
   export MONGODB_URI=mongodb://your-mongodb-uri
   
   # Run with Gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 run:app
   ```

2. **Frontend Deployment**
   ```bash
   # Build for production
   npm run build
   
   # Serve with Nginx or Apache
   # Copy dist/ folder to web server
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@vms.et
- Documentation: [docs.vms.et](https://docs.vms.et)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🙏 Acknowledgments

- Ethiopian Ministry of Health
- Regional Health Bureaus
- Open source community
- All contributors and testers

---

**Built with ❤️ for Ethiopia 🇪🇹**
