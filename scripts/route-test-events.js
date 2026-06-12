/**
 * route-test-events.js
 * Simula el routing de eventos sin enviar nada real.
 * Verifica que el brand_id se detecta correctamente.
 *
 * Uso: node scripts/route-test-events.js --event instagram_dm --page_id KMEDIA_FACEBOOK_PAGE_ID
 */

const args = process.argv.slice(2);

// Mapa de IDs a brand_id (usa vars de entorno o placeholders para pruebas)
const BRAND_MAP = {
  page_ids: {
    [process.env.KMEDIA_FACEBOOK_PAGE_ID || '1009115316143644']: 'kmediafilms',
    [process.env.ANA_FACEBOOK_PAGE_ID || '1043326452200695']: 'ana',
    [process.env.DRIVIP_FACEBOOK_PAGE_ID || '1158307954030806']: 'drivip',
    [process.env.JARDINERO_DAVIS_FACEBOOK_PAGE_ID || 'PLACEHOLDER_JARDINERO_DAVIS_FACEBOOK_PAGE_ID']: 'jardinero-davis',
    [process.env.FC_GUIA_PANAMA_FACEBOOK_PAGE_ID || 'PLACEHOLDER_FC_GUIA_PANAMA_FACEBOOK_PAGE_ID']: 'fc-guia-panama',
  },
  ig_ids: {
    [process.env.KMEDIA_IG_BUSINESS_ID || '17841400348662832']: 'kmediafilms',
    [process.env.ANA_IG_BUSINESS_ID || '17841450875047591']: 'ana',
    [process.env.DRIVIP_IG_BUSINESS_ID || '17841447217470964']: 'drivip',
    [process.env.JARDINERO_DAVIS_IG_BUSINESS_ID || 'PLACEHOLDER_JARDINERO_DAVIS_IG_BUSINESS_ID']: 'jardinero-davis',
    [process.env.FC_GUIA_PANAMA_IG_BUSINESS_ID || 'PLACEHOLDER_FC_GUIA_PANAMA_IG_BUSINESS_ID']: 'fc-guia-panama',
  },
  phone_ids: {
    [process.env.ANA_PHONE_NUMBER_ID || 'PLACEHOLDER_ANA_PHONE_NUMBER_ID']: 'ana',
    [process.env.DRIVIP_PHONE_NUMBER_ID || 'PLACEHOLDER_DRIVIP_PHONE_NUMBER_ID']: 'drivip',
    [process.env.JARDINERO_DAVIS_PHONE_NUMBER_ID || 'PLACEHOLDER_JARDINERO_DAVIS_PHONE_NUMBER_ID']: 'jardinero-davis',
    [process.env.FC_GUIA_PANAMA_PHONE_NUMBER_ID || 'PLACEHOLDER_FC_GUIA_PANAMA_PHONE_NUMBER_ID']: 'fc-guia-panama',
  }
};

function detectBrand(eventData) {
  const { page_id, ig_id, phone_id, waba_id } = eventData;

  if (page_id && BRAND_MAP.page_ids[page_id]) {
    return { brand_id: BRAND_MAP.page_ids[page_id], method: 'page_id_match' };
  }
  if (ig_id && BRAND_MAP.ig_ids[ig_id]) {
    return { brand_id: BRAND_MAP.ig_ids[ig_id], method: 'ig_id_match' };
  }
  if (phone_id && BRAND_MAP.phone_ids[phone_id]) {
    return { brand_id: BRAND_MAP.phone_ids[phone_id], method: 'phone_id_match' };
  }

  return { brand_id: 'unidentified', method: 'no_match', action: 'escalate_to_human' };
}

// Parsear args
const eventData = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    eventData[args[i].slice(2)] = args[i + 1];
    i++;
  }
}

console.log('\n=== ROUTE TEST ===');
console.log('Input:', eventData);

const result = detectBrand(eventData);
console.log('Resultado:', result);

if (result.brand_id === 'unidentified') {
  console.log('⚠️  ALERTA: No se pudo identificar la marca. El evento requiere revisión humana.');
  process.exit(1);
} else {
  console.log(`✅ Marca detectada: ${result.brand_id} (método: ${result.method})`);
  process.exit(0);
}
