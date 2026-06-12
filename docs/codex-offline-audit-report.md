# Codex Offline Audit Report

Fecha: 2026-06-12

## Resumen Ejecutivo

Se agregó una suite offline de auditoría para WEDO Meta OS. La suite valida aislamiento de marcas, contratos de agentes, secretos, workflows n8n, dashboard, Supabase schemas y fixtures locales sin conectarse a n8n, Supabase, Vercel ni Meta.

Resultado actual:

```text
FINAL: FAIL
PASS: 8
WARN: 3
FAIL: 2
```

El estado `FAIL` no bloquea continuar desarrollo offline. Sí bloquea activar producción, webhooks, respuestas automáticas, WhatsApp, DMs o cambios de campañas hasta corregir los riesgos críticos.

## Comando

```bash
node scripts/run-offline-audit.js
```

El comando ejecuta todos los audits y tests offline. Devuelve exit code `1` si hay hallazgos críticos.

## Tests Pasados

```text
PASS brand-isolation
PASS secrets
PASS tests/brand-routing.test.js
PASS tests/agent-contracts.test.js
PASS tests/safety-guards.test.js
PASS tests/campaign-readonly.test.js
PASS tests/no-secrets.test.js
PASS tests/schema-consistency.test.js
```

Observaciones:

- Los fixtures de Meta resuelven `brand_id` correcto para Ana, DRIVIP y KMediaFilms.
- El evento unknown escala a humano.
- Los fixtures de campañas se mantienen en modo `analysis_only`.
- No se detectaron secretos reales probables en archivos versionables escaneados.
- Los schemas operativos JSON requieren `brand_id`.

## Tests Fallidos

```text
FAIL agent-contracts
FAIL n8n-workflows-static
```

## Riesgos Críticos

### 1. Agentes sin contratos estructurados

Los 10 agentes en `.claude/agents/` no declaran los marcadores obligatorios:

```text
input_schema
output_schema
allowed_actions
blocked_actions
failure_modes
```

Impacto:

- No hay contrato verificable para entradas/salidas.
- No hay lista formal de acciones permitidas/bloqueadas por agente.
- No hay modos de fallo documentados.
- Es más fácil que un agente mezcle marcas o proponga acciones inseguras sin que el repo lo detecte.

Recomendación:

Agregar una sección contractual por agente, idealmente en JSON o YAML validable, con schemas y acciones explícitas.

### 2. Workflows n8n con nodos de envío o respuesta sin guardrail suficiente

El audit encontró nodos send-capable o de respuesta real sin `active:false` explícito o sin guardrail de approval/read-only suficientemente cercano.

Ejemplos críticos:

```text
workflows/brand-onboarding.json
- Send Onboarding Checklist

workflows/campaign-reporting.json
- Send Report to Ricardo

workflows/facebook-page-inbound.json
- Facebook Graph API: Respond

workflows/human-approval.json
- Handle Timeout

workflows/instagram-inbound.json
- Send Instagram Reply

workflows/meta-webhook-router.json
- Alert Unidentified Brand

workflows/weekly-report.json
- Send to Ricardo

workflows/whatsapp-inbound.json
- WhatsApp Trigger
- Send Free Form Message
```

Impacto:

- Riesgo de envío accidental de mensajes.
- Riesgo de activar workflows productivos sin mock/dry-run.
- Riesgo de tocar WhatsApp/Instagram antes de validación manual.

Recomendación:

- Añadir `active:false` explícito en todos los workflow exports si el formato lo permite.
- Separar workflows mock de workflows productivos.
- Añadir flags `dry_run`, `requires_human_approval`, `send_enabled:false`.
- Asegurar que cualquier nodo de envío dependa de aprobación humana y guardrail explícito.

## Riesgos Medios

### Dangerous action mentions sin guardrail cercano

El audit encontró menciones a términos sensibles como:

```text
messages
budget
sendMessage
```

En varios docs/scripts/schemas. No todos son acciones reales; algunos son documentación o fixtures, pero deben revisarse para que cualquier referencia sensible tenga contexto de read-only, mock, approval o no-send.

### Dashboard no presente todavía

```text
WARN dashboard: No dashboard source files found yet.
```

Esto no bloquea el repo actual, pero cuando Claude Code agregue el dashboard Vercel, debe pasar por `audit-dashboard-static`.

### Supabase SQL no presente todavía

```text
WARN supabase: No Supabase SQL schema/migrations found yet; JSON schemas were audited instead.
```

Los JSON schemas actuales sí exigen `brand_id`, pero cuando existan migrations SQL se debe validar RLS, ausencia de columnas de tokens y seeds sin datos sensibles.

## Recomendaciones Para Claude Code

1. Agregar contratos formales a cada agente:

```text
input_schema
output_schema
allowed_actions
blocked_actions
failure_modes
```

2. Marcar workflows como inactivos por defecto:

```json
{
  "active": false
}
```

3. Añadir flags de seguridad en workflows:

```json
{
  "dry_run": true,
  "send_enabled": false,
  "requires_human_approval": true
}
```

4. Crear dashboard con acciones reales deshabilitadas por defecto.

5. Crear migrations Supabase con RLS documentado y `brand_id` obligatorio en tablas operativas.

6. Mantener secretos únicamente en el entorno externo, nunca en repo, fixtures, docs ni outputs versionables.

## Bloqueo / No Bloqueo

Bloquea:

- Activar webhooks.
- Enviar WhatsApp.
- Responder DMs automáticamente.
- Modificar campañas.
- Conectar flows productivos de n8n.
- Declarar listo para producción.

No bloquea:

- Seguir desarrollando offline.
- Seguir agregando schemas, mocks, fixtures y tests.
- Seguir construyendo dashboard en modo mock.
- Seguir refinando docs y contratos.

## Archivos Agregados Por Esta Suite

Fixtures:

```text
tests/fixtures/meta/ana-instagram-dm.json
tests/fixtures/meta/drivip-instagram-dm.json
tests/fixtures/meta/kmedia-instagram-dm.json
tests/fixtures/meta/unknown-brand-event.json
tests/fixtures/meta/ana-ad-account-event.json
tests/fixtures/meta/drivip-ad-account-event.json
tests/fixtures/leads/hot-lead.json
tests/fixtures/leads/cold-lead.json
tests/fixtures/leads/complaint.json
tests/fixtures/leads/sensitive-payment.json
tests/fixtures/campaigns/ana-good-ctr-bad-leads.json
tests/fixtures/campaigns/drivip-low-ctr-good-leads.json
```

Tests:

```text
tests/brand-routing.test.js
tests/agent-contracts.test.js
tests/safety-guards.test.js
tests/campaign-readonly.test.js
tests/no-secrets.test.js
tests/schema-consistency.test.js
```

Scripts:

```text
scripts/offline-audit-lib.js
scripts/audit-brand-isolation.js
scripts/audit-agent-contracts.js
scripts/audit-dangerous-actions.js
scripts/audit-secrets.js
scripts/audit-n8n-workflows-static.js
scripts/audit-dashboard-static.js
scripts/audit-supabase-schema.js
scripts/run-offline-audit.js
```
