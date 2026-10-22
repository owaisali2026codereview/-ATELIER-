# MERN Stack Technologies

Project: **AI-Powered Luxury Fashion E-Commerce Platform (Atelier AI)**  
Architecture: **MERN Stack (MongoDB, Express.js, React.js, Node.js)**
Architecture and API Management: **Feature-Based Architecture**

---

### 1. MongoDB (Database Tier)

- **MongoDB** — NoSQL document database for storing catalog products, users, cart sessions, orders, reviews, and custom design requests.
- **Mongoose** — Object Data Modeling (ODM) library for schema definition, validation, and data modeling in Node.js.

---

### 2. Express.js (Backend Application Tier)

- **Express.js** — Fast, minimalist Node.js web framework for building the RESTful API endpoints.
- **CORS (`cors`)** — Middleware to handle Cross-Origin Resource Sharing between the React frontend and Express server.
- **Dotenv (`dotenv`)** — Zero-dependency module for loading secret environment variables (DB URI, JWT secret, ports).
- **JSON Web Token (`jsonwebtoken`)** — Stateless authentication and role-based route authorization.
- **Bcrypt.js (`bcryptjs`)** — Secure password salting and hashing.
- **Cookie-Parser (`cookie-parser`)** — Middleware for parsing and managing secure HTTP cookies.
- **Multer (`multer`)** — Middleware for handling `multipart/form-data` file uploads (reference sketches, garment images).

---

### 3. React.js (Frontend Client Tier)

- **React.js** — Component-driven JavaScript library for rendering responsive customer and admin user interfaces.
- **React Router DOM (`react-router-dom`)** — Client-side routing for multi-page storefront navigation, checkout flow, and studio screens.
- **Redux Toolkit (`@reduxjs/toolkit` & `react-redux`)** — Centralized state management for the slide-over cart, user sessions, and multi-step custom design forms.
- **RTK Query (`Redux Toolkit Query`)** — Powerful data fetching, automatic caching, and server state synchronization tool integrated within Redux Toolkit for calling Express API endpoints.
- **Tailwind CSS (`tailwindcss`)** — Utility-first CSS framework for rapid UI development, custom luxury design tokens, responsive grids, and modern layout styling.
- **Lucide React (`lucide-react`)** — Clean, minimalist icon set for UI navigation, cart, search, and action buttons.

---

### 4. Node.js (`Runtime Environment` & Tooling)

- **Node.js** — Server-side JavaScript runtime environment running the backend API and asynchronous services.
- **NPM (`Node Package Manager`)** — Package and dependency manager for both client and server projects.
- **Vite (`vite`)** — Modern frontend development server and bundler for the React client.
- **Nodemon (`nodemon`)** — Development utility that automatically restarts the Node.js server upon file changes.
