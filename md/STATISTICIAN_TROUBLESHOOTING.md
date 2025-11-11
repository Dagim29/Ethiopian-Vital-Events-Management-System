# Statistician Dashboard Troubleshooting Guide

## Issue Fixed: Dashboard Not Showing Records

### What Was Wrong
The statistician dashboard had several issues:
1. ❌ No error handling when API fails
2. ❌ No handling for empty/null data
3. ❌ Division by zero errors in percentage calculations
4. ❌ No debug logging to diagnose issues
5. ❌ No user feedback during loading

### What Was Fixed
✅ Added comprehensive error handling  
✅ Added safe default values for all stats  
✅ Fixed division by zero in percentage calculations  
✅ Added console logging for debugging  
✅ Added loading message  
✅ Added error display with refresh button  

---

## How to Test the Fix

### Step 1: Login as Statistician
```
Email: stats@vms.et
Password: stats123
```

### Step 2: Check Browser Console
Open browser developer tools (F12) and look for:
```
Fetching statistician stats...
Statistician stats response: { totalRecords: X, totalBirths: Y, ... }
Rendering statistician dashboard with stats: { ... }
```

### Step 3: Verify Dashboard Display
You should see:
- ✅ Purple-themed header
- ✅ 4 main stat cards (Total, Births, Deaths, Marriages)
- ✅ 4 secondary stat cards (Divorces, Region, Growth, Quality)
- ✅ Record distribution chart with progress bars
- ✅ My Contribution section
- ✅ Quick Access buttons

---

## If Dashboard Shows 0 Records

This is **NORMAL** if:
- Database is empty (no records created yet)
- User's region has no records
- Fresh installation

### To Add Test Data:

#### Option 1: Use Admin to Create Records
1. Login as admin: `admin@vms.et` / `admin123`
2. Go to Birth Records → Add New Record
3. Fill in details and save
4. Repeat for Death, Marriage, Divorce records
5. Logout and login as statistician
6. Dashboard should now show the records

#### Option 2: Run Database Initialization
```bash
cd backend
python init_database.py
```
This creates sample records in the database.

---

## Common Issues & Solutions

### Issue 1: "Error Loading Dashboard" Message
**Symptoms:** Red error box appears  
**Causes:**
- Backend not running
- MongoDB not connected
- API endpoint error
- Network issue

**Solutions:**
1. Check if backend is running on `http://localhost:5000`
2. Check MongoDB connection
3. Look at backend terminal for errors
4. Check browser Network tab (F12) for failed requests

**Test Backend:**
```bash
# In browser or Postman
GET http://localhost:5000/api/users/officer-stats
# Should return JSON with statistics
```

### Issue 2: Dashboard Shows All Zeros
**Symptoms:** Dashboard loads but all numbers are 0  
**Causes:**
- No records in database
- User region has no records
- Backend returning empty data

**Solutions:**
1. Create some test records as admin or VMS officer
2. Check backend logs for any errors
3. Verify MongoDB has data:
```bash
mongosh
use ethiopian_vital_management
db.birth_records.count()
db.death_records.count()
```

### Issue 3: Left Sidebar Not Showing
**Symptoms:** No navigation menu visible  
**Causes:**
- Layout component not wrapping page
- CSS not loading
- Role not recognized

**Solutions:**
1. Check if you're logged in
2. Verify user role is 'statistician'
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check browser console for errors

### Issue 4: Buttons Don't Navigate
**Symptoms:** Clicking buttons does nothing  
**Causes:**
- Routes not defined
- React Router issue
- JavaScript error

**Solutions:**
1. Check browser console for errors
2. Verify routes exist in App.jsx
3. Try refreshing the page (F5)

---

## Debug Checklist

When statistician dashboard doesn't work:

### ✅ Backend Checks:
- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] `/api/users/officer-stats` endpoint responds
- [ ] No errors in backend terminal

### ✅ Frontend Checks:
- [ ] Frontend server is running
- [ ] No errors in browser console
- [ ] Network requests succeed (check Network tab)
- [ ] User is logged in with 'statistician' role

### ✅ Data Checks:
- [ ] Database has records
- [ ] User's region has records
- [ ] API returns valid JSON

### ✅ Browser Checks:
- [ ] Cache cleared
- [ ] JavaScript enabled
- [ ] No browser extensions blocking requests
- [ ] Using modern browser (Chrome, Firefox, Edge)

---

## API Response Format

The `/api/users/officer-stats` endpoint should return:

```json
{
  "totalRecords": 100,
  "totalBirths": 45,
  "totalDeaths": 20,
  "totalMarriages": 25,
  "totalDivorces": 10,
  "myRecords": 5,
  "myBirths": 2,
  "myDeaths": 1,
  "myMarriages": 1,
  "myDivorces": 1
}
```

If any field is missing, the dashboard will use 0 as default.

---

## Testing the API Directly

### Using Browser:
1. Login to the system
2. Open browser console (F12)
3. Run:
```javascript
fetch('http://localhost:5000/api/users/officer-stats', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => console.log(data))
```

### Using curl:
```bash
# Get your token from browser localStorage
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     http://localhost:5000/api/users/officer-stats
```

---

## Expected Behavior

### When Database is Empty:
- Dashboard loads successfully
- All numbers show 0
- Progress bars are empty (0%)
- No errors displayed
- Message: "0 Total Records"

### When Database Has Records:
- Dashboard loads successfully
- Numbers show actual counts
- Progress bars show percentages
- Charts display distribution
- Growth rate calculated correctly

### When API Fails:
- Error message displayed
- "Refresh Page" button shown
- Error details in console
- User can retry

---

## Files Modified

1. **`frontend/src/pages/statistician/Dashboard.jsx`**
   - Added error handling
   - Added safe default values
   - Fixed division by zero
   - Added debug logging
   - Improved loading state

---

## Quick Fix Commands

### Restart Backend:
```bash
cd backend
python run.py
```

### Restart Frontend:
```bash
cd frontend/frontend
npm run dev
```

### Clear Browser Cache:
```
Ctrl + Shift + Delete (Windows/Linux)
Cmd + Shift + Delete (Mac)
```

### Check MongoDB:
```bash
mongosh
use ethiopian_vital_management
db.birth_records.count()
```

---

## Contact Support

If issues persist:
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify all services are running
4. Try with a different browser
5. Clear all cache and cookies

---

**The statistician dashboard is now fully functional with proper error handling!** 🎉
