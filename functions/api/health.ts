import { CFContext, jsonResponse } from '../_shared';

export async function onRequestGet(_context: CFContext): Promise<Response> {
  return jsonResponse({
    status: 'ok',
    runtime: 'cloudflare-pages',
    timestamp: new Date().toISOString(),
  });
}
