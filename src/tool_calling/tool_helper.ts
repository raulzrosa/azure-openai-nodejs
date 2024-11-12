import { OpenAI } from "openai";
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources/index.mjs";

export interface OpenAIFunctionsObject {
  getTools(): Array<OpenAI.ChatCompletionTool>;
}

export class OpenAIFunctionsHelper {
  static buildMessage(
    role: "assistant" | "user" | "system",
    content: string
  ):
    | ChatCompletionSystemMessageParam
    | ChatCompletionUserMessageParam
    | ChatCompletionAssistantMessageParam {
    return { role, content };
  }

  static async toolLoops(
    openai: OpenAI,
    model: string,
    messages: Array<OpenAI.ChatCompletionMessageParam>,
    functionsObject: OpenAIFunctionsObject
  ) {
    const tools = functionsObject.getTools();
    const response = await openai.chat.completions.create({
      messages: messages,
      model: model,
      tools: tools,
    });

    // Adiciona a mensagem de resposta ao array de mensagens
    messages = [...messages, response.choices[0].message];
    // Se a resposta tiver chamadas de ferramentas, executar cada uma delas
    if (response.choices[0].message.tool_calls) {
      for (const tool of response.choices[0].message.tool_calls) {
        const functionName = tool.function.name;
        let args = JSON.parse(tool.function.arguments);
        args = Object.values(args);

        // Chama a função com os argumentos
        const retVal = await functionsObject[functionName](...args);

        // Adiciona a resposta da função ao array de mensagens
        const newMessage: OpenAI.ChatCompletionToolMessageParam = {
          role: "tool",
          content: JSON.stringify(retVal),
          tool_call_id: tool.id,
        };

        messages = [...messages, newMessage];
      }

      // chama recursivamente a função para lidar com chamadas de ferramentas aninhadas
      return OpenAIFunctionsHelper.toolLoops(
        openai,
        model,
        messages,
        functionsObject
      );
    } else {
      // Se não houver chamadas de ferramentas, retornar as mensagens
      return messages;
    }
  }

}
