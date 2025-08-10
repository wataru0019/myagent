import { createOpenAI } from '@ai-sdk/openai';
import { streamText, type UIMessage, convertToModelMessages } from 'ai';

import { OPENAI_API_KEY } from '$env/static/private';

const openai = createOpenAI({
  apiKey: OPENAI_API_KEY,
});

// export async function POST({ request }) {
//   const { messages }: { messages: UIMessage[] } = await request.json();

//   const result = streamText({
//     model: openai('gpt-4o-mini'),
//     messages: [
//       {
//         role: 'system',
//         content: `You are a helpful recipe assistant for "Dinner Ideas". Your role is to help users find perfect dinner recipes based on their available ingredients, dietary preferences, and mood. 

// Key guidelines:
// - Be friendly and enthusiastic about cooking
// - Ask clarifying questions about ingredients, dietary restrictions, or cuisine preferences
// - Suggest recipes that are practical and achievable
// - Provide helpful cooking tips when relevant
// - Keep responses conversational and engaging
// - If a user mentions specific ingredients, suggest recipes that use those ingredients
// - Consider cooking time and difficulty level when making suggestions

// Always respond in a helpful, encouraging tone that makes users excited to cook!`
//       },
//       ...convertToModelMessages(messages)
//     ],
//   });

//   return result.toUIMessageStreamResponse();
// }
const API_ENDPOINT = "http://localhost:4111/api/agents/openAiAgent/stream"

export async function POST({ request }) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  console.log('Received messages:', messages.length);

  try {
    // AI SDKのメッセージ形式をMastra形式に変換
    const mastraMessages = messages.map(msg => {
      let content = '';
      
      // AI SDKの新しい形式（parts配列）に対応
      if (Array.isArray(msg.parts)) {
        content = msg.parts
          .filter(part => part.type === 'text')
          .map(part => part.text)
          .join(' ');
      }
      // 従来のcontent形式にも対応
      else if (typeof msg.content === 'string') {
        content = msg.content;
      }
      
      return {
        role: msg.role,
        content: content.trim()
      };
    }).filter(msg => msg.content.length > 0);
    
    console.log('Sending to Mastra:', mastraMessages);
    
    // MastraのStreamingエンドポイントに直接送信
    const mastraResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: mastraMessages,
      }),
    });

    if (!mastraResponse.ok) {
      throw new Error(`Mastra API error: ${mastraResponse.status}`);
    }

    // MastraのレスポンスをそのままAI SDKに流す
    // MastraはAI SDK互換の形式でレスポンスを返すはず
    return new Response(mastraResponse.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Mastra integration error:', error);
    
    // フォールバック: OpenAI実装
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  }
}