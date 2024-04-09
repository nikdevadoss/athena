

import { auth } from '@/auth';
import { nanoid } from '@/lib/utils';
import { NextApiRequest, NextApiResponse } from 'next';



export const runtime = 'edge';

export async function GET(req: any) {
  const userId = (await auth())?.user.id;

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  // Return only the chatbot's last response to the client
  return new Response(JSON.stringify({ response: userId }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
