# Supabase — WEDO Meta OS

Memoria operativa del sistema. Almacena marcas, contactos, conversaciones, mensajes, leads, campañas, aprobaciones, seguimientos, eventos y notas de aprendizaje.

## Aplicar migraciones

```bash
# Usando Supabase CLI (requiere SUPABASE_ACCESS_TOKEN)
supabase db push

# O directamente desde SQL Editor en supabase.com
# Ejecutar: supabase/migrations/001_initial_schema.sql
```

## Seed

```bash
supabase db seed
# O ejecutar: supabase/seed/001_brands.sql en el SQL Editor
```

## Reglas

- `brand_id` obligatorio en todas las tablas operativas
- No guardar tokens ni secretos en la base de datos
- RLS habilitado en todas las tablas — ajustar políticas antes de producción
- El campo `meta_ad_account_id` puede estar vacío (KMediaFilms no tiene confirmado)

## Credenciales necesarias

- `SUPABASE_URL` — URL del proyecto Supabase
- `SUPABASE_ANON_KEY` — para acceso desde dashboard (solo lectura pública)
- `SUPABASE_SERVICE_ROLE_KEY` — para n8n y workflows (nunca en el repo)

Ver `docs/supabase-schema.md` para descripción completa de tablas.
