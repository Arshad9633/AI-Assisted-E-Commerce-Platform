# 🛒 AI-Assisted E-Commerce Platform

A modern full-stack e-commerce application with an **AI shopping assistant**.  
Built with **React, Spring Boot, MongoDB, Stripe, and Docker**.  

---

## ✨ Features

### MVP
- 🔐 **Authentication & Authorization** – JWT-based login/signup (Customer & Admin roles)  
- 📦 **Product Catalog** – Categories, inventory, search & filters  
- 🛒 **Shopping Cart & Orders** – Add to cart, checkout, order history  
- 💳 **Payments** – Stripe integration (test mode)  
- 🛠️ **Admin Dashboard** – Manage products, categories, and orders  

### AI Layer (Phase 2)
- 🔎 **Semantic Product Search** – Natural language queries using embeddings  
- 📊 **Product Comparison Agent** – Side-by-side spec tables + recommendation  
- 🤖 **Checkout Helper** – AI agent answers questions on warranty, shipping & returns  

---

## 🏗️ Tech Stack

**Frontend:** React (Vite) · TailwindCSS · React Query · React Router  
**Backend:** Spring Boot · Spring Security · MongoDB · Stripe API  
**AI:** OpenAI / LangChain4j · Redis Vector / FAISS  
**DevOps:** Docker · GitHub Actions · CI/CD pipelines  

---

## 📂 Project Structure

## 🔗 Connecting Frontend and Backend

The project runs as three Docker Compose services: **MongoDB**, **Spring Boot backend**, and **React (Vite) frontend**.

### How they connect

- **Backend (Spring Boot)**
    - Runs on `backend:8000` inside the Docker network
    - Connects to MongoDB with  
      `SPRING_DATA_MONGODB_URI=mongodb://mongodb:27017/ecommerceDB`

- **Frontend (React + Vite + Nginx)**
    - Served at [http://localhost:3000](http://localhost:3000)
    - Built with `VITE_API_BASE=/api` so all API requests go to `/api/...`

- **Nginx Proxy**
    - Configured to forward `/api/...` requests from the frontend container to the backend container (`backend:8000`)
    - This means the browser always talks to `http://localhost:3000/api/...`
    - No CORS issues, since both frontend and backend share the same origin

### Workflow

1. User opens the frontend at **http://localhost:3000**
2. When submitting the Sign Up or Sign In forms:
    - The frontend makes a request to `/api/auth/signup` or `/api/auth/signin`
3. Nginx receives this request and proxies it to the backend at `http://backend:8000`
4. The backend processes it, talks to MongoDB, and sends back a response
5. The frontend displays the result (login success, error, etc.)

### Test it

- Open [http://localhost:3000/signup](http://localhost:3000/signup) to create a new account
- Open [http://localhost:3000/signin](http://localhost:3000/signin) to log in with that account

All requests flow through `http://localhost:3000/api/...` and reach the backend transparently via Nginx.

