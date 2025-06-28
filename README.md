# 🔧 Helper API – Feroot Integration Backend

A lightweight Node.js + TypeScript backend for integrating with the **Feroot** platform. This service fetches and processes data including **scripts**, **vendors**, and **dashboard-related metrics**, exposing a clean internal API structure for internal tooling or further integration.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/monajemisina/helper-api.git
cd helper-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and define the following keys:

```env
# API Endpoints
FEROOT_API_BASE_URL=https://app.feroot.com/api/v1/platform

# API Authentication
FEROOT_API_KEY=

# Source URL used to extract UUIDs (project & data source)
FEROOT_SOURCE_URL=
```

#### 🔑 How to Find Your Feroot API Key
- Log into your Feroot tenant.
- Go to **Settings → Account → Developer**.
- Click **Create API Key** to generate and copy it.

#### 🌐 How to Find the Source URL
- From the Feroot dashboard, go to **Data Sources**.
- Click on a specific crawler and copy the full source URL from the address bar.

---

## 🛠️ Available Scripts

| Command         | Description                     |
|------------------|---------------------------------|
| `npm run dev`     | Start the development server    |
| `npm run build`   | Compile the TypeScript code     |

---

## 🔎 Querying the API

The API supports filtering and pattern-based search via query parameters:

### ✅ Scripts Endpoint

- `GET /scripts?name=all`  
  → Returns a list of all script names.

- `GET /scripts?name=ferry`  
  → Returns scripts with names containing `"ferry"`.

- `GET /scripts?url=all`  
  → Returns a list of all script URLs.
  
### ✅ Vendors Endpoint

- `GET /vendors?name=all`  
  → Returns a list of all vendor names.

- `GET /vendors?name=facebook`  
  → Returns vendors whose names include `"facebook"` or `"google"`.

---

## 📦 Tech Stack

- **Node.js**
- **TypeScript**
- **Express.js**
- **Axios**
- **dotenv**

---
