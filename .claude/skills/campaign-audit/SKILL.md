---
name: campaign-audit
description: Auditar campañas Meta Ads de una marca específica. Genera análisis de métricas, detecta creativos débiles, formula hipótesis y entrega recomendaciones.
---

# Skill: Campaign Audit

Cuando el usuario invoque este skill, ejecuta una auditoría completa de campañas.

## Uso

```
/campaign-audit [brand_id] [periodo]
```

Ejemplo: `/campaign-audit ana semana-del-2026-06-01`

## Proceso

1. Solicitar las métricas de campañas del período indicado para la marca
2. Cargar el `brand-config.json` de la marca para contexto
3. Calcular: CTR, CPC, CPM, costo por conversación, costo por lead calificado, costo por reserva
4. Comparar campañas entre sí
5. Identificar el creativo ganador y el débil
6. Formular hipótesis sobre qué funcionó y qué no
7. Entregar reporte en formato estándar (ver `04-ads-analyst.md`)

## Output mínimo

- Resumen ejecutivo (3 líneas)
- Tabla comparativa de campañas
- Hipótesis principal
- Top 3 recomendaciones accionables
- Próximo experimento sugerido
