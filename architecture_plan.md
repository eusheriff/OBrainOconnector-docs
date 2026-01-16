# Refine Data & Integrations (Brazil Warehouse & Competitor Prices)

## Goal Description
Restrict product imports to **CJ Dropshipping Brazil Warehouse** only and fix the missing "Competitor Price" data by enabling the Price Watch agent in the scheduled cron.

## Proposed Changes

### Backend Worker

#### [MODIFY] [cj-webhook.ts](file:///Volumes/LexarAPFS/OBrain-Oconnect/OBrain-OConnect/backend-worker/src/routes/cj-webhook.ts)
-   Update `POST /import` endpoint.
-   Add `countryCode: 'BR'` and `isWarehouse: true` to `cjService.getProductList` call.
-   This ensures manual imports via this endpoint only fetch local stock.

#### [MODIFY] [scheduler.ts](file:///Volumes/LexarAPFS/OBrain-Oconnect/OBrain-OConnect/backend-worker/src/services/scheduler.ts)
-   Import `PriceWatchAgent` from `./agents/price-watch`.
-   Instantiate `PriceWatchAgent` with `env`.
-   Call `await priceWatch.scanCompetitors(5)` (limit 5 per run to avoid rate limits) inside `syncProducts`.
-   This ensures `competitorMinPrice` is gradually populated.

## Verification Plan

### Automated Verification
1.  **Import**: Trigger `POST /api/cj/webhook/import?page=1&size=5&clear=false`.
    -   Verify logs show "Brazil" specific params or check `sourceUrl` of imported products? (CJ API handles the logic).
    -   Check database for new products.
2.  **Price Watch**: Trigger `POST /api/cron` (or wait for cron).
    -   Check `competitor_prices` table for new entries.
    -   Check `products.competitorMinPrice` is not null.

### Manual Verification
1.  User checks Dashboard -> Products.
2.  "Concorrente" column should start showing values (might take time to fill all).
3.  New products should be Brazil-based.
