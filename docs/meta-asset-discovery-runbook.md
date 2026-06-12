# Meta Asset Discovery Runbook

Guía segura para descubrir activos reales de Meta y preparar los `brand-config.json` de WEDO Meta OS.

## Objetivo

Descubrir en bloque:

- Business Managers disponibles para el token.
- Facebook Pages propias y compartidas.
- Instagram Business Accounts conectadas a cada Page.
- Ad Accounts propias y compartidas.
- Sugerencias iniciales para mapear activos por marca.

Este proceso es de solo lectura. No envía mensajes, no modifica campañas, no publica contenido, no cambia presupuestos y no edita automáticamente archivos de marca.

## Token Necesario

Ricardo debe crear o proveer un Meta access token con permisos de lectura. Para esta fase, usar el mínimo necesario:

```text
business_management
pages_show_list
pages_read_engagement
pages_manage_metadata
instagram_basic
ads_read
```

Notas:

- `META_ACCESS_TOKEN` es obligatorio.
- `META_BUSINESS_ID` es opcional, pero recomendado si ya sabes cuál Business Manager revisar.
- `GRAPH_API_VERSION` es opcional. El valor recomendado actual del proyecto es `v25.0`.
- No uses permisos de escritura para discovery.
- No pegues el token en README, docs, código, `.env` versionado, issues o PRs.

## Variables de Entorno

En Codex Environment, tu terminal local o tu runner seguro, define:

```bash
META_ACCESS_TOKEN="TOKEN_REAL_DE_META"
META_BUSINESS_ID="ID_DEL_BUSINESS_MANAGER_OPCIONAL"
GRAPH_API_VERSION="v25.0"
```

No crees un `.env` real dentro del repo para esta prueba. Si lo haces localmente fuera del repo por tu cuenta, asegúrate de que nunca se versiona.

## Ejecutar Discovery

Desde la raíz del repo:

```bash
node scripts/meta-discover-assets.js
```

Para guardar el output local:

```bash
node scripts/meta-discover-assets.js > outputs/meta-assets.local.json
```

`outputs/meta-assets.local.json` está ignorado por Git y no debe subirse.

## Validar Output

Después de guardar el output:

```bash
node scripts/validate-meta-assets-output.js outputs/meta-assets.local.json
```

El validador resume:

- Marcas detectadas.
- Páginas encontradas.
- Cuentas publicitarias encontradas.
- Marcas incompletas.
- Activos marcados como `needs_review`.
- Errores de permisos o acceso reportados por Graph API.

## Revisar Output

Abre `outputs/meta-assets.local.json` y revisa manualmente:

- Que el `business.id` sea el Business Manager correcto.
- Que cada `page_id` pertenezca a la marca sugerida.
- Que cada `instagram_business_id` esté conectado a la Page correcta.
- Que cada `meta_ad_account_id` sea de la marca correcta.
- Que los assets con `matched_brand_guess = needs_review` no se copien sin confirmar.
- Que no haya Pages viejas, duplicadas, restringidas o compartidas por error.

## Copiar Datos a Brand Config

Solo después de revisar manualmente, copia los IDs aprobados a:

```text
brands/kmediafilms/brand-config.json
brands/en-la-galeria-de-ana/brand-config.json
brands/drivip/brand-config.json
```

Campos principales:

```json
{
  "facebook_page_id": "PAGE_ID_REVISADO",
  "instagram_business_id": "IG_BUSINESS_ID_REVISADO",
  "meta_ad_account_id": "ACT_AD_ACCOUNT_ID_REVISADO"
}
```

No copies automáticamente todo el bloque sugerido. El matcher ayuda, pero no reemplaza revisión humana.

## Errores Comunes

`Missing META_ACCESS_TOKEN`

El token no está definido en el entorno. Define `META_ACCESS_TOKEN` y vuelve a correr.

`Access token is invalid, expired, revoked, or malformed`

Genera un token nuevo o revisa que no tenga espacios, comillas incorrectas o caracteres cortados.

`Token is missing a permission or asset access is not granted`

El token existe, pero le faltan permisos o el usuario/system user no tiene acceso al Business Manager, Page o Ad Account.

`No businesses returned by /me/businesses`

El token no ve Business Managers. Define `META_BUSINESS_ID` si lo conoces, o revisa `business_management` y acceso del usuario.

`instagram_business_id` vacío

La Page puede no tener Instagram profesional conectado, o el token no tiene acceso suficiente para leer esa relación.

`matched_brand_guess = needs_review`

El script no pudo asignar la marca con suficiente confianza. Revisa manualmente antes de copiar.

## Qué No Debe Hacerse

- No guardar tokens en el repo.
- No crear `.env` real versionado.
- No subir `outputs/meta-assets.local.json` si contiene IDs reales privados.
- No modificar `brand-config.json` automáticamente.
- No usar POST, DELETE ni endpoints de escritura.
- No activar workflows de mensajes con estos datos sin probar routing.
- No enviar DMs, WhatsApp ni comentarios.
- No tocar campañas, presupuestos, ads o adsets.
- No usar scraping ni navegador para obtener assets.

## Orden Recomendado

1. Descubrir assets.
2. Validar output.
3. Revisar manualmente cada match.
4. Copiar IDs aprobados a `brand-config.json`.
5. Correr `node scripts/validate-brand-configs.js`.
6. Probar router con IDs reales.
7. Activar solo lectura antes de cualquier automatización de mensajes.
