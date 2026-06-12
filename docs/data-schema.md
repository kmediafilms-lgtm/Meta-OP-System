# Data Schema — Meta Operating System WEDO

Documentación de todos los schemas de datos del sistema. Todos incluyen `brand_id` como campo obligatorio.

---

## Lead Schema

Representa a una persona que contactó a una de las marcas.

```json
{
  "id": "string (UUID)",
  "brand_id": "string (kmediafilms | ana | drivip)",
  "created_at": "ISO8601",
  "source": "string (instagram_dm | instagram_comment | whatsapp | facebook_message | meta_lead_form | click_to_wa | manual)",
  "channel": "string (instagram | whatsapp | facebook | manual)",
  "name": "string",
  "instagram_username": "string (nullable)",
  "phone": "string (nullable)",
  "campaign_id": "string (nullable)",
  "ad_id": "string (nullable)",
  "first_message": "string",
  "intent": "string (precio | disponibilidad | paquetes_boda | video_corporativo | traslado | portafolio | pregunta_general | cliente_caliente | cliente_tibio | cliente_frio | reclamo | spam | requiere_humano)",
  "status": "string (nuevo | respondido | cotizacion_solicitada | cotizacion_enviada | pendiente_fecha | pendiente_pago | reserva_confirmada | perdido | no_responde | bloqueado)",
  "lead_score": "integer (0-100)",
  "service_interest": "string (nullable)",
  "event_date": "string (nullable, fecha del evento si aplica)",
  "budget_range": "string (nullable)",
  "location": "string (nullable)",
  "assigned_to": "string (nullable)",
  "last_contact_at": "ISO8601 (nullable)",
  "next_followup_at": "ISO8601 (nullable)",
  "opt_in_whatsapp": "boolean",
  "do_not_contact": "boolean",
  "notes": "string (nullable)"
}
```

---

## Message Schema

Representa cada mensaje recibido o enviado.

```json
{
  "id": "string (UUID)",
  "brand_id": "string",
  "conversation_id": "string",
  "platform": "string (instagram | whatsapp | facebook)",
  "sender_id": "string (platform user ID)",
  "sender_name": "string (nullable)",
  "message_text": "string",
  "message_type": "string (text | image | video | audio | document | template)",
  "timestamp": "ISO8601",
  "direction": "string (inbound | outbound)",
  "intent": "string (nullable)",
  "sentiment": "string (positive | neutral | negative | null)",
  "requires_human": "boolean",
  "response_generated": "string (nullable)",
  "response_sent": "boolean",
  "approval_status": "string (not_required | pending | approved | rejected | null)"
}
```

---

## Campaign Schema

Representa una campaña de Meta Ads.

```json
{
  "id": "string (UUID interno)",
  "brand_id": "string",
  "meta_campaign_id": "string",
  "name": "string",
  "objective": "string (MESSAGES | LEAD_GENERATION | AWARENESS | TRAFFIC | CONVERSIONS)",
  "status": "string (ACTIVE | PAUSED | COMPLETED | ARCHIVED)",
  "budget": "number",
  "budget_type": "string (daily | lifetime)",
  "spend": "number",
  "impressions": "integer",
  "reach": "integer",
  "frequency": "number",
  "ctr": "number (porcentaje)",
  "cpc": "number",
  "cpm": "number",
  "conversations_started": "integer",
  "cost_per_conversation": "number",
  "leads": "integer",
  "qualified_leads": "integer",
  "bookings": "integer",
  "cost_per_lead": "number",
  "cost_per_qualified_lead": "number",
  "cost_per_booking": "number",
  "period_start": "ISO8601 date",
  "period_end": "ISO8601 date",
  "winning_creative": "string (nullable)",
  "weak_creative": "string (nullable)",
  "top_intent_received": "string (nullable)",
  "hypothesis": "string (nullable)",
  "recommendation": "string (nullable)",
  "notes": "string (nullable)"
}
```

---

## Conversation Schema

Representa el hilo completo de conversación con un contacto.

```json
{
  "id": "string (UUID)",
  "brand_id": "string",
  "platform": "string (instagram | whatsapp | facebook)",
  "contact_id": "string (platform contact ID)",
  "contact_name": "string (nullable)",
  "lead_id": "string (referencia a Lead)",
  "status": "string (open | closed | pending_human | do_not_contact)",
  "current_intent": "string (nullable)",
  "lead_score": "integer",
  "first_message_at": "ISO8601",
  "last_message_at": "ISO8601",
  "message_count": "integer",
  "assigned_to": "string (nullable)",
  "next_action": "string (nullable)",
  "escalation_required": "boolean",
  "escalation_reason": "string (nullable)"
}
```

---

## Followup Schema

Representa un seguimiento programado.

```json
{
  "id": "string (UUID)",
  "brand_id": "string",
  "lead_id": "string",
  "conversation_id": "string",
  "channel": "string (instagram | whatsapp | facebook | manual)",
  "followup_day": "integer (0 | 1 | 3 | 7)",
  "scheduled_at": "ISO8601",
  "message_type": "string (free_form | template)",
  "template_id": "string (nullable)",
  "draft_message": "string (nullable)",
  "status": "string (pending | sent | cancelled | expired)",
  "approved_by": "string (nullable)",
  "sent_at": "ISO8601 (nullable)",
  "result": "string (responded | no_response | unsubscribed | null)"
}
```

---

## Approval Schema

Representa una solicitud de aprobación humana.

```json
{
  "id": "string (UUID)",
  "brand_id": "string",
  "action_type": "string (send_message | campaign_change | followup | quote | other)",
  "requested_by": "string (system | agent_name)",
  "payload": "object (lo que se quiere ejecutar)",
  "reason": "string (por qué requiere aprobación)",
  "risk_level": "string (low | medium | high | critical)",
  "status": "string (pending | approved | rejected | expired)",
  "approved_by": "string (nullable)",
  "rejection_reason": "string (nullable)",
  "created_at": "ISO8601",
  "resolved_at": "ISO8601 (nullable)",
  "expires_at": "ISO8601 (nullable)"
}
```

---

## Brand Schema

Configuración completa de una marca.

```json
{
  "brand_id": "string",
  "brand_name": "string",
  "business_unit": "string",
  "active_status": "boolean",
  "facebook_page_id": "string",
  "instagram_business_id": "string",
  "whatsapp_waba_id": "string (nullable)",
  "whatsapp_phone_number_id": "string (nullable)",
  "meta_ad_account_id": "string",
  "crm_sheet_id": "string (nullable)",
  "default_language": "string (es | en)",
  "tone_profile": "string (referencia a tone-guide.md)",
  "services": "array of strings",
  "pricing_rules": "object (reglas de cómo manejar precios)",
  "human_approval_required_for": "array of strings",
  "allowed_automations": "array of strings",
  "blocked_automations": "array of strings",
  "responsible_users": "array of strings",
  "escalation_channels": "object (cómo alertar a los responsables)"
}
```
