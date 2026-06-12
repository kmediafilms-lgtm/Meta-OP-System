const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function listFiles(dir, predicate = () => true) {
  const absoluteDir = path.join(ROOT, dir);
  if (!fs.existsSync(absoluteDir)) return [];

  const out = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const absolutePath = path.join(absoluteDir, entry.name);
    const relativePath = path.relative(ROOT, absolutePath);
    if (entry.isDirectory()) out.push(...listFiles(relativePath, predicate));
    if (entry.isFile() && predicate(relativePath)) out.push(relativePath);
  }
  return out.sort();
}

function result(name, status = 'PASS', summary = '') {
  return { name, status, summary, findings: [] };
}

function addFinding(report, severity, file, message, details = {}) {
  report.findings.push({ severity, file, message, ...details });
  if (severity === 'FAIL') report.status = 'FAIL';
  if (severity === 'WARN' && report.status === 'PASS') report.status = 'WARN';
}

function summarize(report) {
  const counts = { PASS: 0, WARN: 0, FAIL: 0 };
  for (const finding of report.findings) counts[finding.severity] += 1;
  report.summary = report.summary || `${counts.FAIL} fail, ${counts.WARN} warn`;
  return report;
}

function loadBrandConfigs() {
  const files = listFiles('brands', (file) => file.endsWith('/brand-config.json'));
  return files.map((file) => ({ file, config: readJson(file) }));
}

function buildBrandIndex() {
  const index = {
    byPageId: new Map(),
    byInstagramId: new Map(),
    byAdAccountId: new Map(),
    configs: loadBrandConfigs()
  };

  for (const { file, config } of index.configs) {
    const brandId = config.brand_id;
    if (config.facebook_page_id && !String(config.facebook_page_id).startsWith('PLACEHOLDER')) {
      index.byPageId.set(String(config.facebook_page_id), { brandId, file });
    }
    if (config.instagram_business_id && !String(config.instagram_business_id).startsWith('PLACEHOLDER')) {
      index.byInstagramId.set(String(config.instagram_business_id), { brandId, file });
    }
    if (config.meta_ad_account_id && !String(config.meta_ad_account_id).startsWith('PLACEHOLDER')) {
      index.byAdAccountId.set(String(config.meta_ad_account_id), { brandId, file });
    }
  }

  return index;
}

function collectMetaIds(payload) {
  const ids = {
    pageIds: new Set(),
    instagramIds: new Set(),
    adAccountIds: new Set()
  };

  function visit(value, key = '') {
    if (value === null || value === undefined) return;
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value);
      if (key === 'page_id' || key === 'id') ids.pageIds.add(text);
      if (key === 'instagram_business_id' || key === 'recipient' || key === 'instagram_id') ids.instagramIds.add(text);
      if (key === 'ad_account_id' || /^act_\d+$/.test(text)) ids.adAccountIds.add(text);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item, key);
      return;
    }
    if (typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value)) {
        if (childKey === 'recipient' && childValue && typeof childValue === 'object' && childValue.id) {
          ids.instagramIds.add(String(childValue.id));
        }
        visit(childValue, childKey);
      }
    }
  }

  visit(payload);
  return ids;
}

function resolveBrand(payload, index = buildBrandIndex()) {
  const ids = collectMetaIds(payload);
  const matches = [];

  for (const id of ids.pageIds) {
    if (index.byPageId.has(id)) matches.push({ method: 'page_id', id, ...index.byPageId.get(id) });
  }
  for (const id of ids.instagramIds) {
    if (index.byInstagramId.has(id)) matches.push({ method: 'instagram_business_id', id, ...index.byInstagramId.get(id) });
  }
  for (const id of ids.adAccountIds) {
    if (index.byAdAccountId.has(id)) matches.push({ method: 'ad_account_id', id, ...index.byAdAccountId.get(id) });
  }

  const brands = [...new Set(matches.map((match) => match.brandId))];
  if (brands.length === 1) return { brand_id: brands[0], action: 'route', matches };
  if (brands.length > 1) return { brand_id: null, action: 'escalate_to_human', reason: 'conflicting_brand_ids', matches };
  return { brand_id: null, action: 'escalate_to_human', reason: 'no_strong_identifier', matches };
}

function readText(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function allRepoTextFiles() {
  const ignoredPrefixes = ['.git/', 'node_modules/', 'outputs/meta-assets.local.json'];
  const extensions = new Set(['.js', '.json', '.md', '.ts', '.tsx', '.jsx', '.yml', '.yaml', '.sql', '.env']);
  return listFiles('.', (file) => {
    if (ignoredPrefixes.some((prefix) => file.startsWith(prefix))) return false;
    return extensions.has(path.extname(file)) || file.includes('.env');
  });
}

function printReport(report) {
  console.log(`${report.status} ${report.name}: ${report.summary}`);
  for (const finding of report.findings) {
    console.log(`- ${finding.severity} ${finding.file}: ${finding.message}`);
  }
}

module.exports = {
  ROOT,
  addFinding,
  allRepoTextFiles,
  buildBrandIndex,
  listFiles,
  loadBrandConfigs,
  printReport,
  readJson,
  readText,
  resolveBrand,
  result,
  summarize
};
