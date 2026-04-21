# 🏪 Retail Billing System (Full Stack POS)

This project is a full-stack retail billing (POS) system designed to handle everyday shop operations like managing products, customers, and generating bills.

I built this to get hands-on experience with a real-world full-stack setup using Spring Boot and React, focusing on clean structure, maintainability, and practical features.

---

## 🧰 Tech Stack

* **Backend:** Spring Boot (Java 17), Spring Data JPA, JWT Security
* **Frontend:** React (Hooks + Context API)
* **Database:** MySQL

---

## 📂 Project Structure

```bash
retail-billing-system/
├── backend/
│   ├── src/main/java/com/retail/billing/
│   │   ├── BillingApplication.java
│   │   │
│   │   ├── config/
│   │   │   ├── CorsConfig.java
│   │   │   ├── DataInitializer.java
│   │   │   └── SecurityConfig.java
│   │   │
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── CustomerController.java
│   │   │   ├── OrderController.java
│   │   │   └── ProductController.java
│   │   │
│   │   ├── dto/
│   │   │   ├── CustomerDTO.java
│   │   │   ├── DashboardDTO.java
│   │   │   ├── OrderDTO.java
│   │   │   └── ProductDTO.java
│   │   │
│   │   ├── entity/
│   │   │   ├── AppUser.java
│   │   │   ├── Customer.java
│   │   │   ├── Order.java
│   │   │   ├── OrderItem.java
│   │   │   └── Product.java
│   │   │
│   │   ├── exception/
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── ResourceNotFoundException.java
│   │   │
│   │   ├── repository/
│   │   │   ├── AppUserRepository.java
│   │   │   ├── CustomerRepository.java
│   │   │   ├── OrderRepository.java
│   │   │   └── ProductRepository.java
│   │   │
│   │   ├── security/
│   │   │   ├── JwtFilter.java
│   │   │   └── JwtUtil.java
│   │   │
│   │   └── service/
│   │       ├── CustomerService.java
│   │       ├── OrderService.java
│   │       └── ProductService.java
│   │
│   ├── src/main/resources/
│   │   └── (application.properties/ is ignored)
│   │
│   ├── pom.xml
│   └── (target/ is ignored)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   └── src/
│       ├── App.js
│       ├── index.js
│       ├── index.css
│       │
│       ├── components/
│       │   └── Sidebar.js
│       │
│       ├── context/
│       │   ├── AuthContext.js
│       │   └── ThemeContext.js
│       │
│       ├── services/
│       │   └── api.js
│       │
│       └── pages/
│           ├── Billing.js
│           ├── CustomerBilling.js
│           ├── Customers.js
│           ├── Dashboard.js
│           ├── Login.js
│           ├── MyOrders.js
│           ├── Orders.js
│           └── Products.js
│
├── database/
│   └── schema.sql
│
├── .gitignore
└── README.md
```

---

## ⚙️ How to Run the Project

### 1. Create Database

```sql
CREATE DATABASE retail_billing;
```

---

### 2. Start Backend

```bash
cd backend
```

Update database credentials in:

```bash
src/main/resources/application.properties
```

Then run:

```bash
mvn spring-boot:run
```

Backend runs on:
👉 http://localhost:8080

---

### 3. Start Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on:
👉 http://localhost:3000

---

## 🔌 API Overview

### Products

* Add, update, delete products
* Search products
* View low stock items

### Customers

* Manage customer details
* View customer order history

### Orders / Billing

* Create new bills
* Generate invoice
* View dashboard analytics

---

## ✨ Features

* Product CRUD operations
* Live product search
* Cart system with quantity controls
* Automatic billing calculation
* Discount support (%)
* Multiple payment methods
* Invoice generation (printable)
* Stock updates after each sale
* Low stock alerts
* Customer management
* Order history tracking
* Dashboard with sales insights
* Top-selling products
* Dark mode toggle
* JWT-based authentication
* Centralized error handling

---

## 🗄️ Database

Tables are automatically created using Hibernate.
You can also refer to `database/schema.sql` for structure.

---

## 🔧 Configuration

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/retail_billing
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

app.low-stock-threshold=10
```

---

## 🧪 Sample API Request

**POST /api/orders**

```json
{
  "customerName": "Ravi Kumar",
  "customerPhone": "9876543210",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ],
  "discountPercent": 5,
  "paymentMethod": "UPI"
}
```

---

## 📌 Notes

This project was built as a practical learning project to understand how a full-stack billing system works end-to-end.

It covers backend architecture, API design, frontend state management, and basic authentication.

There’s still room for improvement, like adding role-based access, deployment, and better reporting features.

---
