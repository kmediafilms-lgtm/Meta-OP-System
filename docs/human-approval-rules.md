# Human Approval Rules — Reglas de Aprobación Humana

**Principio: El sistema sugiere, el humano decide en casos críticos.**

---

## Cuándo se requiere aprobación humana

### Mensajes (siempre)
| Tipo de mensaje | Requiere aprobación | Urgencia |
|---|---|---|
| Precio / cotización | SÍ | Alta |
| Descuento | SÍ | Alta |
| Contrato / reserva | SÍ | Alta |
| Pago / factura | SÍ | Alta |
| Reclamo / queja | SÍ | Crítica |
| Cliente molesto | SÍ | Crítica |
| Fuera de horario (primer contacto) | Respuesta corta auto, seguimiento manual | Normal |
| Consulta simple (portafolio, info general) | No | - |
| Respuesta inicial genérica | No (con revisión) | - |

### Campañas (siempre)
| Acción | Requiere aprobación |
|---|---|
| Aumentar presupuesto | SÍ |
| Disminuir presupuesto | SÍ |
| Pausar campaña | SÍ |
| Activar campaña | SÍ |
| Crear nuevo anuncio | SÍ |
| Modificar creativo | SÍ |
| Cambiar público objetivo | SÍ |
| Leer métricas y generar reporte | NO |
| Analizar y formular hipótesis | NO |

---

## Proceso de aprobación

```
1. Sistema detecta que un mensaje/acción requiere aprobación humana
2. Sistema genera un registro en Approval Schema con:
   - brand_id
   - action_type
   - payload (qué se quiere hacer)
   - reason (por qué requiere aprobación)
   - risk_level
   - draft_response (si aplica)
3. Sistema envía alerta a los responsables de la marca
   (por WhatsApp, email o notificación de n8n)
4. Responsable revisa en interfaz de n8n o panel CRM:
   - Ve el contexto completo de la conversación
   - Ve la respuesta sugerida por Claude
   - Puede: APROBAR / EDITAR y aprobar / RECHAZAR
5. Si aprueba → sistema ejecuta la acción
6. Si edita → sistema envía la versión editada
7. Si rechaza → sistema registra el rechazo y suspende la acción
8. Si no hay respuesta en [tiempo límite] → sistema escala o suspende
```

---

## Tiempos límite por nivel de riesgo

| Risk Level | Tiempo máximo de respuesta | Qué pasa si no hay respuesta |
|---|---|---|
| critical | 15 minutos | Suspender acción, enviar alerta urgente |
| high | 2 horas | Suspender acción, registrar como expirado |
| medium | 24 horas | Suspender acción, programar seguimiento manual |
| low | 48 horas | Suspender acción silenciosamente |

---

## Cómo llegan las alertas de aprobación

El sistema puede enviar alertas por:
1. **WhatsApp** (recomendado para urgentes): mensaje directo a Ricardo/equipo
2. **Email**: para no urgentes
3. **n8n dashboard**: panel centralizado de aprobaciones pendientes
4. **Google Sheets**: fila en hoja "Pendientes de Aprobación" del CRM

La configuración de canal de alerta se define en `brand-config.json` → `escalation_channels`.

---

## Formato de alerta de aprobación

```
🔔 APROBACIÓN REQUERIDA — [MARCA]
Tipo: [MENSAJE/CAMPAÑA]
Riesgo: [CRITICAL/HIGH/MEDIUM]

Contexto:
[Resumen de la conversación o situación]

Acción propuesta:
[Qué quiere hacer el sistema]

Respuesta sugerida (si aplica):
"[Texto sugerido]"

Opciones:
✅ APROBAR → Responder "OK"
✏️ EDITAR → Enviar la respuesta corregida
❌ RECHAZAR → Responder "NO"

Expira en: [tiempo límite]
```
