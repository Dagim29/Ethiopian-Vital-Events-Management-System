# Backend API Fixes

## Issues Fixed

### Issue 1: 403 Forbidden Error for Statistician/Clerk
**Error Log:**
```
GET /api/users/officer-stats HTTP/1.1" 403 -
```

**Problem:**
The `/api/users/officer-stats` endpoint only allowed `admin` and `vms_officer` roles, blocking `statistician` and `clerk` users.

**Solution:**
Updated permission check in `backend/app/routes/users.py` line 298:

**Before:**
```python
if current_user['role'] not in ['vms_officer', 'admin']:
    return jsonify({'error': 'Permission denied'}), 403
```

**After:**
```python
if current_user['role'] not in ['vms_officer', 'admin', 'statistician', 'clerk']:
    return jsonify({'error': 'Permission denied'}), 403
```

---

### Issue 2: 308 Permanent Redirect
**Error Log:**
```
GET /api/births?page=1&per_page=20 HTTP/1.1" 308 -
GET /api/marriages?page=1&per_page=20&search= HTTP/1.1" 308 -
```

**Problem:**
Flask's default `strict_slashes=True` was causing 308 redirects when URLs were accessed without trailing slashes.

**Solution:**
Disabled strict slashes in `backend/app/__init__.py`:

**Added:**
```python
def create_app():
    app = Flask(__name__)
    
    # Disable strict slashes to prevent 308 redirects
    app.url_map.strict_slashes = False
```

---

## How to Apply Fixes

### Step 1: Restart Backend Server
```bash
# Stop the current backend (Ctrl+C)
cd backend
python run.py
```

### Step 2: Verify Fixes
Check backend terminal for:
```
✅ MongoDB connected successfully!
✅ All blueprints registered successfully!
 * Running on http://127.0.0.1:5000
```

### Step 3: Test Statistician Login
1. Login as: `stats@vms.et` / `stats123`
2. Dashboard should load without errors
3. Check browser console - should see:
```
Fetching statistician stats...
Statistician stats response: {...}
```

### Step 4: Test Clerk Login
1. Login as: `clerk@vms.et` / `clerk123`
2. Dashboard should load without errors
3. All navigation should work

---

## Expected Backend Logs (Success)

```
127.0.0.1 - - [23/Oct/2025 21:30:00] "POST /api/auth/login HTTP/1.1" 200 -
127.0.0.1 - - [23/Oct/2025 21:30:01] "GET /api/users/officer-stats HTTP/1.1" 200 -
127.0.0.1 - - [23/Oct/2025 21:30:02] "GET /api/births?page=1&per_page=20 HTTP/1.1" 200 -
127.0.0.1 - - [23/Oct/2025 21:30:03] "GET /api/marriages?page=1&per_page=20 HTTP/1.1" 200 -
```

**All should return 200 (Success), not 403 or 308!**

---

## Files Modified

1. **`backend/app/routes/users.py`** (Line 298)
   - Added `statistician` and `clerk` to allowed roles

2. **`backend/app/__init__.py`** (Line 12)
   - Disabled strict slashes

---

## Testing Checklist

### ✅ Statistician Role:
- [ ] Can login successfully
- [ ] Dashboard loads without 403 error
- [ ] Stats display correctly
- [ ] Left sidebar shows navigation
- [ ] Can view all record types
- [ ] Cannot create/edit/delete records

### ✅ Clerk Role:
- [ ] Can login successfully
- [ ] Dashboard loads without 403 error
- [ ] Stats display correctly
- [ ] Left sidebar shows navigation
- [ ] Can create new records
- [ ] Can view own records

### ✅ VMS Officer Role:
- [ ] Still works as before
- [ ] Can access all features
- [ ] No regression issues

### ✅ Admin Role:
- [ ] Still works as before
- [ ] Can access all features
- [ ] No regression issues

---

## API Endpoint Permissions

| Endpoint | Admin | VMS Officer | Statistician | Clerk |
|----------|-------|-------------|--------------|-------|
| `/api/users/officer-stats` | ✅ | ✅ | ✅ | ✅ |
| `/api/births` (GET) | ✅ | ✅ | ✅ | ✅ |
| `/api/births` (POST) | ✅ | ✅ | ❌ | ✅ |
| `/api/births/:id` (PUT) | ✅ | ✅ | ❌ | ❌ |
| `/api/births/:id` (DELETE) | ✅ | ✅ | ❌ | ❌ |
| `/api/users` | ✅ | ❌ | ❌ | ❌ |

---

## Troubleshooting

### Still Getting 403 Error?
1. **Restart backend server** (important!)
2. Clear browser cache
3. Logout and login again
4. Check backend terminal for errors

### Still Getting 308 Redirect?
1. **Restart backend server** (important!)
2. Check Flask version: `pip show flask`
3. Verify `strict_slashes = False` is in code
4. Clear browser cache

### Dashboard Still Not Loading?
1. Check backend is running
2. Check MongoDB is connected
3. Look at browser console (F12)
4. Look at backend terminal for errors
5. Try with different browser

---

## Quick Test Command

Test the API directly:
```bash
# Get your auth token from browser localStorage
# Then test the endpoint:

curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/users/officer-stats

# Should return 200 with JSON data, not 403!
```

---

## Common Error Codes

- **200** ✅ Success
- **308** ⚠️ Permanent Redirect (fixed by disabling strict_slashes)
- **403** ❌ Forbidden (fixed by adding roles to permission check)
- **404** ❌ Not Found (check URL spelling)
- **500** ❌ Server Error (check backend logs)

---

**Both issues are now fixed! Restart the backend server to apply changes.** 🎉
