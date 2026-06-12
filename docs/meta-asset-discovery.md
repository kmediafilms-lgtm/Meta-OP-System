# Meta Asset Discovery

## Purpose

This module helps WEDO Meta OS discover Meta assets in bulk instead of manually copying IDs one by one.

It is designed for **read-only discovery** of:

- Business Managers available to the authenticated user
- Owned Facebook Pages
- Client/shared Facebook Pages
- Instagram Business Accounts connected to each Page
- Owned Ad Accounts
- Client/shared Ad Accounts
- Basic ad account status
- Suggested brand configuration blocks

This module does **not** send messages, modify campaigns, publish content, change budgets, or write credentials.

---

## Recommended activation order

1. Generate or provide a valid Meta access token with read permissions.
2. Set `META_ACCESS_TOKEN` locally, never in GitHub.
3. Optionally set `META_BUSINESS_ID` if the Business ID is already known.
4. Run the asset discovery script.
5. Review the output manually.
6. Copy approved values into `.env` and each `brands/*/brand-config.json`.
7. Do not activate message sending until routing and brand matching are verified.

---

## Required permissions

Minimum read-oriented permissions depend on which assets are being queried. Start with the least possible access.

Suggested permissions for discovery:

```text
business_management
pages_show_list
pages_read_engagement
pages_manage_metadata
instagram_basic
ads_read
```

For WhatsApp discovery later, additional WhatsApp Business permissions may be required. Do not add WhatsApp automation until Instagram and Ads read-only are stable.

---

## Environment variables

Create these locally only:

```bash
META_ACCESS_TOKEN="your_meta_token_here"
META_BUSINESS_ID="optional_business_id_here"
GRAPH_API_VERSION="v25.0"
```

Never commit `.env`, tokens, app secrets, system user tokens, page tokens, or WhatsApp tokens.

---

## Endpoints used

```http
GET /me/businesses?fields=id,name
GET /{BUSINESS_ID}/owned_pages?fields=id,name,username,link
GET /{BUSINESS_ID}/client_pages?fields=id,name,username,link
GET /{PAGE_ID}?fields=name,instagram_business_account
GET /{BUSINESS_ID}/owned_ad_accounts?fields=id,name,account_id,account_status,currency,timezone_name
GET /{BUSINESS_ID}/client_ad_accounts?fields=id,name,account_id,account_status,currency,timezone_name
```

---

## Output format

The output should follow this structure:

```json
{
  "business": {
    "id": "",
    "name": ""
  },
  "pages": [
    {
      "page_id": "",
      "page_name": "",
      "username": "",
      "link": "",
      "instagram_business_id": "",
      "source": "owned_pages",
      "matched_brand_guess": "needs_review"
    }
  ],
  "ad_accounts": [
    {
      "ad_account_id": "act_",
      "account_id": "",
      "name": "",
      "status": "",
      "currency": "",
      "timezone_name": "",
      "source": "owned_ad_accounts",
      "matched_brand_guess": "needs_review"
    }
  ],
  "brand_config_suggestions": [
    {
      "brand_id": "needs_review",
      "brand_name": "",
      "facebook_page_id": "",
      "instagram_business_id": "",
      "meta_ad_account_id": ""
    }
  ]
}
```

---

## Brand matching rules

The script makes conservative guesses only. It should never pretend certainty when the names are ambiguous.

Initial matching hints:

| Brand | Matching text |
|---|---|
| KMediaFilms | `kmedia`, `k media`, `kmediafilms`, `k media films` |
| En la Galería de Ana | `galeria de ana`, `galería de ana`, `ana` |
| DRIVIP | `drivip`, `dri vip`, `driveip` |

If confidence is low, use:

```text
needs_review
```

---

## What Ricardo must review manually

- Which Page belongs to which brand
- Whether the Instagram Business Account is connected to the correct Page
- Which Ad Account belongs to each brand
- Whether any duplicated, restricted, old, or client assets appear
- Whether Pages are owned or only shared/client assets
- Whether Meta permissions are enough for production

---

## Non-negotiable safety rules

- Do not write `.env` automatically.
- Do not update brand configs automatically without approval.
- Do not request write permissions for discovery.
- Do not use browser automation or scraping.
- Do not send messages.
- Do not modify ads.
- Do not create campaigns.
- Do not connect WhatsApp before Instagram and Ads read-only are stable.

---

## Command

From the repository root:

```bash
META_ACCESS_TOKEN="your_token" META_BUSINESS_ID="optional_business_id" node scripts/meta-discover-assets.js
```

To save output locally:

```bash
META_ACCESS_TOKEN="your_token" META_BUSINESS_ID="optional_business_id" node scripts/meta-discover-assets.js > outputs/meta-assets.local.json
```

`outputs/meta-assets.local.json` should not be committed if it contains real asset IDs you consider private.
