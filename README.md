# OBrain OConnector - Autonomous E-commerce Intelligence Hub

[![Cloudflare Workers](https://img.shields.io/badge/Run_on-Cloudflare_Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/) 
[![TypeScript](https://img.shields.io/badge/Built_with-TypeScript-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-yellowgreen)](https://orm.drizzle.team/)
[![React](https://img.shields.io/badge/Frontend-React_18-cyan?logo=react)](https://react.dev/)

> **Live Demo:** [hub.oconnector.tech](https://hub.oconnector.tech)  
> **Contact:** [dev@oconnector.tech](mailto:dev@oconnector.tech)

## 🚀 Overview

**OBrain OConnector** is a high-performance, edge-native e-commerce management system designed to automate the complexities of dropshipping and inventory management. Unlike traditional monolithic architectures, OBrain runs entirely on the **Edge (Cloudflare Workers)**, ensuring zero cold starts, global low latency, and infinite scalability.

The system features an **Autonomous Agentic Core** that manages pricing, stock levels, and competitor analysis without human intervention.

## ✨ Key Features

### 🤖 Autonomous Price Watch Agent
A self-healing, background-running AI agent that monitors competitor prices 24/7.
- **Multi-Source Scraping**: intelligently switches between local scraping, Google CSE, and a custom VPS Playwright microservice.
- **Smart Rotation**: Automatically prioritizes "stale" products and manages retry logic to avoid infinite loops on difficult targets.
- **Profit Guard**: Automatically disables products that become unprofitable due to supplier price hikes.

### ⚡ Edge-Native Architecture
- **Backend**: Built with **Hono** running on Cloudflare Workers.
- **Database**: **Cloudflare D1** (SQLite at the Edge) managed via **Drizzle ORM**.
- **Storage**: **Cloudflare R2** for image assets.
- **Caching**: **Cloudflare KV** for high-speed token and session management.

### 🛠️ Modern Tech Stack
- **Frontend**: React (Vite) + TailwindCSS + ShadcnUI.
- **Infrastructure**: Infrastructure-as-Code (IaC) via Wrangler.
- **Type Safety**: End-to-end TypeScript from database to frontend.

---

## 🏗️ Architecture

For a deep dive into the system design, including the Agent interaction model and database schema, please see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🔧 Deployment

The system is deployed using Cloudflare's `wrangler` CLI.

```bash
# Backend Deployment
cd backend-worker
npx wrangler deploy

# Schema Migration
npx wrangler d1 migrations apply obrain-db
```

## 📝 License

Proprietary Software. All rights reserved.
