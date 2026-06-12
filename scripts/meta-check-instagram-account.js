#!/usr/bin/env node

/**
 * Safely inspect one Instagram Business Account.
 *
 * Usage:
 *   node scripts/meta-check-instagram-account.js 17841400348662832
 *
 * This script only performs a GET request, never prints access tokens, and never
 * modifies brand configs or Meta assets.
 */

const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v25.0';
const instagramBusinessId = process.argv[2];

if (!ACCESS_TOKEN) {
  console.error(JSON.stringify({
    error: 'Missing META_ACCESS_TOKEN',
    message: 'Set META_ACCESS_TOKEN in the environment before running this script.'
  }, null, 2));
  process.exit(1);
}

if (!instagramBusinessId) {
  console.error(JSON.stringify({
    error: 'Missing Instagram Business Account ID',
    usage: 'node scripts/meta-check-instagram-account.js <instagram_business_id>'
  }, null, 2));
  process.exit(1);
}

async function main() {
  const url = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${instagramBusinessId}`);
  url.searchParams.set('fields', 'id,username,name');
  url.searchParams.set('access_token', ACCESS_TOKEN);

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(JSON.stringify({
      error: payload?.error?.message || 'Graph API request failed',
      status: response.status,
      graph_error: payload?.error ? {
        code: payload.error.code || null,
        subcode: payload.error.error_subcode || null,
        type: payload.error.type || null,
        message: payload.error.message || ''
      } : null
    }, null, 2));
    process.exit(1);
  }

  console.log(JSON.stringify({
    id: payload.id || '',
    username: payload.username || '',
    name: payload.name || ''
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({
    error: error.message
  }, null, 2));
  process.exit(1);
});
