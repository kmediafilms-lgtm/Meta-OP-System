# Codex Setup for Meta Asset Discovery

Esta guía explica qué necesita Codex para ejecutar el discovery de activos Meta de forma segura.

## Acceso al Repo

Codex necesita acceso al repo:

```text
kmediafilms-lgtm/Meta-OP-System
```

Rama de trabajo recomendada:

```text
feature/meta-asset-discovery-runner
```

## Internet

El script necesita salida HTTPS hacia:

```text
https://graph.facebook.com
```

Si Codex no tiene internet habilitado, deja los comandos preparados y ejecuta la prueba localmente o desde n8n en un entorno con salida a Meta.

## Variables de Entorno

Configura las variables en Codex Environment / Variables / Secrets. No las escribas en archivos del repo.

Obligatoria:

```text
META_ACCESS_TOKEN
```

Opcionales:

```text
META_BUSINESS_ID
GRAPH_API_VERSION=v25.0
```

Codex debe verificar que `META_ACCESS_TOKEN` exista antes de correr:

```bash
node scripts/meta-discover-assets.js > outputs/meta-assets.local.json
```

Si no existe, Codex debe detenerse y dejar los comandos listos.

## Permisos Mínimos Meta

Para discovery de solo lectura:

```text
business_management
pages_show_list
pages_read_engagement
pages_manage_metadata
instagram_basic
ads_read
```

No uses permisos de escritura para esta fase.

## Reglas de Seguridad

Codex no debe:

- Imprimir tokens.
- Guardar tokens.
- Crear `.env` real.
- Modificar `brand-config.json` automáticamente.
- Enviar mensajes.
- Modificar campañas.
- Hacer POST o DELETE a Meta.
- Usar scraping.
- Usar navegador para discovery.
- Hacer cold DM.

## Comandos Seguros

Validar que el runner existe:

```bash
node --check scripts/meta-discover-assets.js
```

Ejecutar discovery si `META_ACCESS_TOKEN` existe:

```bash
node scripts/meta-discover-assets.js > outputs/meta-assets.local.json
```

Validar output:

```bash
node scripts/validate-meta-assets-output.js outputs/meta-assets.local.json
```

## Cuando Codex No Puede Ejecutar

Si faltan variables o internet, Codex debe entregar:

- Archivos preparados.
- Comandos exactos.
- Lista de variables faltantes.
- Próximo paso para Ricardo.

La fase queda lista aunque no se puedan ver páginas reales hasta tener token y acceso de red.
