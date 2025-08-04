import { createOpenAI } from '@ai-sdk/openai';
import { streamText, type UIMessage, convertToModelMessages } from 'ai';

import { OPENAI_API_KEY } from '$env/static/private';

const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST({ request }) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: [
      {
        role: 'system',
        content: `You are a helpful recipe assistant for "Dinner Ideas". Your role is to help users find perfect dinner recipes based on their available ingredients, dietary preferences, and mood. 

Key guidelines:
- Be friendly and enthusiastic about cooking
- Ask clarifying questions about ingredients, dietary restrictions, or cuisine preferences
- Suggest recipes that are practical and achievable
- Provide helpful cooking tips when relevant
- Keep responses conversational and engaging
- If a user mentions specific ingredients, suggest recipes that use those ingredients
- Consider cooking time and difficulty level when making suggestions

Always respond in a helpful, encouraging tone that makes users excited to cook!`
      },
      ...convertToModelMessages(messages)
    ],
  });

  return result.toUIMessageStreamResponse();
}