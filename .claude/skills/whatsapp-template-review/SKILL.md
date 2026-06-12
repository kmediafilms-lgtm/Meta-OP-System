---
name: whatsapp-template-review
description: Revisar templates de WhatsApp antes de enviarlos a aprobación de Meta. Detecta contenido que puede ser rechazado o causar restricciones.
---

# Skill: WhatsApp Template Review

Revisa un template de WhatsApp antes de enviarlo a aprobación de Meta.

## Uso

```
/whatsapp-template-review [brand_id] [texto del template]
```

## Verificaciones que realiza

1. **Cumplimiento de políticas Meta**: sin contenido prohibido (adultos, armas, juegos de azar, política)
2. **Sin variables ambiguas**: los `{{1}}` deben ser claros y no engañosos
3. **Longitud**: no exceder límites de caracteres por tipo de template
4. **Tipo correcto**: marketing, utility o authentication — debe estar bien categorizado
5. **Idioma**: debe coincidir con el idioma declarado
6. **Call to action**: si incluye botones, deben ser válidos
7. **Promesas**: sin garantías exageradas o afirmaciones no comprobables
8. **Urgencia falsa**: Meta rechaza templates con urgencia artificial

## Output

```
REVISIÓN DE TEMPLATE — [MARCA]

Template:
[Texto del template]

Estado: APROBADO PROBABLE | RIESGO DE RECHAZO | RECHAZAR ANTES DE ENVIAR

Observaciones:
- [Lista de problemas o confirmaciones]

Recomendaciones de modificación:
- [Cambios sugeridos si aplica]

Categoría recomendada: MARKETING / UTILITY / AUTHENTICATION
```
