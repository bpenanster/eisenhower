export const config = { runtime: 'edge' };

export default async function handler(req) {
  return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
