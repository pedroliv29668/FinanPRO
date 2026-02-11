
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export const modifyJsonWithAI = async (currentJson: string, instruction: string): Promise<string> => {
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Você é um especialista em manipulação de dados JSON. 
  O usuário forneceu o seguinte JSON:
  \`\`\`json
  ${currentJson}
  \`\`\`
  
  Instrução do usuário: "${instruction}"
  
  Sua tarefa é modificar ou expandir o JSON original seguindo estritamente a instrução. 
  Retorne APENAS o JSON resultante válido, mantendo a estrutura original onde possível, mas aplicando as mudanças solicitadas.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Erro ao processar JSON com Gemini:", error);
    throw new Error("Falha ao processar sua solicitação de IA.");
  }
};

export const getAIInsight = async (dataSummary: any): Promise<string> => {
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Erro ao gerar insight com Gemini:", error);
    return "Desculpe, tive um problema ao analisar seus dados. Verifique sua conexão ou chave de API.";
  }
};

export const generateMarketingCopy = async (
  type: 'personalized' | 'upsell',
  clientName: string,
  lastService?: string,
  daysSinceLastVisit?: number
) => {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = type === 'personalized'
    ? `Você é uma Copywriter especialista em Clínicas de Estética de Luxo. 
         Crie uma mensagem de WhatsApp para a cliente ${clientName} que a faça se sentir ÚNICA e EXCLUSIVA.
         Diretrizes:
         1. Use Gatilhos Mentais de Afeição e Antecipação.
         2. Fale sobre o brilho no olhar, autoestima e o "tempo para si mesma".
         3. Use emojis de forma elegante (✨, 💖, 🌸).
         4. A linguagem deve ser próxima, como uma "consultora de beleza pessoal".
         5. Máximo 3 parágrafos curtos. Sem placeholders.`
    : `Você é uma especialista em Vendas e Neuro-Copywriting para Estética. 
         Crie uma oferta irresistível para ${clientName}, que fez ${lastService || 'um procedimento'} há ${daysSinceLastVisit || 30} dias.
         Objetivo: Upsell (Venda de serviço complementar).
         
         Lógica de Sugestão (Seja criativa):
         - Se fez Limpeza de Pele -> Sugira Peeling de Diamante ou Skinbooster para "blindar" o resultado.
         - Se fez Botox -> Sugira Bioestimulador para "sustentar" a juventude da pele.
         - Se fez Corporal -> Sugira Drenagem ou Enzimas para "acelerar" a queima.
         
         Estrutura da Mensagem:
         1. Gancho: Relembre o último procedimento e elogie o cuidado dela.
         2. Problema Oculto: Mencione que sem o cuidado X, o resultado Y pode durar menos.
         3. Solução (O Upsell): Apresente o novo serviço como o "par perfeito".
         4. Escassez: Mencione que você reservou apenas 2 horários prioritários para "clientes vips" esta semana.
         5. CTA: Peça uma resposta simples para reservar.
         
         Estilo: Persuasivo, elegante, focado em RESULTADO e TRANSFORMAÇÃO. Sem placeholders.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Erro ao gerar copy de marketing:", error);
    return "";
  }
};
