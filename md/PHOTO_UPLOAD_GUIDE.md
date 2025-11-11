# Photo Upload Implementation Guide

## Overview
Photo upload functionality has been added to all records (birth, death, marriage, divorce) and user profiles in the Ethiopian Vital Management System.

## Frontend Components

### 1. ImageUpload Component
**Location:** `frontend/src/components/common/ImageUpload.jsx`

**Features:**
- Drag and drop support
- File size validation (max 5MB)
- Image preview
- Accepts PNG, JPG, JPEG, GIF, WEBP
- Base64 encoding for easy transmission
- Remove/change photo functionality

**Usage Example:**
```jsx
<ImageUpload
  label="Profile Photo"
  value={photoPreview}
  onChange={(file, preview) => {
    setPhoto(file);
    setPhotoPreview(preview);
  }}
  error={errors.photo}
  helperText="Upload your photo (PNG, JPG up to 5MB)"
/>
```

### 2. Updated Forms

#### User Registration (RegisterModal.jsx)
- Added profile photo upload field
- Photo stored as base64 in `formData.photo`
- Preview stored in `formData.photoPreview`

#### Birth Records (BirthRecordForm.jsx)
- **Child Photo**: Upload child's photo
- **Father Photo**: Upload father's photo
- **Mother Photo**: Upload mother's photo
- Photos included in record submission

#### Death Records
- **Deceased Photo**: Upload photo of deceased person

#### Marriage Records
- **Groom Photo**: Upload groom's photo
- **Bride Photo**: Upload bride's photo

#### Divorce Records
- **Husband Photo**: Upload husband's photo
- **Wife Photo**: Upload wife's photo

## Backend Implementation

### 1. Database Models (models.py)

#### User Model
- Field: `photo_url` - Stores the path/URL to user's profile photo

#### BirthRecord Model
- Fields:
  - `child_photo` - Child's photo
  - `father_photo` - Father's photo
  - `mother_photo` - Mother's photo

#### DeathRecord Model
- Field: `deceased_photo` - Deceased person's photo

#### MarriageRecord Model
- Fields:
  - `groom_photo` - Groom's photo
  - `bride_photo` - Bride's photo

#### DivorceRecord Model
- Fields:
  - `husband_photo` - Husband's photo
  - `wife_photo` - Wife's photo

### 2. Upload API Endpoint (routes/upload.py)

#### Single Image Upload
**Endpoint:** `POST /upload/image`

**Request (Base64):**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "prefix": "user_profile"
}
```

**Request (File Upload):**
```
Content-Type: multipart/form-data
file: [binary image data]
```

**Response:**
```json
{
  "success": true,
  "filepath": "uploads/2025/01/img_20250122_143000_abc123.jpg",
  "url": "/uploads/uploads/2025/01/img_20250122_143000_abc123.jpg"
}
```

#### Multiple Images Upload
**Endpoint:** `POST /upload/multiple`

**Request:**
```
Content-Type: multipart/form-data
files: [multiple binary image files]
```

**Response:**
```json
{
  "success": true,
  "uploaded": [
    {
      "filename": "photo1.jpg",
      "filepath": "uploads/2025/01/upload_20250122_143000_xyz789.jpg",
      "url": "/uploads/uploads/2025/01/upload_20250122_143000_xyz789.jpg"
    }
  ],
  "errors": []
}
```

### 3. File Storage Structure
```
backend/
  uploads/
    2025/
      01/
        img_20250122_143000_abc123.jpg
        upload_20250122_143500_def456.jpg
      02/
        ...
```

## Features

### Security
- File type validation (only images allowed)
- File size limit (5MB max)
- Secure filename generation with UUID
- Base64 encoding support

### Organization
- Files organized by year/month folders
- Unique filenames with timestamp and UUID
- Prevents filename collisions

### User Experience
- Drag and drop interface
- Real-time preview
- Easy photo removal/replacement
- Visual feedback during upload
- Error handling with user-friendly messages

## Integration Steps

### For New Forms

1. **Import ImageUpload Component:**
```jsx
import ImageUpload from '../common/ImageUpload';
```

2. **Add State Variables:**
```jsx
const [photo, setPhoto] = useState(null);
const [photoPreview, setPhotoPreview] = useState(null);
```

3. **Add ImageUpload Component to Form:**
```jsx
<ImageUpload
  label="Photo"
  value={photoPreview}
  onChange={(file, preview) => {
    setPhoto(file);
    setPhotoPreview(preview);
  }}
  helperText="Upload photo (PNG, JPG up to 5MB)"
/>
```

4. **Include Photo in Form Submission:**
```jsx
const formData = {
  ...otherFields,
  photo: photoPreview // Base64 encoded image
};
```

## API Integration

### Frontend API Service
Add to your API service file:

```javascript
export const uploadAPI = {
  uploadImage: async (imageData, prefix = 'img') => {
    const response = await fetch(`${API_URL}/upload/image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageData,
        prefix: prefix
      })
    });
    return response.json();
  },
  
  uploadMultiple: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await fetch(`${API_URL}/upload/multiple`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
};
```

## Testing

### Test Photo Upload
1. Navigate to user registration or any record form
2. Click on the upload area or drag an image
3. Verify preview appears
4. Submit the form
5. Check database for photo data
6. Verify file is saved in uploads folder

### Test Validations
1. Try uploading a non-image file (should fail)
2. Try uploading a file > 5MB (should fail)
3. Try removing and re-uploading (should work)

## Future Enhancements

1. **Image Optimization**
   - Compress images before upload
   - Generate thumbnails
   - WebP conversion

2. **Cloud Storage**
   - Integrate AWS S3 or Azure Blob Storage
   - CDN for faster delivery

3. **Advanced Features**
   - Image cropping/editing
   - Multiple photos per record
   - Photo gallery view
   - Facial recognition for verification

4. **Performance**
   - Lazy loading for images
   - Progressive image loading
   - Caching strategies

## Troubleshooting

### Common Issues

**Issue:** Photos not uploading
- Check file size (must be < 5MB)
- Verify file type (PNG, JPG, JPEG, GIF, WEBP only)
- Check network connection
- Verify backend upload endpoint is running

**Issue:** Preview not showing
- Check browser console for errors
- Verify base64 encoding is correct
- Check ImageUpload component props

**Issue:** Backend errors
- Verify uploads folder exists and has write permissions
- Check MongoDB connection
- Review backend logs for specific errors

## Notes

- Photos are stored as base64 strings in the database for simplicity
- For production, consider using cloud storage (AWS S3, Azure Blob, etc.)
- Implement proper backup strategy for uploaded files
- Consider implementing image optimization/compression
- Add proper authentication/authorization for file access
