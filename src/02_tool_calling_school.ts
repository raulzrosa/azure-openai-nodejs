import "dotenv/config";
import { AzureOpenAI } from "openai";
import { OpenAIFunctionsHelper } from "./tool_calling/tool_helper.js";
import {
  Aluno,
  Boletim,
  Responsavel,
  SchoolFunctions,
} from "./tool_calling/school.js";

const openai = new AzureOpenAI({
  apiVersion: process.env.AZURE_OPENAI_VERSION,
  baseURL: process.env.AZURE_OPENAI_API_BASE,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

const model = "gpt-4o";

const responsavel = new Responsavel("Arthur", [1111, 2222, 3333]);

const alunos: Aluno[] = [
  new Aluno("Percival", 1111),
  new Aluno("Lancelot", 2222),
  new Aluno("Tristão", 3333),
  new Aluno("Athos", 4444),
];

const boletins: Boletim[] = [
  new Boletim(1111, [
    { nome: "Português", nota: 7.2 },
    { nome: "Matemática", nota: 5.8 },
  ]),
  new Boletim(2222, [
    { nome: "Português", nota: 9.1 },
    { nome: "Matemática", nota: 10 },
  ]),
  new Boletim(4444, [
    { nome: "Português", nota: 10 },
    { nome: "Matemática", nota: 10 },
  ]),
];

const schoolFunctions = new SchoolFunctions(responsavel, alunos, boletins);

(async () => {
  const messages = await OpenAIFunctionsHelper.toolLoops(
    openai,
    model,
    [
      OpenAIFunctionsHelper.buildMessage(
        "system",
        `Voce é um assistente escolar que ajuda os responsáveis dos alunos a conseguir 
            informações sobre os seus dependentes que estudam na escola. Seja solicito e educado.`
      ),
      OpenAIFunctionsHelper.buildMessage(
        "user",
        "Gostaria de informações sobre os meus dependentes"
      ),
      // OpenAIFunctionsHelper.buildMessage(
      //   "user",
      //   "Gostaria de visualizar o boletim do meu filho Percival"
      // ),
    ],
    schoolFunctions
  );
  console.dir(messages, { depth: null });
})();
