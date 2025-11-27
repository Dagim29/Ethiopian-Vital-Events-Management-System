# 🔍 Divorce Records Not Displaying - Debug Guide

## 🐛 **Issue**

- Records exist in database ✅
- Backend returns 200 OK ✅
- Records NOT displayed in frontend ❌

---

## 🔧 **Debug Logging Added**

### **File:** `frontend/src/pages/DivorceRecords.jsx`

Added detailed console logging to track data flow:

```javascript
// When fetching records
console.log('API Response in component:', response);
console.log('Response type:', typeof response);
console.log('Has divorce_records?', response?.divorce_records);
console.log('divorce_records length:', response?.divorce_records?.length);
console.log('divorce_records array:', response?.divorce_records);

// When setting state
console.log('Setting records to state:', response.divorce_records);
console.log('State updated - records count:', response.divorce_records.length);

// When rendering
console.log('Rendering DivorceRecords - records state:', records);
console.log('Rendering DivorceRecords - records.length:', records.length);
console.log('Rendering DivorceRecords - loading:', loading);
```

---

## 📋 **How to Debug**

### **Step 1: Open Browser Console**
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Clear console (trash icon)
4. Refresh the divorce records page

### **Step 2: Check Console Logs**

Look for these logs in order:

#### **A. Fetching Request:**
```
Fetching divorce records with params: {page: 1, per_page: 20, search: ''}
```

#### **B. API Response:**
```
API Response in component: {divorce_records: Array(X), total: X, pages: X}
Response type: object
Has divorce_records? Array(X)
divorce_records length: X
divorce_records array: [{...}, {...}, ...]
```

#### **C. State Update:**
```
Setting records to state: [{...}, {...}, ...]
State updated - records count: X
```

#### **D. Rendering:**
```
Rendering DivorceRecords - records state: [{...}, {...}, ...]
Rendering DivorceRecords - records.length: X
Rendering DivorceRecords - loading: false
```

---

## 🎯 **Possible Issues & Solutions**

### **Issue 1: Response Structure Mismatch**

**Symptom:**
```
Has divorce_records? undefined
```

**Cause:** Backend returns different structure than expected

**Solution:** Check backend response format
```python
# Backend should return:
{
  'divorce_records': [...],
  'total': X,
  'pages': X,
  'current_page': X
}
```

---

### **Issue 2: Empty Array**

**Symptom:**
```
divorce_records length: 0
```

**Cause:** Filtering issue - records exist but don't match clerk's region/woreda

**Solution:** Check user's region/woreda matches record's region/woreda

**Debug in MongoDB:**
```javascript
// Check user
db.users.findOne({email: "clerk@example.com"})

// Check recent divorce record
db.divorce_records.find().sort({created_at: -1}).limit(1)

// Compare:
// - user.region vs record.divorce_region
// - user.woreda vs record.divorce_woreda
```

---

### **Issue 3: State Not Updating**

**Symptom:**
```
Setting records to state: [...]  // Has data
Rendering DivorceRecords - records state: []  // Empty!
```

**Cause:** React state update issue or re-render problem

**Solution:** Check if there's a re-fetch happening that clears the data

---

### **Issue 4: Records State is Correct But Not Rendering**

**Symptom:**
```
Rendering DivorceRecords - records.length: 5  // Has data
// But table shows "No records found"
```

**Cause:** Rendering logic issue

**Check:**
```javascript
// In DivorceRecords.jsx line 402-422
{records.length === 0 ? (
  // "No records" message
) : (
  records.map((record) => (
    // Table row
  ))
)}
```

---

## 🔍 **Most Likely Causes**

### **1. Region/Woreda Filtering**

**Check if clerk's region/woreda matches record:**

```javascript
// In browser console after page loads
console.log('User:', user);
console.log('Records:', records);

// Compare:
// user.region === records[0].divorce_region?
// user.woreda === records[0].divorce_woreda?
```

### **2. Data Not Persisting to State**

**Check if useEffect is running multiple times:**

```javascript
// Add to useEffect
useEffect(() => {
  console.log('useEffect triggered - fetching records');
  fetchRecords();
}, [currentPage, searchTerm, filters.region, filters.status, filters.dateFrom, filters.dateTo]);
```

---

## ✅ **Action Items**

### **Do This Now:**

1. **Refresh browser** (Ctrl + F5)
2. **Open Console** (F12)
3. **Go to Divorce Records page**
4. **Copy all console logs** and share them

### **Look For:**

- ✅ API Response has data?
- ✅ divorce_records array has items?
- ✅ State is being set?
- ✅ Rendering shows records?

### **Share:**

1. All console logs
2. Network tab - GET /api/divorces response
3. Any error messages

---

## 🎯 **Quick Fixes to Try**

### **Fix 1: Clear Filters**

Maybe filters are hiding the records:

```javascript
// In browser console
localStorage.clear();
location.reload();
```

### **Fix 2: Check User Region**

```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('user')));
```

### **Fix 3: Force Refetch**

```javascript
// Click the "Clear Filters" button
// Or refresh the page
```

---

## 📝 **Next Steps**

**After you check the console logs, we can:**

1. Identify if it's a backend filtering issue
2. Fix region/woreda matching
3. Fix state update issue
4. Fix rendering logic

**Share the console logs and we'll solve this!** 🎯
