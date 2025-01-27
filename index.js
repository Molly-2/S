const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = 3000;

// Hugging Face API Token
const HF_API_TOKEN = "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"; // Replace with your valid token

// Middleware
app.use(bodyParser.json());

// Endpoint: /generate-image
app.get("/generate-image", async (req, res) => {
  try {
    const prompt = req.query.prompt;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    // Send request to Stable Diffusion model
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2`,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer", // Ensure we get binary image data
      }
    );

    if (response.status !== 200 || !response.data) {
      throw new Error("Model returned an invalid response.");
    }

    // Send the image as a response
    res.set("Content-Type", "image/png");
    res.send(response.data);
  } catch (error) {
    console.error("Error Details:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.error || "Something went wrong.",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
