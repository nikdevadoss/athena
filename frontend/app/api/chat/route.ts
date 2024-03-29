import { kv } from '@vercel/kv';
import { auth } from '@/auth';
import { nanoid } from '@/lib/utils';
const { executeSqlQuery } = require('./helpers/sqlHelper');
import { NextApiRequest, NextApiResponse } from 'next';



export const runtime = 'edge';

export async function POST(req: any) {
  const json = await req.json();
  const { messages } = json;
  const userId = (await auth())?.user.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Construct the prompt from messages
  const prompt = messages.map((m: { role: any; content: any; }) => `${m.role}: ${m.content}`).join('\n');


  const queryString = "Here's some metadata about my databases, take a question and give me the necessary queries to answer the question: metadata: USER (id, name, age), question: "


  // // Assuming you have variables for tables and question like so:
  // let tables = "people_name(id,name), people_age(people_id,age)";
  // let question = promptString;

  // // Construct the prompt string using template literals
  // const prompt = `convert question and table into SQL query. tables: ${tables}. question: ${question}`;

  // Call to Hugging Face API
  // const response = await fetch('https://api-inference.huggingface.co/models/google/gemma-7b', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': 'Bearer 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',
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     inputs: queryString + prompt,
  //     options: { max_new_tokens: 50 }, // Customize as needed
  //   }),
  // });

  // const data = await response.json();
  // console.log(data)
  // const completion = data[0]?.generated_text

  // // Extract only the chatbot's last response, not the entire conversation
  // const lastResponseLines = completion.split('\n');
  // const lastResponse = lastResponseLines[lastResponseLines.length - 1];

  const sqlQuery = "SELECT * FROM your_table"

  const queryResult = await executeSqlQuery(sqlQuery);

  const title = messages[0].content.substring(0, 100);
  const id = json.id ?? nanoid();
  const createdAt = Date.now();
  const path = `/chat/${id}`;
  const payload = {
    id,
    title,
    userId,
    createdAt,
    path,
    messages: [
      ...messages,
      {
        content: queryResult, // Use only the chatbot's last response
        role: 'assistant',
      },
    ],
  };

  await kv.hmset(`chat:${id}`, payload);
  await kv.zadd(`user:chat:${userId}`, {
    score: createdAt,
    member: `chat:${id}`,
  });

  // Return only the chatbot's last response to the client
  return new Response(JSON.stringify({ response: queryResult }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
