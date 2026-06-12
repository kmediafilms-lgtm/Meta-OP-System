/**
 * validate-env.js
 * Verifica que todas las variables de entorno requeridas están presentes.
 * Nunca imprime los valores, solo confirma que existen.
 */

const REQUIRED_VARS = {
  'Meta App (compartida)': [
    'META_APP_ID',
    'META_APP_SECRET',
    'META_ACCESS_TOKEN',
    'META_VERIFY_TOKEN',
  ],
  'KMediaFilms': [
    'KMEDIA_FACEBOOK_PAGE_ID',
    'KMEDIA_IG_BUSINESS_ID',
    'KMEDIA_AD_ACCOUNT_ID',
  ],
  'En la Galería de Ana': [
    'ANA_FACEBOOK_PAGE_ID',
    'ANA_IG_BUSINESS_ID',
    'ANA_AD_ACCOUNT_ID',
    'ANA_WABA_ID',
    'ANA_PHONE_NUMBER_ID',
  ],
  'DRIVIP': [
    'DRIVIP_FACEBOOK_PAGE_ID',
    'DRIVIP_IG_BUSINESS_ID',
    'DRIVIP_AD_ACCOUNT_ID',
    'DRIVIP_WABA_ID',
    'DRIVIP_PHONE_NUMBER_ID',
  ],
  'Infraestructura': [
    'N8N_WEBHOOK_BASE_URL',
    'ANTHROPIC_API_KEY',
  ],
};

let allPassed = true;
const results = {};

for (const [section, vars] of Object.entries(REQUIRED_VARS)) {
  results[section] = { passed: [], missing: [] };
  for (const varName of vars) {
    if (process.env[varName] && process.env[varName].trim() !== '') {
      results[section].passed.push(varName);
    } else {
      results[section].missing.push(varName);
      allPassed = false;
    }
  }
}

console.log('\n=== VALIDACIÓN DE VARIABLES DE ENTORNO ===\n');

for (const [section, { passed, missing }] of Object.entries(results)) {
  console.log(`${section}:`);
  for (const v of passed) console.log(`  ✅ ${v}`);
  for (const v of missing) console.log(`  ❌ ${v} — FALTA`);
  console.log('');
}

if (allPassed) {
  console.log('✅ Todas las variables de entorno están configuradas.\n');
  process.exit(0);
} else {
  console.log('❌ Hay variables faltantes. Completar .env antes de continuar.\n');
  process.exit(1);
}
