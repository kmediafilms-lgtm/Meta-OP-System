---
name: brand-routing-review
description: Revisar que el router multi-marca está asignando correctamente los eventos a cada marca. Detectar eventos sin brand_id o asignados incorrectamente.
---

# Skill: Brand Routing Review

Audita que el sistema de routing multi-marca funciona correctamente.

## Uso

```
/brand-routing-review [periodo]
```

## Proceso

1. Obtener log de eventos del período
2. Verificar que todos los eventos tienen brand_id asignado
3. Detectar eventos con `brand_id: unidentified`
4. Verificar que el método de routing fue correcto (page_id_match, ig_id_match, etc.)
5. Detectar posibles asignaciones incorrectas (ej. evento de Ana asignado a DRIVIP)

## Output

```
REVISIÓN DE ROUTING — [Período]

Total eventos: X
Eventos con brand_id correcto: X (X%)
Eventos sin brand_id: X (X%) ← REQUIEREN ATENCIÓN
Eventos en revisión humana: X

Por marca:
kmediafilms: X eventos
ana: X eventos
drivip: X eventos
unidentified: X eventos ← LISTA DETALLADA

Eventos sin brand_id (últimas 24h):
[Lista con timestamp, tipo de evento y payload parcial]

Recomendación:
[Acción para resolver eventos no identificados]
```
