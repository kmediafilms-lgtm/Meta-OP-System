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
      patterns: [
        'enlagaleriadeana',
        'en la galeria de ana',
        'galeria de ana',
        'galeriadeana',
        'galeria ana',
        'galeriaana',
        'ana bodas'
      ]
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

function formatGraphError(error, context = {}) {
  const graphError = error.payload?.error || {};
  const code = graphError.code || null;
  const subcode = graphError.error_subcode || null;
  const message = graphError.message || error.message || 'Graph API request failed';

  const hints = [];
  if (code === 190) hints.push('Access token is invalid, expired, revoked, or malformed.');
  if ([10, 200, 299].includes(code)) hints.push('Token is missing a permission or asset access is not granted.');
  if (error.status === 403) hints.push('The token does not have access to this edge or asset.');
  if (error.status === 404) hints.push('The Business/Page/Ad Account ID may be wrong or unavailable to this token.');

  return {
    edge: context.edge || '',
    path: context.path || '',
    status: error.status || null,
    code,
    subcode,
    message,
    hints
  };
}

async function graphGet(path, params = {}) {
  const url = new URL(`${GRAPH_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  url.searchParams.set('access_token', ACCESS_TOKEN);

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });
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
    const response = await fetch(next, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });
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

async function getAllPagesWithErrors(path, params, context, errors) {
  try {
    return await getAllPages(path, params);
  } catch (error) {
    errors.push(formatGraphError(error, { ...context, path }));
    return [];
  }
}

async function discoverBusinesses() {
  const businesses = await getAllPages('/me/businesses', { fields: 'id,name' });
  return businesses;
}

async function discoverBusinessesSafe(errors) {
  try {
    return await discoverBusinesses();
  } catch (error) {
    errors.push(formatGraphError(error, { edge: 'me_businesses', path: '/me/businesses' }));
    if (BUSINESS_ID) return [];
    throw error;
  }
}

async function discoverBusinessDetails(businessId, errors) {
  try {
    const business = await graphGet(`/${businessId}`, { fields: 'id,name' });
    return {
      id: business.id || businessId,
      name: business.name || 'Provided Business ID'
    };
  } catch (error) {
    errors.push(formatGraphError(error, { edge: 'business', path: `/${businessId}` }));
    return { id: businessId, name: 'Provided Business ID' };
  }
}

async function enrichInstagramBusinessAccount(instagramBusinessId, errors) {
  if (!instagramBusinessId) {
    return { id: '', username: '', name: '' };
  }

  try {
    const account = await graphGet(`/${instagramBusinessId}`, {
      fields: 'id,username,name'
    });

    return {
      id: account.id || instagramBusinessId,
      username: account.username || '',
      name: account.name || ''
    };
  } catch (error) {
    errors.push(formatGraphError(error, {
      edge: 'instagram_business_account',
      path: `/${instagramBusinessId}`
    }));
    return { id: instagramBusinessId, username: '', name: '' };
  }
}

async function discoverPages(businessId, edge, source, errors) {
  const pages = await getAllPagesWithErrors(`/${businessId}/${edge}`, {
    fields: 'id,name,username,link'
  }, { edge: source }, errors);

  const enriched = [];

  for (const page of pages) {
    let instagramBusinessId = '';
    let instagramAccount = { id: '', username: '', name: '' };

    try {
      const pageDetails = await graphGet(`/${page.id}`, {
        fields: 'name,instagram_business_account'
      });
      instagramBusinessId = pageDetails.instagram_business_account?.id || '';
    } catch (error) {
      errors.push(formatGraphError(error, {
        edge: 'page_instagram_business_account',
        path: `/${page.id}`
      }));
      instagramBusinessId = '';
    }

    if (instagramBusinessId) {
      instagramAccount = await enrichInstagramBusinessAccount(instagramBusinessId, errors);
    }

    enriched.push({
      page_id: page.id || '',
      page_name: page.name || '',
      username: page.username || '',
      link: page.link || '',
      instagram_business_id: instagramBusinessId,
      instagram_username: instagramAccount.username || '',
      instagram_name: instagramAccount.name || '',
      source,
      matched_brand_guess: guessBrand(page.name, page.username, page.link, instagramAccount.username, instagramAccount.name)
    });
  }

  return enriched;
}

async function discoverAdAccounts(businessId, edge, source, errors) {
  const accounts = await getAllPagesWithErrors(`/${businessId}/${edge}`, {
    fields: 'id,name,account_status,currency,timezone_name'
  }, { edge: source }, errors);

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
  const graph_errors = [];
  const businesses = await discoverBusinessesSafe(graph_errors);

  if (!businesses.length && !BUSINESS_ID) {
    throw new Error('No businesses returned by /me/businesses and META_BUSINESS_ID was not provided.');
  }

  const selectedBusiness = BUSINESS_ID
    ? (businesses.find((b) => b.id === BUSINESS_ID) || await discoverBusinessDetails(BUSINESS_ID, graph_errors))
    : businesses[0];

  const [ownedPages, clientPages, ownedAdAccounts, clientAdAccounts] = await Promise.all([
    discoverPages(selectedBusiness.id, 'owned_pages', 'owned_pages', graph_errors),
    discoverPages(selectedBusiness.id, 'client_pages', 'client_pages', graph_errors),
    discoverAdAccounts(selectedBusiness.id, 'owned_ad_accounts', 'owned_ad_accounts', graph_errors),
    discoverAdAccounts(selectedBusiness.id, 'client_ad_accounts', 'client_ad_accounts', graph_errors)
  ]);

  const pages = [...ownedPages, ...clientPages];
  const adAccounts = [...ownedAdAccounts, ...clientAdAccounts];

  const output = {
    run_metadata: {
      generated_at: new Date().toISOString(),
      graph_api_version: GRAPH_API_VERSION,
      mode: 'read_only'
    },
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
    graph_errors,
    warnings: [
      'Review all matched_brand_guess values manually before copying into brand-config.json.',
      'This script is read-only and does not validate production permissions or App Review status.',
      'If Instagram Business ID is empty, check whether the Instagram account is professional and connected to the correct Facebook Page.',
      'If expected assets are missing, check Business Manager ownership, shared access, token permissions, restrictions, and graph_errors.'
    ]
  };

  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({
    error: error.message,
    status: error.status || null,
    graph_error: formatGraphError(error, { edge: 'startup' })
  }, null, 2));
  process.exit(1);
});
