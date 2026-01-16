# System Architecture

## 🔍 High-Level Design

OBrain OConnector follows a **Serverless Edge Architecture**. The core logic resides in a distributed network of Cloudflare Workers, interacting with a globally replicated SQLite database (D1).

```mermaid
graph TD
    User[Admin User] -->|HTTPS| CDN[Cloudflare CDN]
    CDN --> Frontend[React SPA (Pages)]
    CDN --> API[Backend Worker (Hono)]
    
    subgraph "Edge Infrastructure"
        API --> DB[(D1 Database - SQLite)]
        API --> KV[(KV Cache - Tokens)]
        API --> R2[(R2 Storage - Images)]
    end
    
    subgraph "Autonomous Agents"
        Cron[Cron Trigger] -->|Every 10m| PriceAgent[Price Watch Agent]
        PriceAgent -->|Query| DB
        PriceAgent -->|Scrape| VPS[VPS Scraper Microservice]
        PriceAgent -->|API| Google[Google Search API]
        PriceAgent -->|API| ML[Mercado Livre API]
    end
```

## 🧠 The Agentic Core

The heart of the automation is the **Price Watch Agent** (`price-watch.ts`). It operates autonomously to ensure the catalog remains competitive.

### Workflow
1.  **Selection**: The agent selects `N` products that haven't been updated recently (`ORDER BY updatedAt ASC`).
2.  **Strategy**:
    *   **Primary**: Checks a specialized Python/Playwright microservice running on a VPS to bypass tough CAPTCHAs (Bing Shopping).
    *   **Fallback**: If VPS is unreachable, fails over to Google Custom Search Engine (CSE) or Mercado Livre API.
3.  **Analysis**:
    *   compares the found minimum competitor price against the supplier cost + tax + shipping.
    *   **Decision**: If `CompetitorPrice < Cost * 1.15` (15% margin), the product is marked `active=false` (Unviable).
4.  **Rotation**: Updates the `updatedAt` timestamp regardless of success to ensure fair queue rotation and prevent "head-of-line blocking".

## 💾 Data Model (Drizzle ORM)

We use **Drizzle ORM** for type-safe database interactions.

### Key Tables
-   `products`: The master catalog. Contains `supplierPrice`, `competitorMinPrice`, `isPriceViable`.
-   `competitor_prices`: Historical record of all scans.
-   `users`: Authentication and role management.
-   `orders`: Syncs with external marketplaces.

## 🔒 Security

-   **Authentication**: JWT-based auth via HTTP Headers.
-   **Role-Based Access Control (RBAC)**: Middleware enforcement for Admin vs User routes.
-   **Environment Isolation**: Separate D1 databases for `preview` and `production` environments.
