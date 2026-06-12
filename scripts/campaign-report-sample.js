/**
 * campaign-report-sample.js
 * Genera un reporte de ejemplo con datos dummy para probar el formato
 * antes de conectar la API real de Meta Ads.
 *
 * Uso: node scripts/campaign-report-sample.js --brand ana --period last-week
 */

const SAMPLE_DATA = {
  ana: {
    brand_name: "En la Galería de Ana",
    period: "2026-06-05 al 2026-06-12",
    campaigns: [
      {
        name: "Bodas Noviembre 2026",
        objective: "MESSAGES",
        spend: 250,
        impressions: 18000,
        reach: 9500,
        frequency: 1.89,
        ctr: 2.1,
        cpc: 0.59,
        cpm: 13.89,
        conversations: 15,
        cost_per_conversation: 16.67,
        leads: 12,
        qualified_leads: 3,
        bookings: 1,
        cost_per_lead: 20.83,
        cost_per_qualified_lead: 83.33,
        cost_per_booking: 250
      },
      {
        name: "Novias Premium Q4",
        objective: "MESSAGES",
        spend: 180,
        impressions: 12000,
        reach: 7200,
        frequency: 1.67,
        ctr: 1.4,
        cpc: 1.07,
        cpm: 15.00,
        conversations: 8,
        cost_per_conversation: 22.50,
        leads: 7,
        qualified_leads: 4,
        bookings: 2,
        cost_per_lead: 25.71,
        cost_per_qualified_lead: 45.00,
        cost_per_booking: 90
      }
    ]
  },
  kmediafilms: {
    brand_name: "KMediaFilms",
    period: "2026-06-05 al 2026-06-12",
    campaigns: [
      {
        name: "Videos Corporativos B2B",
        objective: "TRAFFIC",
        spend: 150,
        impressions: 8000,
        reach: 5000,
        frequency: 1.6,
        ctr: 1.8,
        cpc: 1.04,
        cpm: 18.75,
        conversations: 5,
        cost_per_conversation: 30,
        leads: 4,
        qualified_leads: 2,
        bookings: 0
      }
    ]
  },
  drivip: {
    brand_name: "DRIVIP",
    period: "2026-06-05 al 2026-06-12",
    campaigns: [
      {
        name: "Traslados Aeropuerto",
        objective: "MESSAGES",
        spend: 100,
        impressions: 6000,
        reach: 4000,
        frequency: 1.5,
        ctr: 3.2,
        cpc: 0.52,
        cpm: 16.67,
        conversations: 18,
        cost_per_conversation: 5.56,
        leads: 16,
        qualified_leads: 8,
        bookings: 4,
        cost_per_lead: 6.25,
        cost_per_qualified_lead: 12.50,
        cost_per_booking: 25
      }
    ]
  }
};

function generateBrandReport(brandId) {
  const data = SAMPLE_DATA[brandId];
  if (!data) {
    console.log(`Marca '${brandId}' no encontrada. Opciones: ${Object.keys(SAMPLE_DATA).join(', ')}`);
    return;
  }

  const totalSpend = data.campaigns.reduce((s, c) => s + c.spend, 0);
  const totalLeads = data.campaigns.reduce((s, c) => s + (c.leads || 0), 0);
  const totalQualified = data.campaigns.reduce((s, c) => s + (c.qualified_leads || 0), 0);
  const totalBookings = data.campaigns.reduce((s, c) => s + (c.bookings || 0), 0);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`REPORTE SEMANAL — ${data.brand_name}`);
  console.log(`Período: ${data.period}`);
  console.log('='.repeat(60));
  console.log(`\nRESUMEN EJECUTIVO`);
  console.log(`  Inversión total:       $${totalSpend}`);
  console.log(`  Total leads:           ${totalLeads}`);
  console.log(`  Leads calificados:     ${totalQualified}`);
  console.log(`  Reservas/ventas:       ${totalBookings}`);
  if (totalBookings > 0) {
    console.log(`  Costo por reserva:     $${(totalSpend / totalBookings).toFixed(2)}`);
  }

  console.log(`\nPOR CAMPAÑA`);
  for (const c of data.campaigns) {
    console.log(`\n  📊 ${c.name}`);
    console.log(`     Objetivo: ${c.objective} | Gasto: $${c.spend}`);
    console.log(`     Alcance: ${c.reach} | Impresiones: ${c.impressions} | Frecuencia: ${c.frequency}`);
    console.log(`     CTR: ${c.ctr}% | CPC: $${c.cpc} | CPM: $${c.cpm}`);
    if (c.conversations) {
      console.log(`     Conversaciones: ${c.conversations} | Costo/conv: $${c.cost_per_conversation}`);
    }
    if (c.leads !== undefined) {
      console.log(`     Leads: ${c.leads} | Calificados: ${c.qualified_leads} | Reservas: ${c.bookings || 0}`);
      if (c.cost_per_booking) {
        console.log(`     Costo por reserva: $${c.cost_per_booking}`);
      }
    }
  }

  console.log(`\n${'='.repeat(60)}\n`);
}

function generateConsolidatedReport() {
  const brands = Object.keys(SAMPLE_DATA);
  let grandTotal = { spend: 0, leads: 0, qualified: 0, bookings: 0 };

  console.log(`\n${'='.repeat(60)}`);
  console.log(`REPORTE CONSOLIDADO — KMEDIA`);
  console.log(`${'='.repeat(60)}\n`);

  for (const brandId of brands) {
    const data = SAMPLE_DATA[brandId];
    const spend = data.campaigns.reduce((s, c) => s + c.spend, 0);
    const leads = data.campaigns.reduce((s, c) => s + (c.leads || 0), 0);
    const qualified = data.campaigns.reduce((s, c) => s + (c.qualified_leads || 0), 0);
    const bookings = data.campaigns.reduce((s, c) => s + (c.bookings || 0), 0);
    grandTotal.spend += spend;
    grandTotal.leads += leads;
    grandTotal.qualified += qualified;
    grandTotal.bookings += bookings;
    const status = bookings > 0 ? '🟢' : qualified > 0 ? '🟡' : '🔴';
    console.log(`${status} ${data.brand_name}: $${spend} invertido | ${leads} leads | ${qualified} calificados | ${bookings} reservas`);
  }

  console.log(`\n── TOTAL ──`);
  console.log(`Inversión: $${grandTotal.spend} | Leads: ${grandTotal.leads} | Calificados: ${grandTotal.qualified} | Reservas: ${grandTotal.bookings}`);
  if (grandTotal.bookings > 0) {
    console.log(`Costo total por reserva: $${(grandTotal.spend / grandTotal.bookings).toFixed(2)}`);
  }
  console.log('');
}

const args = process.argv.slice(2);
const brandArg = args[args.indexOf('--brand') + 1];

if (brandArg === 'all') {
  generateConsolidatedReport();
  for (const brandId of Object.keys(SAMPLE_DATA)) {
    generateBrandReport(brandId);
  }
} else if (brandArg) {
  generateBrandReport(brandArg);
} else {
  console.log('Uso: node campaign-report-sample.js --brand [ana|kmediafilms|drivip|all]');
}
