// Example usage of image upload functions for travel planners
import {
  updatePlannerMainImage,
  updatePlannerGeneralImages,
  updateTripmateImage,
  updatePlaceImages,
  updatePlannerImagesFromFormData,
} from "@/lib/actions/planner.action";

/**
 * Example 1: Upload main image for travel planner
 */
export const uploadMainImageExample = async (
  plannerId: string,
  imageFile: File
) => {
  try {
    const result = await updatePlannerMainImage({
      plannerId,
      imageFile,
    });

    if (result.success) {
      console.log("✅ Main image uploaded successfully!");
      console.log("Updated planner:", result.data?._id);
      console.log("Main image URL:", result.data?.image);
      return result.data;
    } else {
      console.error("❌ Failed to upload main image:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

/**
 * Example 2: Upload multiple images to general gallery
 */
export const uploadGeneralImagesExample = async (
  plannerId: string,
  imageFiles: File[]
) => {
  try {
    const result = await updatePlannerGeneralImages({
      plannerId,
      imageFiles,
    });

    if (result.success) {
      console.log("✅ General images uploaded successfully!");
      console.log("Updated planner:", result.data?._id);
      console.log("Total images:", result.data?.images?.length);
      return result.data;
    } else {
      console.error(
        "❌ Failed to upload general images:",
        result.error?.message
      );
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

/**
 * Example 3: Upload image for specific tripmate
 */
export const uploadTripmateImageExample = async (
  plannerId: string,
  imageFile: File,
  tripmateIndex: number
) => {
  try {
    const result = await updateTripmateImage({
      plannerId,
      imageFile,
      tripmateIndex,
    });

    if (result.success) {
      console.log("✅ Tripmate image uploaded successfully!");
      console.log("Updated planner:", result.data?._id);
      console.log(
        "Tripmate image URL:",
        result.data?.tripmates?.[tripmateIndex]?.image
      );
      return result.data;
    } else {
      console.error(
        "❌ Failed to upload tripmate image:",
        result.error?.message
      );
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

/**
 * Example 4: Upload images for specific place
 */
export const uploadPlaceImagesExample = async (
  plannerId: string,
  imageFiles: File[],
  detailIndex: number,
  placeIndex: number
) => {
  try {
    const result = await updatePlaceImages({
      plannerId,
      imageFiles,
      detailIndex,
      placeIndex,
    });

    if (result.success) {
      console.log("✅ Place images uploaded successfully!");
      console.log("Updated planner:", result.data?._id);

      const place = result.data?.details?.[detailIndex]?.data?.[placeIndex];
      if (place && place.type === "place") {
        console.log("Place images:", place.images?.length);
        console.log("Place image keys:", place.imageKeys?.length);
      }

      return result.data;
    } else {
      console.error("❌ Failed to upload place images:", result.error?.message);
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

/**
 * Example 5: Upload images using FormData (for form submissions)
 */
export const uploadImagesFromFormExample = async (formData: FormData) => {
  try {
    const result = await updatePlannerImagesFromFormData(formData);

    if (result.success) {
      console.log("✅ Images uploaded from form successfully!");
      console.log("Updated planner:", result.data?._id);
      return result.data;
    } else {
      console.error(
        "❌ Failed to upload images from form:",
        result.error?.message
      );
      return null;
    }
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return null;
  }
};

/**
 * Example 6: Complete workflow - Upload main image and place images
 */
export const completeImageUploadWorkflow = async (plannerId: string) => {
  try {
    console.log("🚀 Starting complete image upload workflow...");

    // Step 1: Upload main image (assuming we have a file)
    // const mainImageFile = new File([""], "main-image.jpg", { type: "image/jpeg" });
    // const mainImageResult = await updatePlannerMainImage({
    //   plannerId,
    //   imageFile: mainImageFile,
    // });

    // Step 2: Upload general gallery images
    // const galleryFiles = [
    //   new File([""], "gallery1.jpg", { type: "image/jpeg" }),
    //   new File([""], "gallery2.jpg", { type: "image/jpeg" }),
    // ];
    // const galleryResult = await updatePlannerGeneralImages({
    //   plannerId,
    //   imageFiles: galleryFiles,
    // });

    // Step 3: Upload place-specific images
    // const placeFiles = [
    //   new File([""], "place1.jpg", { type: "image/jpeg" }),
    // ];
    // const placeResult = await updatePlaceImages({
    //   plannerId,
    //   imageFiles: placeFiles,
    //   detailIndex: 0, // First detail/day
    //   placeIndex: 0,  // First place in that day
    // });

    console.log("✅ Complete workflow finished!");
    return true;
  } catch (error) {
    console.error("💥 Workflow failed:", error);
    return false;
  }
};

/**
 * Example 7: Using with real File objects in browser
 */
export const handleFileInputChange = async (
  event: React.ChangeEvent<HTMLInputElement>,
  plannerId: string,
  targetType: "main" | "general" | "place"
) => {
  const files = event.target.files;
  if (!files || files.length === 0) {
    console.log("No files selected");
    return;
  }

  const fileArray = Array.from(files);

  try {
    switch (targetType) {
      case "main":
        if (fileArray.length > 1) {
          console.warn("Only first file will be used for main image");
        }
        return await uploadMainImageExample(plannerId, fileArray[0]);

      case "general":
        return await uploadGeneralImagesExample(plannerId, fileArray);

      case "place":
        // For place images, you need to specify detailIndex and placeIndex
        return await uploadPlaceImagesExample(plannerId, fileArray, 0, 0);

      default:
        console.error("Invalid target type");
        return null;
    }
  } catch (error) {
    console.error("Error handling file input:", error);
    return null;
  }
};

/**
 * Example 8: Create FormData for form submission
 */
export const createImageUploadFormData = (
  plannerId: string,
  files: File[],
  targetType: "main" | "general" | "place" | "tripmate",
  options?: {
    targetIndex?: number;
    detailIndex?: number;
    placeIndex?: number;
  }
) => {
  const formData = new FormData();

  formData.append("plannerId", plannerId);
  formData.append("targetType", targetType);

  if (options?.targetIndex !== undefined) {
    formData.append("targetIndex", options.targetIndex.toString());
  }

  if (options?.detailIndex !== undefined) {
    formData.append("detailIndex", options.detailIndex.toString());
  }

  if (options?.placeIndex !== undefined) {
    formData.append("placeIndex", options.placeIndex.toString());
  }

  files.forEach((file) => {
    formData.append("images", file);
  });

  return formData;
};

// Usage examples:
/*
// Example in a React component:

const handleMainImageUpload = async (file: File) => {
  const result = await uploadMainImageExample(plannerId, file);
  if (result) {
    // Update UI state
    setPlanner(result);
  }
};

const handleMultipleImageUpload = async (files: File[]) => {
  const result = await uploadGeneralImagesExample(plannerId, files);
  if (result) {
    // Update UI state
    setPlanner(result);
  }
};

const handleFormSubmit = async (event: React.FormEvent) => {
  event.preventDefault();
  const formData = createImageUploadFormData(
    plannerId,
    selectedFiles,
    "place",
    { detailIndex: 0, placeIndex: 0 }
  );
  
  const result = await uploadImagesFromFormExample(formData);
  if (result) {
    // Handle success
  }
};
*/
