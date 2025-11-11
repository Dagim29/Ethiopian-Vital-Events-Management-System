# 🚀 Complete Audit Trail Implementation Guide

## ✅ **Status**

- ✅ **Birth Records** - Fully implemented
- ⏳ **Death Records** - Import added, need to add to update/approve/reject/delete
- ⏳ **Marriage Records** - Need to implement
- ⏳ **Divorce Records** - Need to implement
- ⏳ **Frontend View Modals** - Need to add AuditHistory component
- ⏳ **Admin Dashboard** - Need to create

---

## 📋 **Task 1: Complete Backend Audit Logging**

### **Death Records** (`deaths.py`)

✅ **Already Added:**
- Import statement
- Create audit log

⏳ **Still Need:**

Add to **update_death_record** function (around line 350):
```python
# After the update_one operation
# Create audit log with only changed fields
changed_field_names = [k for k in update_data.keys() if k != 'updated_at' and k != 'ethiopian_date_of_death']

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
```

Add to **update_death_record_status** function (around line 420):
```python
# After status update
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
```

Add to **delete_death_record** function (around line 440):
```python
# Before deletion
death_record = db.death_records.find_one({'_id': ObjectId(death_id)})
record_name = f"{death_record.get('deceased_first_name', 'Unknown')} {death_record.get('deceased_father_name', '')}"

# After deletion
create_audit_log(
    db=db,
    user_id=current_user_id,
    action='delete',
    record_type='death',
    record_id=death_id,
    details=f"Deleted death record for {record_name}"
)
```

---

### **Marriage Records** (`marriages.py`)

Add import at top:
```python
from .audit_logs import create_audit_log
```

Add to **create_marriage_record** (after insert_one):
```python
marriage_id = str(result.inserted_id)

create_audit_log(
    db=db,
    user_id=current_user_id,
    action='create',
    record_type='marriage',
    record_id=marriage_id,
    details=f"Created marriage record for {data.get('spouse1_full_name', 'Spouse 1')} & {data.get('spouse2_full_name', 'Spouse 2')}"
)
```

Add to **update_marriage_record**, **update_marriage_record_status**, and **delete_marriage_record** (same pattern as deaths)

---

### **Divorce Records** (`divorces.py`)

Same pattern as marriages - add import and audit logging to all CRUD operations.

---

## 📋 **Task 2: Add AuditHistory to View Modals**

### **ViewDeathRecord.jsx**

1. Add import:
```javascript
import AuditHistory from '../audit/AuditHistory';
```

2. Find the scrollable div (search for `max-h-[70vh] overflow-y-auto`)

3. Add before closing the scrollable div:
```javascript
{/* Audit History Section */}
{record && record.death_id && (
  <div className="mt-8 border-t border-gray-200 pt-6">
    <AuditHistory 
      recordType="death" 
      recordId={record.death_id} 
    />
  </div>
)}
```

---

### **ViewMarriageRecord.jsx**

Same pattern:
```javascript
import AuditHistory from '../audit/AuditHistory';

// In scrollable div
{record && record.marriage_id && (
  <div className="mt-8 border-t border-gray-200 pt-6">
    <AuditHistory 
      recordType="marriage" 
      recordId={record.marriage_id} 
    />
  </div>
)}
```

---

### **ViewDivorceRecord.jsx**

Same pattern:
```javascript
import AuditHistory from '../audit/AuditHistory';

// In scrollable div
{record && record.divorce_id && (
  <div className="mt-8 border-t border-gray-200 pt-6">
    <AuditHistory 
      recordType="divorce" 
      recordId={record.divorce_id} 
    />
  </div>
)}
```

---

## 📋 **Task 3: Create Admin Audit Logs Dashboard**

### **Create New Page:** `frontend/src/pages/admin/AuditLogs.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { auditLogsAPI } from '../../services/api';
import { ClockIcon, UserIcon, FunnelIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    record_type: '',
    start_date: '',
    end_date: '',
    page: 1,
    limit: 50
  });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogsAPI.getAuditLogs(filters);
      setLogs(response.audit_logs);
      setTotal(response.total);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const badges = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      approve: 'bg-green-100 text-green-800',
      reject: 'bg-red-100 text-red-800',
      delete: 'bg-red-100 text-red-800',
    };
    return badges[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ClockIcon className="h-8 w-8 mr-3 text-teal-600" />
          Audit Logs
        </h1>
        <p className="text-gray-600 mt-2">Complete system activity history</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value, page: 1})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Record Type
            </label>
            <select
              value={filters.record_type}
              onChange={(e) => setFilters({...filters, record_type: e.target.value, page: 1})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            >
              <option value="">All Types</option>
              <option value="birth">Birth</option>
              <option value="death">Death</option>
              <option value="marriage">Marriage</option>
              <option value="divorce">Divorce</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({...filters, start_date: e.target.value, page: 1})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({...filters, end_date: e.target.value, page: 1})}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Record Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No audit logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{log.user_name}</div>
                    <div className="text-sm text-gray-500">{log.user_role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.record_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.details}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {total > filters.limit && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters({...filters, page: filters.page - 1})}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({...filters, page: filters.page + 1})}
                disabled={filters.page * filters.limit >= total}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(filters.page * filters.limit, total)}</span> of{' '}
                  <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setFilters({...filters, page: filters.page - 1})}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters({...filters, page: filters.page + 1})}
                    disabled={filters.page * filters.limit >= total}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
```

### **Add Route**

In `frontend/src/App.jsx`, add route for admin:
```javascript
import AuditLogs from './pages/admin/AuditLogs';

// In admin routes
<Route path="/admin/audit-logs" element={<AuditLogs />} />
```

### **Add to Admin Navigation**

In admin layout/sidebar, add link:
```javascript
<Link to="/admin/audit-logs">
  <ClockIcon className="h-5 w-5" />
  Audit Logs
</Link>
```

---

## 📋 **Task 4: Add Audit Stats to Dashboards**

### **Admin Dashboard** (`pages/admin/Dashboard.jsx`)

Add to the component:
```javascript
const [auditStats, setAuditStats] = useState(null);

useEffect(() => {
  const fetchAuditStats = async () => {
    try {
      const stats = await auditLogsAPI.getStats();
      setAuditStats(stats);
    } catch (error) {
      console.error('Error fetching audit stats:', error);
    }
  };
  fetchAuditStats();
}, []);

// In the JSX, add a stats card:
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
  <div className="space-y-2">
    <div className="flex justify-between">
      <span className="text-gray-600">Last 24 hours:</span>
      <span className="font-semibold">{auditStats?.recent_activity || 0} actions</span>
    </div>
    <div className="flex justify-between">
      <span className="text-gray-600">Total logs:</span>
      <span className="font-semibold">{auditStats?.total_logs || 0}</span>
    </div>
  </div>
</div>
```

---

## ✅ **Summary Checklist**

### **Backend:**
- [x] Birth records - Complete
- [ ] Death records - Create done, need update/approve/reject/delete
- [ ] Marriage records - Need all operations
- [ ] Divorce records - Need all operations

### **Frontend:**
- [x] Birth view modal - Complete
- [ ] Death view modal - Need to add AuditHistory
- [ ] Marriage view modal - Need to add AuditHistory
- [ ] Divorce view modal - Need to add AuditHistory
- [ ] Admin audit logs page - Need to create
- [ ] Audit stats widgets - Need to add

---

## 🚀 **Quick Implementation Order**

1. **Complete death records backend** (15 min)
2. **Add to death view modal** (5 min)
3. **Repeat for marriage** (20 min)
4. **Repeat for divorce** (20 min)
5. **Create admin audit logs page** (30 min)
6. **Add stats widgets** (15 min)

**Total: ~2 hours**

---

Would you like me to continue implementing these one by one, or would you prefer to implement them yourself using this guide?
