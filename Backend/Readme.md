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




