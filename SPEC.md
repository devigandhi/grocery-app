# Technical Specification – Grocery List Sharing App

## 1. Overview

A full-stack grocery management application with two distinct experiences:

- **Admin**: manages master data — users, grocery items, and shops.
- **User**: browses grocery items by category, builds a personal shopping list with quantity/unit/shop, and shares that list with other users via WhatsApp or email. Multiple users can share their list to the same recipient (many-to-one sharing).

### Core Features

- Authentication (register, login, logout) via **Better Auth**, phone-number based
- Role-based access control (`admin`, `user`)
- Admin CRUD: Users, Grocery items, Shops
- User: browse grocery catalog by category, add items to a personal shopping list with quantity + unit + preferred shop
- Shopping list management: edit/delete list items
- Shopping list sharing: share a list to another registered user; share link/summary can be sent externally via WhatsApp and Email; many senders can share to the same recipient
- Two independent UI systems in one frontend app: Ant Design (admin) and Tailwind + shadcn/ui (user)

### Tech Stack

- **Frontend**: React + TypeScript, built with Vite
  - Admin UI: Ant Design
  - User UI: Tailwind CSS + shadcn/ui
  - Data fetching/caching: TanStack Query (React Query) on top of a shared Axios client
- **Backend**: NestJS (Node.js), REST API
- **Auth**: Better Auth (server + client), phone-number/password credential provider
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Package manager**: Bun for `web`, npm for `api` (two independent projects, not a unified workspace — NestJS tooling/ecosystem assumes npm)

## 2. Architecture

### 2.1 High-Level Architecture

```
React (Vite, TS)
  ├─ /admin  → Ant Design
  └─ /app    → Tailwind + shadcn/ui
        │  (REST, fetch/axios)
        ▼
NestJS API
  ├─ Better Auth integration (middleware/guards)
  ├─ Modules: Auth, Users, Shops, Grocery, ShoppingLists, Shares
        │
        ▼
Prisma ORM
        │
        ▼
PostgreSQL
```

- **Repo layout** (two independent projects, flat at root — not a unified workspace):
  ```
  Grocery-app/
    web/     (Vite + React + TS, admin + user under one app, route-split) — package manager: bun
    api/     (NestJS) — package manager: npm
  ```

### 2.2 Application Layers

**Presentation layer**
- React Router routes split into `/admin/*` (Ant Design) and `/*` (Tailwind + shadcn/ui) with separate layout shells and separate theme providers so Ant Design and Tailwind styling never leak into each other.

**API layer**
- NestJS REST controllers grouped by module, versioned under `/api/v1`.
- Guards enforce authentication (Better Auth session) and role-based authorization (`RolesGuard` checking `admin` vs `user`).

**Data access layer**
- Prisma Client used inside NestJS services (repository-style service classes, one per module).

## 3. Functional Requirements

### 3.1 Authentication (Better Auth)

- Register: phone number + password (+ name)
- Login: phone number + password
- Logout
- Session available on both client (React) and server (NestJS guards) via Better Auth session cookie/token
- New registrations default to role `user`; `admin` accounts are created only by an existing admin (no public admin signup)

Unauthenticated users:
- Can access `Home` and `About` pages
- Cannot access grocery list, shopping list, or any admin page

### 3.2 Admin Functionality

**Dashboard**
- Summary cards: total users, total grocery items grouped by category (e.g., simple bar/list breakdown)

**User management**
- Create user (name, phone number, password, role)
- Edit user
- List users with edit/delete icon actions
- Delete user (soft-confirm dialog before delete)

**Grocery management**
- Create grocery item (item name, category)
- Edit grocery item
- List grocery items with edit/delete icon actions, filterable/searchable by category

**Shop management**
- Create shop (name, location)
- Edit shop
- List shops with edit/delete icon actions

### 3.3 User Functionality

**Public pages**
- Home page
- About page

**Grocery list page** (post-login)
- Groceries displayed grouped by category
- User selects an item, specifies quantity + unit, optionally a preferred shop, and adds it to their shopping list

**Shopping list page**
- Shows all items the user has added, with edit and delete icon actions per row (quantity, unit, shop editable inline or via modal)
- "Share" action per list: opens a share dialog to
  - select a registered recipient user (search by name/phone)
  - choose share channel: WhatsApp or Email
  - generates a shareable summary (formatted text for WhatsApp deep link, formatted email body for `mailto:`/email API)
- A recipient can receive shares from multiple different senders (many-to-one); each incoming share is tracked as a distinct record, not merged automatically — the recipient can view "Lists shared with me" as a separate section.

**Share history page**
- Shows every list the current user has shared out, one row/card per share event
- Each entry displays: recipient's name, the shared list's item snapshot (a frozen copy of items/quantity/unit/shop as they were at the moment of sharing), share channel (WhatsApp/Email), and the date/time shared
- Because the same list can be shared to multiple recipients over time (and the source list can keep changing afterward), each share stores its own immutable copy of the items rather than a live reference — so this page always reflects exactly what that recipient was sent, even if the sender's live shopping list has since changed
- Sortable/filterable by recipient name and date; grouped by recipient if the same list was shared more than once

## 4. Non-Functional Requirements

**Performance**
- List/catalog endpoints paginated (default page size 20)
- Grocery catalog and other slow-changing resources cached client-side via TanStack Query (`staleTime` tuned per resource) to avoid refetching on every navigation

**Security**
- All authenticated endpoints scoped by `userId` from session; users can only mutate their own shopping list items
- Admin-only endpoints protected by `RolesGuard`
- Passwords hashed and managed entirely by Better Auth (never handled in plaintext by app code)
- Input validation via `class-validator` DTOs on every NestJS endpoint

**Reliability**
- Consistent API error shape: `{ statusCode, message, error }`
- Graceful handling of Prisma constraint errors (e.g., duplicate phone number)

**Maintainability**
- Strict TypeScript across frontend and backend
- Shared enum/type definitions for `Role`, `Unit`, `ShareChannel`

**UX**
- Admin: dense data tables (Ant Design `Table`) with inline edit/delete icon buttons and confirm-on-delete popconfirm
- User: mobile-friendly cards/list views (shadcn/ui `Card`, `Sheet`, `Dialog`) grouped by category with quantity steppers

## 5. Data Model & Database Schema (PostgreSQL via Prisma)

### 5.1 Better Auth Core Tables

Better Auth manages its own tables (generated via its Prisma adapter/CLI). Minimum required models:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  phoneNumber   String    @unique
  email         String?   @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions        Session[]
  accounts        Account[]
  shoppingLists   ShoppingList[]
  sharesSent      ShoppingListShare[] @relation("SharedBy")
  sharesReceived  ShoppingListShare[] @relation("SharedWith")

  @@map("user")
}

enum Role {
  ADMIN
  USER
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])

  @@map("session")
}

model Account {
  id                    String    @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  password              String?
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user                  User      @relation(fields: [userId], references: [id])

  @@map("account")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("verification")
}
```

### 5.2 Domain Tables

```prisma
model Shop {
  id        String   @id @default(cuid())
  name      String
  location  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  shoppingListItems ShoppingListItem[]

  @@map("shop")
}

model Grocery {
  id        String   @id @default(cuid())
  item      String
  category  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  shoppingListItems ShoppingListItem[]

  @@index([category])
  @@map("grocery")
}

model ShoppingList {
  id        String   @id @default(cuid())
  name      String   @default("My Shopping List")
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner  User                  @relation(fields: [ownerId], references: [id])
  items  ShoppingListItem[]
  shares ShoppingListShare[]

  @@index([ownerId])
  @@map("shopping_list")
}

model ShoppingListItem {
  id             String   @id @default(cuid())
  shoppingListId String
  groceryId      String
  quantity       Decimal  @default(1)
  unit           Unit
  shopId         String?
  isChecked      Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  shoppingList ShoppingList @relation(fields: [shoppingListId], references: [id], onDelete: Cascade)
  grocery      Grocery      @relation(fields: [groceryId], references: [id])
  shop         Shop?        @relation(fields: [shopId], references: [id])

  @@index([shoppingListId])
  @@map("shopping_list_item")
}

enum Unit {
  PCS
  KG
  G
  L
  ML
  PACK
  DOZEN
}

model ShoppingListShare {
  id             String      @id @default(cuid())
  shoppingListId String
  sharedByUserId String
  sharedWithUserId String
  channel        ShareChannel
  sharedAt       DateTime    @default(now())

  shoppingList   ShoppingList          @relation(fields: [shoppingListId], references: [id], onDelete: Cascade)
  sharedBy       User                  @relation("SharedBy", fields: [sharedByUserId], references: [id])
  sharedWith     User                  @relation("SharedWith", fields: [sharedWithUserId], references: [id])
  items          ShoppingListShareItem[]

  @@index([sharedWithUserId])
  @@index([shoppingListId])
  @@map("shopping_list_share")
}

// Frozen snapshot of the list's items at the moment this share was sent.
// Keeps each recipient's copy stable even if the sender later edits their live list.
model ShoppingListShareItem {
  id                  String   @id @default(cuid())
  shoppingListShareId String
  groceryName         String   // denormalized: item name at time of share
  category            String   // denormalized: category at time of share
  quantity             Decimal
  unit                 Unit
  shopName             String?  // denormalized: shop name at time of share, if any

  shoppingListShare ShoppingListShare @relation(fields: [shoppingListShareId], references: [id], onDelete: Cascade)

  @@index([shoppingListShareId])
  @@map("shopping_list_share_item")
}

enum ShareChannel {
  WHATSAPP
  EMAIL
}
```

Notes:
- `ShoppingListShare` supports the "many users share to one user" requirement: each share is its own row, so a single recipient (`sharedWithUserId`) can have many rows from different `sharedByUserId` senders, each pointing to a different (or the same) `shoppingListId`.
- `ShoppingListShareItem` is a denormalized snapshot (item name/category/shop stored as plain strings, not foreign keys) so the historical copy shown on the Share History page never changes even if the original `Grocery` or `Shop` record is later edited or deleted.
- `unit` is a fixed enum for consistency in the UI (extend as needed).

## 6. Backend: NestJS Module Design

### 6.1 Modules

- `AuthModule` — wraps Better Auth handlers, exposes `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, session middleware/guard
- `UsersModule` — admin user CRUD + "search users" (for share recipient picker)
- `ShopsModule` — admin shop CRUD
- `GroceryModule` — admin grocery CRUD + public "list grouped by category" endpoint
- `ShoppingListsModule` — user's list + items CRUD
- `SharesModule` — create share (with item snapshotting), list "shared with me", list "share history / shared by me"

### 6.2 Guards & Decorators

- `AuthGuard` — validates Better Auth session, attaches `req.user`
- `RolesGuard` + `@Roles('ADMIN')` decorator — restricts admin-only controllers/routes
- `@CurrentUser()` param decorator — pulls `req.user` into handler

### 6.3 API Endpoints

**Auth**
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Register with phone number + password |
| POST | `/api/v1/auth/login` | Public | Login |
| POST | `/api/v1/auth/logout` | Authenticated | Logout |
| GET  | `/api/v1/auth/session` | Authenticated | Current session/user |

**Users (Admin)**
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/v1/users` | Admin | Paginated list |
| GET | `/api/v1/users/:id` | Admin | Get one |
| POST | `/api/v1/users` | Admin | Create user |
| PATCH | `/api/v1/users/:id` | Admin | Update user |
| DELETE | `/api/v1/users/:id` | Admin | Delete user |
| GET | `/api/v1/users/search?q=` | Authenticated | Search users (for share recipient picker) |

**Shops (Admin)**
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/v1/shops` | Public/Auth | List shops |
| POST | `/api/v1/shops` | Admin | Create shop |
| PATCH | `/api/v1/shops/:id` | Admin | Update shop |
| DELETE | `/api/v1/shops/:id` | Admin | Delete shop |

**Grocery**
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/v1/grocery` | Authenticated | List, grouped by category (`?groupBy=category`) |
| POST | `/api/v1/grocery` | Admin | Create grocery item |
| PATCH | `/api/v1/grocery/:id` | Admin | Update grocery item |
| DELETE | `/api/v1/grocery/:id` | Admin | Delete grocery item |

**Shopping Lists**
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/v1/shopping-lists/me` | Authenticated | Current user's list(s) with items |
| POST | `/api/v1/shopping-lists/items` | Authenticated | Add item (grocery, qty, unit, shop) |
| PATCH | `/api/v1/shopping-lists/items/:id` | Authenticated | Edit item |
| DELETE | `/api/v1/shopping-lists/items/:id` | Authenticated | Delete item |

**Shares**
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/v1/shares` | Authenticated | Create share `{ shoppingListId, sharedWithUserId, channel }`; snapshots current items into `ShoppingListShareItem`, returns share record + prebuilt message payload |
| GET | `/api/v1/shares/received` | Authenticated | Lists shared with current user (from many senders), each with its frozen item snapshot |
| GET | `/api/v1/shares/sent` | Authenticated | Share history: every list current user has shared out, grouped by recipient, each with recipient name, item snapshot, channel, and `sharedAt` date |

**Share payload behavior**
- On `POST /shares`, the API:
  1. Copies the list's current items into `ShoppingListShareItem` rows tied to the new `ShoppingListShare` (freezing the recipient's copy)
  2. Builds a formatted text summary of the list (items, qty, unit, shop) and returns:
     - `whatsappUrl`: `https://wa.me/<recipientPhone>?text=<url-encoded summary>`
     - `emailPayload`: `{ subject, body }` for the frontend to open `mailto:` or call an email-sending endpoint
- The actual send action (opening WhatsApp link / mailto, or triggering a transactional email) happens client-side or via a lightweight `EmailModule` (e.g., Nodemailer) if in-app email sending is desired.
- `GET /shares/sent` is what powers the Share History page — it never needs to look at the live `ShoppingList`/`ShoppingListItem` tables, only the frozen snapshots, so past shares stay accurate regardless of later edits.

## 7. Frontend – Routes & Structure

### 7.1 Route Split

```
/                     Home (public)
/about                About (public)
/register             Register (Better Auth client)
/login                Login (Better Auth client)

/app                  User area (Tailwind + shadcn/ui, protected, role=USER or ADMIN)
  /app/grocery        Grocery catalog grouped by category, "add to list" action
  /app/shopping-list  My shopping list, edit/delete rows, "Share" dialog
  /app/shared-with-me Lists shared with current user
  /app/share-history  Lists current user has shared out — recipient name, frozen item copy, date

/admin                Admin area (Ant Design, protected, role=ADMIN)
  /admin               Dashboard
  /admin/users          User list (edit/delete icons)
  /admin/users/new      Create user
  /admin/users/:id/edit Edit user
  /admin/grocery        Grocery list (edit/delete icons)
  /admin/grocery/new    Create grocery
  /admin/grocery/:id/edit Edit grocery
  /admin/shops           Shop list (edit/delete icons)
  /admin/shops/new       Create shop
  /admin/shops/:id/edit  Edit shop
```

### 7.2 Layout & Theming Isolation

- `AdminLayout.tsx` wraps `/admin/*` with Ant Design `ConfigProvider` + `Layout` (Sider/Header/Content); Ant Design CSS scoped/imported only here.
- `AppLayout.tsx` wraps `/app/*` and public pages with Tailwind base styles + shadcn/ui components.
- Both layouts share the same Better Auth client/session hook but render entirely separate component trees — no shared Ant/Tailwind component reuse across the boundary.

### 7.2.1 Data Fetching Layer

- A single `QueryClientProvider` wraps the entire app at the root (`main.tsx`/`App.tsx`), **above** the route split — both `/admin/*` and `/app/*` share one `QueryClient` instance and one cache, since the same data (e.g. grocery catalog, users) may be viewed from both areas.
- `apiClient` — a single shared Axios instance (`web/src/lib/api-client.ts`) with:
  - `baseURL` from an env var (`VITE_API_URL`)
  - a request interceptor that attaches the Better Auth session token/cookie
  - a response interceptor that normalizes NestJS error responses (`{ statusCode, message, error }`) into a consistent shape for `onError` handlers
- TanStack Query conventions:
  - One `useXQuery`/`useXMutation` hook file per resource (e.g. `useGroceryQuery.ts`, `useShoppingListMutations.ts`), colocated under `src/features/<resource>/`
  - Query keys as arrays, namespaced by resource: `['grocery', 'list']`, `['shopping-list', 'me']`, `['users', userId]`
  - Mutations call `queryClient.invalidateQueries` on the relevant keys on success (e.g. adding a shopping list item invalidates `['shopping-list', 'me']`)
  - `staleTime` set per resource based on volatility: grocery catalog and shops (rarely change) get a longer `staleTime`; shopping list and shares (change often) stay near-default
  - Admin `Table` components and user list views both consume `isLoading`/`isError`/`data` directly from Query — no manual `useEffect` + `useState` fetching anywhere in the app

### 7.3 Key Components

**User side (Tailwind + shadcn/ui)**
- `GroceryCategoryAccordion` — groceries grouped by category, expandable
- `AddToListDialog` — qty + unit + shop select, uses shadcn `Dialog`, `Select`, `Input`
- `ShoppingListTable` / `ShoppingListCards` — edit (inline or `Sheet`) and delete (`AlertDialog` confirm) per row
- `ShareListDialog` — recipient search combobox, channel toggle (WhatsApp/Email), "Send" triggers `wa.me` link or email action
- `SharedWithMeList` — grouped by sender
- `ShareHistoryList` — grouped by recipient; each entry shows recipient name, `sharedAt` date, channel badge (WhatsApp/Email), and an expandable read-only view of that share's frozen item snapshot

**Admin side (Ant Design)**
- `DashboardCards` — `Statistic` + `Card` for totals
- `UserTable`, `GroceryTable`, `ShopTable` — Ant `Table` with `actions` column (`EditOutlined`, `DeleteOutlined` + `Popconfirm`)
- `UserForm`, `GroceryForm`, `ShopForm` — Ant `Form` used for both create and edit (mode prop)

## 8. Auth Integration Details

- Better Auth server configured inside NestJS (custom adapter or Better Auth's Node handler mounted as middleware/controller), using the Prisma adapter pointed at the same PostgreSQL database.
- Better Auth client configured in the Vite React app (`createAuthClient`), used by both `/app` and `/admin` login/register flows.
- Role is stored on the `User` model (`role: Role`) and included in the session payload so NestJS guards and the frontend route guards can both check it without an extra query.
- Frontend route protection: a `RequireAuth` wrapper for `/app/*` and a `RequireAdmin` wrapper (checks `role === 'ADMIN'`) for `/admin/*`, redirecting to `/login` otherwise.

## 9. Development Workflow

1. Scaffold two independent projects: `web` (bun) and `api` (npm) — no shared workspace config between them
2. `api`: init NestJS project (npm), add Prisma, configure PostgreSQL connection, define schema in section 5, run `npx prisma migrate dev`
3. Integrate Better Auth in `api` with Prisma adapter; verify register/login/session endpoints
4. Build NestJS modules/controllers/services per section 6, with DTO validation
5. `web`: scaffold Vite + React + TypeScript; set up `QueryClientProvider` at the root and the shared `apiClient` Axios instance (see section 7.2.1)
6. Set up Tailwind + shadcn/ui for `/app` and public routes; set up Ant Design for `/admin`, scoped so styles don't conflict
7. Integrate Better Auth client; build Login/Register pages
8. Build admin CRUD pages (Users, Grocery, Shops) with Ant Design tables/forms
9. Build user grocery catalog page (grouped by category) and add-to-list flow
10. Build shopping list page with edit/delete and the share dialog (WhatsApp `wa.me` link + email)
11. Build "Shared with me" view
12. Build "Share History" page (recipient name + frozen item snapshot + date, grouped by recipient)
13. Polish: loading states, empty states, toasts/notifications (Ant `message`/`notification` for admin, shadcn `toast`/`sonner` for user), error handling
14. Seed script for initial admin user, sample shops, and sample grocery catalog
