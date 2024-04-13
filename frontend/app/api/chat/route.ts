import { kv } from '@vercel/kv';
import { auth } from '@/auth';
import { nanoid } from '@/lib/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from "openai";
import { format } from 'path/posix';
import { validators } from 'tailwind-merge';


export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const validDatasources = ['SNOWFLAKE', 'POSTGRES'];

function transformMetadataList(metadataList : any) {
  let result = "";

  metadataList.forEach((entry: { datasource: any; metadata: string; }) => {
      const dataSource = entry.datasource;
      const metadata = JSON.parse(entry.metadata);
      result += `-- Data Source: ${dataSource}\n`;

      Object.keys(metadata).forEach(tableName => {
          result += `CREATE TABLE ${tableName} (\n`;
          metadata[tableName].forEach((column: { column_name: any; COLUMN_NAME: any; data_type: any; DATA_TYPE: any; }) => {
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


async function  executeQueries(queries: any[], userId: string) {
  const responses = await Promise.all(queries.map(async query => {
    const { datasource, sql } = query;
    // const formattedSql = sql.replace(/\n/g, ' ');
    const lowerCaseDatasource = datasource.toLowerCase();

    // Adjust the URL and options based on the datasource
    const url = `${process.env.NEXT_PUBLIC_NODE_SERVER}${lowerCaseDatasource}/query`;
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId, query: sql })
    };

    // Fetch data from the datasource
    const response = await fetch(url, fetchOptions);
    const data = await response.json()
    return {datasource, data}; // Return both datasource and parsed data
  }));
  
  return responses; // Returns an array of objects with datasource and data
}


function parseOpenAIResponse(response: any) {
  console.log(response)
  const responseJson = JSON.parse(response);
  var queries = []
  validDatasources.forEach((datasource) => {
    const query = {datasource: datasource, sql : responseJson[datasource]}
    queries.push(query)
  });
  const mathExpression = responseJson['expression']
  return {queries, mathExpression};
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
  
  var response = await fetch(`${process.env.NEXT_PUBLIC_NODE_SERVER}supabase/metadata`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({userId: userId}),
    });

  const responseJson = await response.json()
  
  const convertedMetadata = transformMetadataList(responseJson)

  // Assuming you have variables for tables and question like so:
  let tables = convertedMetadata;

  // Construct the prompt string using template literals
  
  var openaiResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    response_format: { "type": "json_object" },
    messages: [
      {
        role: "system",
        content: `Given the following SQL tables from different data sources as described: \n\n${convertedMetadata}\n\n For each data source, provide a SQL query to answer the question provided by me, using ONLY the tables and columns in the metadata that was just provided. Ensure that your queries strictly adhere to this metadata, referencing no external tables or fields that don't exist in a specific datasource. \n\nThe valid data sources are SNOWFLAKE AND POSTGRES. \n\nAfter providing the SQL queries, specify a math expression to combine these results using placeholders for each datasource's result. The format should be a simple math expression. \n\nProvide your response as a string representing a JSON, here is the format of the json : {'Datasource Name': 'sql query', 'Datasource Name': 'sql query', 'expression': 'math expression’}.\n\n Here's an example using the actual names:  {'SNOWFLAKE': 'SELECT COUNT(*) AS table_count FROM table_a', 'POSTGRES': 'SELECT COUNT(*) AS table_count FROM table_a', 'expression': '(SNOWFLAKE + POSTGRES) / 2’}'`
      },
      {
        role: "user",
        content: prompt // This is the user's question extracted from chat messages.
      }
    ],
    temperature: 0.2,
    max_tokens: 300, // Adjusted for potentially more complex instructions
    top_p: 1,
  });  

  // const content = 'POSTGRES: \n```sql\nSELECT COUNT(*) AS column_count\nFROM information_schema.columns;\n```\nSNOWFLAKE: \n```sql\nSELECT COUNT(*) AS column_count\nFROM information_schema.columns;\n```\nRESULT_FROM_POSTGRES + RESULT_FROM_SNOWFLAKE.'
  const content = openaiResponse.choices[0].message.content
  console.log(content)


  const {queries, mathExpression} = parseOpenAIResponse(content)

  console.log("QUERIES")
  
  console.log(queries)

  const datasourceQueryResponse = await executeQueries(queries, userId);
  console.log(datasourceQueryResponse)
  console.log(JSON.stringify(datasourceQueryResponse))


  const answerPrompt = `A user asked: "${prompt}"
Given the following query results: ${JSON.stringify(datasourceQueryResponse)}\n\nCalculate the total following the operation: ${mathExpression}, and craft an answer to the user's question based on this information. \n\n Make sure to show the exact SQL queries for each data source: ${JSON.stringify(queries)} \n\n Also show the math done to get the answer you provided as well: ${mathExpression}`;
  
  console.log(answerPrompt)

  openaiResponse = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      {
        role: "system",
        content: answerPrompt
      }
    ],
    temperature: 0.5,
    max_tokens: 300, // Adjusted for potentially more complex instructions
    top_p: 1,
  });

  const finalAnswer = openaiResponse.choices[0].message.content;

  console.log(openaiResponse);
  
  const formattedResponse = finalAnswer;



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
  return new Response(formattedResponse, {
    headers: { 'Content-Type': 'application/json' },
  });
}
