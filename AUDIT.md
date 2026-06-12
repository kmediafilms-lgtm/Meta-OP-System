# AUDIT.md — Auditoría inicial del proyecto

**Fecha:** 2026-06-12
**Proyecto:** WEDO Meta OS

---

## ¿Qué existe?

El repositorio parte desde cero. No existe:
- Código fuente previo
- Documentación técnica
- Workflows importados
- Configuración de Meta Apps
- Credenciales configuradas
- CRM activo
- Conexión a n8n

Lo que **sí existe** como punto de partida:
- Historial operativo de 2 campañas en "En la Galería de Ana"
- Fanpages activas en Facebook para KMediaFilms, En la Galería de Ana y DRIVIP
- Cuentas de Instagram profesionales (pendiente confirmar)
- Cuenta publicitaria de Meta (pendiente limpiar estructura)

---

## ¿Qué falta?

### Infraestructura técnica
- [ ] Meta Developer Account verificada y activa
- [ ] Meta Business Portfolio limpio (sin páginas duplicadas o bloqueadas)
- [ ] Meta App creada con productos: WhatsApp, Instagram Messaging
- [ ] Privacy Policy URL pública para la Meta App
- [ ] Access Tokens por marca
- [ ] Webhook URLs configuradas
- [ ] App Review para permisos avanzados (si se requiere)
- [ ] n8n instalado y accesible (cloud o self-hosted)
- [ ] CRM base (Google Sheets o Airtable)
- [ ] Clave API de Anthropic

### Por marca

**KMediaFilms:**
- [ ] Facebook Page ID
- [ ] Instagram Business Account ID
- [ ] Ad Account ID
- [ ] Tono y reglas de respuesta documentadas

**En la Galería de Ana:**
- [ ] Facebook Page ID
- [ ] Instagram Business Account ID
- [ ] WhatsApp WABA ID (si aplica)
- [ ] WhatsApp Phone Number ID (si aplica)
- [ ] Ad Account ID
- [ ] Templates de WhatsApp aprobados

**DRIVIP:**
- [ ] Facebook Page ID
- [ ] Instagram Business Account ID
- [ ] WhatsApp WABA ID
- [ ] WhatsApp Phone Number ID
- [ ] Ad Account ID
- [ ] Templates de WhatsApp aprobados

---

## Riesgos identificados

1. **Estructura Meta sucia**: historial de páginas duplicadas, viejas o con restricciones. Conectar APIs sobre estructura sucia automatiza el problema.
2. **App Review pendiente**: permisos avanzados de Instagram Messaging requieren revisión de Meta. Puede tomar días o semanas.
3. **Templates WhatsApp no aprobados**: sin templates, WhatsApp no puede iniciar conversaciones fuera de la ventana de 24h.
4. **Mezclado de marcas**: riesgo crítico si los Page IDs o Business IDs no están bien separados antes de conectar.
5. **Tokens de corta duración**: los User Access Tokens expiran. Necesitas System User Tokens o renovación automática.
6. **Ventana de 24h WhatsApp**: mensajes fuera de ventana solo permitidos con templates aprobados.
7. **Spam y baneo**: automatizar respuestas sin reglas claras puede generar reportes y restricciones de cuenta.

---

## Credenciales necesarias por componente

| Componente | Variable | Quién la obtiene |
|---|---|---|
| Meta App | `META_APP_ID`, `META_APP_SECRET` | Ricardo — Meta Developer |
| Meta Webhooks | `META_VERIFY_TOKEN` | Ricardo — definir y configurar |
| Token general | `META_ACCESS_TOKEN` | Ricardo — System User Token |
| KMedia Page | `KMEDIA_FACEBOOK_PAGE_ID` | Ricardo — Business Manager |
| KMedia IG | `KMEDIA_IG_BUSINESS_ID` | Ricardo — Instagram Settings |
| KMedia Ads | `KMEDIA_AD_ACCOUNT_ID` | Ricardo — Business Manager |
| Ana Page | `ANA_FACEBOOK_PAGE_ID` | Ricardo — Business Manager |
| Ana IG | `ANA_IG_BUSINESS_ID` | Ricardo — Instagram Settings |
| Ana WhatsApp | `ANA_WABA_ID`, `ANA_PHONE_NUMBER_ID` | Ricardo — WhatsApp API Setup |
| DRIVIP Page | `DRIVIP_FACEBOOK_PAGE_ID` | Ricardo — Business Manager |
| DRIVIP IG | `DRIVIP_IG_BUSINESS_ID` | Ricardo — Instagram Settings |
| DRIVIP WhatsApp | `DRIVIP_WABA_ID`, `DRIVIP_PHONE_NUMBER_ID` | Ricardo — WhatsApp API Setup |
| n8n | `N8N_WEBHOOK_BASE_URL` | Hosting de n8n |
| Anthropic | `ANTHROPIC_API_KEY` | console.anthropic.com |

---

## Qué requiere intervención humana obligatoria

- Login y autenticación en Meta Business Manager
- Códigos 2FA y verificaciones de identidad
- App Review de Meta
- Aprobación de templates de WhatsApp
- Creación y verificación de System Users en Meta
- Limpieza de activos Meta (páginas duplicadas, cuentas bloqueadas)
- Aprobación de mensajes con precios, descuentos, contratos, reservas, reclamos
- Modificaciones de presupuesto o pausa de campañas
- Verificación de que un número de teléfono puede recibir WhatsApp Cloud API

---

## Estado de permisos Meta necesarios por marca

| Permiso | KMedia | Ana | DRIVIP | Requiere App Review |
|---|---|---|---|---|
| `pages_read_engagement` | [ ] | [ ] | [ ] | No |
| `pages_manage_messages` | [ ] | [ ] | [ ] | Sí |
| `instagram_basic` | [ ] | [ ] | [ ] | No |
| `instagram_manage_messages` | [ ] | [ ] | [ ] | Sí |
| `ads_read` | [ ] | [ ] | [ ] | No |
| `ads_management` | [ ] | [ ] | [ ] | Sí |
| WhatsApp Cloud API | N/A | [ ] | [ ] | Ver política |

---

## Elementos que deben separarse estrictamente por marca

- Leads y conversaciones
- Campañas y métricas
- Respuestas y tono
- Templates de WhatsApp
- CRM / hojas de cálculo
- Logs
- Reportes semanales
- Credenciales y tokens

---

## Próximo paso inmediato (para Ricardo)

1. Auditar Business Manager: identificar qué páginas están activas, cuáles duplicadas, cuáles con restricciones.
2. Confirmar los IDs reales de cada Page, Instagram Business Account y Ad Account.
3. Completar `.env` con los valores reales (sin subirlo al repo).
4. Instalar n8n o confirmar instancia cloud.
5. Crear Meta App de desarrollo para pruebas antes de producción.
