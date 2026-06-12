// SAFE MODE — READ ONLY test data. No real API calls, no message sends.
/**
 * test-webhook-payloads.js
 * Payloads de prueba para simular eventos de Meta sin usar datos reales de clientes.
 * Usar para probar el router y los workflows antes de activar en producción.
 */

const TEST_PAYLOADS = {

  // ─── INSTAGRAM ─────────────────────────────────────────────────────────────

  instagram_dm_price_question_ana: {
    description: "DM de Instagram preguntando precio para Ana (fotografía de bodas)",
    brand_expected: "ana",
    payload: {
      object: "instagram",
      entry: [{
        id: "PLACEHOLDER_ANA_IG_BUSINESS_ID",
        time: Date.now(),
        messaging: [{
          sender: { id: "test_user_001" },
          recipient: { id: "PLACEHOLDER_ANA_IG_BUSINESS_ID" },
          timestamp: Date.now(),
          message: {
            mid: "test_mid_001",
            text: "Hola! Cuánto cuesta la fotografía de bodas?"
          }
        }]
      }]
    },
    expected_classification: {
      intent: "precio",
      requires_human: false,
      lead_temperature: "cold"
    }
  },

  instagram_dm_hot_lead_ana: {
    description: "DM de novia caliente para Ana (fecha específica, íntimo, emocional)",
    brand_expected: "ana",
    payload: {
      object: "instagram",
      entry: [{
        id: "PLACEHOLDER_ANA_IG_BUSINESS_ID",
        time: Date.now(),
        messaging: [{
          sender: { id: "test_user_002" },
          recipient: { id: "PLACEHOLDER_ANA_IG_BUSINESS_ID" },
          timestamp: Date.now(),
          message: {
            mid: "test_mid_002",
            text: "Hola Ana! Me caso en noviembre en Ciudad de Panamá, quiero algo íntimo y muy emocional para recordar ese día para siempre. ¿Tienen disponibilidad?"
          }
        }]
      }]
    },
    expected_classification: {
      intent: "paquetes_boda",
      requires_human: true,
      lead_temperature: "hot"
    }
  },

  instagram_comment_info_kmedia: {
    description: "Comentario 'info' en post de KMedia",
    brand_expected: "kmediafilms",
    payload: {
      object: "instagram",
      entry: [{
        id: "PLACEHOLDER_KMEDIA_IG_BUSINESS_ID",
        time: Date.now(),
        changes: [{
          field: "comments",
          value: {
            media: { id: "media_001" },
            from: { id: "test_user_003", username: "testuser" },
            text: "Info 👀",
            id: "comment_001"
          }
        }]
      }]
    },
    expected_classification: {
      intent: "pregunta_general",
      requires_human: false,
      action: "move_to_dm"
    }
  },

  instagram_dm_video_corporate_kmedia: {
    description: "DM preguntando por video corporativo para KMedia",
    brand_expected: "kmediafilms",
    payload: {
      object: "instagram",
      entry: [{
        id: "PLACEHOLDER_KMEDIA_IG_BUSINESS_ID",
        time: Date.now(),
        messaging: [{
          sender: { id: "test_user_004" },
          recipient: { id: "PLACEHOLDER_KMEDIA_IG_BUSINESS_ID" },
          timestamp: Date.now(),
          message: {
            mid: "test_mid_004",
            text: "Buenos días, somos una empresa y queremos hacer un video corporativo para presentar nuestro equipo. ¿Cuáles son sus servicios?"
          }
        }]
      }]
    },
    expected_classification: {
      intent: "video_corporativo",
      requires_human: false,
      lead_temperature: "warm"
    }
  },

  // ─── WHATSAPP ───────────────────────────────────────────────────────────────

  whatsapp_within_window_drivip: {
    description: "WhatsApp dentro de ventana de 24h para DRIVIP",
    brand_expected: "drivip",
    payload: {
      object: "whatsapp_business_account",
      entry: [{
        id: "PLACEHOLDER_DRIVIP_WABA_ID",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: {
              display_phone_number: "PLACEHOLDER",
              phone_number_id: "PLACEHOLDER_DRIVIP_PHONE_NUMBER_ID"
            },
            contacts: [{ profile: { name: "Test User" }, wa_id: "50700000000" }],
            messages: [{
              from: "50700000000",
              id: "wamid_test_001",
              timestamp: Date.now(),
              text: { body: "Hola, quiero un traslado del aeropuerto al hotel Marriott el próximo sábado a las 3pm para 2 personas." },
              type: "text"
            }]
          },
          field: "messages"
        }]
      }]
    },
    compliance_context: {
      opt_in: true,
      window_status: "open",
      do_not_contact: false
    },
    expected_classification: {
      intent: "traslado",
      requires_human: true,
      lead_temperature: "hot"
    }
  },

  whatsapp_outside_window_template_required: {
    description: "WhatsApp fuera de ventana de 24h — requiere template",
    brand_expected: "drivip",
    compliance_context: {
      opt_in: true,
      window_status: "closed",
      do_not_contact: false
    },
    expected_action: "use_approved_template_only"
  },

  // ─── CASOS ESPECIALES ───────────────────────────────────────────────────────

  upset_client: {
    description: "Cliente molesto — debe escalar inmediatamente a humano",
    brand_expected: "ana",
    payload: {
      message_text: "Estoy muy molesta. Me prometieron algo y no cumplieron. Necesito hablar con alguien YA."
    },
    expected_classification: {
      intent: "reclamo",
      requires_human: true,
      risk_level: "critical"
    }
  },

  discount_request: {
    description: "Pedido de descuento — requiere aprobación humana",
    brand_expected: "ana",
    payload: {
      message_text: "Me gusta su trabajo pero está muy caro. ¿Pueden hacer un descuento especial?"
    },
    expected_classification: {
      intent: "descuento",
      requires_human: true,
      risk_level: "high"
    }
  },

  unidentified_brand: {
    description: "Evento sin brand_id identificable — debe escalar a humano",
    payload: {
      object: "instagram",
      entry: [{
        id: "UNKNOWN_PAGE_ID_99999",
        time: Date.now()
      }]
    },
    expected_action: "escalate_to_human_unidentified_brand"
  },

  // ─── NUEVAS MARCAS ──────────────────────────────────────────────────────────

  instagram_dm_jardinero_davis: {
    description: "DM preguntando por servicio de jardinería para Jardinero Davis",
    brand_expected: "jardinero-davis",
    payload: {
      object: "instagram",
      entry: [{
        id: "PLACEHOLDER_JARDINERO_DAVIS_IG_BUSINESS_ID",
        time: Date.now(),
        messaging: [{
          sender: { id: "test_user_010" },
          recipient: { id: "PLACEHOLDER_JARDINERO_DAVIS_IG_BUSINESS_ID" },
          timestamp: Date.now(),
          message: {
            mid: "test_mid_010",
            text: "Hola, tengo un jardín en mi casa que necesita mantenimiento urgente, ¿trabajan en zona de Costa del Este?"
          }
        }]
      }]
    },
    expected_classification: {
      intent: "disponibilidad",
      requires_human: true,
      lead_temperature: "warm"
    }
  },

  instagram_dm_fc_guia_panama: {
    description: "DM preguntando por tours para FC Guía Panamá",
    brand_expected: "fc-guia-panama",
    payload: {
      object: "instagram",
      entry: [{
        id: "PLACEHOLDER_FC_GUIA_PANAMA_IG_BUSINESS_ID",
        time: Date.now(),
        messaging: [{
          sender: { id: "test_user_011" },
          recipient: { id: "PLACEHOLDER_FC_GUIA_PANAMA_IG_BUSINESS_ID" },
          timestamp: Date.now(),
          message: {
            mid: "test_mid_011",
            text: "Hi! We are 4 people arriving to Panama City next Friday. We would like a private tour of the canal and Casco Viejo. Are you available?"
          }
        }]
      }]
    },
    expected_classification: {
      intent: "reserva",
      requires_human: true,
      lead_temperature: "hot"
    }
  },

  // ─── AD ACCOUNT EVENTS ──────────────────────────────────────────────────────

  ad_account_event_ana: {
    description: "Evento de cuenta publicitaria Ana (act_2189268925168947)",
    brand_expected: "ana",
    payload: {
      object: "adaccount",
      entry: [{
        id: "act_2189268925168947",
        time: Date.now(),
        changes: [{
          field: "campaign",
          value: { campaign_id: "test_campaign_001", status: "ACTIVE" }
        }]
      }]
    },
    expected_classification: {
      intent: "campaign_event",
      requires_human: true,
      note: "Cambios en campañas siempre requieren aprobación humana"
    }
  },

  ad_account_event_drivip: {
    description: "Evento de cuenta publicitaria DRIVIP (act_1861455161486718)",
    brand_expected: "drivip",
    payload: {
      object: "adaccount",
      entry: [{
        id: "act_1861455161486718",
        time: Date.now(),
        changes: [{
          field: "campaign",
          value: { campaign_id: "test_campaign_002", status: "PAUSED" }
        }]
      }]
    },
    expected_classification: {
      intent: "campaign_event",
      requires_human: true,
      note: "Cambios en campañas siempre requieren aprobación humana"
    }
  },

  // ─── CAMPAÑAS ───────────────────────────────────────────────────────────────

  campaign_good_ctr_bad_leads: {
    description: "Campaña con buen CTR pero pocos leads calificados",
    brand: "ana",
    metrics: {
      campaign_name: "Bodas Nov 2026 - Test",
      spend: 200,
      impressions: 15000,
      reach: 8000,
      ctr: 2.8,
      cpc: 0.45,
      conversations: 12,
      leads: 10,
      qualified_leads: 1,
      bookings: 0
    },
    expected_hypothesis: "CTR alto sugiere buen creativo pero bajo ratio de calificación indica problema en conversación o seguimiento"
  },

  campaign_low_ctr_good_conversion: {
    description: "Campaña con bajo CTR pero buena conversión (leads de calidad)",
    brand: "ana",
    metrics: {
      campaign_name: "Novias Premium - Test",
      spend: 300,
      impressions: 20000,
      reach: 12000,
      ctr: 0.9,
      cpc: 1.65,
      conversations: 8,
      leads: 7,
      qualified_leads: 5,
      bookings: 2
    },
    expected_hypothesis: "Bajo CTR pero alta calidad de leads — creativo segmentado correctamente"
  }
};

// Función para ejecutar un test específico
function runTest(testName) {
  const test = TEST_PAYLOADS[testName];
  if (!test) {
    console.log(`Test '${testName}' no encontrado.`);
    console.log('Tests disponibles:', Object.keys(TEST_PAYLOADS).join(', '));
    return;
  }
  console.log(`\n=== TEST: ${testName} ===`);
  console.log('Descripción:', test.description);
  if (test.brand_expected) console.log('Brand esperado:', test.brand_expected);
  if (test.expected_classification) console.log('Clasificación esperada:', JSON.stringify(test.expected_classification, null, 2));
  if (test.expected_action) console.log('Acción esperada:', test.expected_action);
  console.log('\nPayload:');
  console.log(JSON.stringify(test.payload || test.metrics || {}, null, 2));
}

// Listar todos los tests disponibles
function listTests() {
  console.log('\n=== PAYLOADS DE PRUEBA DISPONIBLES ===\n');
  for (const [name, test] of Object.entries(TEST_PAYLOADS)) {
    console.log(`• ${name}`);
    console.log(`  ${test.description}`);
    if (test.brand_expected) console.log(`  Brand: ${test.brand_expected}`);
    console.log('');
  }
}

const arg = process.argv[2];
if (arg) {
  runTest(arg);
} else {
  listTests();
}

module.exports = TEST_PAYLOADS;
