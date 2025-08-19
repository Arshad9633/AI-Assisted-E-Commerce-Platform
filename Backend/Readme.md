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

## 📌 Next Steps
- Add **Admin Panel** with "Promote to Admin" endpoint
- Extend auth with **refresh tokens**
- Add **account verification** (email/OTP)

---

## 🤝 Contributing
1. Fork the repo
2. Create a new branch (`feature/xyz`)
3. Commit your changes
4. Open a Pull Request

---

