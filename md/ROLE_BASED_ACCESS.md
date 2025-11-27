# Role-Based Access Control (RBAC) - Business Logic

## User Roles and Permissions

### 1. **Admin**
**Full System Access**
- ✅ **Dashboard**: Admin-specific dashboard with system-wide statistics
- ✅ **User Management**: Create, view, edit, delete users
- ✅ **All Records**: Full CRUD access to Birth, Death, Marriage, Divorce records
- ✅ **Approvals**: Can approve/reject all records
- ✅ **Settings**: Full system configuration access
- ✅ **Reports**: Generate system-wide reports
- ✅ **Region Access**: Can access records from all regions

**Dashboard Location**: `/pages/admin/Dashboard.jsx`

---

### 2. **VMS Officer (Vital Management System Officer)**
**Full Record Management Access (Except User Management)**
- ✅ **Dashboard**: VMS Officer-specific dashboard with record statistics
- ✅ **All Records**: Full CRUD access to Birth, Death, Marriage, Divorce records
  - Can **create** new records
  - Can **view** all records in their region
  - Can **edit** all records in their region
  - Can **approve** records
  - Can **delete** records (if authorized)
- ❌ **User Management**: Cannot access user management page
- ✅ **Settings**: Can update own profile
- ✅ **Reports**: Generate reports for their region
- ✅ **Region Access**: Limited to their assigned region (unless admin override)

**Dashboard Location**: `/pages/vms-officer/Dashboard.jsx`

**Key Features**:
- Quick action buttons to register new records
- View and manage all record types
- Approve pending records
- Track personal contribution statistics
- View record distribution charts

---

### 3. **Statistician**
**Read-Only Access for Statistical Analysis**
- ✅ **Dashboard**: Statistician-specific dashboard with analytics
- ✅ **View Records**: Can view all Birth, Death, Marriage, Divorce records
  - Can **view** records for statistical analysis
  - Can **export** data for reports
- ❌ **Create/Edit**: Cannot create or edit records
- ❌ **Delete**: Cannot delete records
- ❌ **Approve**: Cannot approve records
- ❌ **User Management**: Cannot access user management
- ✅ **Settings**: Can update own profile
- ✅ **Reports**: Generate statistical reports and analytics
- ✅ **Region Access**: Can view records from assigned region

**Dashboard Location**: `/pages/statistician/Dashboard.jsx`

**Key Features**:
- View-only access to all record types
- Statistical analysis dashboards
- Record distribution visualizations
- Quick access to view records
- Cannot modify any data

---

### 4. **Clerk** (Future Implementation)
**Limited Data Entry Access**
- ✅ **Dashboard**: Basic dashboard
- ✅ **Create Records**: Can create new records (draft status)
- ✅ **View Own Records**: Can view records they created
- ❌ **Edit Others**: Cannot edit records created by others
- ❌ **Approve**: Cannot approve records
- ❌ **Delete**: Cannot delete records
- ❌ **User Management**: Cannot access user management
- ✅ **Settings**: Can update own profile

---

## Access Control Matrix

| Feature | Admin | VMS Officer | Statistician | Clerk |
|---------|-------|-------------|--------------|-------|
| **Dashboard** | ✅ Full | ✅ Records | ✅ Analytics | ✅ Basic |
| **Create Records** | ✅ | ✅ | ❌ | ✅ (Draft) |
| **View Records** | ✅ All | ✅ Region | ✅ Region | ✅ Own |
| **Edit Records** | ✅ All | ✅ Region | ❌ | ❌ |
| **Delete Records** | ✅ | ✅ | ❌ | ❌ |
| **Approve Records** | ✅ | ✅ | ❌ | ❌ |
| **User Management** | ✅ | ❌ | ❌ | ❌ |
| **Settings (Own)** | ✅ | ✅ | ✅ | ✅ |
| **Reports** | ✅ All | ✅ Region | ✅ Analytics | ❌ |
| **Region Access** | ✅ All | ✅ Assigned | ✅ Assigned | ✅ Assigned |

---

## Implementation Details

### Frontend Routing
```javascript
// Dashboard.jsx
const Dashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  if (user?.role === 'vms_officer') {
    return <VMSOfficerDashboard />;
  }
  
  if (user?.role === 'statistician') {
    return <StatisticianDashboard />;
  }
  
  // Default dashboard for other roles
  return <DefaultDashboard />;
};
```

### Backend Authorization
```python
# Example from users.py
@bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    current_user = find_user_by_id(db, current_user_id)
    
    # Only admin can access user management
    if current_user['role'] != 'admin':
        return jsonify({'error': 'Permission denied'}), 403
```

### Record Access Control
```python
# Example from births.py
@bp.route('/', methods=['GET'])
@jwt_required()
def get_birth_records():
    current_user = find_user_by_id(db, current_user_id)
    
    filters = {}
    
    # VMS Officer and Statistician: Region-based access
    if current_user['role'] in ['vms_officer', 'statistician']:
        if current_user.get('region'):
            filters['birth_region'] = current_user['region']
        if current_user.get('woreda'):
            filters['birth_woreda'] = current_user['woreda']
    
    # Admin: Access all records (no filters)
    records = db.birth_records.find(filters)
```

---

## Navigation Menu Access

### Admin Navigation
- Dashboard
- Birth Records
- Death Records
- Marriage Records
- Divorce Records
- **Users** (Admin only)
- Settings

### VMS Officer Navigation
- Dashboard
- Birth Records
- Death Records
- Marriage Records
- Divorce Records
- Settings
- ~~Users~~ (Hidden)

### Statistician Navigation
- Dashboard
- Birth Records (View only)
- Death Records (View only)
- Marriage Records (View only)
- Divorce Records (View only)
- Settings
- ~~Users~~ (Hidden)

---

## Security Notes

1. **Frontend Protection**: Role-based routing and UI hiding
2. **Backend Protection**: JWT authentication + role verification on every API endpoint
3. **Region Filtering**: Automatic filtering based on user's assigned region
4. **Audit Trail**: All actions logged with user ID and timestamp
5. **Photo Access**: Users can only upload/view photos for records they have access to

---

## Testing Accounts

Create test users with different roles:

```javascript
// Admin
{
  email: "admin@vms.et",
  role: "admin",
  region: null // Access all regions
}

// VMS Officer
{
  email: "officer@vms.et",
  role: "vms_officer",
  region: "AA", // Addis Ababa
  woreda: "01"
}

// Statistician
{
  email: "stats@vms.et",
  role: "statistician",
  region: "AA", // Addis Ababa
  woreda: "01"
}
```

---

## Future Enhancements

1. **Granular Permissions**: Add specific permissions per action
2. **Multi-Region Access**: Allow users to access multiple regions
3. **Temporary Access**: Grant temporary elevated permissions
4. **Audit Dashboard**: View all user actions and changes
5. **Role Hierarchy**: Implement role inheritance
6. **Custom Roles**: Allow admins to create custom roles with specific permissions
