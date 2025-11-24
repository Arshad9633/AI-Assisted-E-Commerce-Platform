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
## 🟩 Frontend — Slug Routing + Product Fetch

The React frontend generates URLs like:

```
/products/men/shoes
/products/women/bags
```

### How it works:

1. `gender` and `categorySlug` are extracted using `useParams()`.
2. The slug (`"shoes"`) is converted back to `"Shoes"` for readability.
3. Axios calls:
   ```js
   axios.get("/api/products/filter", {
     params: { gender, categorySlug }
   })
   ```
4. Products returned from the backend are displayed in a responsive grid layout.
5. If the category has no products, a `"No products found"` message is shown.

This structure allows dynamic storefront loading and clean navigation from the navbar to product listing pages.

---

## ✔ Result

Users can click any category (e.g., *Women → Bags*) and instantly load all matching published products, thanks to a clean separation of concerns:

- **Backend** resolves categories and fetches products.
- **Frontend** formats URLs, handles slugs, and displays results.

This provides a smooth and scalable category‑based browsing experience.

## 2. Frontend: Notifications in Navbar

### 2.1. Axios auth setup

`axiosAuth` is your authenticated HTTP client used by the notification logic:

```js
// src/api/axiosAuth.js
import axios from "axios";

const axiosAuth = axios.create({
  baseURL: "/api",
});

axiosAuth.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem("auth_user");
    const user = raw ? JSON.parse(raw) : null;

    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch (err) {
    console.error("Failed to parse auth_user:", err);
  }

  return config;
});

export default axiosAuth;
```

Because `baseURL` is `/api`, the calls:

- `axiosAuth.get("/notifications")` → `GET /api/notifications`
- `axiosAuth.post("/notifications/read")` → `POST /api/notifications/read`
- `axiosAuth.post("/notifications/clear")` → `POST /api/notifications/clear`

are correctly aligned with the backend.

---

### 2.2. Notification state & API calls in Navbar

In `Navbar.jsx` you hold notification state and functions:

```jsx
const [notifications, setNotifications] = useState([]);
const [openNoti, setOpenNoti] = useState(false);

const unreadCount = notifications.filter((n) => !n.read).length;

const fetchNotifications = async () => {
  if (!isAuthenticated) return;
  try {
    const res = await axiosAuth.get("/notifications");
    const list = Array.isArray(res.data) ? res.data : [];
    setNotifications(list);
  } catch (err) {
    console.error("NOTIFICATION ERROR:", err);
  }
};

const markAllRead = async () => {
  if (!isAuthenticated) return;
  try {
    await axiosAuth.post("/notifications/read");
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  } catch (err) {
    console.error("MARK READ ERROR:", err);
  }
};

const clearAllNotifications = async () => {
  if (!isAuthenticated) return;
  try {
    await axiosAuth.post("/notifications/clear");
    setNotifications([]);
  } catch (err) {
    console.error("CLEAR NOTIFICATIONS ERROR:", err);
  }
};
```

#### Polling for new notifications

```jsx
useEffect(() => {
  if (!isAuthenticated) {
    setNotifications([]);
    return;
  }

  fetchNotifications();                 // initial fetch

  const interval = setInterval(fetchNotifications, 15000); // every 15s
  return () => clearInterval(interval);
}, [isAuthenticated]);
```

- When the user logs in, notifications are fetched immediately.
- Then, every 15 seconds, the Navbar will ping `/api/notifications` to get new ones.
- If the user logs out, notifications are cleared on the frontend.

---

### 2.3. Desktop bell icon & dropdown

In the desktop layout, the notification bell is shown when authenticated:

```jsx
{isAuthenticated && (
  <div className="relative">
    <button
      onClick={toggleNotifications}
      className="relative p-1 text-gray-800 hover:text-indigo-600"
    >
      <Bell className="h-6 w-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
          {unreadCount}
        </span>
      )}
    </button>

    {openNoti && (
      <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-lg
                      rounded-2xl shadow-2xl border border-indigo-100 z-[999] p-3">
        <NotificationPanel
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          onClearAll={clearAllNotifications}
        />
      </div>
    )}
  </div>
)}
```

`unreadCount` is used for the red badge on the bell.

---

### 2.4. Mobile bell icon

On mobile (small screens), the bell appears next to the hamburger menu:

```jsx
<div className="md:hidden flex items-center gap-2">
  {isAuthenticated && (
    <div className="relative">
      <button
        onClick={toggleNotifications}
        className="relative p-1 text-gray-800 hover:text-indigo-600"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {openNoti && (
        <div className="absolute right-0 mt-3 w-80 max-w-[90vw] bg-white/95
                        backdrop-blur-lg rounded-2xl shadow-2xl border border-indigo-100 z-[999] p-3">
          <NotificationPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllRead}
            onClearAll={clearAllNotifications}
          />
        </div>
      )}
    </div>
  )}

  {/* Hamburger */}
  <button
    className="p-2 rounded-md hover:bg-gray-100 text-gray-700"
    onClick={() => {
      setOpenMobile((v) => !v);
      setOpenMen(false);
      setOpenWomen(false);
    }}
  >
    {/* icon */}
  </button>
</div>
```

The same `NotificationPanel` is reused, so desktop and mobile stay consistent.

---

### 2.5. NotificationPanel component (UI)

`NotificationPanel` is a small presentational component that shows:

- Header with title
- `Mark all read` button (if there are unread notifications)
- `Clear` button (if there are any notifications)
- List of notifications with different styling for `read` vs `unread`

```jsx
function NotificationPanel({
  notifications,
  unreadCount,
  onMarkAllRead,
  onClearAll,
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
            Activity
          </p>
          <h4 className="text-sm font-bold text-gray-800">Notifications</h4>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-[11px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-[11px] px-2 py-1 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 && (
        <p className="text-sm text-gray-500 py-4 text-center">
          You’re all caught up ✨
        </p>
      )}

      <div className="max-h-64 overflow-y-auto space-y-2 mt-1">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${
              n.read
                ? "bg-gray-50 border-gray-200"
                : "bg-indigo-50 border-indigo-200"
            }`}
          >
            <div
              className={`mt-1 h-2 w-2 rounded-full ${
                n.read ? "bg-gray-300" : "bg-indigo-500"
              }`}
            />
            <div className="flex-1">
              <p className="text-gray-800">{n.message}</p>
              <p className="text-[11px] text-gray-500 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
```

---

## 3. End-to-end flow

1. **Customer places an order.**  
   `Order` document is saved with `status = PENDING`.

2. **Admin opens the Admin Orders page** and changes status of an order to `PAID` or `SHIPPED`.  
   `OrderAdminController.updateStatus(...)`:
    - Updates the `Order` in MongoDB
    - Creates a `Notification` with `userEmail`, `message`, `read = false`, `createdAt = now`

3. **Customer is logged in**, Navbar is mounted:
    - Calls `/api/notifications` using `axiosAuth` to get all notifications for that user.
    - Shows the bell icon with red unread badge.

4. Customer opens the **notification dropdown**:
    - Sees latest messages with timestamps.

5. Customer clicks **“Mark all read”**:
    - Frontend: `POST /api/notifications/read`
    - Backend: sets `read = true` on all user notifications.
    - UI updates: all notifications become “read” style, badge count goes to 0.

6. Customer clicks **“Clear”**:
    - Frontend: `POST /api/notifications/clear`
    - Backend: `deleteByUserEmail(email)` → removes all notifications for that user.
    - UI: local `notifications` state resets to `[]`, panel shows “You’re all caught up ✨”.

## 📄 License
This project is free to use for learning and development.

