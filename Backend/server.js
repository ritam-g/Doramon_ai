// Load env
import dotenv from "dotenv";
dotenv.config();

// Imports
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { chatWithMistralAiModel } from "./src/services/ai.service.js";

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    // connect DB
    await connectDB();

    // start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // wait a little before starting CLI
    //! stoping for morgan 
    // setTimeout(async () => {
    //   console.log("\n🤖 AI Chat Started\n");
    //   await chatWithMistralAiModel();
    // }, 500);

  } catch (err) {
    console.error("Error:", err);
  }
}

main();