# GoldMetrics — GoldCheck Web App (`goldcheck-webapp`)

## Overview

GoldCheck is a Vue 3 + Vite application organized with a domain-driven design (DDD) style.
It is the front-end of the **GoldMetrics** platform, a gold traceability solution that follows
the metal from **mining extraction → jewelry certification → final-consumer verification**.

The project models each feature by bounded context and keeps business concepts separated
from UI and infrastructure concerns. It consumes a real ASP.NET Core backend (RESTful API
documented with OpenAPI/Swagger) and supports three user segments: **mining, jewelry and
consumer**, plus subscriptions and billing with Stripe.

## Goals

* Show a practical front-end architecture with DDD-inspired layering.
* Keep domain concepts explicit (`entity`, `assembler`, `store`, `api`).
* Cover real use cases: traceability, certification, analytics, subscriptions (Stripe), i18n and routing.

## Tech Stack

* Vue 3 (`<script setup>`)
* Vite
* Pinia
* Vue Router (hash history)
* Vue I18n (English / Spanish)
* PrimeVue + PrimeFlex + PrimeIcons (Material theme)
* Axios
* `qrcode` + `html5-qrcode` (QR generation and scanning)
* `jsPDF` (certificate / report export)
* Stripe Checkout (hosted, via the backend)

## Project Structure (DDD-Oriented)

Each bounded context follows the same four-layer structure:

```
src/
  iam/                            # Identity & Access Management
  fleet-operations/               # Mining fleet & hauling cycles
  material-operations/            # Mineral typing & shrinkage
  jewelry-inventory-certification/# Jewelry pieces, purity, QR, certificates
  consumer-traceability/          # Consumer verification & traceability sheet
  analytics/                      # Mining shrinkage & jewelry validated volume
  monitoring-telemetry/           # Checkpoints, alerts, telemetry
  incident-management/            # Incidents
  asset-maintenance/              # Machinery maintenance
  reporting-notifications/        # Reporting
  subscriptions-billing/          # Plans & Stripe checkout
  shared/                         # Cross-context infrastructure & UI

  <context>/
    domain/          # Domain model (entities)
    application/     # Use-case orchestration (Pinia stores)
    infrastructure/  # API clients and assemblers
    presentation/    # Views and route declarations
```

## Bounded Contexts

* **IAM** — authentication (sign in / sign up), profile, plan onboarding.
* **Fleet Operations** — vehicles, hauling cycles, weighing, custody, route start.
* **Material Operations** — mineral typing and shrinkage.
* **Jewelry Inventory & Certification** — register pieces, purity test, batch split,
  QR generation, PDF certificate, client gold, refinement, sales.
* **Consumer Traceability** — verify a piece, view the traceability life sheet
  (origin mine, mineral type, purity, authorized-seller badge), share, report irregularities.
* **Analytics** — mining monthly shrinkage chart, CSV export, jewelry validated volume.
* **Subscriptions & Billing** — plan comparison and **Stripe Checkout** upgrade flow.
* **Shared** — `BaseApi` (Axios), layout, sidebar, footer, status-label helper, i18n locales.

## Layer Responsibilities

* **Domain** — business concepts as plain JavaScript classes; framework-agnostic.
* **Application** — coordinates behavior and state through Pinia stores.
* **Infrastructure** — talks to the backend API and maps payloads via assemblers.
* **Presentation** — renders UI, calls store actions, reacts to state.

## Running the Project

### Prerequisites

* Node.js + npm installed (versions compatible with Vite).
* The GoldMetrics backend running (locally or on Azure) — see the backend `README-DEPLOY.md`.

### 1) Install dependencies

```
npm install
```

### 2) Start the app (development)

```
npm run dev
```

Opens at `http://localhost:5173`.

### 3) Build for production

```
npm run build
```

### 4) Preview the production build

```
npm run preview
```

## Environment Variables

Environment files included:

* `.env.development`
* `.env.production`

Main variable:

* `VITE_GOLDCHECK_API_URL` — base URL of the backend REST API.
  * Development: `http://localhost:5225/api/v1`
  * Production: `https://goldcheck-platform-wa.azurewebsites.net/api/v1`

Tip: if the backend runs on a different host/port, update `VITE_GOLDCHECK_API_URL`.

> The front-end holds **no** payment secrets. Stripe keys live only in the backend; the app
> just calls `POST /subscriptions/checkout` and is redirected to Stripe's hosted checkout.

## Routing Notes

* Uses **hash history** (`createWebHashHistory`), so routes look like `/#/app/...`.
  This matters for the Stripe success/cancel URLs, which must include `/#/`.
* Public routes: landing, `login`, `register`, `plan-selection`, `terms`, `privacy`.
* Authenticated routes live under `/app/*`, gated by the IAM store.
* The sidebar shows different sections per segment (mining / jewelry / consumer).

## Internationalization

* English and Spanish, under `src/locales/en.json` and `src/locales/es.json`.
* Backend status enums are localized through the shared `useStatusLabel` helper.
* No hard-coded UI text: components use `$t(...)` keys.

## Deployment

* Deployed on **Netlify** (`public/_redirects` handles SPA routing).
* Production build points to the Azure backend via `.env.production`.

## Recommended Development Practices

* Keep each feature inside its bounded context first; move to `shared` only when truly cross-context.
* Preserve layer boundaries (presentation does not call raw HTTP clients directly).
* Prefer explicit domain language in naming.
* Add or update i18n keys when introducing new UI text (both `en` and `es`).
