# Supabase — WEDO Meta OS

Memoria operativa del sistema. Almacena marcas, contactos, conversaciones, mensajes, leads, campañas, aprobaciones, seguimientos, eventos y notas de aprendizaje.

## Proyecto activo

```
Project ID:  ndusmrxnaupypomfdnun
URL:         https://ndusmrxnaupypomfdnun.supabase.co
Región:      us-east-1
Org:         Drivippa (rdorktgkxooapwxtusyc)
Status:      ACTIVE_HEALTHY
```

Migración `001_initial_schema` aplicada. Seed `001_brands.sql` aplicado (3 productos).

## Variables de entorno

### No secretas — se pueden poner en Vercel (Public) y en el repo

```
NEXT_PUBLIC_SUPABASE_URL=https://ndusmrxnaupypomfdnun.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Qbq2Ec1-Yp7EtSHnz4z20A_ZQzjvI-3
```

### Secretas — SOLO en n8n Settings → Variables y Vercel (Server-only). Nunca en el repo.

```
SUPABASE_URL=https://ndusmrxnaupypomfdnun.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<obtener desde supabase.com/dashboard/project/ndusmrxnaupypomfdnun/settings/api>
```

**Para obtener la service_role key:**
1. Ir a https://supabase.com/dashboard/project/ndusmrxnaupypomfdnun/settings/api
2. Sección "Project API keys"
3. Copiar `service_role` (la que dice "secret")
4. Pegar en n8n: Settings → Variables → Nueva variable `SUPABASE_SERVICE_ROLE_KEY`

## Tablas — 11 tablas, RLS habilitado en todas

| Tabla | Propósito |
|-------|-----------|
| `brands` | 3 productos registrados (KMediaFilms, Ana, DRIVIP) |
| `contacts` | Contactos únicos por brand_id + canal |
| `conversations` | Hilos de conversación por marca |
| `messages` | Mensajes inbound/outbound con intent clasificado |
| `leads` | Leads con score, temperatura y status |
| `campaigns` | Campañas Meta sincronizadas (solo lectura) |
| `campaign_metrics` | Métricas históricas por campaña |
| `approvals` | Cola de aprobaciones humanas |
| `followups` | Seguimientos programados D0/D1/D3/D7 |
| `events_log` | Log inmutable de eventos entrantes de Meta |
| `learning_notes` | Patrones detectados por el agente de aprendizaje |

## Reglas

- `brand_id` obligatorio en todas las tablas operativas
- No guardar tokens ni secretos en la base de datos
- RLS habilitado en todas las tablas — ajustar políticas por brand_id antes de producción
- El campo `meta_ad_account_id` puede estar vacío (KMediaFilms no tiene confirmado)

Ver `docs/supabase-schema.md` para descripción completa de tablas y columnas.
