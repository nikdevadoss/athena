import { kv } from '@vercel/kv';
import { auth } from '@/auth';
import { nanoid } from '@/lib/utils';
const { executeSqlQuery } = require('./helpers/sqlHelper');
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";


export const runtime = 'edge';


// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const openai = new OpenAI({
  apiKey: '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',
});


function transformMetadataList(metadataList) {
  let result = "";

  metadataList.forEach(entry => {
      const dataSource = entry.datasource;
      const metadata = JSON.parse(entry.metadata);
      result += `-- Data Source: ${dataSource}\n`;

      Object.keys(metadata).forEach(tableName => {
          result += `CREATE TABLE ${tableName} (\n`;
          metadata[tableName].forEach(column => {
              const columnName = column.column_name || column.COLUMN_NAME;
              const dataType = column.data_type || column.DATA_TYPE;
              result += `  ${columnName} ${dataType},\n`;
          });
          // Remove the last comma and add closing parenthesis
          result = result.replace(/,\n$/, "\n"); // Removes the last comma
          result += ");\n\n";
      });
  });

  return result;
}


async function executeQueries(queries, userId) {
  const responses = await Promise.all(queries.map(async query => {
    const { datasource, sql } = query;
    const formattedSql = sql.replace(/\n/g, ' ');
    const lowerCaseDatasource = datasource.toLowerCase();

    // Adjust the URL and options based on the datasource
    const url = `http://localhost:8080/${lowerCaseDatasource}/query`;
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId, query: formattedSql })
    };

    // Fetch data from the datasource
    const response = await fetch(url, fetchOptions);
    const data = await response.json()
    console.log(data)
    return {datasource, data}; // Return both datasource and parsed data
  }));
  
  return responses; // Returns an array of objects with datasource and data
}




function parseOpenAIResponse(response: any) {
  // Split the response by the specific pattern separating SQL queries from the math expression
  const parts = response.split('\n```\n');
  // Initialize an array to hold the queries
  const queries : any[] = [];

  // Process the parts to fill the queries array and extract the math expression
  parts.forEach((part, index) => {
    if (part.includes('```sql')) {
      // Extract the datasource and SQL query
      const [datasourceLine, sql] = part.split('```sql\n');
      const datasource = datasourceLine.split(': ')[0];
      queries.push({ datasource, sql: sql.trim() });
    }
  });

  // The math expression is in the last part, after the last occurrence of '```'
  const mathExpression = parts[parts.length - 1].split('```').pop().trim();
  return { queries, mathExpression };
}



export async function POST(req: any) {
  const json = await req.json();
  const { messages } = json;
  const userId = (await auth())?.user.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Construct the prompt from messages
  var prompt = messages.map((m: { role: any; content: any; }) => `${m.role}: ${m.content}`).join('\n');
  
  var response = await fetch(`http://localhost:8080/supabase/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({userId: userId}),
    });

  const responseJson = await response.json()

  // console.log(responseJson)
  
  const convertedMetadata = transformMetadataList(responseJson)

  // Assuming you have variables for tables and question like so:
  let tables = convertedMetadata;

  // Construct the prompt string using template literals
  
  var openaiResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content: `Given the following SQL tables from different data sources as described: \n\n${convertedMetadata}\n\nFor each data source, provide an SQL query. Follow this format:\n\n- DATASOURCE: [SQL Query],\n\nAfter providing the SQL queries, specify a math expression to combine these results using placeholders for each datasource's result. The format should be a simple math expression.\n\nFormat the response as follows:\nDATASOURCE: sql query,\nDATASOURCE: sql query,\nmath expression.`
      },
      {
        role: "user",
        content: prompt // This is the user's question extracted from chat messages.
      }
    ],
    temperature: 0.7,
    max_tokens: 100, // Adjusted for potentially more complex instructions
    top_p: 1,
  });

  // console.log(openaiResponse)
  


  // const content = 'POSTGRES: \n```sql\nSELECT COUNT(*) AS column_count\nFROM information_schema.columns;\n```\nSNOWFLAKE: \n```sql\nSELECT COUNT(*) AS column_count\nFROM information_schema.columns;\n```\nRESULT_FROM_POSTGRES + RESULT_FROM_SNOWFLAKE.'
  const content = openaiResponse.choices[0].message.content

  const {queries, mathExpression} = parseOpenAIResponse(content)

  const datasourceQueryResponse = await executeQueries(queries, userId);


  const answerPrompt = `A user asked: "${prompt}"
Given the following query results: ${datasourceQueryResponse}

Calculate the total following the operation: ${mathExpression}, and craft an answer to the user's question based on this information.`;
  

  openaiResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content: answerPrompt
      },
      {
        role: "user",
        content: prompt // This is the user's question extracted from chat messages.
      }
    ],
    temperature: 0.7,
    max_tokens: 100, // Adjusted for potentially more complex instructions
    top_p: 1,
  });

  const finalAnswer = openaiResponse.choices[0].message.content;

  console.log(openaiResponse);
  
  const formattedResponse = queries.toString() + '\n' + finalAnswer;



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
        content: formattedResponse, // Use only the chatbot's last response
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
  return new Response(JSON.stringify({ response: formattedResponse }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
