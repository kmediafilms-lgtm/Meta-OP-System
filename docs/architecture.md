# Architecture — Meta Operating System WEDO

## Arquitectura general

```
┌─────────────────────────────────────────────────────────┐
│                    META ECOSISTEMA                       │
│  Instagram  │  Facebook Pages  │  WhatsApp  │  Meta Ads  │
└──────────────────────┬──────────────────────────────────┘
                       │ Webhooks / Events
                       ▼
┌─────────────────────────────────────────────────────────┐
│                    n8n (Centro Operativo)                │
│                                                          │
│  meta-webhook-router → [detectar marca] → [rutear]       │
│                                                          │
│  instagram-inbound   whatsapp-inbound   campaign-report  │
│  facebook-inbound    lead-scoring       human-approval   │
│  brand-onboarding    weekly-report                       │
└──────────┬───────────────────────────┬───────────────────┘
           │ Clasificar / Generar       │ Ejecutar acciones
           ▼                           ▼
┌──────────────────┐        ┌──────────────────────────────┐
│  Claude / Agents  │        │  Meta APIs (responder/enviar) │
│                   │        │  CRM (guardar/actualizar)     │
│  - router         │        │  Humano (aprobar/rechazar)    │
│  - classifier     │        └──────────────────────────────┘
│  - responder      │
│  - scorer         │
│  - analyst        │
└──────────────────┘
```

## Flujo Instagram

```
Usuario envía DM / comenta / responde story
    ↓
Meta Webhook → n8n Facebook Trigger
    ↓
[meta-webhook-router] detecta brand_id por IG Business ID o Page ID
    ↓
[instagram-inbound workflow]
    ↓
Cargar brand-config de la marca
    ↓
[Claude: instagram-inbox-agent] clasifica intención
    ↓
¿Requiere humano?
    ├── SÍ → crear alerta para Ricardo/Ana → esperar aprobación → enviar
    └── NO → [Claude: copy-conversion-agent] genera respuesta
                ↓
          Validar compliance
                ↓
          Enviar respuesta por Graph API
                ↓
          Guardar en CRM + log
```

## Flujo WhatsApp

```
Usuario envía mensaje por WhatsApp
    ↓
Meta Webhook → n8n WhatsApp Trigger
    ↓
[meta-webhook-router] detecta brand_id por Phone Number ID o WABA ID
    ↓
[whatsapp-inbound workflow]
    ↓
[Claude: whatsapp-compliance-agent] valida:
  - opt-in ✓
  - ventana 24h ✓
  - do-not-contact ✓
    ↓
[Claude: lead-scoring-agent] puntúa el lead
    ↓
[Claude: instagram-inbox-agent] clasifica intención
    ↓
¿Requiere humano?
    ├── SÍ → alerta + esperar aprobación
    └── NO → [Claude: copy-conversion-agent] genera respuesta
                ↓
          ¿Dentro de ventana 24h?
          ├── SÍ → enviar mensaje libre
          └── NO → usar template aprobado
                ↓
          Guardar en CRM + log
```

## Flujo Meta Ads / Campañas

```
Trigger: Diario o semanal (scheduled)
    ↓
[campaign-reporting workflow]
    ↓
Meta Marketing API → obtener insights por marca y campaña
    ↓
[Claude: ads-analyst] calcula métricas, compara, detecta creativos débiles
    ↓
Genera reporte por marca + reporte consolidado
    ↓
Entrega a Ricardo para revisión
    ↓
Ricardo aprueba/rechaza recomendaciones
    ↓
[Si aprobado] Ejecutar cambio → solo con confirmación explícita
```

## Flujo CRM

```
Nuevo evento (DM, comentario, WhatsApp, formulario Meta)
    ↓
[lead-scoring workflow]
    ↓
Crear/actualizar registro en CRM con:
  - brand_id
  - canal de entrada
  - intención
  - lead_score
  - estado
  - próximo seguimiento
    ↓
Programar follow-up según temperatura:
  Caliente → D1
  Tibio    → D3
  Frío     → D7
    ↓
Al llegar la fecha → [human-approval] → Ricardo/equipo revisa → ejecutar o descartar
```

## Puntos de aprobación humana obligatoria

| Evento | Motivo |
|---|---|
| Lead pregunta precio | Requiere cotización personalizada |
| Lead pide descuento | Decisión comercial |
| Lead molesto / reclamo | Riesgo de escalada |
| Lead habla de contrato, pago o reserva | Compromiso legal/financiero |
| Campaña necesita cambio de presupuesto | Dinero real involucrado |
| Campaña necesita pausa o activación | Impacto en gasto |
| Evento de WhatsApp fuera de ventana 24h | Solo template aprobado |
| brand_id no identificado | Riesgo de mezcla de marcas |

## Qué puede automatizarse vs. qué no

### Automatizable con supervisión
- Respuesta inicial a consultas simples (disponibilidad, portafolio)
- Clasificación de intención
- Lead scoring
- Follow-ups D1/D3 suaves
- Extracción de métricas de campañas
- Generación de reportes

### Requiere aprobación humana
- Cotizaciones y precios
- Descuentos
- Contratos y reservas
- Respuestas a reclamos
- Cambios en campañas (presupuesto, pausa, activación)
- Follow-up D7 (cierre)
- Mensajes de WhatsApp fuera de ventana

### Nunca automatizar
- Cold DMs a personas que no contactaron primero
- Follow/unfollow automático
- Comentarios masivos
- Spam de cualquier tipo
- Subida de presupuesto sin aprobación
- Creación de anuncios sin aprobación
