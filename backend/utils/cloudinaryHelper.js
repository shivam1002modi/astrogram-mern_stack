// This utility function extracts the public ID from a full Cloudinary URL.
// The public ID is needed to tell Cloudinary which specific image to delete.
// Example URL: https://res.cloudinary.com/demo/image/upload/v1629321908/ostrogram_posts/sample.jpg
// Example Public ID: ostrogram_posts/sample

export const getPublicIdFromUrl = (url) => {
  try {
    // Find the part of the URL after '/upload/'
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    // Find the part of the string before the version number (e.g., /v1629321908/)
    const pathPart = parts[1];
    const versionIndex = pathPart.indexOf('/v');
    const pathWithoutVersion = versionIndex !== -1 ? pathPart.substring(pathPart.indexOf('/', versionIndex + 1) + 1) : pathPart;
    
    // Remove the file extension (e.g., .jpg, .png)
    const publicId = pathWithoutVersion.substring(0, pathWithoutVersion.lastIndexOf('.'));
    return publicId;
  } catch (error) {
    console.error("Could not extract Public ID from URL:", url, error);
    return null;
  }
};

