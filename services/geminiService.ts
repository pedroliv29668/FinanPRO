
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

export const getAIInsight = async (dataSummary: any): Promise<string> => {
  const model = 'gemini-1.5-flash'; // Using stable flash model

  const prompt = `Você é um Consultor Estratégico Especialista em Clínicas de Estética e Gestão Financeira de Alto Nível.
  Analise os dados financeiros abaixo e forneça um relatório executivo de alta performance.
  
  DADOS DO MÊS ATUAL:
  ${JSON.stringify(dataSummary, null, 2)}
  
  DIRETRIZES DO RELATÓRIO (DEVE TER ESSAS SEÇÕES):
  1. **Resumo de Performance**: Indique claramente o Faturamento Total e o **Lucro Líquido Real** deste mês. Compare brevemente com a meta se aplicável.
  2. **Análise de Eficiência**: Comente sobre a Margem de Lucro. Está saudável (acima de 30%)? Onde os custos estão pesando mais?
  3. **Estrela da Clínica**: Qual serviço mais rentável e como escalá-lo.
  4. **Projeção para o Próximo Mês**: Com base nos dados, sugira uma meta de crescimento (ex: 10%, 20%) que seja ambiciosa mas realista, justificando o porquê.
  5. **3 Insights Estratégicos**: Recomendações práticas (marketing, preços ou gestão) para bater a meta sugerida.
  
  Mantenha a resposta em Português do Brasil, formatada em Markdown elegante, e seja direto ao ponto.`;

  try {
    const result = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    export const generateMarketingCopy = async (
      type: 'personalized' | 'upsell',
      clientName: string,
      lastService?: string,
      daysSinceLastVisit?: number
    ) => {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = type === 'personalized'
        ? `Crie uma mensagem curta e carinhosa de WhatsApp para a cliente ${clientName}. 
       O objetivo é fazer ela se sentir única e especial em minha clínica de estética. 
       Use emojis, seja persuasiva mas gentil. Não use placeholders como [Nome]. 
       Foque em autoestima e bem-estar.`
        : `Crie uma mensagem de WhatsApp para a cliente ${clientName} que fez ${lastService || 'um procedimento'} recentemente (há ${daysSinceLastVisit || 30} dias). 
       O objetivo é sugerir um procedimento complementar de forma elegante e persuasiva. 
       Se ela fez Limpeza de Pele, sugira Hidratação ou Peeling. 
       Se ela fez Botox, sugira Preenchimento ou Bioestimulador. 
       Use emojis e foco em resultados duradouros. Não use placeholders.`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
      } catch (error) {
        console.error("Erro ao gerar copy de marketing:", error);
        return "";
      }
    };

    return result.response.text() || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro ao gerar insight com Gemini:", error);
    return "Desculpe, tive um problema ao analisar seus dados. Verifique sua conexão ou chave de API.";
  }
};
