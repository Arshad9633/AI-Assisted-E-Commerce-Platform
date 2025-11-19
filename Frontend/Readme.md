# E-Commerce Application – Full Stack (React + Vite + Spring Boot + MongoDB)

This project is a full‑stack e-commerce application built using **React + Vite** on the frontend and a **Spring Boot + MongoDB** backend. It supports secure JWT-based authentication, user roles, an admin dashboard, and a fully responsive UI using **Tailwind CSS v4**. The application includes a dynamic navigation bar that updates based on login status, showing the customer name, cart, logout button, and an Admin Panel link for administrators.

Users can browse products on the public home page, sign up, sign in, and interact with authenticated features. Admins receive a dedicated protected route to manage backend data.

---

## 🚀 Features Overview

### 🏠 Public Home
The public homepage is accessible to both guests and authenticated users.  
Logged-in users see:
- Their name in uppercase gradient text  
- A Cart link  
- A Logout button  
- Admin Panel (if they have ADMIN role)

Guests see:
- Sign In  
- Sign Up  

The UI includes a hero slider, featured products, and fully responsive design.

---

## 🔐 Authentication & Authorization

### Sign In
- Email and password with zod validation  
- Stores JWT in localStorage  
- Redirects:
  - **ADMIN → `/home/admin`**
  - **CUSTOMER → `/`**  

### Sign Up
- Name, email, password, confirm-password  
- Strong validation rules  
- Redirects to Sign In after successful registration  

### Auth Flow Features
- Persistent login via localStorage (`AuthContext`)  
- Auto-inject JWT into API requests  
- Secure logout clears localStorage and cookies  
- Route Guards:
  - **GuestRoute** → blocks authenticated users from visiting Sign In / Sign Up  
  - **PrivateRoute** → protects authenticated routes  
  - **RoleProtectedRoute** → ADMIN-only access  

---

## 🛠️ Admin Panel
The admin dashboard is fully protected and accessible only to ADMIN role users.  
Routes include:
- `/home/admin` (Admin Home)
- `/home/admin/users` (User Management)

Admin views include nested routing via `RoleProtectedRoute`.

---

## 🎨 UI Styling
- Built with **Tailwind CSS v4**  
- Uses `@tailwindcss/forms` plugin  
- Gradient text & button styling  
- Responsive navigation bar  
- Support for both desktop and mobile menus  

---

## 🧩 Technology Stack
### Frontend
- React + Vite  
- Tailwind CSS  
- react-hook-form + zod  
- lucide-react icons  
- React Router v6  

### Backend
- Spring Boot  
- MongoDB  
- JWT Security  

### Deployment / DevOps
- Docker Compose (frontend, backend, MongoDB)  
- Hot reloading (frontend + backend)  

---

## 🛳️ Docker Setup

Start all containers:
```bash
docker-compose up --build
```

Containers:
- **frontend** → port 3000  
- **backend** → port 8000  
- **mongodb** → port 27017  

Hot reload works automatically with volume mounts.

---

## 📦 Installation (Frontend)
1. Install dependencies  
```bash
npm install
npm i -D tailwindcss @tailwindcss/vite @tailwindcss/forms
```

2. Vite configuration  
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwind()],
})
```

3. Tailwind  
```css
@import "tailwindcss";
@plugin "@tailwindcss/forms";
```

4. Import CSS in entry  
```jsx
import './index.css'
```


---

## 📁 Project Status
The application supports:
- User authentication  
- Admin role management  
- Product display  
- Dynamic navbar  
- Secure routing  
- Fully Dockerized development setup  

More features like Cart logic, Order flow, and Profile pages can be added anytime.

---

## 📦 Cloudinary Integration

### ✅ What Cloudinary Does

Cloudinary is used to: - Upload product images securely. - Store them in
a dedicated folder structure (`ecommerce/products`). - Automatically
generate a `secure_url` that is saved and displayed in the app.

### ✅ Backend Components Used

#### `CloudinaryConfig.java`

Initializes Cloudinary with: - cloud_name\
- api_key\
- api_secret

Loaded either from: - `application.properties` - or environment
variables (Docker compatible)

#### `ImageUploadService.java`

Handles: - Validation of file type & size - Upload to Cloudinary via the
SDK - Returning the uploaded image URL

#### `AdminUploadController.java`

Exposes:

    POST /api/admin/upload/image

Accepts: - multipart/form-data - only image files - max size = 10 MB

Returns:

``` json
{ "url": "https://res.cloudinary.com/xxx/...jpg" }
```

------------------------------------------------------------------------

## ⚙️ How Image Upload Works (Step-by-Step)

1.  Admin selects a product image.

2.  Frontend sends the file to:

        POST /api/admin/upload/image

3.  Controller validates the file.

4.  File is passed to `ImageUploadService`.

5.  Cloudinary returns a `secure_url`.

6.  URL is stored in the database as part of the product.

7.  Public pages display images directly from Cloudinary CDN.

------------------------------------------------------------------------

## 🖼 Homepage Update -- Dynamic Hero Slider

### What's New

#### ⭐ **HeroSlider now displays the latest 4 products**

-   Automatically updates when new products are added.
-   Always shows one slide at a time (mobile + desktop).
-   Fully responsive.
-   Smooth autoplay + arrow controls.
-   Reinitializes cleanly whenever product data changes.

#### ⭐ Dynamic slides include:

-   Product image (from Cloudinary)
-   Title
-   Price
-   "Latest Arrivals" badge
-   Link to product page

#### ⭐ Improved Mobile Support

-   Slide width issues fixed
-   Tailwind overrides corrected
-   Always one slide per view
-   Clean layout and readable captions

------------------------------------------------------------------------

## 📱 Frontend Enhancements

### HeroSlider.jsx

-   Uses Keen Slider with autoplay
-   Re-mounts using a `sliderKey` when data updates
-   Handles both desktop & mobile layouts
-   Ensures correct aspect ratio across devices

### PublicHome.jsx

-   Fetches latest products using:

    ``` js
    useProducts({ page: 0, limit: 12, sort: "createdAt:desc" })
    ```

-   Passes first 4 products to HeroSlider

-   Clean featured product grid

## 📄 License
This project is free to use for learning and development.

