# 🔧 Helper API – Feroot Integration Backend

This is a Node.js + TypeScript backend that integrates with the Feroot platform to fetch and process data such as scripts, vendors, and dashboards. It provides a structured and scalable service architecture suitable for internal tooling and API consumption.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/monajemisina/helper-api.git
cd helper-api
2. Install Dependencies
npm install
3. Configure Environment Variables
Create a .env file in the root directory with the following keys:

env
Copy
Edit
# API Endpoints
FEROOT_API_SCRIPT_URL=
FEROOT_API_VENDOR_URL=
FEROOT_API_DASH_URL=
FEROOT_API_BASE_URL=

# API Authentication
FEROOT_API_KEY=

# Source URL for extracting UUIDs
FEROOT_SOURCE_URL=

🛠 Scripts
Command	Description
npm run dev	Start the dev server
npm run build	Compile TypeScript
npm run lint	Run ESLint for code quality

📦 Tech Stack
Node.js

TypeScript

Express

Axios

dotenv

