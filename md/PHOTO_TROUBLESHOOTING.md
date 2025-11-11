# Photo Display Troubleshooting Guide

## Issue: Photos Not Visible in Birth Record Details

### Debugging Steps

#### 1. Check Browser Console
When you open a birth record to view details, check the browser console (F12) for these logs:

```javascript
Birth Record Data: { ... }  // Full record data
Photo data: {
  child_photo: "...",  // Should show base64 string or null
  father_photo: "...",
  mother_photo: "..."
}
Filtered photos: [...]  // Array of photos to display
```

**What to look for:**
- If `child_photo`, `father_photo`, `mother_photo` are `null` or `undefined` → Photos weren't saved
- If they contain base64 strings (starting with `data:image/...`) → Photos are saved correctly
- If "No photos to display" appears → No photos in the record

#### 2. Verify Photo Upload
When creating/editing a record:

**Test Steps:**
1. Open "Add New Birth Record" or edit existing record
2. Upload photos for child, father, mother
3. Verify preview appears for each photo
4. Submit the form
5. Check success message
6. View the record details
7. Photos should appear at the top

#### 3. Check Database
If photos aren't displaying, check if they're in the database:

**MongoDB Query:**
```javascript
db.birth_records.findOne(
  { _id: ObjectId("YOUR_RECORD_ID") },
  { child_photo: 1, father_photo: 1, mother_photo: 1 }
)
```

**Expected Result:**
```json
{
  "_id": "...",
  "child_photo": "data:image/jpeg;base64,/9j/4AAQ...",
  "father_photo": "data:image/jpeg;base64,/9j/4AAQ...",
  "mother_photo": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

#### 4. Common Issues & Solutions

**Issue 1: Photos Not Saving**
- **Symptom:** Photos upload but don't save to database
- **Solution:** 
  - Check backend logs for errors
  - Verify `child_photo`, `father_photo`, `mother_photo` fields are in the updatable fields list
  - Restart backend server

**Issue 2: Photos Not Loading in Edit Mode**
- **Symptom:** Existing photos don't show when editing
- **Solution:** Already fixed - photos now load from record data in useEffect

**Issue 3: Photos Show as Broken Images**
- **Symptom:** Photo boxes appear but images don't load
- **Possible Causes:**
  - Base64 string is corrupted
  - Missing `data:image/...` prefix
  - Image data too large (>5MB)
- **Solution:**
  - Check console for image load errors
  - Verify base64 string format
  - Try uploading smaller images

**Issue 4: Photo Section Not Appearing**
- **Symptom:** No photo section in view details
- **Cause:** All photo fields are null/undefined
- **Solution:** 
  - Upload photos when creating/editing record
  - Check if photos are being sent in API request

#### 5. API Request/Response Check

**Create/Update Request:**
```json
POST/PUT /api/births/{id}
{
  "child_first_name": "...",
  "child_photo": "data:image/jpeg;base64,...",
  "father_photo": "data:image/jpeg;base64,...",
  "mother_photo": "data:image/jpeg;base64,...",
  ...
}
```

**Get Record Response:**
```json
GET /api/births/{id}
{
  "birth_id": "...",
  "child_photo": "data:image/jpeg;base64,...",
  "father_photo": "data:image/jpeg;base64,...",
  "mother_photo": "data:image/jpeg;base64,...",
  ...
}
```

### Quick Test Procedure

1. **Create New Record with Photos:**
   ```
   ✓ Navigate to Birth Records
   ✓ Click "Add New Birth Record"
   ✓ Fill required fields
   ✓ Upload child photo
   ✓ Upload father photo
   ✓ Upload mother photo
   ✓ Verify previews show
   ✓ Click "Create Record"
   ✓ Success message appears
   ```

2. **View Record:**
   ```
   ✓ Click "View" on the record
   ✓ Check console logs (F12)
   ✓ Photo section should appear at top
   ✓ Three photos displayed in grid
   ✓ Each labeled with emoji
   ```

3. **Edit Record:**
   ```
   ✓ Click "Edit" on the record
   ✓ Existing photos should show in preview
   ✓ Can upload new photos to replace
   ✓ Click "Update Record"
   ✓ View record again
   ✓ Updated photos display
   ```

### Files to Check

**Frontend:**
- `src/components/birth/BirthRecordForm.jsx` - Photo upload
- `src/components/birth/ViewBirthRecord.jsx` - Photo display
- `src/components/common/ImageUpload.jsx` - Upload component
- `src/services/api.js` - API calls

**Backend:**
- `backend/app/routes/births.py` - Birth record endpoints
- `backend/app/models.py` - Data models

### Recent Fixes Applied

✅ **Fixed:** Backend response format for updates
✅ **Fixed:** Photo fields added to updatable fields
✅ **Fixed:** Photo display component in ViewBirthRecord
✅ **Fixed:** Photo loading when editing records
✅ **Added:** Debug logging to track photo data

### If Photos Still Don't Show

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Restart backend server**
3. **Restart frontend dev server**
4. **Check browser console** for errors
5. **Verify MongoDB connection**
6. **Try uploading smaller images** (<1MB)

### Contact Points

If issues persist, provide:
- Browser console logs
- Network tab showing API requests/responses
- Screenshot of the issue
- MongoDB query results for the record
