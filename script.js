const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyDNWrB8Gfcp10-NrXPeB7jBGO0t6LLD1KU');
// const model = genAI.getGenerativeModel({ model: "tunedModels/sgdmsmetadatamodel-6di82w0c7au" }); //gemini 1.5 pro 
const model = genAI.getGenerativeModel({ model: "tunedModels/modelsgdmspromptmultilingual-wg3y7xto4yr" }); //gemini 1.5 flash bb
console.log("Using model:", model);
const prompt = "do you have any idea who built you?";   //add language selection using template literal

async function call(prompt) {
    try {
        const ans = await model.generateContent(prompt + "consider yourself and exerpt chatbot. Reply in a friendly and helpful manner make sure your answers are a bit descriptive in nature so that people understand much more. ");
        
        // Extract the generated text
        const responseText = await ans.response.text(); // call the text function to get the text content
        console.log(responseText); // Output the text
        
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

call(prompt);
