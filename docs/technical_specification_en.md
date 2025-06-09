# Business Requirements and Technical Specifications (English)

## 1. Introduction

### 1.1. Purpose

Create a front‑end web application (FE App) that interacts with two back‑end systems: the **Payment Gateway** (PG) and the **Electronic Wallet** (EW). The FE App shall provide a user interface allowing authorized users, based on role (manager, finance, supervisor), to perform operations such as bulk payment uploads, redemption requests, and confirmations, retrieving and displaying data from the respective back ends.

### 1.2. Scope

The FE App is intended for Asset company employees, including:

* **Managers**: bulk upload payment files to the EW database via the PG API.
* **Finance**: create and submit electronic money (EM) redemption requests for merchants; view pending requests, redemption and issuance history, and current balance.
* **Supervisors**: review and confirm finance redemption requests; view history and balance.
* **All roles**: access a Dashboard; view role‑specific navigation and protected routes.

The system must also support future role additions and expanded functionality.

### 1.3. Constraints

* The FE App shall not maintain its own database. All persistent data (user credentials, merchant lists, upload histories, redemption requests, transaction histories) is stored in text files on the FE App server (`.txt` files) or retrieved from PG/EW APIs.
* User credentials (login and bcrypt‑hashed passwords) reside in `users.txt` on the server.
* Authentication & authorization are performed via JWTs issued by the FE App back‑end.
* All FE App ↔ PG/EW communications occur over HTTPS, proxied through the FE App back‑end to hide API tokens.

---

## 2. Goals & Objectives

1. **Secure Authentication & Authorization**

   * Multi‑role support (manager, finance, supervisor; extendable).
   * Role‑based route protection.

2. **Role‑based Functional Modules**

   * Manager: batch payment uploads.
   * Finance: EM redemption requests, history, balance.
   * Supervisor: redemption approvals, history, balance.

3. **Integration**

   * Proxy file uploads and data requests to PG/EW APIs.

4. **Maintainability & Extensibility**

   * Modular front‑end architecture for new roles.
   * Simple file‑based storage for rapid updates.

5. **Usability**

   * Clear navigation, consistent UI components (forms, tables, buttons, toasts).

---

## 3. Functional Requirements

### 3.1. Authentication & Authorization

#### 3.1.1. Login

* **Route**: `POST /api/auth/login`
* **Client**: FE App login page (`/login`) with `login` and `password` fields.
* **Back‑end**: Verify credentials against `users.txt`; compare bcrypt hashes; on success, sign JWT ({userId, role, login}, 2h expiry) and return `{ token, user }`.
* **Storage**: Store the JWT in `sessionStorage` or a Secure, httpOnly cookie.
* **Error**: Return 401 with `{ message: "Invalid login or password" }`.

#### 3.1.2. Roles

* `manager`, `finance`, `supervisor`
* Expandable in `users.txt`.

#### 3.1.3. Protected Routes

* Middleware: verify JWT and role before granting access.
* FE App uses a `ProtectedRoute` component to guard React Router paths.

---

### 3.2. Manager Module (Role = manager)

**Batch Upload Payments**

1. **Screen**: `/manager/payments`
2. **GET** `/api/manager/uploaded-files` → read and parse `uploaded_files.txt`.
3. Display table with columns: File Name, Date (ISO), Uploader, Status, Uploaded Count, Error Count.
4. **Upload Flow**:

   * Button: "Upload"
   * `<input type="file">` for CSV/XML.
   * **POST** `/api/manager/upload` multipart/form-data, field `file`.
   * Back‑end proxies to PG: `POST https://payment-gateway/api/payments/batch-upload` with Authorization header.
   * Capture PG response: `{ success, uploadedCount, errors[] }`.
   * Append a new line to `uploaded_files.txt`: `fileName;dateISO;uploaderId;status;uploadedCount;errorCount`.
5. Show toast with upload result; refresh the file list.

---

### 3.3. Finance Module (Role = finance)

**EM Redemption Requests**

1. **Screen**: `/finance/redemption`
2. On load, FE App calls:

   * `GET /api/finance/merchants` → parse `merchants.txt` (merchantId;merchantName).
   * `GET /api/finance/redemption-requests` → parse `redemption_requests.txt`.
   * `GET /api/finance/history` → parse `history.txt` (type;recordId;merchantId;amount;dateTime).
   * `GET /api/finance/balance` → proxy PG `/balance?userId=` returns `{ balance }`.
3. UI:

   * Balance display.
   * Redemption form: `amount` (number), `merchantId` (select), Submit.
   * Table: pending requests (status PENDING).
   * Table(s): history of redemptions & emissions (filtered by type).
4. **POST** `/api/finance/redemption-requests` with `{ merchantId, amount, requesterId }`.

   * Append to `redemption_requests.txt`: `requestId;merchantId;amount;requesterId;dateTime;PENDING`.
5. Toast success: "Redemption request sent to supervisor"; refresh requests.

---

### 3.4. Supervisor Module (Role = supervisor)

**Confirm Redemptions**

1. **Screen**: `/supervisor/approvals`
2. On load, calls:

   * `GET /api/supervisor/redemption-requests`
   * `GET /api/supervisor/history`
   * `GET /api/supervisor/balance`
3. UI:

   * Balance.
   * Table: PENDING requests with "Confirm" button.
   * History tables.
4. **POST** `/api/supervisor/confirm-redemption` with `{ requestId }`.

   * Locate entry in `redemption_requests.txt`; if missing, 404.
   * Proxy to PG `/payments/redeem`.
   * On success, remove entry, append to `history.txt`: `REDEMPTION;newRecordId;merchantId;amount;dateTime`.
5. Toast result; refresh requests & history.

---

## 4. Non‑Functional Requirements

* **Performance**: initial load ≤2s; API responses ≤1s average.
* **Security**:

  * HTTPS for all traffic.
  * JWT expiry.
  * bcrypt-hashed passwords.
  * CSRF/XSS protections.
* **Compatibility**: latest major browsers.
* **Scalability**: path to migrate text files → DB (SQLite/Postgres).
* **Localization**: Russian UI with i18n-ready structure.
* **Testing**: unit tests (Jest, React Testing Library), integration tests (Mocha/Chai).

---

## 5. Architecture & Folder Structure

### Front‑end (React + TypeScript + Vite)

```
/frontend/
  public/index.html
  src/
    api/
      authApi.ts
      managerApi.ts
      financeApi.ts
      supervisorApi.ts
    assets/
      logo.svg
    components/
      Button/
      Input/
      Table/
      Spinner/
      Notification/
    contexts/
      AuthContext.tsx
    hooks/
      useAuth.ts
      useFetch.ts
    layouts/
      AppLayout.tsx
      ProtectedRoute.tsx
    pages/
      Login/
      Dashboard/
      ManagerPayments/
      FinanceRedemption/
      SupervisorApprovals/
    store/
      authSlice.ts
      managerSlice.ts
      financeSlice.ts
      supervisorSlice.ts
      index.ts
    utils/
      formatDate.ts
    App.tsx
    main.tsx
  package.json
  tsconfig.json
  vite.config.ts
```

### Back‑end (Node.js + Express + TypeScript)

```
/backend/
  src/
    controllers/
      authController.ts
      managerController.ts
      financeController.ts
      supervisorController.ts
    services/
      fileService.ts
      paymentGatewayService.ts
      walletService.ts
    middleware/
      authMiddleware.ts
      roleMiddleware.ts
      errorMiddleware.ts
    models/
      userModel.ts
      fileModels.ts
      requestModels.ts
    routes/
      authRoutes.ts
      managerRoutes.ts
      financeRoutes.ts
      supervisorRoutes.ts
    utils/
      utils.ts
    config.ts
    index.ts
  data/
    users.txt
    uploaded_files.txt
    merchants.txt
    redemption_requests.txt
    history.txt
  .env
  package.json
  tsconfig.json
```

---

## 6. Technology Stack

**Front-end:** React, TypeScript, Vite, React Router v6, Redux Toolkit, Axios, Tailwind CSS (or MUI), React Hook Form + Yup, React‑Toastify, Jest + RTL

**Back-end:** Node.js (v16+) + Express, TypeScript, bcrypt, jsonwebtoken, multer, fs/promises, axios, Joi/Zod, dotenv, swagger-jsdoc + swagger-ui-express

**Infra:** Docker, Docker Compose, GitHub Actions, Nginx/PM2 or Kubernetes

---

## 7. Implementation Roadmap

1. Approve requirements.
2. Create GitHub repo (`ewallet-backoffice`).
3. Scaffold back-end and front-end per structure.
4. Implement authentication and file services.
5. Build front-end pages and components.
6. Write tests and set up CI.
7. Document and deploy (Docker + Nginx + PM2).
