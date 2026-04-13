import { put, head, getDownloadUrl } from '@vercel/blob';

const BLOB_KEY = 'eisenhower-data.json';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const origin = req.headers.get('origin') || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method === 'GET') {
    try {
      // Try to find existing blob
      const list = await fetch(`https://api.vercel.com/v2/blob/store/list?prefix=${BLOB_KEY}`, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
      });
      const listData = await list.json();
      
      if (!listData.blobs || listData.blobs.length === 0) {
        return new Response(JSON.stringify({ tasks: [], archive: [], tags: ['perso', 'pro', 'politique'] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const blobUrl = listData.blobs[0].url;
      const dataRes = await fetch(blobUrl);
      const data = await dataRes.text();

      return new Response(data, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ tasks: [], archive: [], tags: ['perso', 'pro', 'politique'] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.text();
      JSON.parse(body); // validate JSON

      const blob = await put(BLOB_KEY, body, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: false,
        contentType: 'application/json',
      });

      return new Response(JSON.stringify({ ok: true, url: blob.url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
}
