// 1. IMGBB CONFIG (For Images)
const IMGBB_API_KEY = "cadb0d9174d86e5c6573b29887e436d3"; 

// 2. CLOUDINARY CONFIG (For Audio & PDFs)
const CLOUDINARY_CLOUD_NAME = "dmek9tfju"; 
const CLOUDINARY_PRESET = "tucasa_upload"; 

// ------------------------------------------------------------------

// FUNCTION 1: Upload Images (Uses ImgBB)
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      return data.data.url;
    } else {
      throw new Error("ImgBB Upload Failed: " + (data.error?.message || "Unknown error"));
    }
  } catch (error) {
    console.error("ImgBB Error:", error);
    throw error;
  }
};

// FUNCTION 2: Upload Files/Audio (Uses Cloudinary)
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET); 
  
  // Determine type: 'video' handles audio/video, 'raw' handles documents like PDF
  const resourceType = file.type.includes('audio') ? 'video' : 'raw'; 

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    
    if (data.secure_url) {
      return data.secure_url; // Success! Returns the file link
    } else {
      throw new Error("Cloudinary Error: " + (data.error?.message || "Check your Upload Preset name"));
    }
  } catch (error) {
    console.error("Upload Service Error:", error);
    throw error;
  }
};