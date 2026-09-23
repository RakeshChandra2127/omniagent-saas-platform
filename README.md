# OmniAgent SaaS Core

> **A production-grade, multi-tenant AI Agent Orchestration Platform built on the MEAN stack with TypeScript.**

A full-stack SaaS application that enables businesses to configure AI-powered conversational agents, manage a real-time inbox of customer conversations, and automatically convert conversations into CRM leads and bookings — all through an integrated platform.

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Angular](https://img.shields.io/badge/Angular-18-red?logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-8-green?logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?logo=socket.io)
![BullMQ](https://img.shields.io/badge/BullMQ-5-red)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-purple?logo=openai)

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Real-Time Architecture](#real-time-architecture)
- [LLM Orchestration & Tool Calling](#llm-orchestration--tool-calling)
- [Multi-Tenant Data Model](#multi-tenant-data-model)
- [Queue System & Background Jobs](#queue-system--background-jobs)
- [Observability & Monitoring](#observability--monitoring)
- [Environment Variables](#environment-variables)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        Angular Frontend                          │
│  ┌─────────┐  ┌──────────────┐  ┌──────────┐  ┌──────────────┐ │
│  │  Login   │  │ Agent Config │  │  Inbox   │  │ CRM (Leads,  │ │
│  │ Register │  │  (5-tab UI)  │  │(Realtime)│  │  Bookings)   │ │
│  └─────────┘  └──────────────┘  └──────────┘  └──────────────┘ │
│            ↕ HTTP (REST)          ↕ WebSocket (Socket.io)        │
├──────────────────────────────────────────────────────────────────┤
│                      Express.js API Gateway                      │
│  ┌────────┐  ┌──────┐  ┌───────────┐  ┌──────────┐  ┌────────┐ │
│  │  Auth  │  │ RBAC │  │ Rate Limit│  │ Validate │  │  CORS  │ │
│  └────────┘  └──────┘  └───────────┘  └──────────┘  └────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                       Service Layer                              │
│  ┌─────────┐  ┌──────────┐  ┌──────┐  ┌────────┐  ┌──────────┐ │
│  │  Agent  │  │Conversat-│  │ Lead │  │Booking │  │ Webhook  │ │
│  │ Config  │  │  ions    │  │      │  │        │  │          │ │
│  └─────────┘  └──────────┘  └──────┘  └────────┘  └──────────┘ │
│                       ↕                                          │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │              LLM Orchestration Service                       ││
│  │  OpenAI GPT-4o ← Function Calling → save_lead,              ││
│  │                                      book_appointment        ││
│  │  • System prompt builder from Agent Config                   ││
│  │  • Tool-call loop with re-prompting                          ││
│  │  • Rate-limit & context-overflow handling                    ││
│  └──────────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────────┤
│               Async Infrastructure                               │
│  ┌──────────────┐    ┌──────────────┐    ┌─────────────────────┐ │
│  │  BullMQ       │    │ Socket.io    │    │   Redis             │ │
│  │  • webhook-   │    │ • Tenant     │    │   • Queue backend   │ │
│  │    processing │    │   rooms      │    │   • Pub/Sub         │ │
│  │  • message-   │    │ • Conv       │    │   • Session store   │ │
│  │    processing │    │   rooms      │    │                     │ │
│  │  • notification│   │ • JWT auth   │    │                     │ │
│  └──────────────┘    └──────────────┘    └─────────────────────┘ │
├──────────────────────────────────────────────────────────────────┤
│                        MongoDB                                   │
│  Tenants │ Users │ AgentConfigs │ Contacts │ Conversations       │
│  Messages │ Leads │ Bookings                                     │
│  ► Compound indexes on (tenantId, ...) for every collection      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 🤖 Agent Configurator
- Multi-tab configuration UI: Basic Info, AI Config, Persona & Guardrails, Knowledge Base, Tools
- Configurable LLM provider (OpenAI/Anthropic/Gemini), model, temperature, max tokens
- System prompt editor with rich persona controls (tone, language, personality)
- Dynamic knowledge base with add/remove entries
- Guardrails: blocked topics, max conversation turns, sensitive data handling, human-approval toggle

### 📨 Real-Time Inbox
- Two-panel layout: conversation list (left) + message thread (right)
- Live WebSocket streaming — new messages and conversations appear instantly
- Message bubbles: user (blue, right-aligned) vs. assistant (gray, left-aligned)
- Tool-call result cards (lead saved, appointment booked)
- Typing indicator while AI processes
- Status filtering (All, Active, Waiting, Resolved)
- Auto-scroll to latest messages

### 🧲 CRM / Lead Management
- Automatic lead extraction via LLM function calling
- Lead pipeline with status tracking (New → Contacted → Qualified → Won/Lost)
- Priority levels, extracted data fields (name, email, phone, company, budget, timeline)
- Notes system for each lead
- Contact management with phone/email dedup

### 📅 Booking System
- AI-triggered appointment booking via tool calling
- Booking lifecycle: Pending → Confirmed → Completed/Cancelled/No-Show
- Attendee management, reminders, calendar integration hooks

### 🔗 Webhook Ingestion (WhatsApp Business API)
- `/api/webhooks/whatsapp` endpoint for Meta's webhook verification + message reception
- Non-blocking processing via BullMQ queues
- Automatic contact creation, conversation routing, and LLM response generation
- Retry logic with exponential backoff (3 attempts)

### 🔒 Multi-Tenant Architecture
- Complete tenant isolation — every query scoped by `tenantId`
- Role-Based Access Control: Super Admin, Tenant Admin, Agent Manager, Viewer
- JWT authentication with token-based WebSocket auth
- Tenant-aware rate limiting

### 📊 Analytics Dashboard
- Summary cards: Total Conversations, Active, Leads, Bookings, Messages Today
- Real-time metric updates

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Angular 18, Angular Material, RxJS | Standalone components, reactive UI |
| **Backend** | Node.js, Express.js | REST API, middleware pipeline |
| **Database** | MongoDB, Mongoose 8 | Multi-tenant data storage |
| **Real-time** | Socket.io 4.8 | Live inbox, event streaming |
| **Queue** | BullMQ 5, Redis | Async webhook processing, retries |
| **AI** | OpenAI GPT-4o | Function calling / tool use |
| **Auth** | JWT, bcryptjs | Token auth, password hashing |
| **Validation** | Zod | Request schema validation |
| **Logging** | Winston | Structured logging |
| **Metrics** | prom-client | Prometheus-compatible metrics |
| **Language** | TypeScript 5.6 (strict) | End-to-end type safety |

---

## Project Structure

```
omniagent-saas-core/
├── backend/
│   ├── src/
│   │   ├── app.ts                    # Express app entry point
│   │   ├── config/
│   │   │   ├── index.ts              # Environment config singleton
│   │   │   ├── database.ts           # MongoDB connection with retry
│   │   │   ├── redis.ts              # IORedis connection factory
│   │   │   └── logger.ts             # Winston logger setup
│   │   ├── models/
│   │   │   ├── tenant.model.ts       # Tenant schema (plan, settings, billing)
│   │   │   ├── user.model.ts         # User schema (RBAC, bcrypt hooks)
│   │   │   ├── agent-config.model.ts # Agent configuration schema
│   │   │   ├── contact.model.ts      # CRM contact schema
│   │   │   ├── conversation.model.ts # Conversation schema
│   │   │   ├── message.model.ts      # Message schema
│   │   │   ├── lead.model.ts         # CRM lead schema
│   │   │   ├── booking.model.ts      # Booking/appointment schema
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts     # JWT authentication
│   │   │   ├── rbac.middleware.ts     # Role-based authorization
│   │   │   ├── tenant.middleware.ts   # Tenant context scoping
│   │   │   ├── validate.middleware.ts # Zod schema validation
│   │   │   └── error.middleware.ts    # Global error handler
│   │   ├── services/
│   │   │   ├── auth.service.ts       # Register/login/JWT
│   │   │   ├── agent-config.service.ts
│   │   │   ├── conversation.service.ts
│   │   │   ├── message.service.ts
│   │   │   ├── contact.service.ts
│   │   │   ├── lead.service.ts
│   │   │   ├── booking.service.ts
│   │   │   ├── llm.service.ts        # LLM orchestration + tool calling
│   │   │   └── webhook.service.ts    # WhatsApp webhook parsing
│   │   ├── routes/
│   │   │   ├── auth.routes.ts        # POST /register, /login, GET /me
│   │   │   ├── agent-config.routes.ts# CRUD + knowledge base
│   │   │   ├── conversation.routes.ts
│   │   │   ├── contact.routes.ts
│   │   │   ├── lead.routes.ts
│   │   │   ├── booking.routes.ts
│   │   │   ├── webhook.routes.ts     # WhatsApp verification + ingestion
│   │   │   ├── analytics.routes.ts   # Dashboard aggregation
│   │   │   └── index.ts              # Route mounting
│   │   ├── queues/
│   │   │   ├── queue.config.ts       # BullMQ queue definitions
│   │   │   ├── webhook.worker.ts     # Webhook processing worker
│   │   │   ├── notification.worker.ts# Notification delivery worker
│   │   │   └── index.ts
│   │   ├── websocket/
│   │   │   ├── socket.service.ts     # Socket.io init, auth, rooms
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── app-error.ts          # Custom error class
│   │       ├── async-handler.ts      # Async route wrapper
│   │       └── helpers.ts            # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.ts                   # Standalone bootstrap
│   │   ├── index.html
│   │   ├── styles.css
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   └── app/
│   │       ├── app.component.ts/html/css  # Layout with sidenav
│   │       ├── app.routes.ts              # Route definitions
│   │       ├── core/
│   │       │   ├── services/
│   │       │   │   ├── auth.service.ts    # Auth state + JWT
│   │       │   │   ├── api.service.ts     # Generic HTTP client
│   │       │   │   ├── socket.service.ts  # Socket.io + RxJS
│   │       │   │   ├── agent.service.ts
│   │       │   │   ├── conversation.service.ts
│   │       │   │   ├── contact.service.ts
│   │       │   │   ├── lead.service.ts
│   │       │   │   ├── booking.service.ts
│   │       │   │   └── notification.service.ts
│   │       │   ├── guards/auth.guard.ts
│   │       │   └── interceptors/auth.interceptor.ts
│   │       ├── features/
│   │       │   ├── auth/
│   │       │   │   ├── login/             # Login form
│   │       │   │   └── register/          # Registration form
│   │       │   ├── dashboard/             # Analytics cards
│   │       │   ├── inbox/                 # Real-time 2-panel inbox
│   │       │   ├── agent-config/
│   │       │   │   ├── agent-list/        # Agent list table
│   │       │   │   └── agent-config/      # 5-tab config editor
│   │       │   ├── contacts/              # Contact list table
│   │       │   ├── leads/                 # Lead pipeline table
│   │       │   └── bookings/              # Booking list table
│   │       └── shared/
│   │           ├── pipes/time-ago.pipe.ts
│   │           ├── pipes/truncate.pipe.ts
│   │           └── components/status-badge/
│   ├── angular.json
│   ├── proxy.conf.json
│   ├── package.json
│   └── tsconfig.json / tsconfig.app.json
├── shared/
│   └── types/                        # Shared TypeScript interfaces
│       ├── tenant.types.ts
│       ├── user.types.ts
│       ├── agent.types.ts
│       ├── conversation.types.ts
│       ├── message.types.ts
│       ├── contact.types.ts
│       ├── lead.types.ts
│       ├── booking.types.ts
│       ├── api.types.ts
│       ├── events.types.ts
│       └── index.ts
├── docker-compose.yml                # MongoDB + Redis
├── .env.example
├── .gitignore
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20 LTS
- **npm** ≥ 10
- **MongoDB** ≥ 7 (local or Atlas)
- **Redis** ≥ 7 (local or cloud)
- **OpenAI API Key** (for LLM features)

### 1. Clone the Repository

```bash
git clone https://github.com/RakeshChandra2127/project-1.git
cd project-1
```

### 2. Start Infrastructure (Docker)

```bash
docker-compose up -d
```

This starts MongoDB (port 27017) and Redis (port 6379).

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values:
#   OPENAI_API_KEY=sk-...
#   JWT_SECRET=your-secret-key
#   MONGODB_URI=mongodb://localhost:27017/omniagent
#   REDIS_URL=redis://localhost:6379
```

### 4. Install & Run Backend

```bash
cd backend
npm install
npm run dev
# Server starts on http://localhost:3000
```

### 5. Install & Run Frontend

```bash
cd frontend
npm install
npm start
# App opens at http://localhost:4200
```

### 6. Test the Flow

1. **Register** a new account at `/register` — this creates a Tenant + Admin User
2. **Create an Agent** in the Agent Configurator — set a system prompt, knowledge base, and guardrails
3. **Simulate a webhook** (send a POST to `/api/webhooks/whatsapp`):

```bash
curl -X POST http://localhost:3000/api/webhooks/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "BUSINESS_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551234567",
            "phone_number_id": "PHONE_ID"
          },
          "contacts": [{ "profile": { "name": "John Doe" }, "wa_id": "919876543210" }],
          "messages": [{
            "from": "919876543210",
            "id": "wamid.test123",
            "timestamp": "1700000000",
            "text": { "body": "Hi, I am interested in your enterprise plan. My email is john@acme.com" },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

4. **Watch the Inbox** — the message appears in real-time, the AI responds, and a lead is automatically created in the CRM

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register tenant + admin user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user profile |

### Agent Configuration
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List agent configs |
| POST | `/api/agents` | Create agent config |
| GET | `/api/agents/:id` | Get agent config |
| PUT | `/api/agents/:id` | Update agent config |
| DELETE | `/api/agents/:id` | Archive agent config |
| PUT | `/api/agents/:id/knowledge-base` | Update knowledge base |

### Conversations & Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations` | List conversations (filterable) |
| GET | `/api/conversations/:id` | Get conversation detail |
| PATCH | `/api/conversations/:id/status` | Update status |
| GET | `/api/conversations/:id/messages` | Get messages (paginated) |

### CRM
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/contacts` | List/create contacts |
| GET/PUT | `/api/contacts/:id` | Get/update contact |
| GET/POST | `/api/leads` | List/create leads |
| GET/PUT | `/api/leads/:id` | Get/update lead |
| POST | `/api/leads/:id/notes` | Add note to lead |
| GET/POST | `/api/bookings` | List/create bookings |
| POST | `/api/bookings/:id/cancel` | Cancel booking |

### Webhooks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/webhooks/whatsapp` | Webhook verification |
| POST | `/api/webhooks/whatsapp` | Receive webhook events |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard summary |

---

## Real-Time Architecture

The platform uses **Socket.io** for all real-time features. Connections are authenticated via JWT and organized into rooms:

```
Socket.io Connection Flow:
1. Client connects with JWT in handshake.auth
2. Server verifies JWT, extracts { userId, tenantId, role }
3. Client auto-joins: tenant:{tenantId}, user:{userId}
4. Client manually joins: conversation:{conversationId} (on selection)

Event Flow (Webhook → Inbox):
WhatsApp Webhook → Express Route → BullMQ Queue → Worker
  ├→ Save message to MongoDB
  ├→ Emit 'new_message' to conversation room
  ├→ Emit 'conversation_updated' to tenant room
  ├→ Call LLM with tool definitions
  ├→ If tool_calls → Execute (save lead / book appointment)
  ├→ Re-prompt LLM with tool results
  ├→ Save AI response to MongoDB
  └→ Emit 'new_message' to conversation room
```

### Socket Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `authenticate` | Client → Server | `{ token }` | JWT auth |
| `join_conversation` | Client → Server | `conversationId` | Join conv room |
| `leave_conversation` | Client → Server | `conversationId` | Leave conv room |
| `new_message` | Server → Client | `Message` | New message |
| `conversation_updated` | Server → Client | `Conversation` | Conv status change |
| `lead_created` | Server → Client | `Lead` | Auto-extracted lead |
| `booking_created` | Server → Client | `Booking` | Auto-booked appt |

---

## LLM Orchestration & Tool Calling

The `LlmService` implements the complete OpenAI Function Calling loop:

```
User Message → Build System Prompt (from AgentConfig)
              → Assemble conversation history (last 20 messages)
              → Call OpenAI with tools: [save_lead, book_appointment]
              → If finish_reason === 'tool_calls':
                  → Execute each tool (write to MongoDB)
                  → Re-prompt LLM with tool results
                  → Return natural language response
              → If no tools: return direct response
              → Error handling: rate limits, context overflow, fallbacks
```

### Tool Definitions

**`save_lead`** — Triggered when a user shares contact info or buying intent:
- Extracts: name, email, phone, company, requirement, budget, timeline
- Creates a Lead document in MongoDB with `status: 'new'`
- Emits `lead_created` via WebSocket

**`book_appointment`** — Triggered when a user wants to schedule a meeting:
- Extracts: title, description, scheduledAt, duration, timezone, attendee info
- Creates a Booking document in MongoDB with `status: 'confirmed'`
- Emits `booking_created` via WebSocket

---

## Multi-Tenant Data Model

Every collection uses `tenantId` as the first field in compound indexes for query isolation and performance:

```
Tenant ─┬── Users (RBAC: super_admin, tenant_admin, agent_manager, viewer)
         ├── AgentConfigs (LLM settings, persona, guardrails, knowledge base)
         ├── Contacts (phone/email dedup, lead status tracking)
         ├── Conversations (per-contact, per-agent, per-channel)
         │    └── Messages (user/assistant/system/tool roles)
         ├── Leads (auto-extracted from conversations)
         └── Bookings (auto-created from conversations)

Key Indexes:
  users:         { tenantId: 1, email: 1 } UNIQUE
  agent_configs: { tenantId: 1, name: 1 } UNIQUE
  contacts:      { tenantId: 1, phone: 1 } UNIQUE SPARSE
  conversations: { tenantId: 1, status: 1, lastMessageAt: -1 }
  messages:      { conversationId: 1, createdAt: 1 }
  leads:         { tenantId: 1, status: 1, createdAt: -1 }
  bookings:      { tenantId: 1, scheduledAt: 1 }
```

---

## Queue System & Background Jobs

BullMQ with Redis handles all asynchronous processing:

| Queue | Purpose | Retry Policy |
|-------|---------|-------------|
| `webhook-processing` | Process incoming WhatsApp webhooks | 3 attempts, exponential backoff |
| `message-processing` | LLM calls + response generation | 3 attempts, exponential backoff |
| `notification` | Email/SMS/WhatsApp notifications | 3 attempts, linear backoff |

### Why Queues?

1. **Non-blocking webhooks**: Return 200 to Meta immediately, process async
2. **Retry on failure**: LLM API outages, DB timeouts → automatic retry
3. **Rate limit handling**: Queue controls throughput to avoid provider rate limits
4. **Observability**: Track job success/failure rates, processing latency

---

## Observability & Monitoring

### Structured Logging (Winston)

```typescript
// Every log includes: timestamp, service, level, message, metadata
logger.info('Webhook processed', {
  tenantId, conversationId, contactId,
  latencyMs: 142, provider: 'openai', model: 'gpt-4o'
});
```

### Metrics (prom-client)

The app exposes Prometheus-compatible metrics at `GET /metrics`:

```
# API Performance
http_request_duration_seconds{method, route, status_code}
http_requests_total{method, route, status_code}

# Queue Health
bullmq_jobs_completed_total{queue}
bullmq_jobs_failed_total{queue}
bullmq_job_duration_seconds{queue}
bullmq_queue_depth{queue}

# LLM Performance
llm_request_duration_seconds{provider, model}
llm_tokens_used_total{provider, model, type}
llm_tool_calls_total{tool_name}

# WebSocket
websocket_connections_active{tenant}
websocket_messages_total{event}
```

### Health Check

```bash
GET /api/health
→ { status: "ok", mongo: "connected", redis: "connected", uptime: 3600 }
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/omniagent` | MongoDB connection |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection |
| `JWT_SECRET` | Yes | — | JWT signing secret |
| `JWT_EXPIRES_IN` | No | `7d` | Token expiry |
| `OPENAI_API_KEY` | Yes | — | OpenAI API key |
| `WHATSAPP_VERIFY_TOKEN` | No | — | WhatsApp webhook verification |
| `CORS_ORIGIN` | No | `http://localhost:4200` | Allowed CORS origin |
| `LOG_LEVEL` | No | `info` | Winston log level |

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Tenant-scoped compound indexes** | Every query hits `tenantId` first — ensures O(log n) lookups within a tenant, not across all tenants |
| **BullMQ over in-process** | Webhooks must return 200 instantly. Processing is deferred to Redis-backed queues with automatic retries |
| **Socket.io rooms by tenant + conversation** | Users only receive events for their tenant. Opening a conversation subscribes to its specific room |
| **LLM tool-call re-prompting** | After executing tools, we send results back to the LLM so it crafts a natural confirmation message |
| **Standalone Angular components** | Angular 18 best practice — no NgModules, tree-shakable, faster compilation |
| **Shared types package** | TypeScript interfaces shared between frontend/backend ensure API contract consistency |

---

## License

MIT

---

**Built by [Rakesh Chandra](https://github.com/RakeshChandra2127)** — Full-Stack Platform Engineer
