# Brand Onboarding Checklist — Agregar Nueva Marca

Usa este checklist cada vez que se agrega una marca nueva al sistema.

---

## Información requerida

- [ ] Nombre de la marca
- [ ] brand_id (slug único, sin espacios: ej. `nueva-marca`)
- [ ] Descripción del negocio (2-3 líneas)
- [ ] Tono de comunicación
- [ ] Servicios que ofrece
- [ ] Reglas de precios (qué puede decir el sistema, qué no)
- [ ] Responsables (quién aprueba mensajes sensibles)

---

## IDs de Meta requeridos

- [ ] Facebook Page ID
- [ ] Instagram Business Account ID
- [ ] Ad Account ID
- [ ] WhatsApp WABA ID (si aplica)
- [ ] WhatsApp Phone Number ID (si aplica)

---

## Archivos a crear

- [ ] `brands/[brand_id]/brand-config.json`
- [ ] `brands/[brand_id]/tone-guide.md`
- [ ] `brands/[brand_id]/services.md`
- [ ] `brands/[brand_id]/response-rules.md`
- [ ] `brands/[brand_id]/campaign-notes.md`

---

## Configuración técnica

- [ ] Agregar brand_id al mapa del `03-multibrand-router-agent.md`
- [ ] Agregar variables al `.env.example`
- [ ] Crear CRM separado (Google Sheet o Airtable)
- [ ] Configurar credenciales en n8n
- [ ] Configurar canal de alertas de aprobación humana

---

## Pruebas antes de activar

- [ ] Test de routing (el evento llega al brand_id correcto)
- [ ] Test de clasificación de intención
- [ ] Test de generación de respuesta con el tono correcto
- [ ] Test de lead scoring
- [ ] Test de aprobación humana
- [ ] Confirmar que los leads van al CRM correcto y no al de otra marca

---

## Activación gradual

1. **Primero:** Activar solo router + clasificación (sin enviar nada)
2. **Segundo:** Activar generación de respuestas sugeridas (sin envío automático)
3. **Tercero:** Activar envío automático para consultas simples (portafolio, info general)
4. **Cuarto:** Activar seguimientos programados
5. **Quinto:** Activar reportes de campaña
