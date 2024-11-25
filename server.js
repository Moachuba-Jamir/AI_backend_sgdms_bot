const WebSocket = require("ws");
const http = require("http");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// server config
app.use(cors());
app.use(express.json());

// HTTP server to combine Express and WebSocket
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server });

// config for Gemini
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.MODEL_ID });
const additionalPrompt =
  "Consider yourself an expert chatbot developed by Zeliang Codetech Pvt. Ltd. Respond only with precise, necessary, and relevant information. if input has goals and objectives respond with a list";

// async generator function that stream text chunks to the client
async function* streamResponse(prompt) {
  try {
    const result = await model.streamGenerateContent(prompt + additionalPrompt);

    // for await of : is a for loop used to iterate over chunks
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      console.log(chunkText)
      if (chunkText) {
        yield chunkText; //yield pauses the the function and awaits the next chuck
      }
    }
  } catch (error) {
    console.error("Error in stream generation:", error);
    throw error;
  }
}

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("New WebSocket connection established.");

  // onmessage from the client
  ws.on("message", async (message) => {
    try {
      const { prompt } = JSON.parse(message);
      console.log(`user sends prompt ${prompt}`)
      if (!prompt) {
        ws.send(
          JSON.stringify({
            success: false,
            error: "Prompt is required.",
          })
        );
        return;
      }

      // Stream the response
      try {
        for await (const chunk of streamResponse(prompt)) {
          console.log(chunk)
          ws.send(
            JSON.stringify({
              success: true,
              data: chunk,
              isComplete: false,
            })
          );
        }

        // Send completion message
        ws.send(
          JSON.stringify({
            success: true,
            isComplete: true,
          })
        );
      } catch (error) {
        ws.send(
          JSON.stringify({
            success: false,
            error: error.message || "Failed to stream response",
          })
        );
      }
    } catch (error) {
      console.error("WebSocket Error:", error);
      ws.send(
        JSON.stringify({
          success: false,
          error: error.message || "Failed to process prompt.",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed.");
  });
});

app.get("/", (req, res) => {
  return res.status(200).json({ Message: "SGDMS backend is working fine" });
});

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
