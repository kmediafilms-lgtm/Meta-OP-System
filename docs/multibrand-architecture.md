# Multibrand Architecture — Meta Operating System WEDO

## Principio fundamental

**Un solo sistema, múltiples marcas, separación estricta.**

Cada evento, lead, conversación, campaña, respuesta, reporte y log debe tener `brand_id` asignado. Nada se mezcla.

## Estructura de datos por marca

```
brands/
├── kmediafilms/
│   ├── brand-config.json    ← IDs de Meta, tono, servicios, reglas
│   ├── tone-guide.md        ← Guía de voz y estilo
│   ├── services.md          ← Servicios y precios base
│   ├── response-rules.md    ← Reglas de respuesta automática
│   └── campaign-notes.md    ← Notas e historial de campañas
├── en-la-galeria-de-ana/
│   ├── brand-config.json
│   ├── tone-guide.md
│   ├── services.md
│   ├── response-rules.md
│   └── campaign-notes.md
└── drivip/
    ├── brand-config.json
    ├── tone-guide.md
    ├── services.md
    ├── response-rules.md
    └── campaign-notes.md
```

## Cómo se identifica la marca en cada evento

```
Prioridad de identificación (de mayor a menor confiabilidad):

1. page_id                → directo a brand_id
2. instagram_business_id  → directo a brand_id
3. whatsapp_phone_id      → directo a brand_id
4. waba_id                → directo a brand_id
5. ad_account_id          → directo a brand_id
6. campaign_id            → buscar en CRM → brand_id
7. source_tag             → mapear → brand_id
8. Sin match              → UNIDENTIFIED → ESCALACIÓN HUMANA
```

## Reglas de aislamiento

### Datos
- Cada marca tiene su propio CRM (hoja de Google Sheets o base de Airtable separada)
- Los leads NUNCA se copian ni comparten entre marcas
- Las campañas de una marca no afectan los datos de otra

### Comunicación
- Las respuestas usan el tono de la marca, no un tono genérico
- Los templates de WhatsApp son específicos por marca
- Las notificaciones de aprobación humana incluyen la marca explícitamente

### Reportes
- Cada marca recibe su reporte individual
- El reporte consolidado muestra marcas separadas, no agrupadas

### Logs
- Todo log incluye `brand_id` como campo obligatorio
- Los errores de routing (sin brand_id) se loguean por separado y se escalan

## Onboarding de nueva marca

Cuando se agrega una marca nueva:

1. Crear `brands/[nombre-marca]/` con todos los archivos requeridos
2. Agregar IDs de Meta al mapa de routing en `03-multibrand-router-agent.md`
3. Agregar variables al `.env.example`
4. Crear CRM separado para la marca
5. Configurar credenciales de Meta en n8n
6. Ejecutar `scripts/validate-brand-configs.js` para verificar
7. Probar con payloads de prueba de `scripts/test-webhook-payloads.js`
8. Activar workflows gradualmente (primero clasificación, luego respuestas)

## Marcas futuras

El sistema está diseñado para soportar N marcas. La estructura `brand-config.json` es el punto de extensión principal.

Para agregar una marca nueva solo se necesita:
- Su `brand-config.json` completo
- Sus IDs de Meta registrados en el router
- Sus credenciales en n8n
- Su CRM propio
