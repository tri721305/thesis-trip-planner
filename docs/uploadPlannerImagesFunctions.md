# Travel Planner Image Upload Functions

Các function để upload images lên AWS S3 và cập nhật travel planner với image URLs.

## Overview

Hệ thống image upload cho travel planner bao gồm:

- Upload lên AWS S3 sử dụng existing upload.action.ts
- Cập nhật database với image URLs
- Rollback mechanism nếu có lỗi
- Hỗ trợ multiple image types: main, general, tripmate, place images

## Available Functions

### 1. `updatePlannerImages(params: UpdatePlannerImagesParams)`

Function chính để upload images và update planner với URLs.

**Features:**

- ✅ Upload multiple images to AWS S3
- ✅ Update database with image URLs
- ✅ Transaction-based updates
- ✅ Automatic rollback on errors
- ✅ Permission checking
- ✅ Support for different image types

**Parameters:**

```typescript
{
  plannerId: string;
  imageFiles: File[];
  targetType: "main" | "general" | "place" | "tripmate";
  targetIndex?: number;     // For tripmate images
  detailIndex?: number;     // For place images
  placeIndex?: number;      // For place images
}
```

### 2. `updatePlannerMainImage(params)`

Upload single main image for planner.

**Use case:** Planner cover/hero image

```typescript
const result = await updatePlannerMainImage({
  plannerId: "64a7b8c9d0e1f2a3b4c5d6e7",
  imageFile: mainImageFile,
});
```

### 3. `updatePlannerGeneralImages(params)`

Upload multiple images to general gallery.

**Use case:** Travel inspiration images, general photos

```typescript
const result = await updatePlannerGeneralImages({
  plannerId: "64a7b8c9d0e1f2a3b4c5d6e7",
  imageFiles: [file1, file2, file3],
});
```

### 4. `updateTripmateImage(params)`

Upload image for specific tripmate.

**Use case:** Tripmate profile pictures

```typescript
const result = await updateTripmateImage({
  plannerId: "64a7b8c9d0e1f2a3b4c5d6e7",
  imageFile: profileImage,
  tripmateIndex: 0,
});
```

### 5. `updatePlaceImages(params)`

Upload images for specific place in itinerary.

**Use case:** Location photos, attraction images

```typescript
const result = await updatePlaceImages({
  plannerId: "64a7b8c9d0e1f2a3b4c5d6e7",
  imageFiles: [placeImage1, placeImage2],
  detailIndex: 0, // Day 1
  placeIndex: 0, // First place
});
```

### 6. `updatePlannerImagesFromFormData(formData)`

Upload images from FormData (form submissions).

**Use case:** Form-based uploads, drag & drop

```typescript
const formData = new FormData();
formData.append("plannerId", plannerId);
formData.append("targetType", "general");
formData.append("images", file1);
formData.append("images", file2);

const result = await updatePlannerImagesFromFormData(formData);
```

## Image Storage Structure

### AWS S3 Storage

```
s3-bucket/
├── images/
│   ├── timestamp-randomId.jpg    # Main images
│   ├── timestamp-randomId.png    # General images
│   └── timestamp-randomId.webp   # Place/tripmate images
```

### Database Storage

#### Main Image

```typescript
{
  image: "https://bucket.s3.amazonaws.com/images/123-abc.jpg";
}
```

#### General Images

```typescript
{
  images: [
    "https://bucket.s3.amazonaws.com/images/123-abc.jpg",
    "https://bucket.s3.amazonaws.com/images/124-def.jpg",
  ];
}
```

#### Tripmate Images

```typescript
{
  tripmates: [
    {
      name: "John Doe",
      image: "https://bucket.s3.amazonaws.com/images/125-ghi.jpg",
    },
  ];
}
```

#### Place Images

```typescript
{
  details: [
    {
      data: [
        {
          type: "place",
          name: "Eiffel Tower",
          images: ["https://bucket.s3.amazonaws.com/images/126-jkl.jpg"],
          imageKeys: ["images/126-jkl.jpg"],
        },
      ],
    },
  ];
}
```

## Permission System

### Author Permissions

- ✅ Upload all image types
- ✅ Update main image
- ✅ Update general images
- ✅ Update tripmate images
- ✅ Update place images

### Tripmate Permissions

- ✅ Upload general images
- ✅ Upload place images
- ❌ Cannot update main image
- ❌ Cannot update other tripmate images

## Error Handling

### Common Error Scenarios

1. **AWS S3 Upload Failed**
2. **Database Update Failed**
3. **Permission Denied**
4. **Invalid File Type**
5. **File Size Exceeded**

### Automatic Rollback

Nếu database update fails sau khi upload lên S3:

1. Database transaction rolled back
2. S3 images automatically deleted
3. Error returned to client

### Error Response Format

```typescript
{
  success: false,
  error: {
    message: "Description of error"
  }
}
```

## File Validation

### Supported Formats

- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)
- ✅ GIF (.gif)

### Size Limits

- Maximum file size: 5MB per image
- No limit on number of images (within reason)

## Usage Examples

### React Component Example

```typescript
import { updatePlannerMainImage } from "@/lib/actions/planner.action";

const ImageUploadComponent = ({ plannerId }: { plannerId: string }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await updatePlannerMainImage({
        plannerId,
        imageFile: file,
      });

      if (result.success) {
        console.log("Image uploaded successfully!");
        // Update UI state
      } else {
        console.error("Upload failed:", result.error?.message);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
```

### Multiple Images Upload

```typescript
const handleMultipleImages = async (files: File[]) => {
  const result = await updatePlannerGeneralImages({
    plannerId: "your-planner-id",
    imageFiles: files,
  });

  if (result.success) {
    console.log(`Uploaded ${files.length} images successfully!`);
    console.log("Total images in gallery:", result.data?.images?.length);
  }
};
```

### Form-based Upload

```typescript
const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  formData.append("plannerId", plannerId);
  formData.append("targetType", "place");
  formData.append("detailIndex", "0");
  formData.append("placeIndex", "0");

  const result = await updatePlannerImagesFromFormData(formData);

  if (result.success) {
    console.log("Images uploaded from form!");
  }
};
```

## Integration with Existing System

### With updatePlanner()

```typescript
// First upload images
const imageResult = await updatePlannerGeneralImages({
  plannerId,
  imageFiles: selectedFiles,
});

// Then update other planner data
if (imageResult.success) {
  const updateResult = await updatePlanner({
    plannerId,
    title: "Updated title",
    // other updates...
  });
}
```

### With Forms

```typescript
// Combine image upload with form data
const handleSubmit = async (plannerData: any, imageFiles: File[]) => {
  // Upload images first
  if (imageFiles.length > 0) {
    await updatePlannerGeneralImages({
      plannerId: plannerData.plannerId,
      imageFiles,
    });
  }

  // Then update planner data
  await updatePlanner(plannerData);
};
```

## Best Practices

### 1. User Experience

- Show upload progress
- Validate files before upload
- Display success/error messages
- Handle loading states

### 2. Performance

- Compress images before upload if needed
- Use appropriate image formats
- Batch multiple uploads when possible

### 3. Error Handling

- Always handle both success and error cases
- Provide meaningful error messages
- Implement retry logic for network errors

### 4. Security

- Validate file types on both client and server
- Check file sizes before upload
- Ensure proper authentication

## Testing

Sử dụng example files để test functions:

```bash
# Import example functions
import { uploadMainImageExample } from "@/examples/uploadPlannerImagesExample";

# Test in browser console
const file = new File([""], "test.jpg", { type: "image/jpeg" });
await uploadMainImageExample("your-planner-id", file);
```

## Environment Variables Required

Ensure these are set in your `.env` file:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET_NAME=your_bucket_name
NEXT_PUBLIC_S3_URL_PREFIX=https://your-custom-domain.com (optional)
```

## Troubleshooting

### Common Issues

1. **"AWS credential error"**

   - Check AWS keys in .env file
   - Verify AWS permissions

2. **"S3 bucket error"**

   - Check bucket name and permissions
   - Verify bucket exists and is accessible

3. **"Permission denied"**

   - Check user is author or tripmate
   - Verify session authentication

4. **"Invalid file type"**

   - Only JPEG, PNG, WebP, GIF allowed
   - Check file MIME type

5. **"File size exceeds limit"**
   - Maximum 5MB per file
   - Compress images if needed
