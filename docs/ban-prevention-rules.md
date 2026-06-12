# Ban Prevention Rules — Reglas de Prevención de Baneos

**Meta Operating System WEDO — Regla de oro: Si no puedes explicarle esto a Meta, no lo hagas.**

---

## Prohibiciones absolutas

Estas acciones **NUNCA** se implementan en el sistema, sin importar el resultado esperado:

- **NO cold DM**: nunca enviar mensaje a alguien que no contactó primero a la marca
- **NO scraping**: nunca extraer datos de perfiles, seguidores o publicaciones de Meta
- **NO follow/unfollow automático**: Meta castiga patrones de follow masivo
- **NO comentarios masivos**: respuestas automatizadas a muchos posts de otros usuarios
- **NO mensajes repetidos**: mismo texto enviado a múltiples personas en corto tiempo
- **NO follow-ups agresivos**: más de 3 intentos de contacto sin respuesta del usuario
- **NO promesas falsas**: no prometer resultados, fechas o precios que no están confirmados
- **NO urgencia artificial**: "Solo quedan 2 cupos" si no es verdad
- **NO automatización de navegador**: simular clicks humanos es violación de términos
- **NO mezclar marcas**: responder como Ana desde una cuenta de KMedia o DRIVIP

---

## Reglas de WhatsApp (críticas)

WhatsApp tiene las reglas más estrictas del ecosistema Meta. Un baneo de WhatsApp es muy difícil de revertir.

### Opt-in obligatorio
- El usuario debe haber dado permiso explícito para recibir mensajes de la empresa
- El opt-in debe ser documentado con timestamp y canal
- Sin opt-in verificado en el CRM → NO ENVIAR

### Ventana de 24 horas
- Si el usuario envió un mensaje, puedes responder libremente por 24 horas
- Después de 24 horas → solo templates aprobados
- Los templates se usan para: recordatorios, confirmaciones, seguimientos
- Los templates NO se usan para ventas agresivas o spam

### Templates aprobados
- Todos los templates deben ser aprobados por Meta antes de usarse en producción
- No cambiar el texto de un template aprobado sin re-aprobarlo
- Categorías válidas: Marketing, Utility, Authentication
- Un template rechazado no debe enviarse de ninguna forma

### Escalamiento humano obligatorio
- Todo flujo automático de WhatsApp debe ofrecer la opción de hablar con un humano
- Ejemplo de frase: "Para hablar con nuestro equipo, escribe 'Humano'"
- Sin esta opción, el flujo viola las políticas de WhatsApp

### No contactar (opt-out)
- Si el usuario dice "no me contactes", "stop", "baja", "unsubscribe" → marcar en CRM como `do_not_contact: true`
- Después de esto → NO volver a contactar por ningún canal automatizado
- El flag no_contact debe respetarse incluso si el usuario abre otro canal

---

## Reglas de seguimiento (anti-spam)

```
Día 0:  Respuesta inicial al primer mensaje
Día 1:  Seguimiento suave (solo si no respondió)
        "Hola [nombre], solo quería asegurarme que recibiste la info."
Día 3:  Valor / portafolio / recordatorio (solo si sigue sin responder)
        "Aquí te comparto algo que podría interesarte..."
Día 7:  Cierre limpio
        "Cuando quieras hablamos, aquí seguimos."
Después: NO contactar más a menos que el usuario inicie conversación
```

---

## Reglas de campañas y presupuesto

- **Lectura de campañas**: se puede automatizar (obtener métricas, generar reportes)
- **Análisis y recomendaciones**: se puede automatizar
- **Cambios en presupuesto**: SIEMPRE requiere aprobación humana explícita
- **Pausar o activar campañas**: SIEMPRE requiere aprobación humana
- **Crear nuevos anuncios**: SIEMPRE requiere aprobación humana
- **Modificar creativos**: SIEMPRE requiere aprobación humana

---

## Señales de alerta que activan modo seguro

El sistema debe detenerse automáticamente si detecta:

1. Más de 10 errores de webhook en 5 minutos → apagar router
2. Mismo mensaje enviado a más de 5 contactos en 30 minutos → revisar loop
3. Usuario marcó mensaje como spam → suspender automatización para ese contacto
4. Token de Meta con error 400/403 → apagar envío de mensajes, alertar Ricardo
5. Template de WhatsApp rechazado → no usar, alertar Ricardo
6. Brand_id no identificado en más del 10% de eventos → revisar mapa de routing

---

## Qué hacer si la cuenta recibe una restricción

1. Apagar TODOS los workflows inmediatamente (ver SECURITY.md → cómo apagar automatizaciones)
2. Revisar los últimos 100 logs de eventos para identificar la causa
3. NO intentar conectar con otra cuenta mientras la restricción está activa
4. Seguir el proceso de apelación de Meta desde Business Manager
5. Documentar la causa en `docs/campaign-notes.md` de la marca afectada
6. No reactivar automatizaciones hasta que la restricción se resuelva y la causa se corrija
