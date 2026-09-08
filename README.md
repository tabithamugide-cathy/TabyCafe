 # CafePopp Frontend

 React 19 + Vite frontend for the CafePopp restaurant management system.

 ## Run

 ```bash
 npm install
 npm run dev
 ```

 The frontend expects the backend at `http://localhost:8080/api` by default. Override it with:

 ```bash
 VITE_API_URL=http://localhost:8080/api npm run dev
 ```

 Build for production:

 ```bash
 npm run build
 ```

 ## Views

 ### Guest customer view

 - `/`: public menu
 - `/cart`: cart, table selection, order confirmation, status tracking, and payment
 - `/login`: staff login

 Guests do not need an account to browse the menu or place an order. The current order is persisted in browser local storage so a refresh does not immediately lose the customer payment panel.

 ### Staff view

 After login, staff are redirected by role:

 - `ADMIN`: `/dashboard`
 - `CASHIER`: `/dashboard`
 - `WAITER`: `/tables`
 - `KITCHEN`: `/orders`

 The sidebar and root route guard use the authenticated role to hide and block unauthorized screens. The backend repeats these checks, so frontend visibility is not treated as security.

 ## Authentication

 Login calls `POST /api/auth/login` with an email and password. The returned bearer token is stored as `cafe_popp_token`. Requests made through `src/api.js` automatically include:

 ```http
 Authorization: Bearer <token>
 ```

 Logout removes the token and local profile settings, then returns to the guest menu.

 ## Role Navigation

 | Role | Visible workspace |
 | --- | --- |
 | `ADMIN` | All operational views |
 | `CASHIER` | Dashboard, menu, orders, tables, payments, customers, settings |
 | `WAITER` | Menu, orders, tables, customers, settings |
 | `KITCHEN` | Menu, orders, settings |

 The hamburger drawer is available on all viewport sizes. Bootstrap-style icons are provided by the existing `react-icons` Bootstrap icon set.

 ## Customer Order and Payment

 The customer flow is driven by backend status:

 ```text
 OPEN -> IN_PROGRESS -> SERVED -> PAID
 ```

 The customer does not see payment immediately after placing an order because the current restaurant workflow allows payment only after the order is served. The `/cart` order panel:

 - persists the active order in `cafe_popp_active_order`
 - provides a manual `Check status` action
 - polls every 10 seconds while the order is being prepared
 - reveals payment methods when status becomes `SERVED`
 - stores the paid state after successful payment

 Current payment methods are workflow placeholders: `CASH`, `MOBILE_MONEY`, and `CARD`. They do not yet connect to external payment gateways.

 ## Menu Performance

 Menu data is fetched through React Query and shared by the cart, menu, products, and categories views. Query data is reused for five minutes and retained for thirty minutes. The backend adds a short-lived Caffeine cache and evicts it after menu changes.

 ## Important Multi-Device Limitation

 The backend persists orders and statuses in PostgreSQL, so kitchen and cashier devices share operational data. The customer browser currently identifies its active order through local storage. A production multi-device customer experience should add an opaque order access token or customer account and expose a dedicated order tracking URL.

 ## Validation

 ```bash
 npm run build
 ```

 The repository contains unrelated existing ESLint warnings; use the production build to validate route generation and bundling.
