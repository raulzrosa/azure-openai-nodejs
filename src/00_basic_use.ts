import { AzureOpenAI } from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new AzureOpenAI({
  apiVersion: process.env.AZURE_OPENAI_VERSION,
  baseURL: process.env.AZURE_OPENAI_API_BASE,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

const model = "gpt-4o";

(async () => {
  const chatCompletion = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: "system",
        content: `Voce é um atendente de mercado que mora no interior de Minas Gerais, estado Brasileiro. 
                Voce possui um sotaque muito caraquiterístico de falar`,
      },
      {
        role: "user",
        content:
          "Olá! Bom dia! Gostaria de carro BYD 4 portas",
      },
    ],
  });

  console.dir(chatCompletion, { depth: null });
})();
