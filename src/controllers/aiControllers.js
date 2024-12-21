import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("askAI", prompt);
    const result = await model.generateContent(prompt);
    res.status(200).send({ success: true, response: result.response.text() });
  } catch (err) {
    res.status(500).send({ message: err.message, success: false });
  }
};
