export async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Fabric");  // Your preset name (case-sensitive)
    formData.append("folder", "fabrics");        // Optional but matches your preset folder

    const response = await fetch("https://api.cloudinary.com/v1_1/di6unrpjw/image/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Image upload failed");
    }

    const data = await response.json();
    return data.secure_url;  // This is the hosted image URL
}