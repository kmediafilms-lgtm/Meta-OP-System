# Meta Asset Mapping Results

Fecha: 2026-06-12

## Alcance

Este documento registra el mapeo manual y seguro de activos Meta descubiertos para WEDO Meta OS.

No se guardaron tokens, no se creó `.env`, no se enviaron mensajes, no se modificaron campañas, no se activaron webhooks y no se automatizaron respuestas.

## Business Detectado

```text
Business: rickirsch
Business ID: 137551104044234
```

## Activos Confirmados

### En la Galería de Ana

```text
facebook_page_id: 1043326452200695
instagram_business_id: 17841450875047591
instagram_username: enlagaleriadeana
instagram_name: En la Galería de Ana
meta_ad_account_id: act_2189268925168947
ad_account_name: EnlaGaleriadeAna ADS
```

Estos IDs fueron copiados manualmente a:

```text
brands/en-la-galeria-de-ana/brand-config.json
```

### DRIVIP

```text
facebook_page_id: 1158307954030806
instagram_business_id: 17841447217470964
instagram_username: drivippa
instagram_name: Drivip - Traslados Privados
meta_ad_account_id: act_1861455161486718
ad_account_name: Drivip Meta ADS
```

Estos IDs fueron copiados manualmente a:

```text
brands/drivip/brand-config.json
```

### KMediaFilms

El candidato pendiente fue verificado con una consulta GET segura:

```text
GET /17841400348662832?fields=id,username,name
```

Resultado:

```text
instagram_business_id: 17841400348662832
instagram_username: kmediafilms
instagram_name: KMediafilms | Productora Audiovisual
```

KMediaFilms queda confirmado por `instagram_username = kmediafilms`.

IDs copiados manualmente a:

```text
brands/kmediafilms/brand-config.json
```

```text
facebook_page_id: 1009115316143644
instagram_business_id: 17841400348662832
meta_ad_account_id:
```

`meta_ad_account_id` queda vacío porque discovery no encontró una cuenta publicitaria confirmada para KMediaFilms.

## Activos Needs Review

Pages que siguen sin marca confirmada:

```text
Hookai
page_id: 714614565072607
matched_brand_guess: needs_review

LenteCorto
page_id: 738119859382642
matched_brand_guess: needs_review
```

Ad accounts:

```text
Ninguna cuenta publicitaria quedó en needs_review después de mejorar el matcher.
```

## Errores Graph Restantes

Quedan errores al intentar enriquecer Instagram Business Account para Pages no confirmadas:

```text
page_id: 714614565072607
edge: page_instagram_business_account
status: 400
code: 10
message: requiere pages_read_engagement o Page Public Content Access / Page Public Metadata Access

page_id: 738119859382642
edge: page_instagram_business_account
status: 400
code: 10
message: requiere pages_read_engagement o Page Public Content Access / Page Public Metadata Access
```

Estos errores no bloquean Ana, DRIVIP ni KMediaFilms. Afectan solo el enrichment de Pages que siguen en `needs_review`.

## IDs Copiados

```json
{
  "en-la-galeria-de-ana": {
    "facebook_page_id": "1043326452200695",
    "instagram_business_id": "17841450875047591",
    "meta_ad_account_id": "act_2189268925168947"
  },
  "drivip": {
    "facebook_page_id": "1158307954030806",
    "instagram_business_id": "17841447217470964",
    "meta_ad_account_id": "act_1861455161486718"
  },
  "kmediafilms": {
    "facebook_page_id": "1009115316143644",
    "instagram_business_id": "17841400348662832",
    "meta_ad_account_id": ""
  }
}
```

## Archivos Actualizados

```text
brands/en-la-galeria-de-ana/brand-config.json
brands/drivip/brand-config.json
brands/kmediafilms/brand-config.json
scripts/meta-discover-assets.js
scripts/meta-check-instagram-account.js
docs/meta-asset-mapping-results.md
```

## Próximos Pasos

1. Confirmar si Hookai y LenteCorto pertenecen o no al ecosistema WEDO.
2. Confirmar si existe una cuenta publicitaria real para KMediaFilms; por ahora queda vacía.
3. Mantener los webhooks y automatizaciones desactivados hasta probar routing con payloads dummy.
4. Ejecutar pruebas de router por marca antes de activar cualquier flujo de respuesta.
5. Revisar permisos Meta para resolver los errores de enrichment de Pages no confirmadas si esas Pages se van a usar.
