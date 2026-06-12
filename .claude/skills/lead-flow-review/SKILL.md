---
name: lead-flow-review
description: Revisar el flujo de leads de una marca. Analiza cuántos leads llegaron, cómo se clasificaron, qué pasó con cada uno y dónde se perdieron.
---

# Skill: Lead Flow Review

Audita el pipeline completo de leads para detectar fugas de valor.

## Uso

```
/lead-flow-review [brand_id] [periodo]
```

## Proceso

1. Obtener leads del período para la marca
2. Agrupar por canal de entrada (Instagram DM, comentario, WhatsApp, formulario Meta, manual)
3. Agrupar por clasificación de intención
4. Agrupar por estado actual (nuevo, respondido, cotización enviada, reserva, perdido, no responde)
5. Calcular tasa de conversión en cada etapa del embudo
6. Identificar el punto de mayor pérdida
7. Listar leads que llevan más de 7 días sin respuesta

## Output mínimo

```
REVISIÓN DE FLUJO DE LEADS — [MARCA] — [Período]

Total leads: X
Por canal:    Instagram X | WhatsApp X | Facebook X | Manual X
Por intención: caliente X | tibio X | frío X
Por estado: nuevo X | respondido X | cotización X | reserva X | perdido X

TASA DE CONVERSIÓN
Leads → Respondidos:    X%
Respondidos → Cotización: X%
Cotización → Reserva:   X%

FUGA PRINCIPAL
[Dónde se pierde más valor y por qué]

ACCIÓN INMEDIATA
[Lead(s) específico(s) que requieren seguimiento hoy]
```
