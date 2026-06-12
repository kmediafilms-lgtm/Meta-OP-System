# Testing Plan — Meta Operating System WEDO

Todos los tests usan payloads de prueba. Ningún test envía mensajes reales a clientes.

---

## Fase 1: Tests de routing (sin mensajes reales)

### Test 1.1 — Identificación de marca por page_id
```bash
node scripts/route-test-events.js --event instagram_dm --page_id KMEDIA_FACEBOOK_PAGE_ID
# Resultado esperado: brand_id = kmediafilms
```

### Test 1.2 — Identificación de marca por ig_id
```bash
node scripts/route-test-events.js --event instagram_dm --ig_id ANA_IG_BUSINESS_ID
# Resultado esperado: brand_id = ana
```

### Test 1.3 — Evento sin brand_id identificable
```bash
node scripts/route-test-events.js --event instagram_dm --page_id UNKNOWN_PAGE_ID
# Resultado esperado: brand_id = unidentified, escalación a humano
```

---

## Fase 2: Tests de clasificación de intención

### Test 2.1 — Consulta de precio (Ana)
Input: "Hola cuánto cuesta la fotografía de boda?"
Resultado esperado: `intent: precio`, `requires_human: false`

### Test 2.2 — Lead caliente (Ana)
Input: "Hola Ana! Me caso en noviembre y quiero algo íntimo y emocional para recordar ese día. ¿Tienen disponibilidad?"
Resultado esperado: `intent: paquetes_boda`, `lead_score >= 75`, `classification: hot`

### Test 2.3 — Pedido de descuento
Input: "Pueden hacer un descuento? Solo quiero fotos básicas"
Resultado esperado: `intent: descuento`, `requires_human: true`

### Test 2.4 — Reclamo
Input: "Estoy muy molesta, me prometieron algo y no cumplieron"
Resultado esperado: `intent: reclamo`, `requires_human: true`, `risk_level: critical`

### Test 2.5 — Spam
Input: "Sígueme de vuelta 🙏🙏🙏"
Resultado esperado: `intent: spam`, `requires_human: false`, `action: no_response`

---

## Fase 3: Tests de compliance WhatsApp

### Test 3.1 — Mensaje con opt-in y dentro de ventana
Datos: `opt_in: true`, `last_message_at: hace 2 horas`
Resultado esperado: `can_send: true`, `message_type_allowed: free_form`

### Test 3.2 — Mensaje sin opt-in
Datos: `opt_in: false`
Resultado esperado: `can_send: false`, acción registrada

### Test 3.3 — Mensaje fuera de ventana de 24h
Datos: `opt_in: true`, `last_message_at: hace 30 horas`
Resultado esperado: `can_send: true`, `template_required: true`

### Test 3.4 — Contacto en lista no contactar
Datos: `do_not_contact: true`
Resultado esperado: `can_send: false`, log de bloqueo

---

## Fase 4: Tests de lead scoring

Ver `scripts/test-webhook-payloads.js` para payloads completos.

| Caso | Score esperado | Clasificación |
|---|---|---|
| Novia con fecha, lugar y presupuesto claro | 80+ | hot |
| "Cuánto cuesta?" sin más contexto | 20-35 | cold |
| Empresa con proyecto definido pero sin fecha | 45-60 | warm |
| Traslado con fecha, destino y grupo | 70+ | hot |

---

## Fase 5: Tests de aprobación humana

### Test 5.1 — Flujo completo de aprobación
1. Simular mensaje que requiere aprobación (precio detallado)
2. Verificar que se crea registro en Approval Schema
3. Verificar que llega alerta al responsable
4. Simular respuesta "OK" del responsable
5. Verificar que el mensaje se envía
6. Verificar que el registro queda cerrado como "approved"

### Test 5.2 — Expiración de aprobación
1. Simular mensaje que requiere aprobación
2. Esperar hasta que expire el tiempo límite
3. Verificar que el registro queda como "expired"
4. Verificar que NO se envió el mensaje

---

## Fase 6: Tests de reporte semanal

### Test 6.1 — Reporte con datos sample
```bash
node scripts/campaign-report-sample.js --brand ana --period last-week
# Resultado esperado: reporte completo en formato estándar
```

### Test 6.2 — Reporte consolidado multi-marca
```bash
node scripts/campaign-report-sample.js --brand all --period last-week
# Resultado esperado: reporte por marca + resumen ejecutivo
```

---

## Matriz de pruebas requeridas antes de producción

| Test | Estado | Fecha |
|---|---|---|
| Routing KMediaFilms | ☐ Pendiente | - |
| Routing Ana | ☐ Pendiente | - |
| Routing DRIVIP | ☐ Pendiente | - |
| Routing sin brand_id | ☐ Pendiente | - |
| Clasificación intención (10 casos) | ☐ Pendiente | - |
| Lead scoring (5 casos) | ☐ Pendiente | - |
| WhatsApp opt-in | ☐ Pendiente | - |
| WhatsApp ventana 24h | ☐ Pendiente | - |
| WhatsApp template fuera de ventana | ☐ Pendiente | - |
| Aprobación humana — flujo completo | ☐ Pendiente | - |
| Aprobación humana — expiración | ☐ Pendiente | - |
| Reporte semanal por marca | ☐ Pendiente | - |
| Reporte consolidado | ☐ Pendiente | - |
