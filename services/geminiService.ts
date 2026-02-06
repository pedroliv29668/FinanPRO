
import { GoogleGenAI, Type } from "@google/genai";

// Always use const ai = new GoogleGenAI({apiKey: import.meta.env.VITE_GEMINI_API_KEY});
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const modifyJsonWithAI = async (currentJson: string, instruction: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';

  const prompt = `Você é um especialista em manipulação de dados JSON. 
  O usuário forneceu o seguinte JSON:
  \`\`\`json
  ${currentJson}
  \`\`\`
  
  Instrução do usuário: "${instruction}"
  
  Sua tarefa é modificar ou expandir o JSON original seguindo estritamente a instrução. 
  Retorne APENAS o JSON resultante válido, mantendo a estrutura original onde possível, mas aplicando as mudanças solicitadas.`;

  try {
    // Use ai.models.generateContent to query GenAI with both the model name and prompt.
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // The GenerateContentResponse object features a text property (not a method, so do not call text())
    // Ensure text is not undefined before calling trim()
    return (response.text || "").trim();
  } catch (error) {
    console.error("Erro ao processar JSON com Gemini:", error);
    throw new Error("Falha ao processar sua solicitação de IA. Verifique se o JSON é válido.");
  }
};
