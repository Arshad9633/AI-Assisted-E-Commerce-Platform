# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## 🚀 Setup

1. Install dependencies
   ```bash
   npm install
   npm i -D tailwindcss @tailwindcss/vite @tailwindcss/forms
   ```

2. Configure **Vite**
   ```js
   // vite.config.js
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   import tailwind from '@tailwindcss/vite'

   export default defineConfig({
     plugins: [react(), tailwind()],
   })
   ```

3. Configure **Tailwind in CSS**
   ```css
   /* src/index.css */
   @import "tailwindcss";
   @plugin "@tailwindcss/forms";
   ```

4. Import CSS in entry
   ```jsx
   // src/main.jsx
   import './index.css'
   ```

---

## 📄 Pages

### 🔑 Sign In
- Email + password input  
- Client-side validation with **react-hook-form + zod**  
- "Remember me" option  
- Redirects to Dashboard after login  

### 📝 Sign Up
- Name, email, password, confirm password  
- Password rules (uppercase, lowercase, number, min 8 chars)  
- Validates "passwords match"  
- Redirects to Sign In after account creation  

---

## 📦 Features
- Responsive design with Tailwind v4  
- Accessible inputs and buttons  
- Token storage in `localStorage`  
- Reusable `Input` and `Button` components  
- Dashboard with protected route example  

---

## 🖼️ Preview

### Sign Up Page
![Sign Up](docs/screenshots/signup.png)

### Sign In Page
![Sign In](docs/screenshots/signin.png)
