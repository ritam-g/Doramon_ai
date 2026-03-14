import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import { chatWithGeminiAiModel,chatWithMistralAiModel } from './src/services/ai.service.js';

dotenv.config()


const PORT = process.env.PORT || 5000;

connectDB()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
});
async function callingAi() {
  await chatWithMistralAiModel()
  
}
callingAi()

