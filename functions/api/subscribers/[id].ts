import { CFContext, jsonResponse } from '../../_shared';

export async function onRequestDelete(_context: CFContext): Promise<Response> {
  return jsonResponse({ success: true, source: 'cloudflare-edge-noop' });
}
