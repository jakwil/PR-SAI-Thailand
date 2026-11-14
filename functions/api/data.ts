import { CFContext, jsonResponse } from '../_shared';

// On Cloudflare Pages, Firestore is the source of truth for app data.
// Returning cloudflare-edge-noop ensures App.tsx does not overwrite live Firestore state.
export async function onRequestGet(_context: CFContext): Promise<Response> {
  return jsonResponse({
    ok: true,
    source: 'cloudflare-edge-noop',
  });
}

export async function onRequestPost(_context: CFContext): Promise<Response> {
  return jsonResponse({
    ok: true,
    source: 'cloudflare-edge-noop',
  });
}
