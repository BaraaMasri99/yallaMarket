# YallaMarket

YallaMarket is a full-stack digital marketplace for game cards, subscriptions, mobile balance, and digital gift products. It provides a React storefront for customers, an admin area for managing products and orders, and an Express API backed by a local SQLite database.

## Project Status

The project is functional and under active development. The current implementation includes the main application structure, product catalog browsing, authentication, cart and checkout flows, order management, and admin screens.

## Tech Stack

| Layer      | Technology                                 |
| ---------- | ------------------------------------------ |
| Frontend   | React 18, Vite, React Router, Tailwind CSS |
| Backend    | Node.js, Express.js                        |
| Database   | SQLite                                     |
| Auth       | JWT, bcryptjs                              |
| API Client | Axios                                      |

## Features

### Customer

- Browse digital product categories and products
- View product details and related products
- Search products by Arabic or English names within categories
- Register, log in, and log out
- Add items to the cart and update quantities
- Place orders through checkout

### Admin

- Access protected admin pages
- Create, update, and delete products
- View orders
- Update order statuses

### Backend

- REST API with Express
- SQLite schema initialization on server startup
- JWT-based authentication helpers
- Admin-only route protection
- Product, category, authentication, and order endpoints
- Catalog and admin seed scripts for a clean local SQLite setup

## Project Structure

```text
YallaMarket/
+-- client/              # React frontend
|   +-- src/
|   |   +-- components/  # Shared UI components
|   |   +-- context/     # Auth, cart, and language context
|   |   +-- pages/       # Customer and admin pages
|   |   +-- services/    # API service modules
|   +-- package.json
+-- server/              # Express backend
|   +-- src/
|   |   +-- config/      # Environment and database setup
|   |   +-- controllers/ # Route controllers
|   |   +-- middleware/  # Auth and admin middleware
|   |   +-- models/      # Data access helpers
|   |   +-- routes/      # API routes
|   |   +-- seeders/     # Seed scripts
|   |   +-- utils/       # Password and JWT utilities
|   +-- package.json
+-- docs/                # Requirements and design documentation
+-- README.md
```

## API Overview

The backend exposes the following main routes:

```text
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/categories
GET    /api/categories/:id
GET    /api/categories/slug/:slug
GET    /api/products
GET    /api/products/:id
GET    /api/products/related/:id
POST   /api/products              # admin
PUT    /api/products/:id          # admin
DELETE /api/products/:id          # admin
POST   /api/orders
GET    /api/orders                # admin
GET    /api/orders/my
GET    /api/orders/:id
PUT    /api/orders/:id/status     # admin
```

## Getting Started

### Prerequisites

- Node.js installed
- npm installed

### 1. Install Dependencies

```bash
cd client
npm install

cd ../server
npm install
```

### 2. Configure Environment

The server works with default development values, but you can create `server/.env` if you want to customize them:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/yalla-market.sqlite
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=7d
```

For the frontend, create `client/.env` when the API is running on a different origin:

```env
VITE_API_BASE_URL=http://localhost:5000
```

If the frontend is served through a proxy or the same origin as the API, this variable can be omitted.

### 3. Seed Initial Data

From the `server` directory:

```bash
npm run seed:catalog
npm run seed:admin
```

The SQLite database file is created automatically at the configured `DATABASE_PATH`.

### 4. Run the Backend

From the `server` directory:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

### 5. Run the Frontend

From the `client` directory:

```bash
npm run dev
```

The web app runs on `http://localhost:5173` by default.

## Available Scripts

### Frontend

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the Vite development server |
| `npm run build`   | Build the frontend for production |
| `npm run preview` | Preview the production build      |

### Backend

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the API with nodemon               |
| `npm start`            | Start the API with Node                  |
| `npm run seed:catalog` | Seed product categories and catalog data |
| `npm run seed:admin`   | Seed an admin user                       |

## Documentation

Project documentation is stored in the `docs/` directory and includes requirements and design artifacts such as SRS and UML documents.

## Authors

- Baraa Masri
- Hamed Bizreh
- Yehya Zayoud

Computer Science Apprenticeship - Year 2
