import {ref} from 'vue'

export function useMemeGenerator() {
    const imageUrl = ref('')
    const imageBlob = ref<Blob | null>(null)
    const isLoading = ref(false)
    const memeHeader = ref('')
    const theme = ref('beach')
    const themeChance = 0.4

    const generateImage = async (prompt: string) => {
        if (prompt) {
            isLoading.value = true
            imageUrl.value = ''
            imageBlob.value = null
            memeHeader.value = ''
            try {
                // Randomly set the theme or not
                if (Math.random() < themeChance) {
                    theme.value = '';
                }

                const responsePrompt = await fetch(`https://memeprompt.spuckteller.workers.dev/?prompt=${encodeURIComponent(prompt)}&theme=${encodeURIComponent(theme.value)}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                })

                if (!responsePrompt.ok) {
                    const errorText = await responsePrompt.text()
                    throw new Error(`Failed to get meme prompt: ${errorText}`)
                }

                const parsedResponse = await responsePrompt.json()

                const finalPrompt = parsedResponse.enhancedPrompt.response; // Accessing the response property
                const memeHeader = parsedResponse.memeHeader.response; // Accessing the response property

                console.log("enhanced", finalPrompt);
                console.log("memeheader", memeHeader);

                const imageResponse = await fetch(`https://memes.spuckteller.workers.dev/?prompt=${encodeURIComponent(finalPrompt)}`)
                console.log('imageResponse', imageResponse)

                if (!imageResponse.ok) {
                    throw new Error('Failed to generate image')
                }

                const blob = await imageResponse.blob()

                // Create a canvas to draw the image and the meme header
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Failed to get canvas context'); // Ensure ctx is not null

                // Create an image element to load the blob
                const img = new Image();
                img.src = URL.createObjectURL(blob);

                // Wait for the image to load
                await new Promise((resolve) => {
                    img.onload = resolve;
                });

                // Set canvas dimensions
                canvas.width = img.width;
                canvas.height = img.height + 120; // Extra space for the header

                // Draw the image on the canvas
                ctx.drawImage(img, 0, 120); // Draw image below the header

                // Function to draw wrapped text
                const drawWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
                    const words = text.split(' ');
                    let line = '';

                    for (let n = 0; n < words.length; n++) {
                        const testLine = line + words[n] + ' ';
                        const metrics = ctx.measureText(testLine);
                        const testWidth = metrics.width;

                        if (testWidth > maxWidth && n > 0) {
                            ctx.fillText(line, x, y);
                            line = words[n] + ' ';
                            y += 35; // Move down for the next line
                        } else {
                            line = testLine;
                        }
                    }
                    ctx.fillText(line, x, y); // Draw the last line
                }

                // Set font and draw the meme header
                ctx.fillStyle = 'black';
                ctx.font = 'bold 30px Arial';
                ctx.textAlign = 'center';
                drawWrappedText(memeHeader, canvas.width / 2, 30, canvas.width - 20); // Draw wrapped header

                // Convert canvas to blob
                return new Promise((resolve) => {
                    canvas.toBlob((newBlob) => {
                        imageBlob.value = newBlob;
                        imageUrl.value = URL.createObjectURL(newBlob as Blob);
                        console.log('imageBlob', imageBlob.value)
                        console.log('imageUrl', imageUrl.value);

                        // Resolve the promise with the imageBlob, imageUrl, and memeHeader
                        resolve({imageBlob: imageBlob.value, imageUrl: imageUrl.value, memeHeader: memeHeader.value});
                    });
                });
            } catch (error) {
                console.error('Error generating image:', error)
                throw error // Re-throw the error to be handled by the caller
            } finally {
                isLoading.value = false
            }
        }
        // Return null if no prompt was provided
        console.log('no prompt provided')
        return {imageBlob: null, imageUrl: '', memeHeader: ''}
    }

    return {
        imageUrl,
        imageBlob,
        isLoading,
        memeHeader,
        generateImage
    }
}
