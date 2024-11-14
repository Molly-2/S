const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

// Hugging Face model API details
const HF_API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1-base';
const HF_API_KEY = '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'; // Replace with your actual Hugging Face API key

// Helper function to make API request with retry on loading
async function fetchImageWithRetry(prompt, retries = 5, delay = 2000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await axios.post(
                HF_API_URL,
                { inputs: prompt },
                {
                    headers: {
                        Authorization: `Bearer ${HF_API_KEY}`,
                    },
                    responseType: 'arraybuffer'
                }
            );
            return response.data; // Successful response
        } catch (error) {
            // Check if the error indicates the model is loading
            if (error.response?.data?.error?.includes("is currently loading")) {
                console.log(`Model is loading. Retrying in ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            } else {
                throw error; // Other errors, rethrow
            }
        }
    }
    throw new Error("Model failed to load after multiple attempts.");
}

// Endpoint to handle prompt and return generated image
app.get('/generate', async (req, res) => {
    const prompt = req.query.prompt;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt query parameter is required" });
    }

    try {
        const imageData = await fetchImageWithRetry(prompt);
        
        // Set appropriate headers to serve the image
        res.set('Content-Type', 'image/jpeg');
        res.send(imageData);
    } catch (error) {
        console.error("Error fetching data from Hugging Face API:", error.message);
        res.status(500).json({
            error: "An error occurred while fetching data from Hugging Face API",
            details: error.message
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
