-- WEDO Meta OS — Product Registry Seed
-- Seeds the 3 active products. IDs confirmed from Meta discovery (PR #5).
-- Do NOT commit real tokens. Page IDs are public identifiers, not secrets.
--
-- To add a new product: insert a new row with activation_status = 'draft',
-- then update Meta IDs once confirmed. No code changes required.

INSERT INTO brands (brand_id, brand_name, business_unit, active_status,
  facebook_page_id, instagram_business_id, meta_ad_account_id,
  default_language, timezone)
VALUES
  (
    'kmediafilms',
    'KMediaFilms',
    'Producción audiovisual',
    TRUE,
    '1009115316143644',
    '17841400348662832',
    '',                         -- no confirmed ad account
    'es',
    'America/Panama'
  ),
  (
    'ana',
    'En la Galería de Ana',
    'Fotografía de bodas',
    TRUE,
    '1043326452200695',
    '17841450875047591',
    'act_2189268925168947',
    'es',
    'America/Panama'
  ),
  (
    'drivip',
    'DRIVIP',
    'Transporte privado y traslados',
    TRUE,
    '1158307954030806',
    '17841447217470964',
    'act_1861455161486718',
    'es',
    'America/Panama'
  )
ON CONFLICT (brand_id) DO UPDATE SET
  brand_name            = EXCLUDED.brand_name,
  business_unit         = EXCLUDED.business_unit,
  facebook_page_id      = EXCLUDED.facebook_page_id,
  instagram_business_id = EXCLUDED.instagram_business_id,
  meta_ad_account_id    = EXCLUDED.meta_ad_account_id,
  updated_at            = NOW();
