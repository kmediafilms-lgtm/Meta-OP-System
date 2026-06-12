#!/usr/bin/env node

/**
 * WEDO Meta OS - Meta Asset Discovery
 *
 * Read-only script to discover Meta Business assets in bulk:
 * - Business Managers
 * - Owned/client Pages
 * - Instagram Business IDs connected to Pages
 * - Owned/client Ad Accounts
 * - Brand config suggestions
 *
 * Required environment variables:
 * - META_ACCESS_TOKEN
 * - META_BUSINESS_ID optional. If missing, the script uses the first business returned by /me/businesses.
 * - GRAPH_API_VERSION optional. Defaults to v25.0.
 *
 * This script does not write .env, does not modify brand configs, does not send messages,
 * and does not modify ads.
 */

const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const BUSINESS_ID = process.env.META_BUSINESS_ID || '';
const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || 'v25.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

if (!ACCESS_TOKEN) {
  console.error(JSON.stringify({
    error: 'Missing META_ACCESS_TOKEN',
    message: 'Set META_ACCESS_TOKEN locally before running this script. Do not commit real tokens.'
  }, null, 2));
  process.exit(1);
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function guessBrand(...values) {
  const text = normalizeText(values.filter(Boolean).join(' '));

  if (!text) return 'needs_review';

  const rules = [
    {
      brand_id: 'kmediafilms',
      patterns: ['kmedia', 'k media', 'kmediafilms', 'k media films']
    },
    {
      brand_id: 'en-la-galeria-de-ana',
      patterns: ['galeria de ana', 'en la galeria de ana', 'galeria ana', 'ana']
    },
    {
      brand_id: 'drivip',
      patterns: ['drivip', 'dri vip', 'driveip']
    }
  ];

  const matches = rules.filter((rule) =>
    rule.patterns.some((pattern) => text.includes(normalizeText(pattern)))
  );

  if (matches.length === 1) return matches[0].brand_id;
  return 'needs_review';
}

async function graphGet(path, params = {}) {
  const url = new URL(`${GRAPH_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  url.searchParams.set('access_token', ACCESS_TOKEN);

  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(payload?.error?.message || `Graph API request failed: ${path}`);
    err.payload = payload;
    err.status = response.status;
    throw err;
  }

  return payload;
}

async function getAllPages(path, params = {}) {
  const first = await graphGet(path, params);
  const data = Array.isArray(first.data) ? [...first.data] : [];
  let next = first.paging?.next;

  while (next) {
    const response = await fetch(next);
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = new Error(payload?.error?.message || `Graph API pagination failed: ${path}`);
      err.payload = payload;
      err.status = response.status;
      throw err;
    }

    if (Array.isArray(payload.data)) data.push(...payload.data);
    next = payload.paging?.next;
  }

  return data;
}

async function discoverBusinesses() {
  const businesses = await getAllPages('/me/businesses', { fields: 'id,name' });
  return businesses;
}

async function discoverPages(businessId, edge, source) {
  const pages = await getAllPages(`/${businessId}/${edge}`, {
    fields: 'id,name,username,link'
  });

  const enriched = [];

  for (const page of pages) {
    let instagramBusinessId = '';

    try {
      const pageDetails = await graphGet(`/${page.id}`, {
        fields: 'name,instagram_business_account'
      });
      instagramBusinessId = pageDetails.instagram_business_account?.id || '';
    } catch (error) {
      instagramBusinessId = '';
    }

    enriched.push({
      page_id: page.id || '',
      page_name: page.name || '',
      username: page.username || '',
      link: page.link || '',
      instagram_business_id: instagramBusinessId,
      source,
      matched_brand_guess: guessBrand(page.name, page.username, page.link)
    });
  }

  return enriched;
}

async function discoverAdAccounts(businessId, edge, source) {
  const accounts = await getAllPages(`/${businessId}/${edge}`, {
    fields: 'id,name,account_id,account_status,currency,timezone_name'
  });

  return accounts.map((account) => ({
    ad_account_id: account.id || (account.account_id ? `act_${account.account_id}` : ''),
    account_id: account.account_id || String(account.id || '').replace(/^act_/, ''),
    name: account.name || '',
    status: String(account.account_status || ''),
    currency: account.currency || '',
    timezone_name: account.timezone_name || '',
    source,
    matched_brand_guess: guessBrand(account.name, account.id, account.account_id)
  }));
}

function buildBrandSuggestions(pages, adAccounts) {
  const knownBrands = ['kmediafilms', 'en-la-galeria-de-ana', 'drivip'];

  return knownBrands.map((brandId) => {
    const page = pages.find((item) => item.matched_brand_guess === brandId) || null;
    const adAccount = adAccounts.find((item) => item.matched_brand_guess === brandId) || null;

    const brandNames = {
      kmediafilms: 'KMediaFilms',
      'en-la-galeria-de-ana': 'En la Galería de Ana',
      drivip: 'DRIVIP'
    };

    return {
      brand_id: brandId,
      brand_name: brandNames[brandId],
      facebook_page_id: page?.page_id || '',
      instagram_business_id: page?.instagram_business_id || '',
      meta_ad_account_id: adAccount?.ad_account_id || ''
    };
  });
}

async function main() {
  const businesses = await discoverBusinesses();

  if (!businesses.length && !BUSINESS_ID) {
    throw new Error('No businesses returned by /me/businesses and META_BUSINESS_ID was not provided.');
  }

  const selectedBusiness = BUSINESS_ID
    ? { id: BUSINESS_ID, name: businesses.find((b) => b.id === BUSINESS_ID)?.name || 'Provided Business ID' }
    : businesses[0];

  const [ownedPages, clientPages, ownedAdAccounts, clientAdAccounts] = await Promise.all([
    discoverPages(selectedBusiness.id, 'owned_pages', 'owned_pages').catch(() => []),
    discoverPages(selectedBusiness.id, 'client_pages', 'client_pages').catch(() => []),
    discoverAdAccounts(selectedBusiness.id, 'owned_ad_accounts', 'owned_ad_accounts').catch(() => []),
    discoverAdAccounts(selectedBusiness.id, 'client_ad_accounts', 'client_ad_accounts').catch(() => [])
  ]);

  const pages = [...ownedPages, ...clientPages];
  const adAccounts = [...ownedAdAccounts, ...clientAdAccounts];

  const output = {
    business: {
      id: selectedBusiness.id,
      name: selectedBusiness.name || ''
    },
    available_businesses: businesses.map((business) => ({
      id: business.id,
      name: business.name || ''
    })),
    pages,
    ad_accounts: adAccounts,
    brand_config_suggestions: buildBrandSuggestions(pages, adAccounts),
    warnings: [
      'Review all matched_brand_guess values manually before copying into brand-config.json.',
      'This script is read-only and does not validate production permissions or App Review status.',
      'If Instagram Business ID is empty, check whether the Instagram account is professional and connected to the correct Facebook Page.',
      'If expected assets are missing, check Business Manager ownership, shared access, token permissions, and restrictions.'
    ]
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({
    error: error.message,
    status: error.status || null,
    graph_error: error.payload?.error || null
  }, null, 2));
  process.exit(1);
});
