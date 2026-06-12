# Permissions Map — Mapa de Permisos Meta

Referencia de todos los permisos necesarios por marca y funcionalidad.

---

## Permisos de Facebook / Instagram

| Permiso | Para qué sirve | App Review requerida | Marcas que lo necesitan |
|---|---|---|---|
| `pages_show_list` | Ver páginas conectadas | No | Todas |
| `pages_read_engagement` | Leer comentarios y posts | No | Todas |
| `pages_manage_messages` | Enviar y recibir mensajes de Facebook Pages | Sí | Todas |
| `pages_messaging` | Mensajes de Messenger | Sí | Todas |
| `instagram_basic` | Perfil básico de Instagram | No | Todas |
| `instagram_manage_comments` | Responder comentarios de Instagram | No | Todas |
| `instagram_manage_messages` | Leer y responder Instagram DM | Sí | Todas |
| `instagram_content_publish` | Publicar contenido | Sí | Opcional |
| `ads_read` | Leer métricas de campañas | No | Todas |
| `ads_management` | Crear/modificar campañas | Sí | Con aprobación humana |
| `business_management` | Administración del Business Manager | Depende | Owner |
| `leads_retrieval` | Leer leads de formularios Meta | No | Todas |

---

## WhatsApp Cloud API

| Componente | Descripción | Requiere |
|---|---|---|
| WABA (WhatsApp Business Account) | Cuenta de WA Business | Meta Business Portfolio |
| Phone Number | Número verificado para enviar/recibir | WABA activo |
| Templates | Mensajes pre-aprobados para envíos iniciados por empresa | Aprobación de Meta por template |
| Webhooks | Recibir mensajes entrantes | Meta App con WA product |
| System User Token | Token de larga duración para automatización | Business Manager |

---

## Tabla de permisos por funcionalidad

| Funcionalidad | Permiso requerido | ¿Puede hacerse hoy? |
|---|---|---|
| Leer mensajes de Instagram | `instagram_manage_messages` | Requiere App Review |
| Responder Instagram DM | `instagram_manage_messages` | Requiere App Review |
| Leer comentarios de IG | `instagram_manage_comments` | No requiere App Review |
| Responder comentarios de IG | `instagram_manage_comments` | No requiere App Review |
| Recibir mensajes de Facebook Page | `pages_manage_messages` | Requiere App Review |
| Leer métricas de campañas | `ads_read` | No requiere App Review |
| Pausar/modificar campañas | `ads_management` | Requiere App Review |
| Recibir mensajes de WhatsApp | WhatsApp Cloud API | Ver configuración |
| Enviar WhatsApp dentro de ventana | WhatsApp Cloud API | Ver configuración |
| Enviar WhatsApp fuera de ventana | Templates aprobados + WA Cloud API | Aprobación de template |

---

## Estado actual de permisos (completar)

| Marca | `pages_manage_messages` | `instagram_manage_messages` | `ads_read` | WA Cloud API |
|---|---|---|---|---|
| KMediaFilms | ☐ No configurado | ☐ No configurado | ☐ No configurado | N/A |
| En la Galería de Ana | ☐ No configurado | ☐ No configurado | ☐ No configurado | ☐ No configurado |
| DRIVIP | ☐ No configurado | ☐ No configurado | ☐ No configurado | ☐ No configurado |

---

## Notas de App Review

- App Review puede tomar entre 3 días y varias semanas
- Requiere Privacy Policy URL accesible
- Requiere demostración de cómo se usa cada permiso
- Los permisos de Instagram Messaging son los más estrictos
- Se puede operar en modo desarrollo con cuentas del equipo mientras no pasa App Review
- En modo desarrollo: máximo 25 usuarios en la app (necesarios para pruebas iniciales)
