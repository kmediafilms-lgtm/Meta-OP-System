> **ARCHIVED — HISTORICAL DOCUMENT — DO NOT USE FOR CURRENT PRODUCT SCOPE**
>
> This document reflects system state as of the pre–Control Plane v1 session.
> It contains references to Jardinero Davis and FC Guía Panamá, which are **not active products**.
> The current official product scope is: **KMediaFilms · En la Galería de Ana · DRIVIP**
>
> For current state, see:
> - `docs/wedo-os-operating-model.md`
> - `docs/n8n-safe-activation-plan.md`
> - `docs/production-readiness-checklist.md`

---

# n8n Activation Results — WEDO Meta OS

**Fecha:** 2026-06-12
**Estado general:** 🟡 TEST MODE — Routing validado. Credenciales reales pendientes.

---

## 1. Estado de n8n

| Item | Estado |
|---|---|
| n8n instancia | ✅ Activa — drivippa.app.n8n.cloud |
| Proyecto | `drivippa <drivippa@gmail.com>` (personal) |
| Workflows WEDO creados | 1 (Router Test Only) |
| Workflows WEDO activos en producción | 0 — intencional |
| Workflows pre-existentes encontrados | 6 (DRIVIP + ELGDA — no tocar) |

### Workflows pre-existentes (NO modificar)

| Nombre | Estado | Notas |
|---|---|---|
| DRIVIP - Booking Operations | ✅ ACTIVO | Operacional — no tocar |
| DRIVIP — Flujo Operacional v1 | Inactivo | Versión anterior |
| Curador IA — v4 (production) | Inactivo | Proyecto separado |
| ELGDA — Instalar Schema Supabase | Inactivo | Setup ya ejecutado |
| ELGDA — Verificar Schema | Inactivo | Diagnóstico |
| ELGDA workflow | Inactivo | Versión anterior |

---

## 2. Workflow de prueba creado

**Nombre:** `WEDO Meta OS - Router Test Only`
**ID:** `7Xgo45BaZkhTnups`
**URL:** https://drivippa.app.n8n.cloud/workflow/7Xgo45BaZkhTnups
**Estado:** Inactivo (intencional — solo manual)

### ¿Qué hace?

1. Se activa manualmente desde el botón "Run Tests"
2. Genera los 6 casos de prueba requeridos
3. Detecta `brand_id` por IG ID, Page ID o Ad Account ID
4. Clasifica la intención del mensaje
5. Determina `requires_human` y `next_action`
6. Retorna resultado por caso con `✅ PASS` / `❌ FAIL`

### Garantías de seguridad

- No llama a ninguna API de Meta
- No envía mensajes
- No modifica campañas
- No escribe en CRM ni Google Sheets
- No toca WhatsApp
- No hace scraping
- Corre 100% offline con datos sintéticos

---

## 3. Pruebas ejecutadas

### validate-brand-configs.js

```
✅ Todas las configuraciones de marca son válidas.
```

| Marca | Campos requeridos | Placeholders |
|---|---|---|
| `kmediafilms` | ✅ 11/11 | 3 (IDs Meta) |
| `ana` | ✅ 11/11 | 3 (IDs Meta) |
| `drivip` | ✅ 11/11 | 3 (IDs Meta) |
| `jardinero-davis` | ✅ 11/11 | 3 (IDs Meta) |
| `fc-guia-panama` | ✅ 11/11 | 3 (IDs Meta) |

### route-test-events.js — con IDs reales confirmados

| Test | ID usado | Resultado |
|---|---|---|
| Ana IG | `17841450875047591` | ✅ brand=ana (ig_id_match) |
| DRIVIP IG | `17841447217470964` | ✅ brand=drivip (ig_id_match) |
| KMediaFilms IG | `17841400348662832` | ✅ brand=kmediafilms (ig_id_match) |
| Ana Facebook Page | `1043326452200695` | ✅ brand=ana (page_id_match) |
| Desconocido | `UNKNOWN_999` | ✅ escalate_to_human |

### test-webhook-payloads.js

```
11 payloads disponibles (8 existentes + 3 nuevos)
```

Nuevos casos agregados:
- `instagram_dm_jardinero_davis`
- `instagram_dm_fc_guia_panama`
- `ad_account_event_ana` (act_2189268925168947)
- `ad_account_event_drivip` (act_1861455161486718)

---

## 4. Estado de brand-configs

| Marca | facebook_page_id | instagram_business_id | meta_ad_account_id | Estado |
|---|---|---|---|---|
| `ana` | PLACEHOLDER (PR #5 tiene real) | PLACEHOLDER (PR #5 tiene real) | PLACEHOLDER (PR #5 tiene real) | ⚠️ Pendiente merge PR #5 |
| `drivip` | PLACEHOLDER (PR #5 tiene real) | PLACEHOLDER (PR #5 tiene real) | PLACEHOLDER (PR #5 tiene real) | ⚠️ Pendiente merge PR #5 |
| `kmediafilms` | PLACEHOLDER (PR #5 tiene real) | PLACEHOLDER (PR #5 tiene real) | vacío (sin Ads confirmado) | ⚠️ Pendiente merge PR #5 |
| `jardinero-davis` | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER | 🔴 IDs pendientes con Ricardo |
| `fc-guia-panama` | PLACEHOLDER | PLACEHOLDER | PLACEHOLDER | 🔴 IDs pendientes con Ricardo |

**Nota:** Los IDs reales de Ana, DRIVIP y KMediaFilms están en PR #5 (no mergeado). El workflow de routing en n8n ya usa esos IDs hardcodeados en el test — funcionan correctamente.

---

## 5. Credenciales faltantes en n8n

Para activar cualquier workflow productivo, Ricardo necesita configurar estas credenciales en n8n:

| Credencial | Para qué | Riesgo si falta |
|---|---|---|
| `META_ACCESS_TOKEN` (System User) | Graph API, webhooks, envío de mensajes | Sistema no funciona |
| `META_VERIFY_TOKEN` | Verificación de webhooks de Meta | No se pueden registrar webhooks |
| `META_APP_ID` / `META_APP_SECRET` | Autenticación de la Meta App | Sistema no funciona |
| Anthropic API Key | Clasificación de intención con Claude | Agentes no funcionan |
| Google Sheets OAuth | CRM, logs, reportes | No se guarda nada |
| WhatsApp Business Cloud | Envío de mensajes WA + alertas humanas | Sin WhatsApp ni notificaciones |
| `KMEDIA_FACEBOOK_PAGE_ID` | Router — identificar KMediaFilms | Marca no identificable |
| `ANA_FACEBOOK_PAGE_ID` | Router — identificar Ana | Marca no identificable |
| `DRIVIP_FACEBOOK_PAGE_ID` | Router — identificar DRIVIP | Marca no identificable |
| `ANA_PHONE_NUMBER_ID` | Router WhatsApp Ana | Canal WA no funciona |
| `DRIVIP_PHONE_NUMBER_ID` | Router WhatsApp DRIVIP | Canal WA no funciona |
| `PLACEHOLDER_RICARDO_WHATSAPP` | Escalamiento humano | Sin alertas a Ricardo |

---

## 6. Estado de PRs

| PR | Título | Estado | Base | ¿Mergeable? |
|---|---|---|---|---|
| PR #1 | feat: arquitectura completa multi-marca | ✅ Cerrado/Merged | main | N/A |
| PR #2 | feature: safe Meta asset discovery runner | ✅ Cerrado/Merged | main | N/A |
| PR #3 | Main | ✅ Cerrado/Merged | — | N/A |
| **PR #4** | rename: KMedia Meta OS → WEDO Meta OS + 2 new brands | 🟡 Draft abierto | main | Sí, independiente |
| **PR #5** | chore: map confirmed Meta assets to brand configs | 🟡 Draft abierto | main | Sí, pero después de PR #4 |

### Orden correcto de merge

```
1. Mergear PR #4 primero (rename + 2 new brands)
2. Mergear PR #5 segundo (real Meta IDs en brand-configs)
```

**¿Por qué este orden?**
- PR #4 y PR #5 tocan archivos diferentes (PR #4 toca agentes/docs, PR #5 toca brand-configs)
- No hay conflicto técnico si se mergean en cualquier orden
- El orden recomendado es PR #4 primero por semántica: primero renombrar el sistema, luego conectar los activos reales

---

## 7. Qué NO debe activarse todavía

| Acción | Razón |
|---|---|
| Activar `meta-webhook-router` en producción | Faltan IDs reales en brand-configs (PR #5 sin mergear) y credenciales en n8n |
| Activar `instagram-inbound` | Requiere Anthropic API Key + Graph API credentials |
| Activar `whatsapp-inbound` | WhatsApp completamente pendiente (no configurado) |
| Activar `human-approval` | Requiere WhatsApp Business Cloud credentials para alertas |
| Crear campañas con dinero real | No hay aprobación explícita |
| Activar Auto-reply en Instagram | No hay credenciales de Instagram Messaging API |
| Conectar Jardinero Davis o FC Guía Panamá | IDs de Meta completamente pendientes |

---

## 8. Riesgos identificados

| Riesgo | Nivel | Mitigación |
|---|---|---|
| IDs reales en scripts (route-test-events.js) | ⚠️ Bajo | Son IDs públicos de páginas, no tokens. No representan acceso. |
| PR #5 sin mergear — brand-configs locales siguen con PLACEHOLDERs | Medio | Merge PR #4 → PR #5 cuando Ricardo apruebe |
| DRIVIP - Booking Operations activo en n8n | Riesgo de interferencia | No tocar — es workflow pre-existente separado |
| WhatsApp no configurado | Alto para producción | Pendiente configuración completa con Ricardo |
| Ninguna credencial de Meta en n8n todavía | Bloquea producción total | Completar setup con Ricardo siguiendo meta-setup-checklist.md |

---

## 9. Próximo paso exacto

**Inmediato (antes de cualquier otra cosa):**

1. Ricardo aprueba y mergea **PR #4** (rename WEDO + 2 brands) → merge a `main`
2. Ricardo aprueba y mergea **PR #5** (IDs reales en brand-configs) → merge a `main`
3. Pull en local: `git pull origin main`

**Siguiente sesión — conectar credenciales:**

4. Agregar en n8n las credenciales reales siguiendo `docs/meta-setup-checklist.md`
   - Empezar con: Anthropic API Key (la más fácil)
   - Luego: META_ACCESS_TOKEN del System User
   - Luego: Google Sheets OAuth
5. Ejecutar `WEDO Meta OS - Router Test Only` manualmente y confirmar 6/6 PASS
6. Verificar el webhook URL de n8n para registrarlo en Meta Developer Console
7. Orden de conexión recomendado: **Ana → DRIVIP → KMediaFilms**
8. WhatsApp al final — requiere App Review separado

**NO hacer todavía:** registrar webhooks, enviar mensajes, activar campañas, configurar WhatsApp.
