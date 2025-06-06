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

# API Endpoints
FEROOT_API_BASE_URL= 
How to find: 
Go to Api Doc on tenant for reference

# API Authentication
FEROOT_API_KEY=
How to find:
Go to your Feroot tenant, navigate to Settings → Account → Developer, and click Create API Key to generate one.

# Source URL for extracting UUIDs
FEROOT_SOURCE_URL=
How to find:
Go to your Feroot dashboard, navigate to Data Sources, and click on the specific crawler. You’ll be able to copy the full source URL from the browser.

🛠 Scripts
Command	Description
npm run dev	Start the dev server
npm run build	Compile TypeScript

📦 Tech Stack
Node.js

TypeScript

Express

Axios

dotenv

