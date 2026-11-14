import { CFContext, jsonResponse } from '../_shared';

export async function onRequestGet(_context: CFContext): Promise<Response> {
  // Primary persistence is Firestore; return empty fallback list on Cloudflare Edge
  return jsonResponse({ subscribers: [], source: 'cloudflare-edge-noop' });
}

export async function onRequestPost(context: CFContext): Promise<Response> {
  const body: any = await context.request.json().catch(() => ({}));
  return jsonResponse({
    success: true,
    subscriber: {
      id: `sub_${Date.now()}`,
      email: String(body?.email || '').trim().toLowerCase(),
      storyId: body?.storyId || 'general',
    },
    source: 'cloudflare-edge-noop',
  });
}
