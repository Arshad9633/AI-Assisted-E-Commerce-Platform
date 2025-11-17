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





