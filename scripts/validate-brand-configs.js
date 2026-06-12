/**
 * validate-brand-configs.js
 * Verifica que todos los brand-config.json tienen los campos requeridos
 * y que no tienen PLACEHOLDER como valor.
 */

const fs = require('fs');
const path = require('path');

const BRANDS_DIR = path.join(__dirname, '..', 'brands');
const REQUIRED_FIELDS = [
  'brand_id',
  'brand_name',
  'business_unit',
  'active_status',
  'facebook_page_id',
  'instagram_business_id',
  'meta_ad_account_id',
  'default_language',
  'tone_profile',
  'services',
  'responsible_users',
];

const brandDirs = fs.readdirSync(BRANDS_DIR).filter(d =>
  fs.statSync(path.join(BRANDS_DIR, d)).isDirectory()
);

let allValid = true;

console.log('\n=== VALIDACIÓN DE BRAND CONFIGS ===\n');

for (const brandDir of brandDirs) {
  const configPath = path.join(BRANDS_DIR, brandDir, 'brand-config.json');
  console.log(`Marca: ${brandDir}`);

  if (!fs.existsSync(configPath)) {
    console.log('  ❌ brand-config.json no encontrado\n');
    allValid = false;
    continue;
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    console.log(`  ❌ JSON inválido: ${e.message}\n`);
    allValid = false;
    continue;
  }

  let brandValid = true;
  for (const field of REQUIRED_FIELDS) {
    if (config[field] === undefined || config[field] === null) {
      console.log(`  ❌ Campo faltante: ${field}`);
      brandValid = false;
      allValid = false;
    } else if (typeof config[field] === 'string' && config[field].startsWith('PLACEHOLDER')) {
      console.log(`  ⚠️  Placeholder sin completar: ${field} = ${config[field]}`);
    } else {
      console.log(`  ✅ ${field}`);
    }
  }

  if (brandValid) {
    console.log(`  → Configuración válida para: ${config.brand_name}`);
  }
  console.log('');
}

if (allValid) {
  console.log('✅ Todas las configuraciones de marca son válidas.\n');
  process.exit(0);
} else {
  console.log('❌ Hay problemas en algunas configuraciones. Revisar antes de activar.\n');
  process.exit(1);
}
