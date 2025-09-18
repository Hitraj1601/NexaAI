import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function run() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set. Create a .env file and set GEMINI_API_KEY.');
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const resp = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: 'Say hello in one short sentence.'
    });
    console.log('Gemini response:', resp.text.trim());
  } catch (err) {
    console.error('Gemini API test failed:', err?.message || err);
  }
}

run();
