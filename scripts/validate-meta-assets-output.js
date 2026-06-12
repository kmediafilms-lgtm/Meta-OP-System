#!/usr/bin/env node

/**
 * Validate a local Meta asset discovery output file.
 *
 * This script never calls Meta, never prints tokens, and never modifies brand configs.
 */

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || 'outputs/meta-assets.local.json';
const resolvedPath = path.resolve(process.cwd(), inputPath);

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function missingFields(record, fields) {
  return fields.filter((field) => !record[field]);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function printSection(title) {
  console.log(`\n=== ${title} ===`);
}

function main() {
  const data = readJson(resolvedPath);
  const pages = asArray(data.pages);
  const adAccounts = asArray(data.ad_accounts);
  const suggestions = asArray(data.brand_config_suggestions);
  const graphErrors = asArray(data.graph_errors);

  const errors = [];
  const warnings = [];

  if (!data.business || typeof data.business !== 'object') {
    errors.push('Missing business object.');
  } else if (!data.business.id) {
    errors.push('Missing business.id.');
  }

  if (!Array.isArray(data.pages)) warnings.push('pages is missing or is not an array.');
  if (!Array.isArray(data.ad_accounts)) warnings.push('ad_accounts is missing or is not an array.');
  if (!Array.isArray(data.brand_config_suggestions)) {
    warnings.push('brand_config_suggestions is missing or is not an array.');
  }

  const pageReviewItems = pages.filter((page) => page.matched_brand_guess === 'needs_review');
  const adReviewItems = adAccounts.filter((account) => account.matched_brand_guess === 'needs_review');

  const incompleteSuggestions = suggestions
    .map((suggestion) => ({
      brand_id: suggestion.brand_id || 'unknown',
      brand_name: suggestion.brand_name || '',
      missing: missingFields(suggestion, [
        'facebook_page_id',
        'instagram_business_id',
        'meta_ad_account_id'
      ])
    }))
    .filter((item) => item.missing.length > 0);

  const detectedBrands = unique([
    ...pages.map((page) => page.matched_brand_guess),
    ...adAccounts.map((account) => account.matched_brand_guess),
    ...suggestions.map((suggestion) => suggestion.brand_id)
  ]).filter((brand) => brand !== 'needs_review');

  printSection('META ASSETS OUTPUT VALIDATION');
  console.log(`File: ${resolvedPath}`);
  console.log(`Business: ${data.business?.name || '(name missing)'} (${data.business?.id || 'id missing'})`);

  printSection('SUMMARY');
  console.log(`Detected brands: ${detectedBrands.length ? detectedBrands.join(', ') : 'none'}`);
  console.log(`Pages found: ${pages.length}`);
  console.log(`Ad accounts found: ${adAccounts.length}`);
  console.log(`Brand suggestions: ${suggestions.length}`);
  console.log(`Graph errors reported: ${graphErrors.length}`);

  printSection('BRAND SUGGESTIONS');
  if (!suggestions.length) {
    console.log('No brand_config_suggestions were found.');
  } else {
    for (const suggestion of suggestions) {
      const missing = missingFields(suggestion, [
        'facebook_page_id',
        'instagram_business_id',
        'meta_ad_account_id'
      ]);
      const status = missing.length ? `incomplete: missing ${missing.join(', ')}` : 'complete';
      console.log(`- ${suggestion.brand_id || 'unknown'}: ${status}`);
    }
  }

  printSection('ASSETS NEEDING REVIEW');
  if (!pageReviewItems.length && !adReviewItems.length) {
    console.log('No assets are marked needs_review.');
  } else {
    for (const page of pageReviewItems) {
      console.log(`- Page needs review: ${page.page_name || '(unnamed)'} (${page.page_id || 'id missing'})`);
    }
    for (const account of adReviewItems) {
      console.log(`- Ad account needs review: ${account.name || '(unnamed)'} (${account.ad_account_id || 'id missing'})`);
    }
  }

  printSection('INCOMPLETE BRANDS');
  if (!incompleteSuggestions.length) {
    console.log('No incomplete brand suggestions.');
  } else {
    for (const item of incompleteSuggestions) {
      console.log(`- ${item.brand_id}: missing ${item.missing.join(', ')}`);
    }
  }

  if (graphErrors.length) {
    printSection('GRAPH ERRORS');
    for (const error of graphErrors) {
      console.log(`- ${error.edge || 'unknown edge'} (${error.status || 'no status'}): ${error.message || 'unknown error'}`);
      for (const hint of asArray(error.hints)) {
        console.log(`  hint: ${hint}`);
      }
    }
  }

  if (warnings.length) {
    printSection('WARNINGS');
    for (const warning of warnings) console.log(`- ${warning}`);
  }

  if (errors.length) {
    printSection('ERRORS');
    for (const error of errors) console.log(`- ${error}`);
    process.exit(1);
  }

  console.log('\nValidation complete. Review incomplete brands and needs_review assets before copying IDs manually.\n');
}

try {
  main();
} catch (error) {
  console.error(`\nValidation failed: ${error.message}\n`);
  process.exit(1);
}
