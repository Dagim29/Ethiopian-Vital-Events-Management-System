import React, { useState, useRef, useEffect } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ImageUpload = ({ 
  label = "Upload Photo", 
  value, 
  onChange, 
  error,
  accept = "image/*",
  maxSize = 5, // MB
  preview = true,
  required = false,
  helperText = "PNG, JPG, JPEG up to 5MB"
}) => {
  const [previewUrl, setPreviewUrl] = useState(value || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Update preview when value prop changes (for editing existing records)
  useEffect(() => {
    if (value !== previewUrl) {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleFileChange = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      if (onChange) {
        onChange(file, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileChange(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onChange) {
      onChange(null, null);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      
      <div className="space-y-3">
        {/* Upload Area */}
        {!previewUrl ? (
          <div
            onClick={handleClick}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
              transition-all duration-200
              ${dragActive 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
              }
              ${error ? 'border-red-300 bg-red-50' : ''}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
            />
            
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                <PhotoIcon className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">{helperText}</p>
              </div>
              
              <button
                type="button"
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-semibold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Choose File
              </button>
            </div>
          </div>
        ) : (
          /* Preview Area */
          <div className="relative border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                  onError={(e) => {
                    console.error('Image preview failed to load:', previewUrl?.substring(0, 50));
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Photo uploaded successfully
                </p>
                <p className="text-xs text-gray-500">
                  Click remove to change the photo
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleRemove}
                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove photo"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
