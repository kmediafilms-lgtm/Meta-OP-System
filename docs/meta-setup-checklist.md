# Meta Setup Checklist — Para Ricardo

**Sistema: Meta Operating System WEDO**
**Responsable de completar:** Ricardo

---

## PASO 1: Limpiar activos Meta existentes

Antes de conectar cualquier API, es crítico tener una estructura Meta limpia.

- [ ] Entrar a business.facebook.com
- [ ] Identificar páginas duplicadas o viejas de cada marca
- [ ] Eliminar o desconectar páginas que no se usan
- [ ] Verificar que cada marca tiene UNA sola página activa
- [ ] Verificar que no hay cuentas publicitarias bloqueadas o con restricciones
- [ ] Resolver cualquier restricción de cuenta pendiente antes de continuar

---

## PASO 2: Verificar cuentas de Instagram profesionales

Para cada marca:
- [ ] KMediaFilms: confirmar que la cuenta IG es Professional Account (Business o Creator)
- [ ] En la Galería de Ana: confirmar que la cuenta IG es Professional Account
- [ ] DRIVIP: confirmar que la cuenta IG es Professional Account
- [ ] Cada cuenta IG debe estar conectada a su Facebook Page correspondiente

---

## PASO 3: Conectar Facebook Pages correctas en Business Manager

- [ ] Ir a business.facebook.com → Pages
- [ ] Verificar que las 3 páginas (KMedia, Ana, DRIVIP) están en el Business Manager
- [ ] Confirmar que cada página tiene los roles correctos asignados

---

## PASO 4: Verificar cuentas publicitarias

- [ ] Ir a business.facebook.com → Ad Accounts
- [ ] Confirmar cuenta publicitaria para KMediaFilms
- [ ] Confirmar cuenta publicitaria para En la Galería de Ana
- [ ] Confirmar cuenta publicitaria para DRIVIP
- [ ] Anotar los Ad Account IDs en `.env`

---

## PASO 5: Crear o revisar Meta App

- [ ] Ir a developers.facebook.com
- [ ] Crear nueva App (tipo Business) o usar App existente
- [ ] Dar nombre: "WEDO Meta OS" (o el que prefieras)
- [ ] Agregar dominio de la Privacy Policy
- [ ] Agregar URL de Terms of Service (recomendado)
- [ ] Anotar: `META_APP_ID` y `META_APP_SECRET` en `.env`

---

## PASO 6: Agregar productos a la Meta App

### WhatsApp (para Ana y DRIVIP)
- [ ] En tu App → Add Product → WhatsApp
- [ ] Completar WhatsApp API Setup
- [ ] Anotar: `WABA_ID` y `PHONE_NUMBER_ID` para cada marca
- [ ] Anotar: `WHATSAPP_ACCESS_TOKEN` (usar System User Token, no token de usuario)

### Instagram Messaging
- [ ] En tu App → Add Product → Instagram (o Messenger con Instagram)
- [ ] Conectar las páginas de Facebook con sus IG profesionales
- [ ] Solicitar permiso `instagram_manage_messages`
- [ ] Nota: este permiso requiere App Review para usuarios fuera del equipo de la App

---

## PASO 7: Agregar Privacy Policy URL

- [ ] Publicar una Privacy Policy básica en un URL público
- [ ] Agregar el URL en Meta App → Settings → Basic → Privacy Policy URL
- [ ] Sin esto, no puedes solicitar permisos avanzados

---

## PASO 8: Obtener Access Token de Sistema

Se recomienda usar un System User Token en lugar de tokens personales:
- [ ] Business Manager → System Users → Crear system user
- [ ] Asignar páginas, cuentas publicitarias y apps al system user
- [ ] Generar token con los permisos necesarios
- [ ] Anotar en `.env` como `META_ACCESS_TOKEN`
- [ ] Verificar fecha de expiración (system user tokens pueden ser de larga duración)

---

## PASO 9: Definir y configurar Webhooks

- [ ] Definir URL base de n8n: `N8N_WEBHOOK_BASE_URL=https://tu-n8n.com`
- [ ] En Meta App → Webhooks → Agregar webhook para:
  - [ ] Page (mensajes y comentarios de Facebook Pages)
  - [ ] Instagram (mensajes, comentarios, menciones, story insights)
  - [ ] WhatsApp Business Account
- [ ] Definir `META_VERIFY_TOKEN` (string aleatorio seguro, anotar en `.env`)
- [ ] Configurar el Verify Token en Meta y en n8n

---

## PASO 10: App Review (si aplica)

Para usuarios fuera del equipo de desarrollo:
- [ ] Verificar si los permisos que necesitas requieren App Review
- [ ] Permisos que siempre requieren App Review:
  - `instagram_manage_messages`
  - `pages_manage_messages`
  - `ads_management` (para hacer cambios, no solo leer)
- [ ] Si la App solo se usa con cuentas del Business Manager del owner, puede no requerir App Review completo
- [ ] Consultar la documentación actual de Meta antes de solicitar

---

## PASO 11: Conectar n8n

- [ ] Confirmar URL de n8n activa y accesible por HTTPS
- [ ] En n8n → Credentials → Crear credenciales para:
  - [ ] Facebook Graph API (con token de sistema)
  - [ ] WhatsApp Business Cloud (con WABA ID y token)
  - [ ] Google Sheets (si se usa como CRM)
- [ ] Importar workflows desde `workflows/`
- [ ] Activar primero `meta-webhook-router`
- [ ] Probar con payloads de prueba antes de activar respuestas automáticas

---

## PASO 12: Pruebas en sandbox

- [ ] Usar la cuenta de prueba de WhatsApp que Meta provee en App Setup
- [ ] Enviar mensajes de prueba y verificar que el router identifica la marca correctamente
- [ ] Verificar que los leads se guardan en el CRM correcto
- [ ] Verificar que las respuestas sugeridas tienen el tono correcto
- [ ] Verificar que los mensajes que requieren humano generan alerta

---

## Orden recomendado de conexión por marca

| Prioridad | Marca | Razón |
|---|---|---|
| 1 | En la Galería de Ana | Ya tiene historial de campañas, necesita datos para optimizar |
| 2 | DRIVIP | Alta demanda operacional de respuestas rápidas |
| 3 | KMediaFilms | Ciclo de ventas más largo, menor urgencia de automatización |
