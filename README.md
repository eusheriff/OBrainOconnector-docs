# OBrain OConnector - High Scale DropShipping Hub

**Live System**: [hub.oconnector.tech](https://hub.oconnector.tech)

## Overview
OBrain OConnector is a high-performance, autonomous DropShipping Hub/Aggregator designed to handle massive product catalogs and optimize competitive pricing in real-time. Built on **Cloudflare Workers**, **D1 (SQLite)**, and an Agentic Architecture.

## Architecture Highlights

### 1. The "Brain" (Autonomous Scheduler)
The core of the system is `scheduler.ts`, an autonomous cron worker that manages:
- **Product Lifecycle**: Automatically imports, updates, and deactivates products based on real-time data.
- **Competitive Intelligence**: 
    - **Price Watch Agent**: Scans competitors (Mercado Livre, Google Shopping) hourly.
    - **Dynamic Logic**: Enforces strict visibility rules:
      > `Active = (Stock > 0) && (Base Price < Competitor Min Price)`
- **Stock Synchronization**: Hybrid sync with CJ Dropshipping and AliExpress APIs.

### 2. Pricing Engine
- **Base Price**: `(Supplier Cost * USD Rate) * Plan Markup`.
- **Dynamic Shipping**: Calculated at checkout based on user location (Mini Envios / PAC Proxy).
- **Viability Check**: The system automatically hides products that become uncompetitive due to currency fluctuations or competitor price drops.

### 3. Agentic Workflow
- **PriceWatchAgent**: Periodic scanning of competitor prices.
- **TrendSpotter**: Identifies winning products from social signals (TikTok/Meta).
- **CopyMaster**: Automated listing enhancement and description generation.

## Technical Stack
- **Runtime**: Cloudflare Workers (Edge Computing)
- **Database**: Cloudflare D1 (Distributed SQLite)
- **Frontend**: React + Vite (Dashboard)
- **Language**: TypeScript (Strict Mode)

## Documentation Index
- [System Walkthrough & Logic](./technical_walkthrough.md) - Detailed log of recent architectural decisions.
- [Implementation Plan](./architecture_plan.md) - Technical roadmap and feature breakdown.
- [Database Schema](./database_schema.ts) - Complete Drizzle ORM schema definition.
- [Task History](./task_history.md) - Development log and milestone tracking.

---
*Generated automatically from the OBrain codebase for technical portfolio demonstration.*
