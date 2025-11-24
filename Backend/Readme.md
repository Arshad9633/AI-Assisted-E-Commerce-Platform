# 🛒 AI-Commerce — Backend Authentication
**Spring Boot 3 + MongoDB + JWT (HS512)**

This repository contains the **authentication and user management backend** for an e-commerce platform.  
It provides secure **Sign Up / Sign In** endpoints with stateless JWT authentication.

> 🟢 New users are assigned the `CUSTOMER` role by default.  
> 🔑 Admin promotion can be performed later via an Admin Panel.

---

## 🚀 Features
- 🔐 **JWT Authentication** (HS512) with strong secret enforcement
- 🧂 **BCrypt** password hashing
- 📧 Email normalization (`trim + lowercase`)
- 👥 Role-based model: `CUSTOMER` and `ADMIN`
- 🐳 Docker Compose support (MongoDB + Backend)
- ⚡ Stateless Spring Security (no sessions, CSRF disabled)

---

## 🗂 Project Structure
```
backend/
 ├── src/main/java/com/example/auth
 │    ├── controller   # REST endpoints
 │    ├── entity       # User model
 │    ├── repository   # Mongo repositories
 │    ├── security     # JWT filter, config, utils
 │    └── service      # Business logic
 ├── src/main/resources
 │    └── application.properties
 ├── Dockerfile
 └── docker-compose.yml
```

---

## 🔑 Authentication Flow

### **Sign Up**
**Endpoint**  
`POST /api/auth/signup`

**Request Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Steps**
1. Validate + normalize email
2. Check if email already exists
3. Hash password with BCrypt
4. Assign role = `CUSTOMER`
5. Save to MongoDB

---

### **Sign In**
**Endpoint**  
`POST /api/auth/signin`

**Request Body**
```json
{
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Process**
1. Validate + normalize email
2. Load user & verify password
3. Issue JWT with `sub=email`, `roles`, `iat`, `exp`
4. Return JSON response

**Response Example**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "email": "john@example.com",
  "roles": ["CUSTOMER"]
}
```

---

### **Security Rules**
- Stateless (`SessionCreationPolicy.STATELESS`)
- CSRF disabled
- Public endpoints: `/api/auth/**`, `/error/**`
- Protected endpoints require `Authorization: Bearer <token>`
- JWT filter pipeline:
    1. Extract token from header
    2. Validate (signature + expiration)
    3. Set `SecurityContext`

---

## ⚙️ Requirements
- **Java 21**
- **Maven 3.9+**
- **Docker & Docker Compose**
- Strong **JWT secret** (≥64 bytes, base64 encoded)

Generate secret (Windows PowerShell):
```powershell
[Convert]::ToBase64String((1..64 | % { Get-Random -Maximum 256 }))
```

---

## 🐳 Running Locally with Docker
```bash
# Build & start containers
docker compose up --build
```

Backend will run at → `http://localhost:8080`  
MongoDB at → `mongodb://localhost:27017`

---

## ▶️ Running Without Docker
```bash
# 1. Start MongoDB locally
mongod --dbpath /path/to/mongo/data

# 2. Run Spring Boot
./mvnw spring-boot:run
```

---

## 🔒 Environment Variables
Create a `.env` file in the backend root:
```ini
JWT_SECRET=your-64-byte-base64-secret
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/ecommerce
```

⚠️ **Do not commit `.env`** — it’s in `.gitignore`.

---

## 🛡️ Security Highlights
- **HS512 JWT** with long secret
- **BCrypt** with adaptive hashing
- **Role-based access control**
- **Stateless → no session hijacking**
- Clear separation of `CUSTOMER` and `ADMIN`

---

# Route Auth (Spring Boot + MongoDB + JWT)

This backend exposes three pages with different access levels:

| Route              | Who can access          | Notes              |
|--------------------|-------------------------|--------------------|
| `GET /home`        | Anyone                  | Public landing     |
| `GET /home/user`   | Logged-in USER or ADMIN | Requires JWT       |
| `GET /home/admin`  | ADMIN only              | Requires JWT       |

## How it works

- **JWT** is issued at `POST /api/auth/signin`. Send it on future requests as `Authorization: Bearer <token>`.
- **Security filter** (`JwtFilter`) reads the header, validates the token, loads the user from Mongo, and sets the authentication in the SecurityContext.
- **Authorities** are built from `User.roles` as `ROLE_CUSTOMER` and `ROLE_ADMIN` by `UserDetailsServiceImpl`.
- **Route rules** (in `SecurityConfig`):
  ```java
  .requestMatchers("/home").permitAll()
  .requestMatchers("/home/user").hasAnyRole("CUSTOMER", "ADMIN")
  .requestMatchers("/home/admin").hasRole("ADMIN")
  ```
- **Models**:
  - `ERole { CUSTOMER, ADMIN }`
  - `Role { id, name: ERole }`
  - `User { id, name, email, password, roles: Set<Role> }`

## Configuration

Use environment variables (via Docker Compose) or `application.properties`.

# 📦 Product Catalog Module (Admin + Public API)

This module provides the complete backend implementation for managing and displaying products in the **AI-Assisted E-Commerce Platform**.

It includes:

- Full Admin Catalog Management (Categories + Products)
- Public-facing Product Browsing API
- Search, filtering, pagination, sorting
- MongoDB-optimized data models
- Clean DTO-based responses

---

## 🏛️ 1. Admin Catalog Management

Administrators can create and manage categories and products through protected endpoints under:

```
/api/admin/catalog
```

Admin access is enforced using:

```
@PreAuthorize("hasRole('ADMIN')")
```

---

## ✔ 1.1 Create Category

**POST** `/api/admin/catalog/categories`

Allows admins to create product categories such as:

- Shoes
- Bags
- Clothing
- Beauty
- Accessories
- Sportswear
- Watches

Each category is tied to a **gender**: `MEN` or `WOMEN`.

### Request Body

```json
{
  "name": "Shoes",
  "gender": "MEN"
}
```

---

## ✔ 1.2 List Categories

**GET** `/api/admin/catalog/categories`

Returns all available categories along with their:

- ID
- Name
- Gender

---

## 🛒 2. Admin Product Management

Admins can manage products under:

```
/api/admin/catalog/products
```

---

## ✔ 2.1 Create Product

**POST** `/api/admin/catalog/products`

### Validations

- `price` is required
- `discountPrice <= price`
- Category must exist
- Slug must be unique
- Stock cannot be negative
- Status must be one of: `DRAFT`, `PUBLISHED`, `ARCHIVED`

---

## ✔ 2.2 Update Product

**PUT** `/api/admin/catalog/products/{id}`

Editable fields:

- Title
- Slug
- Description
- Price / Discount Price
- Currency
- Stock
- Status
- Images
- Category
- Tags

---

## ✔ 2.3 Delete Product

**DELETE** `/api/admin/catalog/products/{id}`

---

## ✔ 2.4 List All Products

**GET** `/api/admin/catalog/products`

Returns all products with **category metadata** included.

---

# 🌍 3. Public Product API (No Authentication Required)

Public-facing product API under:

```
/api/products
```

Only products with status:

```
PUBLISHED
```

are returned.

---

## ✔ 3.1 List Products

**GET** `/api/products`

### Supports:

#### 👉 Search
`/api/products?search=sneakers`

#### 👉 Gender filtering
`/api/products?gender=MEN`

#### 👉 Category filtering
`/api/products?categoryId=abc123`

#### 👉 Pagination
`/api/products?page=0&limit=12`

#### 👉 Sorting
`/api/products?sort=createdAt:desc`

---

## ✔ 3.2 Get Product by Slug

**GET** `/api/products/{slug}`

Example:

```
/api/products/air-max-90
```

Returns `ProductResponse` containing:

- Title, Description
- Price, Discount
- Images
- Stock, Status
- Category info
- Created / Updated timestamps

---

# 🧩 4. Internal Design & Conventions

## 📘 DTO Usage

Backend uses DTOs such as:

- `ProductResponse`
- `ProductImageDto`
- `CategoryResponse`

Benefits:

- Clean API
- Prevents leaking internal schema
- Easy frontend integration

---

# 📚 MongoDB Schema

- Category IDs are **String** (Mongo ObjectId)
- Product stores its category as a **String categoryId**
- Products reference categories in a clean one-to-many relationship

---

# 🛠 5. Completed Backend Features

## ✔ Admin Features

- Add categories
- List categories
- Create product
- Update product
- Delete product
- Retrieve all products with category metadata

## ✔ Public Features

- Browse published products
- Search functionality
- Gender filtering
- Category filtering
- Product detail via slug
- Pagination & sorting

---
## 1. Backend: Notifications

### 1.1. Core idea

When an **order status** is changed by an admin (e.g. from `PENDING` to `PAID` or `SHIPPED`), the backend creates a **Notification** document for the corresponding user.  
On the customer side, authenticated users can:

- Fetch their notifications
- Mark all as read
- Clear all notifications

All notification endpoints are **protected** and require a valid JWT token.

---

### 1.2. Notification Entity (MongoDB)

A typical `Notification` entity looks like this (simplified example):

```java
@Document("notifications")
public class Notification {

    @Id
    private String id;

    // The email of the user who should receive this notification
    private String userEmail;

    // The message shown in the frontend
    private String message;

    // If the notification has been read in the UI
    private boolean read;

    // When this notification was created
    private Instant createdAt;
}
```

> Your actual class may contain small variations, but this is the core structure.

---

### 1.3. NotificationRepository

The repository provides query methods used by the controller:

```java
@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    // All notifications for a user, newest first
    List<Notification> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    // Delete all notifications for a user
    void deleteByUserEmail(String userEmail);
}
```

These methods are used to **list**, **update**, and **delete** notifications.

---

### 1.4. NotificationController

The controller exposes **three** main endpoints under `/api/notifications`.

```java
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // 1. GET /api/notifications
    // Return all notifications for the currently authenticated user
    @GetMapping
    public List<Notification> getNotifications(
            @AuthenticationPrincipal(expression = "username") String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    // 2. POST /api/notifications/read
    // Mark all notifications as read for the current user
    @PostMapping("/read")
    public String markAllRead(
            @AuthenticationPrincipal(expression = "username") String email) {
        List<Notification> list =
                notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
        return "OK";
    }

    // 3. POST /api/notifications/clear
    // Delete all notifications for the current user
    @PostMapping("/clear")
    public String clearAll(
            @AuthenticationPrincipal(expression = "username") String email) {
        notificationRepository.deleteByUserEmail(email);
        return "OK";
    }
}
```

#### Notes

- `@AuthenticationPrincipal(expression = "username") String email`  
  uses the authenticated Spring Security principal (set by the JWT filter) and extracts the `username` (email) of the logged-in user.
- All operations are **per-user**: every user only sees and modifies their own notifications.

---

### 1.5. SecurityConfig – protecting the endpoints

In `SecurityConfig`, `/api/notifications/**` must be authenticated:

```java
.authorizeHttpRequests(auth -> auth
    // ... other rules ...

    // Orders – must be authenticated
    .requestMatchers("/api/orders/**").authenticated()

    // Cart – must be authenticated
    .requestMatchers("/api/cart/**").authenticated()

    // Notifications – must be authenticated
    .requestMatchers("/api/notifications/**").authenticated()

    // Admin-only endpoints
    .requestMatchers("/api/admin/**").hasRole("ADMIN")

    .anyRequest().authenticated()
)
```

This ensures that only logged‑in users (with a valid JWT) can hit `/api/notifications` and its subpaths.

---

### 1.6. Creating Notifications when Order Status changes

In your `OrderAdminController` (admin side), whenever you update the order status, you can create a notification for that order’s user.

Example inside the `updateStatus` method after saving the order:

```java
@PatchMapping("/{id}/status")
public ResponseEntity<OrderResponse> updateStatus(
        @PathVariable String id,
        @RequestParam OrderStatus status
) {
    return orderRepository.findById(id)
            .map(order -> {
                order.setStatus(status);
                Order saved = orderRepository.save(order);

                // Create a notification for this user
                Notification notification = new Notification();
                notification.setUserEmail(saved.getEmail()); // or saved.getUserId() -> email via lookup
                notification.setMessage("Your order #" + saved.getId() +
                        " status is now " + saved.getStatus());
                notification.setRead(false);
                notification.setCreatedAt(Instant.now());
                notificationRepository.save(notification);

                return ResponseEntity.ok(toOrderResponse(saved));
            })
            .orElse(ResponseEntity.notFound().build());
}
```

Whenever an admin changes the status via this endpoint, a new notification is stored in MongoDB and picked up by the frontend.

---




