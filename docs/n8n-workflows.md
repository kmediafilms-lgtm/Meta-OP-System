# n8n Workflows — Meta Operating System WEDO

Documentación de todos los workflows del sistema. Los archivos JSON están en `workflows/`.

---

## Workflow 1: meta-webhook-router

**Archivo:** `workflows/meta-webhook-router.json`
**Trigger:** Webhook POST de Meta (cualquier evento)
**Propósito:** Recibe todos los eventos de Meta y los enruta al workflow correcto según la marca detectada.

### Nodos
1. `Webhook` — recibe el POST de Meta, valida `META_VERIFY_TOKEN`
2. `Set: Normalize` — normaliza el payload en estructura estándar
3. `Code: Detect Brand` — mapea source ID (page_id, ig_id, waba_id, phone_id) a brand_id
4. `IF: Brand Identified?` — si no hay brand_id → rama de escalación
5. `Switch: Event Type` — routing por tipo: instagram_dm | instagram_comment | whatsapp | facebook_page | ads_lead
6. `HTTP Request: Route to Workflow` — llama al sub-workflow correspondiente
7. `Set: Log Entry` — construye el objeto de log
8. `Google Sheets: Append Log` — guarda el log en hoja maestra
9. `Send Alert: Unidentified Brand` — si no se identificó marca → notifica a Ricardo

---

## Workflow 2: instagram-inbound

**Archivo:** `workflows/instagram-inbound.json`
**Trigger:** Llamada desde meta-webhook-router con evento de Instagram ya ruteado
**Propósito:** Procesa mensajes, comentarios y story replies de Instagram por marca.

### Nodos
1. `Webhook/Trigger` — recibe el evento ya con brand_id
2. `HTTP Request: Get Brand Config` — carga brand-config.json de la marca
3. `Google Sheets: Save Message` — guarda el mensaje en CRM de la marca
4. `HTTP Request: Claude Classify` — llama a Claude con instagram-inbox-agent para clasificar intención
5. `IF: Requires Human?` — si requires_human → rama de aprobación
6. `HTTP Request: Claude Generate Response` — genera respuesta con copy-conversion-agent
7. `IF: Safe to Send?` — valida que no es spam, no es duplicado, horario ok
8. `Facebook Graph API: Send Reply` — envía la respuesta por Instagram
9. `Google Sheets: Update CRM` — actualiza estado del lead
10. `Set: Log` → `Google Sheets: Append Log` — guarda resultado
11. `Send Alert: Human Required` — si requiere humano, notifica por canal configurado

---

## Workflow 3: whatsapp-inbound

**Archivo:** `workflows/whatsapp-inbound.json`
**Trigger:** WhatsApp Trigger o llamada desde router
**Propósito:** Procesa mensajes de WhatsApp con todas las validaciones de compliance.

### Nodos
1. `WhatsApp Trigger` — recibe evento de WhatsApp
2. `Code: Detect Brand by Phone ID` — mapea `phone_number_id` a brand_id
3. `HTTP Request: Get Brand Config` — carga configuración de la marca
4. `Google Sheets: Check Opt-in` — verifica que el contacto tiene opt-in
5. `IF: Has Opt-in?` — sin opt-in → registrar y NO responder
6. `Code: Check 24h Window` — calcula si estamos dentro de la ventana
7. `HTTP Request: Check Do Not Contact` — verifica lista de no contactar
8. `HTTP Request: Claude Compliance Check` — valida con whatsapp-compliance-agent
9. `HTTP Request: Claude Classify Intent` — clasifica intención
10. `HTTP Request: Claude Lead Scoring` — puntúa el lead
11. `IF: Requires Human?` → rama aprobación humana
12. `HTTP Request: Claude Generate Response` — genera respuesta
13. `IF: Within 24h Window?`
    - Sí → `WhatsApp Business Cloud: Send Message` (mensaje libre)
    - No → `WhatsApp Business Cloud: Send Template` (template aprobado)
14. `Google Sheets: Update CRM` — actualiza lead
15. `Set: Log` → `Google Sheets: Append Log`

---

## Workflow 4: facebook-page-inbound

**Archivo:** `workflows/facebook-page-inbound.json`
**Trigger:** Facebook Trigger (comentario, mensaje, lead de Facebook Page)
**Propósito:** Procesa interacciones en Facebook Pages.

### Nodos
1. `Facebook Trigger` — recibe eventos de Page
2. `Code: Detect Brand by Page ID` — mapea page_id a brand_id
3. `Switch: Event Type` — comentario | mensaje | lead_form
4. Para cada tipo: normalizar → clasificar → guardar → responder o escalar
5. `Google Sheets: Update CRM`
6. Log

---

## Workflow 5: lead-scoring

**Archivo:** `workflows/lead-scoring.json`
**Trigger:** Nuevo lead o mensaje relevante (sub-workflow llamado desde otros)
**Propósito:** Calcular score del lead y programar seguimiento.

### Nodos
1. `Trigger/Input` — recibe lead_id y brand_id
2. `Google Sheets: Get Lead Data` — obtiene datos del lead
3. `HTTP Request: Get Brand Config` — carga reglas de scoring de la marca
4. `HTTP Request: Claude Lead Scoring` — puntúa con lead-scoring-agent
5. `Code: Calculate Score` — combina señales en score final
6. `Switch: Lead Temperature` — hot (75+) | warm (40-74) | cold (<40)
7. Para cada temperatura:
   - Asignar estado
   - Calcular fecha de próximo seguimiento
   - Crear entrada de followup
8. `Google Sheets: Update Lead` — actualiza score y estado
9. `Google Sheets: Create Followup` — programa el seguimiento

---

## Workflow 6: campaign-reporting

**Archivo:** `workflows/campaign-reporting.json`
**Trigger:** Schedule (semanal: lunes 8am, o bajo demanda)
**Propósito:** Genera reportes de campañas por marca y reporte consolidado.

### Nodos
1. `Schedule Trigger` — dispara los lunes a las 8am
2. `Code: Get Active Brands` — lista marcas activas con sus ad_account_ids
3. Loop por marca:
   - `Facebook Graph API: Get Campaigns` — obtiene campañas del período
   - `Facebook Graph API: Get Insights` — métricas por campaña/adset/ad
   - `HTTP Request: Claude Ads Analyst` — analiza con ads-analyst agent
   - `HTTP Request: Claude Generate Report` — genera reporte de la marca
   - `Google Sheets: Save Brand Report` — guarda en CRM de la marca
4. `HTTP Request: Claude Consolidate` — genera reporte consolidado
5. `Google Sheets: Save Master Report` — guarda reporte maestro
6. `Send Report: WhatsApp/Email to Ricardo` — entrega el reporte

---

## Workflow 7: human-approval

**Archivo:** `workflows/human-approval.json`
**Trigger:** Llamado desde cualquier workflow cuando `requires_human: true`
**Propósito:** Gestiona el proceso de aprobación humana.

### Nodos
1. `Trigger/Input` — recibe payload de aprobación con brand_id, action_type, draft, reason
2. `Google Sheets: Create Approval Record` — guarda en registro de aprobaciones
3. `Code: Format Alert` — formatea el mensaje de alerta
4. `WhatsApp Business Cloud: Send Approval Request` — envía a responsable de la marca
5. `Wait: Approval Response` — espera respuesta con timeout configurado
6. `IF: Approved?`
   - Aprobado → ejecutar acción original
   - Editado → ejecutar con texto editado
   - Rechazado → registrar y cerrar
   - Expirado → suspender y notificar
7. `Google Sheets: Update Approval Record` — cierra el registro
8. Log

---

## Workflow 8: brand-onboarding

**Archivo:** `workflows/brand-onboarding.json`
**Trigger:** Manual (nuevo cliente o marca)
**Propósito:** Checklist guiado para conectar una nueva marca al sistema.

### Nodos
1. `Manual Trigger` — inicia con nombre de la nueva marca
2. `Code: Create Brand Folder Structure` — crea archivos en brands/[nueva-marca]/
3. `Form: Collect Meta IDs` — solicita Page ID, IG ID, Ad Account ID, WABA ID
4. `Validate: Meta IDs Format` — verifica formato de IDs
5. `Google Sheets: Create Brand CRM` — crea hoja de CRM para la marca
6. `Update: Router Brand Map` — agrega la marca al mapa del router
7. `Code: Create n8n Credential Placeholders` — documenta las credenciales necesarias
8. `Send Checklist: To Ricardo` — entrega checklist de lo que falta completar
9. `Run: Test Webhook Payloads` — prueba con payloads dummy
10. Log + confirmación

---

## Workflow 9: weekly-report

**Archivo:** `workflows/weekly-report.json`
**Trigger:** Schedule (domingo 10pm, para entregar lunes)
**Propósito:** Genera el reporte multi-marca completo de la semana.

Similar a campaign-reporting pero incluye también:
- Estado de todos los leads de la semana
- Conversaciones abiertas sin respuesta
- Follow-ups pendientes
- Aprobaciones no resueltas
- Recomendación de marca para priorizar la semana siguiente
