# Campaign Analysis Framework — Meta Operating System WEDO

Marco de análisis para evaluar campañas Meta Ads de manera estructurada. Aplica para todas las marcas.

---

## El problema de las campañas anteriores (Ana)

Campaña 1: ~3-4 clientes
Campaña 2: ~2 clientes

Sin saber **qué parte falló** no se puede mejorar. Las variables a analizar son:

```
1. Creativo (imagen/video) — ¿llamó la atención correcta?
2. Copy del anuncio — ¿habló al público correcto con el mensaje correcto?
3. Público objetivo — ¿llegó a novias reales o a curiosos?
4. Objetivo de campaña — ¿MESSAGES, LEADS, TRAFFIC? ¿era el correcto?
5. Presupuesto — ¿fue suficiente para que el algoritmo aprenda?
6. Conversación — ¿la respuesta inicial convirtió o asustó?
7. Seguimiento — ¿se hizo seguimiento correcto o se perdieron leads?
```

---

## Métricas clave y su interpretación

### Métricas de alcance y awareness
| Métrica | Qué mide | Señal de problema |
|---|---|---|
| Alcance | Personas únicas que vieron el anuncio | Muy bajo = presupuesto insuficiente |
| Impresiones | Total de veces que se mostró | Alto con alcance bajo = mucha frecuencia |
| Frecuencia | Impresiones / Alcance | >3 = saturación del público |

### Métricas de engagement
| Métrica | Qué mide | Señal de problema |
|---|---|---|
| CTR | % que hizo clic | <1% = problema de creativo o copy |
| CPC | Costo por clic | Alto = mal creativo o público mal segmentado |
| CPM | Costo por 1000 impresiones | Muy alto = competencia alta o público saturado |

### Métricas de conversión
| Métrica | Qué mide | Señal de problema |
|---|---|---|
| Conversaciones iniciadas | Personas que enviaron mensaje | Bajo vs CTR = problema en primer mensaje |
| Costo por conversación | Budget / conversaciones | Alto = ineficiencia en todo el embudo |
| Leads calificados | Personas que realmente compraron | Bajo vs leads totales = problema de seguimiento |
| Costo por lead calificado | Budget / leads calificados | KPI principal de rentabilidad |
| Reservas / ventas | Contratos cerrados | El objetivo real |
| Costo por reserva | Budget / reservas | Rentabilidad final |

---

## Framework de hipótesis

Antes de cambiar cualquier cosa, formula una hipótesis:

```
OBSERVACIÓN: [qué ves en los datos]
HIPÓTESIS:   [por qué crees que pasó]
EXPERIMENTO: [qué cambiarías para validar]
MÉTRICA:     [cómo sabrías si funcionó]
TIMEFRAME:   [cuánto tiempo darías para validar]
```

### Ejemplos

**Observación:** CTR alto (2.5%) pero pocas conversaciones (5% del CTR)
**Hipótesis:** El anuncio llama la atención pero el primer mensaje no convierte
**Experimento:** Cambiar el mensaje de bienvenida automático por uno que abra conversación real
**Métrica:** Aumentar ratio conversaciones/clicks de 5% a 15%
**Timeframe:** 7 días con mismo presupuesto

---

**Observación:** Leads baratos ($3 por lead) pero ninguno calificado
**Hipótesis:** El público objetivo está mal segmentado (demasiado amplio o incorrecto)
**Experimento:** Cambiar segmentación a intereses específicos: comprometidos, bodas Panamá, planificación nupcial
**Métrica:** Aumentar % leads calificados de 0% a 20%+
**Timeframe:** 14 días

---

## Comparación de campañas (formato estándar)

| Campaña | Presupuesto | CTR | Conv. | Leads | Calificados | Reservas | CPR |
|---|---|---|---|---|---|---|---|
| Campaña 1 | $X | X% | X | X | X | X | $X |
| Campaña 2 | $X | X% | X | X | X | X | $X |

CPR = Costo Por Reserva (KPI principal)

---

## Biblioteca de aprendizaje por campaña

Al terminar cada campaña, documentar en `brands/[marca]/campaign-notes.md`:

```
CAMPAÑA: [nombre] — [período]

QUÉ FUNCIONÓ
- Hook: [descripción del hook ganador]
- Imagen/Video: [descripción del creativo ganador]
- Copy: [línea de copy que mejor convirtió]
- Audiencia: [segmento que mejor respondió]
- Mensaje de bienvenida: [el que mejor abrió conversación]

QUÉ NO FUNCIONÓ
- Creativo débil: [descripción y por qué]
- Objeciones frecuentes: [lista]
- Preguntas que no sabíamos responder: [lista]
- Leads que llegaron pero no calificaron: [patrón]

HIPÓTESIS PARA PRÓXIMA CAMPAÑA
- [Cambio 1 a probar]
- [Cambio 2 a probar]
```
