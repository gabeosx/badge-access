# Product Requirements Document (PRD)
[cite_start]**Project:** Identity Integration Test Harness ("Badge Access App") [cite: 4]
[cite_start]**Version:** 1.1 [cite: 4]
[cite_start]**Status:** Approved for Implementation [cite: 4]

---

## 1. Executive Summary
[cite_start]The Badge Access App is a lightweight, single-tenant reference application designed to serve as a "Target System" for testing Identity and Access Management (IAM) integrations[cite: 6]. [cite_start]It simulates a physical building access control system[cite: 7].

* [cite_start]**Primary Use Case:** IAM Architects and Engineers will use this app to demonstrate and test integrations with 3rd-party tools (e.g., Okta, SailPoint, ForgeRock)[cite: 8].
* **Downstream Target Functions:** The application acts as a target for:
    * [cite_start]SSO/OIDC Login (Initiated by IdP)[cite: 10].
    * [cite_start]SCIM/API-based User Provisioning (Pushed by IGA tool)[cite: 11].
    * [cite_start]Access Certification (Providing user/entitlement data to IGA tools for review)[cite: 12].
    * [cite_start]Access Request Automation (Fulfilling requests triggered in IGA tools)[cite: 13].
    * [cite_start]Just-In-Time (JIT) Provisioning[cite: 14].

**Scope Clarification:**
* [cite_start]**Not an IdP/IGA:** This application is NOT an Identity Provider (IdP) or an Identity Governance and Administration (IGA) platform[cite: 15].
* [cite_start]**Certifications:** It does not run certification campaigns but exposes APIs (`GET /users`, `GET /users/{id}`) for external tools (SailPoint, Saviynt) to ingest data for review[cite: 17].
* [cite_start]**IdP Roles:** It does not manage IdP-level groups or policies; it only consumes claims sent by the IdP during OIDC login to map them to local entitlements[cite: 18, 19].
* [cite_start]**Priorities:** Ease of deployment (Docker), visual appeal (Demo quality UI), and simplicity (SQLite backend)[cite: 20].

---

## 2. User Personas

### 2.1. Administrator (`ROLE_ADMIN`)
* [cite_start]**Description:** Super-user with full visibility[cite: 23].
* **Capabilities:**
    * [cite_start]View all users and their current access[cite: 25].
    * [cite_start]Create/Delete entitlements (Doors, Floors, Roles)[cite: 26].
    * [cite_start]Assign/Revoke entitlements to/from users[cite: 27].
    * [cite_start]View Audit Logs[cite: 32].
    * [cite_start]Configure OIDC settings (via env vars/config)[cite: 33].

### 2.2. End User (`ROLE_END_USER`)
* [cite_start]**Description:** Standard employee or contractor[cite: 35].
* **Capabilities:**
    * [cite_start]Log in via Password or SSO[cite: 37].
    * [cite_start]View their own profile[cite: 38].
    * [cite_start]View their own assigned badge access points (Entitlements)[cite: 39].

---

## 3. Functional Requirements

### 3.1. Authentication & Authorization
**Local Auth:**
* [cite_start]Username/Password login[cite: 43].
* [cite_start]No password complexity enforcement[cite: 44].
* [cite_start]Standard salted hashing for storage[cite: 45].

**OIDC Auth (SSO):**
* [cite_start]Support one OIDC Issuer (e.g., Okta, Auth0)[cite: 47].
* [cite_start]**JIT Provisioning:** If a user logs in via OIDC and does not exist locally, create them immediately[cite: 48].
* [cite_start]**Role Mapping:** The app maps incoming OIDC claims (specifically groups or roles) to local Entitlements[cite: 49].
    * [cite_start]*Note:* Logic for which user gets which group is managed entirely in the 3rd Party IdP[cite: 50].

**Authorization Model:**
* **RBAC:** Coarse-grained authorization. [cite_start]Access to Admin UI requires the user to possess the specific entitlement `ROLE_ADMIN`[cite: 52].
* [cite_start]**Default Access:** Newly registered users (Local or JIT) are assigned `ROLE_END_USER` by default unless mapped otherwise by OIDC claims[cite: 53].

### 3.2. User Management
* **Self-Registration:** Unauthenticated users can sign up (User, Password, First Name, Last Name, Email). [cite_start]No email verification required[cite: 55].
* [cite_start]**Admin Management:** Admins can edit user details, deactivate/reactivate users, and delete users[cite: 56].

### 3.3. Entitlement Management
* [cite_start]**Unified Model:** "Roles" (e.g., `ROLE_ADMIN`) and "Access Points" (e.g., Lobby Door) are stored in the same table[cite: 62].
* [cite_start]**CRUD:** Admins can create new access points (e.g., "Server Room", "Roof Access")[cite: 63].
* [cite_start]**Assignment:** Admins can assign any entitlement to any user[cite: 64].
* [cite_start]**Constraints:** Cannot delete an entitlement if it is currently assigned to a user[cite: 65].

### 3.4. Audit Logging
* [cite_start]**Scope:** All Create/Update/Delete operations on Users and Entitlements must be logged[cite: 67].
* [cite_start]**Storage:** Database table (not just console logs)[cite: 67].
* [cite_start]**UI:** Read-only view for Administrators to see who changed what and when[cite: 68].
* [cite_start]**External Use:** Intended to be read by external IGA tools to verify provisioning/deprovisioning actions occurred successfully[cite: 69].

---

## [cite_start]4. Data Model (SQLite) [cite: 70]

### 4.1. Table: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Not Null | [cite_start]Unique identifier[cite: 76, 80, 81]. |
| `username` | VARCHAR | Unique, Not Null | [cite_start]Login ID[cite: 78, 80, 82]. |
| `password_hash` | VARCHAR | Nullable | [cite_start]Null if only OIDC used, otherwise hashed pwd[cite: 83, 86, 87, 88]. |
| `first_name` | VARCHAR | [cite_start]|[cite: 84, 89]. |
| `last_name` | VARCHAR | [cite_start]|[cite: 85, 91]. |
| `email` | VARCHAR | [cite_start]|[cite: 93, 94]. |
| `is_active` | BOOLEAN | Default TRUE | [cite_start]Soft delete/deactivation flag[cite: 96, 98, 102]. |
| `created_at` | DATETIME | [cite_start]Default NOW |[cite: 97, 99, 100]. |

### 4.2. Table: `entitlements`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, Not Null | [cite_start]Unique identifier[cite: 106]. |
| `name` | VARCHAR | Unique, Not Null | [cite_start]Display name (e.g., "Lobby", "ROLE_ADMIN")[cite: 106]. |
| `description` | VARCHAR | | [cite_start]Optional context[cite: 106]. |

### 4.3. Table: `user_entitlements` (Join Table)
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | UUID | [cite_start]FK users.id | [cite: 109] |
| `entitlement_id` | UUID | [cite_start]FK entitlements.id | [cite: 109] |

### 4.4. Table: `audit_logs`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | [cite_start]PK, Auto Inc | [cite: 111] |
| `timestamp` | DATETIME | [cite_start]Default NOW | [cite: 111] |
| `actor` | VARCHAR | | [cite_start]Username of who performed the action[cite: 111]. |
| `action` | VARCHAR | | [cite_start]CREATE, UPDATE, DELETE, LOGIN[cite: 111]. |
| `target_type` | VARCHAR | | [cite_start]USER, ENTITLEMENT[cite: 111]. |
| `target_id` | VARCHAR | | [cite_start]ID of the object affected[cite: 111]. |
| `details` | TEXT | | [cite_start]JSON or text summary of change[cite: 111]. |

### 4.5. Seed Data
Upon initialization, the database must contain:
1.  [cite_start]**Entitlements:** `ROLE_ADMIN`, `ROLE_END_USER`, `Lobby`, `Floor 1`[cite: 114].
2.  **Users:**
    * [cite_start]`admin / admin` (Assigned: `ROLE_ADMIN`, `ROLE_END_USER`, `Lobby`, `Floor 1`)[cite: 116].
    * [cite_start]`user / user` (Assigned: `ROLE_END_USER`, `Lobby`)[cite: 116].

---

## 5. API Specification
[cite_start]**Authentication:** All API endpoints (except Login/Public) require a header: `X-API-KEY: <static-secret-from-env>`[cite: 122].

### 5.1. User Operations
* [cite_start]`GET /api/users` - List all users (light payload)[cite: 125].
* [cite_start]`GET /api/users/{username}` - Get details + entitlements for specific user[cite: 126].
* [cite_start]`POST /api/users` - Create user (Payload: username, email, names, initial password)[cite: 127].
* [cite_start]`PUT /api/users/{username}` - Update profile fields[cite: 128].
* [cite_start]`DELETE /api/users/{username}` - Hard delete user[cite: 129].

### 5.2. Entitlement Operations
* [cite_start]`GET /api/entitlements` - List all available definitions[cite: 131].
* [cite_start]`POST /api/entitlements` - Create new entitlement definition[cite: 132].
* [cite_start]`DELETE /api/entitlements/{id}` - Delete definition (error if assigned)[cite: 133].

### 5.3. Assignment Operations
* `POST /api/users/{username}/entitlements`
    * [cite_start]Payload: `{ "entitlementId": "guid" }`[cite: 135, 136].
* [cite_start]`DELETE /api/users/{username}/entitlements/{entitlementId}`[cite: 137].

---

## 6. User Interface (UI) Requirements
[cite_start]The UI should be modern, responsive, and "Demo Ready" (clean CSS, clear loading states)[cite: 139].

### 6.1. Public Views
* [cite_start]**Login Page:** Tabs for "Local Login" and "SSO Login" (Button: "Login with Okta/IdP")[cite: 141].
* [cite_start]**Registration Page:** Simple form for self-service[cite: 141].

### 6.2. Authenticated Views (All Users)
* **My Access (Home):**
    * [cite_start]Card layout displaying user profile info[cite: 144].
    * [cite_start]Visual list of held entitlements (e.g., Badge Icons for "Lobby", "Floor 2")[cite: 145].

### 6.3. Admin Views (Restricted to `ROLE_ADMIN`)
* **User Management Grid:** Table with search/filter. [cite_start]Actions: Edit, Manage Access, History[cite: 147].
* **User Detail View:**
    * [cite_start]Profile form[cite: 151].
    * [cite_start]"Shuttle box" or Multi-select list to Add/Remove Entitlements[cite: 153].
* [cite_start]**Entitlement Definition:** Simple list to add/remove badge points (doors/floors)[cite: 154].
* [cite_start]**Audit Log Viewer:** Chronological table of system events[cite: 155].

---

## 7. Non-Functional Requirements

### 7.1. Security
* [cite_start]**API Security:** Static API Key (configured via Env Variable)[cite: 158].
* [cite_start]**Session:** JWT or Session Cookie for UI access[cite: 159].
* [cite_start]**Secrets:** No hardcoded secrets in code; read from `.env`[cite: 160].

### 7.2. Technology Stack (Recommended)
* [cite_start]**Frontend:** React + Tailwind CSS (for rapid, nice UI)[cite: 162].
* [cite_start]**Backend:** Node.js (Express) OR Python (FastAPI/Flask)[cite: 163].
* [cite_start]**Database:** SQLite (file-based)[cite: 164].
* [cite_start]**Containerization:** Docker + Docker Compose[cite: 165].

### 7.3. Configuration
[cite_start]The app must support a `.env` file with: [cite: 167]
* [cite_start]`PORT=3000` [cite: 168]
* [cite_start]`DB_PATH=/data/badgeapp.db` [cite: 169]
* [cite_start]`API_SECRET=super-secret-key-123` [cite: 170]
* [cite_start]`OIDC_ISSUER=https://dev-12345.okta.com` [cite: 171]
* [cite_start]`OIDC_CLIENT_ID=xyz` [cite: 171]
* [cite_start]`OIDC_CLIENT_SECRET=abc` [cite: 172]
* [cite_start]`OIDC_REDIRECT_URI=http://localhost:3000/login/callback` [cite: 173]

---

## 8. Deliverables
1.  [cite_start]**Source Code:** Frontend/Backend[cite: 175].
2.  [cite_start]**docker-compose.yml:** For one-command startup[cite: 176].
3.  [cite_start]**README.md:** With setup instructions[cite: 177].
4.  [cite_start]**Postman Collection:** A JSON export covering all API endpoints defined in Section 5[cite: 178].