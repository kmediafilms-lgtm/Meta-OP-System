---
name: meta-policy-check
description: Verificar si una acción automatizada planificada cumple con las políticas de Meta. Detecta automatizaciones prohibidas antes de implementarlas.
---

# Skill: Meta Policy Check

Verifica si una automatización o acción está permitida por las políticas de Meta.

## Uso

```
/meta-policy-check [descripción de la acción]
```

Ejemplo: `/meta-policy-check "Responder automáticamente a todos los comentarios con la palabra precio"`

## Verificaciones

- ¿La acción viola la política de spam de Instagram/Facebook?
- ¿La acción requiere permisos que no tenemos o que requieren App Review?
- ¿La acción puede activar detección de comportamiento inauténtico?
- ¿La acción involucra mensajes fuera de la ventana de 24h de WhatsApp?
- ¿La acción puede interpretar como mass messaging no autorizado?
- ¿La acción requiere opt-in que no hemos verificado?

## Output

```
VERIFICACIÓN DE POLÍTICA META

Acción propuesta:
[Descripción de la acción]

Resultado: PERMITIDO | PERMITIDO CON CONDICIONES | PROHIBIDO

Análisis:
- [Política específica aplicable]
- [Riesgos identificados]

Condiciones para hacerlo correctamente (si aplica):
- [Lista de requisitos]

Alternativa recomendada (si está prohibido):
- [Qué hacer en su lugar]
```
