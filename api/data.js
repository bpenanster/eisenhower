export const config = { runtime: 'edge' };

const BLOB_FILENAME = 'eisenhower-data.json';
const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method === 'GET') {
    try {
      const res = await fetch(
        'https://blob.vercel-storage.com?prefix=' + BLOB_FILENAME + '&limit=1',
        { headers: { Authorization: 'Bearer ' + TOKEN } }
      );
      const list = await res.json();

      if (!list.blobs || list.blobs.length === 0) {
        return new Response(
          JSON.stringify({ tasks: [], archive: [], tags: ['perso', 'pro', 'politique'] }),
          { headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }

      const dataRes = await fetch(list.blobs[0].url);
      const data = await dataRes.text();
      return new Response(data, {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(
        JSON.stringify({ tasks: [], archive: [], tags: ['perso', 'pro', 'politique'] }),
        { headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.text();
      JSON.parse(body);

      const res = await fetch(
        'https://blob.vercel-storage.com/' + BLOB_FILENAME,
        {
          method: 'PUT',
          headers: {
            Authorization: 'Bearer ' + TOKEN,
            'Content-Type': 'application/json',
            'x-add-random-suffix': '0',
          },
          body: body,
        }
      );
      const result = await res.json();
      return new Response(JSON.stringify({ ok: true, url: result.url }), {
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: e.message }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method not allowed', { status: 405, headers: cors });
}
