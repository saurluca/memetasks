// Uploads image via cloudflare worker
async function uploadImage(image: Blob) {
    try {
        console.log('Uploading image...');
        // Create FormData and append the file
        const formData = new FormData();
        formData.append('image', image);

        // Post the image to the Cloudflare Worker
        const response = await fetch('https://imageupload.spuckteller.workers.dev/', {
            method: 'POST',
            body: formData,
        });
        console.log('Response:', response);
        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        // Get the image URL from the response
        const imageUrl = await response.text();
        console.log('Image URL:', imageUrl);
        return imageUrl;

    } catch (error) {
        console.error('Error uploading image:', error);
    }
}