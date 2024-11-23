const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// server config
app.use(cors());
app.use(express.json());

// cofig for Gemini
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.MODEL_ID }); //gemini 1.5 flash bb
const additionalPrompt =
  "Consider yourself an expert chatbot developed by Zeliang Codetech Pvt. Ltd. Respond only with precise, necessary, and relevant information. if input has goals and objectives respond with a list, if the user types random words clarify the question let them know you don't understand what they mean, if the user provides a language specifically respond in that language, if there is 'describe' or 'detail' or 'expand' etc similar synonyms .. be verbose and descriptive in your response";
// calling gemini fine tuned model with user prompt
async function call(userPrompt) {
  try {
    const ans = await model.generateContent(userPrompt + additionalPrompt);

    // Extract the generated text
    const responseText = await ans.response.text(); // call the text function to get the text content
    console.log(responseText);
    return responseText; // Output the text
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

app.get("/", (req, res) => {
  return res.status(200).json({ Message: "SGDMS backend is working fine" });
});

app.post("/prompt", async (req, res) => {
  const { prompt } = req.body;

  // Input validation
  if (!prompt) {
    return res.status(400).json({
      success: false,
      error: "Prompt is required",
    });
  }

  try {
    var response = await call(prompt);

    if (!response) {
      throw new Error("No response received from prompt service");
    }

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error processing prompt:", error);

    // Determine appropriate status code
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
      success: false,
      error: error.message || "Failed to process prompt",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
});

app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`SGDMS AI port is running on PORT ${process.env.PORT}`);
});
