import { CFContext } from '../_shared';

const FALLBACK_AUDIO = 'https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3';

export async function onRequestGet(context: CFContext): Promise<Response> {
  try {
    const reqUrl = new URL(context.request.url);
    const rawUrl = (reqUrl.searchParams.get('url') || '').trim();
    const driveId = (reqUrl.searchParams.get('id') || '').trim();

    let targetUrl = rawUrl;
    let fileId = driveId;

    if (!fileId && targetUrl) {
      const match =
        targetUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
        targetUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
        targetUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/) ||
        targetUrl.match(/drive\.google\.com\/.*\/([a-zA-Z0-9_-]{25,})/);
      if (match && match[1]) {
        fileId = match[1];
      }
    }

    if (fileId) {
      targetUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0`;
    } else if (targetUrl.includes('dropbox.com')) {
      targetUrl = targetUrl
        .replace('?dl=0', '?dl=1')
        .replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }

    if (!targetUrl) {
      return Response.redirect(FALLBACK_AUDIO, 302);
    }

    const headers: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: '*/*',
    };
    const rangeHeader = context.request.headers.get('range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    let response = await fetch(targetUrl, { headers, redirect: 'follow' });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html') && fileId) {
      const htmlText = await response.text();
      const confirmMatch = htmlText.match(/confirm=([0-9a-zA-Z_]+)/);
      const confirmToken = confirmMatch ? confirmMatch[1] : 't';
      const retryUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=${confirmToken}`;
      response = await fetch(retryUrl, { headers, redirect: 'follow' });
    }

    if (!response.ok && response.status !== 206) {
      return Response.redirect(FALLBACK_AUDIO, 302);
    }

    const outHeaders = new Headers();
    const passHeaders = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control'];
    for (const h of passHeaders) {
      const val = response.headers.get(h);
      if (val) outHeaders.set(h, val);
    }
    const finalType = outHeaders.get('content-type') || '';
    if (!finalType || finalType.includes('text/html')) {
      outHeaders.set('Content-Type', 'audio/mpeg');
    }
    outHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      headers: outHeaders,
    });
  } catch {
    return Response.redirect(FALLBACK_AUDIO, 302);
  }
}
