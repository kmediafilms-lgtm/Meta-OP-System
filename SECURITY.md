# SECURITY.md — Seguridad del Sistema

**WEDO Meta OS**

---

## Regla principal

> **Ninguna credencial real se sube al repositorio. Nunca.**

---

## Dónde van las credenciales

| Entorno | Almacenamiento |
|---|---|
| Desarrollo local | `.env` (no versionado, en `.gitignore`) |
| n8n | Variables de entorno de n8n o Credentials store |
| Producción | Variables de entorno del servidor / secrets manager |

El archivo `.env.example` contiene solo placeholders vacíos. Es la guía. El `.env` real nunca se sube.

---

## Qué NO debe versionarse

```
.env
.env.*
secrets/
config/credentials.json
cualquier archivo con tokens, keys, passwords, client_secrets
```

El `.gitignore` del proyecto ya excluye estos archivos.

---

## Cómo rotar tokens

### Meta Access Token
1. Entrar a Meta Developer → Tu App → Tools → Access Token Debugger
2. Generar nuevo System User Token en Business Manager → System Users
3. Actualizar la variable `META_ACCESS_TOKEN` en `.env` y en n8n Credentials
4. Verificar que los webhooks siguen funcionando
5. Invalidar el token anterior en Meta

### Anthropic API Key
1. Entrar a console.anthropic.com → API Keys
2. Crear nueva key
3. Actualizar `ANTHROPIC_API_KEY`
4. Revocar la key anterior después de confirmar que la nueva funciona

### WhatsApp Access Token
1. En Meta Business → WhatsApp → API Setup
2. Generar nuevo token
3. Actualizar en n8n Credentials y `.env`

---

## Cómo revisar logs

- n8n: panel de ejecuciones → revisar errores, timeouts, respuestas inesperadas
- Cada workflow debe tener nodo de log al inicio y al final
- Logs mínimos por evento: brand_id, timestamp, tipo de evento, resultado, si requirió humano
- Nunca loguear tokens, números completos de teléfono ni mensajes privados completos sin anonimizar

---

## Cómo apagar automatizaciones rápido

### n8n
1. Ir al panel de n8n
2. Desactivar el workflow correspondiente (toggle off)
3. Para emergencia: desactivar todos los workflows activos
4. Alternativa: desconectar el webhook en Meta Developer

### Meta Webhook
1. Meta Developer → Tu App → Webhooks
2. Eliminar o deshabilitar la URL del webhook
3. Los eventos de Meta dejarán de llegar

### Modo mantenimiento
- Todos los workflows críticos deben tener una variable de control `SYSTEM_ENABLED=true/false`
- Si `SYSTEM_ENABLED=false`, los workflows no procesan ni envían mensajes

---

## Permisos mínimos

Principio: **solo solicitar lo que se necesita, cuando se necesita.**

| Acción | Permiso necesario | ¿Automatizable? |
|---|---|---|
| Leer mensajes Instagram | `instagram_manage_messages` | Sí (recibir) |
| Responder mensajes Instagram | `instagram_manage_messages` | Con reglas |
| Leer campañas | `ads_read` | Sí |
| Modificar campañas | `ads_management` | Solo con aprobación humana |
| Enviar WhatsApp | WhatsApp Cloud API | Con templates aprobados |
| Leer Page comments | `pages_read_engagement` | Sí |
| Responder Page comments | `pages_manage_posts` | Con reglas |

---

## Revisión humana obligatoria

Los siguientes casos **siempre** requieren revisión y aprobación humana:

- Mensajes que incluyan precio, cotización, descuento
- Mensajes que incluyan contrato, reserva, pago, factura
- Mensajes de clientes molestos, reclamos o quejas
- Mensajes fuera del horario laboral (solo respuesta corta automática, seguimiento manual)
- Cambios en presupuesto de campañas
- Pausa o activación de campañas
- Creación de nuevos anuncios
- Cualquier mensaje que el sistema clasifique como `requires_human: true`

---

## Seguridad Claude Code

El archivo `.claude/settings.json` configura permisos de lectura de Claude Code. Claude no puede leer:
- `.env`
- `.env.*`
- `secrets/**`
- `config/credentials.json`

Esto evita que Claude acceda accidentalmente a credenciales durante el desarrollo.

---

## Checklist de seguridad antes de producción

- [ ] `.env` real nunca en git (`git status` confirma que no está staged)
- [ ] `.gitignore` incluye `.env`, `secrets/`, `config/credentials.json`
- [ ] Tokens de Meta son System User Tokens (no tokens de usuario que expiran en 60 días)
- [ ] n8n tiene credenciales configuradas en su propio store, no en archivos
- [ ] Webhooks usan HTTPS
- [ ] `META_VERIFY_TOKEN` es un string aleatorio y seguro
- [ ] Todos los workflows tienen logging activado
- [ ] Reglas de no contactar están implementadas
- [ ] Opt-in de WhatsApp validado antes de enviar
- [ ] Templates de WhatsApp aprobados por Meta antes de usarse en producción
