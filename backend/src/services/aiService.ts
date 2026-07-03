import { env } from '../config/env.js';

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenRouterRequest {
  model: string
  messages: OpenRouterMessage[]
  max_tokens?: number
  temperature?: number
}

interface OpenRouterResponse {
  choices: { message: { content: string } }[]
  usage?: { prompt_tokens: number; completion_tokens: number }
}

const SYSTEM_PROMPT = `Você é um assistente pessoal integrado a um aplicativo de organização.
Você ajuda o usuário a organizar tarefas, criar planos de estudo, sugerir hábitos,
dar dicas de produtividade, motivar e auxiliar em decisões do dia a dia.

Seja direto, prático e amigável. Responda em português brasileiro.
Quando aplicável, sugira ações que o usuário pode tomar no app.`;

export async function chatWithAI(
  messages: { role: 'user' | 'assistant'; content: string }[],
  userContext?: string,
): Promise<{ response: string; tokensUsed: number }> {
  const systemMessage: OpenRouterMessage = {
    role: 'system',
    content: userContext ? `${SYSTEM_PROMPT}\n\nContexto do usuário:\n${userContext}` : SYSTEM_PROMPT,
  };

  const requestBody: OpenRouterRequest = {
    model: env.openRouterModel,
    messages: [systemMessage, ...messages],
    max_tokens: 1024,
    temperature: 0.7,
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.openRouterKey}`,
      'HTTP-Referer': 'https://orgapp.vercel.app',
      'X-Title': 'OrgApp',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as OpenRouterResponse;
  const content = data.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua solicitação.';
  const tokensUsed = data.usage
    ? data.usage.prompt_tokens + data.usage.completion_tokens
    : 0;

  return { response: content, tokensUsed };
}

export async function generateDailyBriefing(userContext: string): Promise<string> {
  const { response } = await chatWithAI(
    [{ role: 'user', content: 'Gere um resumo matinal do meu dia com base no meu contexto. Seja breve e motivacional.' }],
    userContext,
  );
  return response;
}

export async function suggestTasks(userContext: string): Promise<string> {
  const { response } = await chatWithAI(
    [{ role: 'user', content: 'Com base no meu perfil e atividades, sugira 3 tarefas que eu deveria fazer hoje para ser produtivo. Seja específico.' }],
    userContext,
  );
  return response;
}
