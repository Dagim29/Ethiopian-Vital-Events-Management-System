# Photo Upload - Complete Test Checklist

## 🔧 Recent Fixes Applied

✅ **ImageUpload Component** - Added useEffect to update preview when value prop changes
✅ **ImageUpload Component** - Added error handling for broken image previews
✅ **ViewBirthRecord Component** - Added photo display section with error handling
✅ **BirthRecordForm** - Added photo loading when editing existing records
✅ **Backend** - Photo fields included in create/update operations
✅ **Backend** - Fixed response format for updates

## 📋 Complete Test Procedure

### Test 1: Create New Birth Record with Photos

**Steps:**
1. ✓ Navigate to Birth Records page
2. ✓ Click "Add New Birth Record" button
3. ✓ Fill in required fields:
   - Child First Name
   - Child Father Name
   - Child Gender
   - Date of Birth
   - Father Full Name
   - Mother Full Name

4. ✓ Upload Child Photo:
   - Click or drag image to "Child Photo" section
   - Verify preview appears (small thumbnail)
   - Check console for any errors (F12)

5. ✓ Upload Father Photo:
   - Click or drag image to "Father's Photo" section
   - Verify preview appears

6. ✓ Upload Mother Photo:
   - Click or drag image to "Mother's Photo" section
   - Verify preview appears

7. ✓ Click "Create Record" button
8. ✓ Verify success message appears
9. ✓ Record should appear in the list

**Expected Result:** ✅ Record created with 3 photo previews visible

---

### Test 2: View Birth Record with Photos

**Steps:**
1. ✓ Find the record you just created
2. ✓ Click "View" button (eye icon)
3. ✓ Open browser console (F12) and check logs:
   ```
   Birth Record Data: {...}
   Photo data: {
     child_photo: "data:image/jpeg;base64,..."
     father_photo: "data:image/jpeg;base64,..."
     mother_photo: "data:image/jpeg;base64,..."
   }
   Filtered photos: [{...}, {...}, {...}]
   ```

4. ✓ Look for "Photos" section at the top of the modal
5. ✓ Verify 3 photos display in a grid:
   - 👶 Child Photo
   - 👨 Father Photo
   - 👩 Mother Photo

**Expected Result:** ✅ All 3 photos visible in grid layout

**If Photos Don't Show:**
- Check console for errors
- Look for "No photos to display" message
- Check if photo data shows as `null` or `undefined`
- Verify images aren't showing "Image not available" placeholder

---

### Test 3: Edit Birth Record and Update Photos

**Steps:**
1. ✓ Click "Edit" button on the record
2. ✓ Edit form should open
3. ✓ Check if existing photos show in preview:
   - Child Photo preview visible?
   - Father Photo preview visible?
   - Mother Photo preview visible?

4. ✓ Try removing one photo:
   - Click X button on a photo
   - Verify preview disappears

5. ✓ Upload a new photo to replace it
6. ✓ Click "Update Record"
7. ✓ View the record again
8. ✓ Verify updated photo displays

**Expected Result:** ✅ Existing photos load, can be updated, changes persist

---

### Test 4: Photo Validation

**Test Invalid File Type:**
1. ✓ Try uploading a .txt or .pdf file
2. ✓ Should show alert: "Please upload an image file"

**Test Large File:**
1. ✓ Try uploading image > 5MB
2. ✓ Should show alert: "File size must be less than 5MB"

**Test Drag and Drop:**
1. ✓ Drag image file over upload area
2. ✓ Area should highlight (green border)
3. ✓ Drop file
4. ✓ Preview should appear

**Expected Result:** ✅ All validations work correctly

---

## 🐛 Troubleshooting Guide

### Issue: Photos Don't Show in View Details

**Check Console Logs:**
```javascript
// Open browser console (F12) and look for:
Photo data: { child_photo: null, ... }  // ❌ Photos not saved
Photo data: { child_photo: "data:image/...", ... }  // ✅ Photos saved
```

**If photos are null:**
- Photos weren't uploaded when creating record
- Create a NEW record with photos

**If photos have data but don't display:**
- Check for image load errors in console
- Look for "Failed to load" messages
- Base64 data might be corrupted

---

### Issue: Photos Don't Show in Edit Form

**Check Console:**
```javascript
// Should see in BirthRecordForm useEffect:
Loading existing photos...
Child photo: data:image/...
```

**If not loading:**
- Restart frontend dev server
- Clear browser cache (Ctrl+Shift+Delete)
- Check if record actually has photos in database

---

### Issue: Preview Shows "No Image"

**Possible Causes:**
1. Base64 string is malformed
2. Missing `data:image/...` prefix
3. Image data corrupted during save

**Solution:**
- Try uploading a smaller image (<1MB)
- Use JPG or PNG format
- Check backend logs for errors

---

## 🔍 Debug Commands

### Check Photo Data in Console
```javascript
// When viewing a record, run in console:
console.log('Child Photo Length:', record.child_photo?.length);
console.log('Photo Starts With:', record.child_photo?.substring(0, 30));
```

**Expected Output:**
```
Child Photo Length: 50000  // Large number
Photo Starts With: data:image/jpeg;base64,/9j/4
```

### Check MongoDB Directly
```javascript
// In MongoDB shell or Compass:
db.birth_records.findOne(
  { certificate_number: "YOUR_CERT_NUMBER" },
  { 
    child_photo: 1, 
    father_photo: 1, 
    mother_photo: 1 
  }
)
```

---

## ✅ Success Criteria

All tests pass when:
- ✅ Photos upload with preview
- ✅ Photos save to database
- ✅ Photos display in view details
- ✅ Photos load in edit form
- ✅ Photos can be updated
- ✅ Validations work correctly
- ✅ No console errors

---

## 🚀 Quick Reset

If things aren't working:

1. **Restart Backend:**
   ```bash
   cd backend
   # Stop server (Ctrl+C)
   python run.py
   ```

2. **Restart Frontend:**
   ```bash
   cd frontend/frontend
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Clear Browser Cache:**
   - Press Ctrl+Shift+Delete
   - Clear cached images and files
   - Reload page (Ctrl+F5)

4. **Create Fresh Test Record:**
   - Create brand new birth record
   - Upload all 3 photos
   - Verify each step

---

## 📞 Report Issues

If photos still don't work, provide:
1. **Console logs** (F12 → Console tab)
2. **Network tab** (F12 → Network → XHR)
3. **Screenshot** of the issue
4. **Steps** you followed

**Key Info to Check:**
- Are photos showing as `null` in console?
- Are there any red errors in console?
- Do you see "Photo data:" logs?
- What does the API response show in Network tab?
