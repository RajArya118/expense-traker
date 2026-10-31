# ExpenseFlow — Architecture & Codebase Documentation

> **Project Name:** ExpenseFlow  
> **Type:** Full-Stack Personal Finance & Expense Management SaaS  
> **Framework:** Next.js 15 (App Router) + React 19 + TypeScript 5  
> **Styling:** Tailwind CSS 3  
> **Database & ORM:** PostgreSQL + Prisma ORM 6  
> **State Management:** Hybrid (React Context + Server Actions)  

---

## Table of Contents
1. [Executive Overview](#1-executive-overview)
2. [High-Level System Architecture](#2-high-level-system-architecture)
3. [Complete Directory & Code Structure Map](#3-complete-directory--code-structure-map)
4. [Database Schema & Data Modeling](#4-database-schema--data-modeling)
5. [State Management & Data Flow](#5-state-management--data-flow)
6. [Authentication & Security Architecture](#6-authentication--security-architecture)
7. [Frontend Design System & Component Hierarchy](#7-frontend-design-system--component-hierarchy)
8. [App Routing & Navigation Map](#8-app-routing--navigation-map)
9. [Resilience & Development Fallback Strategy](#9-resilience--development-fallback-strategy)
10. [Development, Build & Verification Workflow](#10-development-build--verification-workflow)

---

## 1. Executive Overview

**ExpenseFlow** is an enterprise-grade financial management application built to provide real-time transaction tracking, automated cash-flow categorization, visual budget planning, and multi-wallet balance aggregation.

### Key Technical Pillars:
- **Next.js 15 App Router & React 19:** Leverages modern Server Components (RSC) for initial page loads and Client Components for dynamic, interactive financial dashboards.
- **Strict TypeScript:** 100% end-to-end type safety across the database models, server actions, API boundaries, and UI components.
- **Tailwind CSS Design System:** Modern finance SaaS aesthetics inspired by Stripe and Linear, featuring custom micro-interactions, responsive sidebars, accessible modals, and dark mode support.
- **Prisma ORM with PostgreSQL:** Type-safe database queries with UUID primary keys, exact Decimal monetary precision (`Decimal(12, 2)`), relational cascading deletes, and optimized query indexes.
- **Stateless HMAC-SHA256 Authentication:** Encrypted JWT session cookies paired with Bcrypt password hashing and Edge-ready Next.js Middleware.

---

## 2. High-Level System Architecture

The following diagram illustrates how user requests travel through ExpenseFlow's four-layer architecture:

```mermaid
flowchart TD
    subgraph Client_Layer ["Client Layer (Browser)"]
        UI["React 19 Components (AppShell / UI Primitives)"]
        CTX["ExpenseContext (Global Client State)"]
        CHARTS["Recharts Engine (SVG Data Visualizations)"]
        UI <--> CTX
        CTX --> CHARTS
    end

    subgraph Routing_Security ["Routing & Security Layer"]
        MW["src/middleware.ts (Edge JWT Protection)"]
        PAGES["src/app/ Route Handlers & Pages"]
        ACTIONS["src/actions/ (Next.js Server Actions)"]
        MW --> PAGES
        PAGES --> ACTIONS
    end

    subgraph Business_Layer ["Business Logic & Validation Layer"]
        VAL["src/lib/validations/ (Zod Schemas)"]
        AUTH["src/lib/auth/ (Bcrypt + Jose JWT Engine)"]
        CALC["Financial Analytics & Budget Warning Engine"]
        ACTIONS --> VAL
        ACTIONS --> AUTH
        ACTIONS --> CALC
    end

    subgraph Data_Layer ["Data & Persistence Layer"]
        REPO["Transaction Repository (src/lib/db/)"]
        PRISMA["Prisma ORM Client (prisma/schema.prisma)"]
        FALLBACK[("In-Memory Dev Fallback Store")]
        PG[("PostgreSQL Database")]

        CALC --> REPO
        REPO --> PRISMA
        PRISMA -.->|Database Connected| PG
        PRISMA -.->|No DB / Dev Mode| FALLBACK
    end

    Client_Layer <==>|Server Action Invocations / Optimistic State| Routing_Security
```

---

## 3. Complete Directory & Code Structure Map

Every file in ExpenseFlow has a single, well-defined responsibility.

```text
ExpenseFlow/
├── prisma/
│   ├── migrations/                 # Version-controlled SQL migration scripts
│   │   └── 20261031_init/          # Initial PostgreSQL schema migration
│   └── schema.prisma               # Prisma data models, relations, enums, & indexes
│
├── public/                         # Public static files (SVGs, favicon, icons)
│
├── src/
│   ├── actions/                    # Next.js Server Actions (RPC mutations)
│   │   ├── auth.ts                 # Registration, login, logout, & session querying
│   │   └── transactions.ts         # Add, edit, delete, & filter transactions
│   │
│   ├── app/                        # Next.js 15 App Router directory
│   │   ├── (auth)/                 # Route group for authentication
│   │   │   ├── login/page.tsx      # Secure email/password login screen
│   │   │   └── register/page.tsx   # Account creation screen
│   │   ├── analytics/page.tsx      # Visual analytics & cash flow breakdown
│   │   ├── budgets/page.tsx        # Monthly category budget management & warnings
│   │   ├── categories/page.tsx     # Custom spending & income categories manager
│   │   ├── expenses/page.tsx       # Filtered view for expense records
│   │   ├── income/page.tsx         # Filtered view for income records
│   │   ├── settings/page.tsx       # User profile, currency, & account settings
│   │   ├── transactions/page.tsx   # Paginated, searchable transactions ledger
│   │   ├── globals.css             # Tailwind base/utilities + theme variables
│   │   ├── layout.tsx              # Root HTML shell + ExpenseProvider + AppShell
│   │   └── page.tsx                # Main dashboard homepage (financial overview)
│   │
│   ├── components/                 # React UI Component Hierarchy
│   │   ├── dashboard/              # Dashboard-specific feature widgets
│   │   │   ├── CategoryBreakdownChart.tsx # Donut chart of category distribution
│   │   │   ├── IncomeExpenseChart.tsx     # Monthly bar chart (Income vs Expense)
│   │   │   ├── MetricCards.tsx            # 4 Key metrics (Balance, Income, Expense, Savings)
│   │   │   ├── QuickAddModal.tsx          # Fast transaction modal popup
│   │   │   └── RecentTransactionsTable.tsx# Live table with status badges & actions
│   │   ├── layout/                 # Structural shell components
│   │   │   ├── AppShell.tsx        # Conditional frame (auth vs dashboard layout)
│   │   │   ├── MobileDrawer.tsx    # Slide-out mobile navigation drawer
│   │   │   ├── Navbar.tsx          # Top sticky navbar with search, alerts, & dates
│   │   │   └── Sidebar.tsx         # Desktop fixed navigation with active route highlights
│   │   └── ui/                     # Reusable atomic design tokens
│   │       ├── Badge.tsx           # Status & category pills
│   │       ├── Button.tsx          # Polymorphic buttons with variants & loading state
│   │       ├── Card.tsx            # Standardized surface cards with optional hover effects
│   │       ├── Input.tsx           # Form inputs with helper text and validation states
│   │       ├── Modal.tsx           # Accessible portal dialogs with backdrop blur
│   │       └── ProgressBar.tsx     # Dynamic progress bars with budget alert colors
│   │
│   ├── context/
│   │   └── ExpenseContext.tsx       # Global React state for accounts, transactions & modals
│   │
│   ├── data/
│   │   └── mockData.ts             # Default accounts, categories, and sample records
│   │
│   ├── lib/                        # Core system utilities and libraries
│   │   ├── auth/
│   │   │   └── session.ts          # JWT signing, verification, and cookie storage
│   │   ├── db/
│   │   │   ├── prisma.ts           # Global singleton PrismaClient instance
│   │   │   └── transaction-repository.ts # Unified DB repository with in-memory fallback
│   │   ├── validations/
│   │   │   └── schemas.ts          # Zod validation schemas for all form inputs
│   │   └── utils.ts                # cn() class merger, formatCurrency(), and formatters
│   │
│   └── middleware.ts               # Edge request interceptor for route protection
│
├── .env.example                    # Template for database & JWT environment variables
├── package.json                    # Project dependencies, scripts, and metadata
├── tailwind.config.ts              # Custom colors, shadows, and animation keyframes
└── tsconfig.json                   # Strict TypeScript compiler options
```

---

## 4. Database Schema & Data Modeling

ExpenseFlow uses **PostgreSQL** configured through [`prisma/schema.prisma`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/prisma/schema.prisma).

### Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Account : "owns"
    User ||--o{ Category : "creates"
    User ||--o{ Transaction : "records"
    User ||--o{ Budget : "sets"

    Account ||--o{ Transaction : "contains"
    Category ||--o{ Transaction : "classifies"
    Category ||--o{ Budget : "allocates"

    User {
        string id PK "UUID"
        string email UK "Unique index"
        string name "User Full Name"
        string passwordHash "Bcrypt hashed"
        string currency "Default USD"
        datetime createdAt
        datetime updatedAt
    }

    Account {
        string id PK "UUID"
        string userId FK "Cascade delete"
        string name "Account label"
        AccountType type "CHECKING, SAVINGS, CREDIT_CARD, etc."
        decimal balance "Decimal(12, 2)"
        string color "Hex code"
        boolean isArchived
        datetime createdAt
    }

    Category {
        string id PK "UUID"
        string userId FK "Nullable for system defaults"
        string name "Category name"
        CategoryType type "INCOME, EXPENSE"
        string icon "Lucide icon name"
        string color "Hex code"
        boolean isSystem
    }

    Transaction {
        string id PK "UUID"
        string userId FK "Cascade delete"
        string accountId FK "Account reference"
        string categoryId FK "Restrict delete"
        decimal amount "Decimal(12, 2)"
        TransactionType type "INCOME, EXPENSE, TRANSFER"
        TransactionStatus status "COMPLETED, PENDING, CANCELLED"
        string description "Memo / Payee"
        datetime date "Transaction timestamp"
    }

    Budget {
        string id PK "UUID"
        string userId FK "Cascade delete"
        string categoryId FK "Category reference"
        decimal limit "Monthly maximum"
        BudgetPeriod period "MONTHLY, YEARLY"
    }
```

### Critical Database Design Decisions:
1. **Monetary Precision:** All balances, transaction amounts, and budget limits use `@db.Decimal(12, 2)` instead of floating-point numbers to prevent binary rounding inaccuracies common in financial software.
2. **Cascading vs Restricting Deletes:**
   - Deleting a `User` cascades to delete their associated `Accounts`, `Transactions`, and `Budgets`.
   - Deleting a `Category` is restricted (`onDelete: Restrict`) if transactions are actively linked to it, ensuring historical ledgers remain unbroken.
3. **Compound Indexes:** Includes composite index `@@index([userId, date])` on the `Transaction` table for fast chronological querying on the dashboard.

---

## 5. State Management & Data Flow

ExpenseFlow adopts a **hybrid state architecture** balancing lightning-fast client interactivity with authoritative server mutations:

### 1. Client State (`ExpenseContext`)
- Located at [`src/context/ExpenseContext.tsx`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/context/ExpenseContext.tsx).
- Provides immediate reactive updates across components:
  - Adding a transaction updates the balance and recent list **instantly**.
  - Opens and closes modals (`QuickAddModal`) from any component in the tree.
  - Recomputes total balance, total income, total expenses, and savings rate in real-time.

### 2. Server Mutations (`Server Actions`)
- Located in [`src/actions/transactions.ts`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/actions/transactions.ts) and [`src/actions/auth.ts`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/actions/auth.ts).
- Benefits:
  - Zero client JavaScript bundle overhead for API routing.
  - Automatic CSRF protection.
  - Validates all payloads on the server using Zod schemas before touching the repository.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant UI as QuickAddModal
    participant Context as ExpenseContext
    participant Action as createTransactionAction
    participant Repo as TransactionRepository
    participant DB as PostgreSQL

    User->>UI: Fills form & clicks "Save"
    UI->>Action: Invokes Server Action with form data
    Action->>Action: Validates payload with Zod schema
    Action->>Repo: create(data)
    Repo->>DB: INSERT into transactions
    DB-->>Repo: Saved Transaction (UUID)
    Repo-->>Action: Success Result
    Action-->>UI: { success: true, transaction }
    UI->>Context: addTransaction(newTx) (Local State Updated)
    Context-->>User: Balance Cards & Charts Update Instantly
```

---

## 6. Authentication & Security Architecture

ExpenseFlow features production-ready, row-level isolated authentication:

```mermaid
flowchart LR
    A["User Request"] --> B["src/middleware.ts"]
    B -->|Has 'expenseflow_session' Cookie?| C{"Verify JWT with jose"}
    C -->|Valid Token| D["Allow Request to Dashboard"]
    C -->|Invalid / Missing| E["Redirect to /login"]
    
    subgraph Auth_Actions ["Authentication Mutations"]
        F["loginAction(email, password)"]
        G["Verify Bcrypt Hash"]
        H["Set HttpOnly Secure Cookie"]
        F --> G --> H
    end
```

### Security Measures Implemented:
1. **Password Hashing:** Passwords are hashed with `bcryptjs` using 10 salt rounds before storage. Plain-text passwords are never stored or logged.
2. **Stateless JWT Sessions:** The `jose` library generates encrypted HS256 tokens stored inside an `HttpOnly`, `SameSite=Lax`, `Path=/` cookie named `expenseflow_session`. This prevents Cross-Site Scripting (XSS) attacks from stealing tokens.
3. **Edge Middleware Protection:** [`src/middleware.ts`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/middleware.ts) protects all routes under `/`, `/transactions`, `/budgets`, `/analytics`, `/categories`, and `/settings`. Unauthenticated traffic is immediately redirected to `/login`.
4. **Row-Level Tenant Isolation:** Every database query in `transaction-repository.ts` filters strictly by the authenticated `userId`. Users can never query or manipulate records belonging to other users.

---

## 7. Frontend Design System & Component Hierarchy

ExpenseFlow follows the **Atomic Design Methodology**:

```text
Atoms (ui/)          ---> Molecules (layout/)      ---> Organisms (dashboard/)
-----------------         -------------------           -----------------------
• Button.tsx              • Navbar.tsx                  • MetricCards.tsx
• Card.tsx                • Sidebar.tsx                 • IncomeExpenseChart.tsx
• Badge.tsx               • MobileDrawer.tsx            • CategoryBreakdownChart.tsx
• Input.tsx               • AppShell.tsx                • RecentTransactionsTable.tsx
• ProgressBar.tsx                                       • QuickAddModal.tsx
• Modal.tsx
```

### Design Standards:
- **Consistent Elevation & Shadows:** Standardized `shadow-subtle` and `shadow-card` provide depth without visual noise.
- **Micro-Interactions:** Subtle `active:scale-[0.98]` on buttons and `transition-all duration-200` on cards make the interface feel responsive and native.
- **Theme Support:** Fully supports system-level Dark Mode through Tailwind's `dark:` utility variants and CSS custom properties in `globals.css`.

---

## 8. App Routing & Navigation Map

| Route URL | Component File | Description & Capabilities |
| :--- | :--- | :--- |
| `/` | [`src/app/page.tsx`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/app/page.tsx) | **Dashboard Homepage:** Real-time balance cards, income vs. expense chart, category breakdown, connected accounts, and recent transactions. |
| `/transactions` | [`src/app/transactions/page.tsx`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/app/transactions/page.tsx) | **Transactions Ledger:** Complete transaction history with search, type filter (Income/Expense/Transfer), category filter, and CSV export. |
| `/income` | [`src/app/income/page.tsx`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/app/income/page.tsx) | **Income Stream:** Focus view of all incoming revenues, payees, and revenue breakdown. |
| `/expenses` | [`src/app/expenses/page.tsx`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/app/expenses/page.tsx) | **Expense Tracker:** Detailed analysis of outgoing cash flow and spending trends. |
| `/categories` | [`src/app/categories/page.tsx`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/app/categories/page.tsx) | **Category Manager:** Custom categories with custom colors, Lucide icon selectors, and transaction counters. |
| `/budgets` | [`src/app/budgets/page.tsx`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/app/budgets/page.tsx) | **Budget Control:** Monthly spending targets with automatic percentage indicators and budget exceeded warnings. |
| `/analytics` | [`src/app/analytics/page.tsx`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/app/analytics/page.tsx) | **Financial Analytics:** Deep-dive charts, net savings rates, and historical performance tracking. |
| `/settings` | [`src/app/settings/page.tsx`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/app/settings/page.tsx) | **User Settings:** Currency preferences, connected bank accounts, notifications, and profile data. |
| `/login` | [`src/app/(auth)/login/page.tsx`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/app/(auth)/login/page.tsx) | **User Login:** Authenticates existing users and establishes session cookies. |
| `/register` | [`src/app/(auth)/register/page.tsx`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/app/(auth)/register/page.tsx) | **Registration:** Onboards new users with automated default categories and accounts. |

---

## 9. Resilience & Development Fallback Strategy

A major strength of ExpenseFlow's repository pattern ([`src/lib/db/transaction-repository.ts`](file:///c:/Users/chand/OneDrive/Desktop/Expense%20Tracker/src/lib/db/transaction-repository.ts)) is its **Zero-Setup Resilience Engine**:

1. **Active PostgreSQL Mode:**
   - When a valid `DATABASE_URL` is configured in `.env`, the repository executes high-speed Prisma queries against the PostgreSQL database.
2. **Graceful In-Memory Fallback:**
   - If PostgreSQL is offline, undergoing maintenance, or running in an isolated development environment without a live database, the repository automatically falls back to an in-memory data store seeded with realistic data.
   - **Why this matters:** The entire UI, CRUD operations, charts, and budget warnings function 100% reliably without crashing during local design and frontend development.

---

## 10. Development, Build & Verification Workflow

### Getting Started (Local Development)

1. **Install Dependencies:**
   ```powershell
   npm install
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/expenseflow?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-min-32-chars-long"
   ```

3. **Initialize Database Schema (When using PostgreSQL):**
   ```powershell
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. **Start the Development Server:**
   ```powershell
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Assurance & Verification Commands

ExpenseFlow includes three automated checks to guarantee code quality:

| Command | Tool | Purpose |
| :--- | :--- | :--- |
| `npm run lint` | **ESLint** | Enforces clean code formatting and prevents React hook violations. |
| `npx tsc --noEmit` | **TypeScript** | Performs full static type analysis across all routes and components. |
| `npm run build` | **Next.js Compiler** | Tests production compilation, tree-shaking, and static optimization. |

---

*ExpenseFlow — Engineered with Next.js 15, React 19, TypeScript, and Tailwind CSS.*
