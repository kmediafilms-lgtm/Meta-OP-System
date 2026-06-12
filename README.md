# Meta Operating System WEDO

**Sistema operativo de marketing, ventas, atención y análisis para múltiples marcas en el ecosistema Meta.**

Desarrollado y operado por Ricardo / KMedia.

---

## Marcas activas

| Brand ID | Nombre | Canales |
|---|---|---|
| `kmediafilms` | KMediaFilms | Instagram, Facebook, Ads |
| `ana` | En la Galería de Ana | Instagram, Facebook, WhatsApp, Ads |
| `drivip` | DRIVIP | Instagram, Facebook, WhatsApp, Ads |

---

## Arquitectura

```
Claude Code        →  construye, audita, coordina técnicamente
n8n                →  ejecuta workflows, webhooks, reglas, logs, aprobaciones
Meta APIs          →  canal oficial (Instagram, WhatsApp, Facebook, Ads)
CRM / Base datos   →  memoria operativa por marca
Humano             →  aprobación obligatoria para casos sensibles
```

Diagrama completo: [`docs/architecture.md`](docs/architecture.md)
Arquitectura multi-marca: [`docs/multibrand-architecture.md`](docs/multibrand-architecture.md)

---

## Módulos del sistema

1. **Captura de leads** — Instagram DM, comentarios, stories, WhatsApp, formularios Meta, Click to WA
2. **Clasificador de intención** — precio, disponibilidad, cliente caliente/tibio/frío, reclamo, spam, requiere humano
3. **Respuestas controladas** — Claude redacta, n8n decide si envía, humano aprueba sensibles
4. **Seguimiento CRM** — estados, follow-up D0/D1/D3/D7, no acosar
5. **Analítica de campañas** — CTR, CPC, CPM, leads, calificados, reservas, costo por reserva
6. **Biblioteca de aprendizaje** — hooks, imágenes, objeciones, mensajes de cierre por campaña

---

## Estructura del repositorio

```
.claude/agents/          Subagentes de Claude Code
.claude/skills/          Skills reutilizables
.claude/settings.json    Seguridad y permisos
brands/                  Configuración por marca
docs/                    Documentación técnica y operativa
schemas/                 JSON Schemas multi-marca
scripts/                 Scripts de validación y prueba
workflows/               Workflows n8n (importables o pseudoworkflows)
.env.example             Variables de entorno (sin valores reales)
AUDIT.md                 Auditoría inicial del proyecto
SECURITY.md              Reglas de seguridad y credenciales
```

---

## Regla de oro

> **No mezcles marcas. No automatices sin control. No envíes mensajes sensibles sin aprobación humana.**

- Automatizar análisis: sí.
- Automatizar organización: sí.
- Automatizar primera respuesta simple: con cuidado.
- Automatizar seguimiento: limitado.
- Automatizar ventas sensibles: NO.
- Automatizar campañas con dinero real: solo con aprobación.
- Automatizar spam: jamás.

---

## Días operativos

| Día | Foco |
|---|---|
| 1 | Arquitectura, agentes, docs, schemas, pruebas, checklist |
| 2 | n8n + CRM, importar workflows, validar clasificación |
| 3 | Instagram test (solo sugerencias, no envío automático) |
| 4 | WhatsApp test, templates, regla 24h, aprobación humana |
| 5 | Ads analytics en modo lectura, reporte semanal |

---

## Setup

Ver: [`docs/meta-setup-checklist.md`](docs/meta-setup-checklist.md)

Variables de entorno: copia `.env.example` a `.env` y completa con Ricardo.

**Nunca versionar `.env` ni credenciales reales.**
