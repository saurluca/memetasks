import {ref} from 'vue'

export function useMemeGenerator() {
    const imageBlob = ref<Blob | null>(null)
    const isLoading = ref(false)
    const memeHeader = ref('')
    const theme = ref('')
    const themeChance = 0

    const generateImage = async (prompt: string) => {
        if (!prompt) {
            // Return null if no prompt was provided
            console.error('no prompt provided')
            return null
        }

        isLoading.value = true
        imageBlob.value = null
        memeHeader.value = ''
        try {
            // Randomly set the theme or not
            if (Math.random() > themeChance) {
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
                console.error(`Failed to get meme prompt: ${errorText}`)
                return
            }

            const parsedResponse = await responsePrompt.json()
            const finalPrompt = parsedResponse.enhancedPrompt.response; // Accessing the response property
            const memeHeader = parsedResponse.memeHeader.response; // Accessing the response property

            const imageResponse = await fetch(`https://memes.spuckteller.workers.dev/?prompt=${encodeURIComponent(finalPrompt)}`)

            if (!imageResponse.ok) {
                const errorText = await responsePrompt.text()
                console.error('Failed to fetch image', errorText)
                return
            }

            const blob = await imageResponse.blob()

            // Create a canvas to draw the image and the meme header
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                console.error('Failed to get canvas context');
                return
            }

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

            // Set canvas background color
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

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
            return await new Promise((resolve) => {
                canvas.toBlob((newBlob) => {
                    resolve(newBlob);
                });
            })
        } catch (error) {
            console.error('Error generating image:', error)
            return
        } finally {
            isLoading.value = false
        }
    }
    return {
        imageBlob,
        isLoading,
        generateImage
    }
}
