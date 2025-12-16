# 💼 Expense Management System

A role-based Expense Management System that automates employee expense submission, approval workflows, and reimbursements with multi-level and conditional approvals.

---

## 🚀 Project Overview

The Expense Management System is designed to eliminate manual, time-consuming, and error-prone expense reimbursement processes. It provides a transparent, configurable, and scalable solution for managing company expenses with support for multiple roles, approval rules, OCR receipt scanning, and multi-currency handling.

---

## ✨ Features

### 🔐 Authentication & Company Setup
- Secure user login and signup
- On first signup:
  - A new company is automatically created
  - Company currency is set based on selected country
  - An Admin user is auto-created

---

### 👥 User & Role Management
- Role-based access control:
  - Admin
  - Manager
  - Employee
- Admin can create users and assign roles
- Define employee-manager relationships
- Configure approval sequences and rules

---

### 🧾 Expense Submission
Employees can:
- Submit expense claims with:
  - Amount (supports different currencies)
  - Category
  - Description
  - Date
- Upload or scan receipts
- View expense status (Pending / Approved / Rejected)

---

### ✅ Approval Workflow
- Multi-level approval support
- Configurable approval order
- Example flow:
  ```
  Manager → Finance → Director
  ```
- Expense moves to next approver only after approval
- Approvers can approve or reject with comments

---

### 🔀 Conditional Approval Rules
- Percentage-based approval
  - Example: If 60% approvers approve → Expense approved
- Specific approver approval
  - Example: CFO approval → Auto-approved
- Hybrid rules combining both approaches

---

### 🧠 OCR Receipt Scanning
- Scan receipts using OCR
- Automatically extract:
  - Amount
  - Date
  - Description
  - Expense category
  - Vendor / merchant name

---

### 🌍 Multi-Currency Support
- Company currency auto-set using country selection
- Expenses can be submitted in any currency
- Automatic currency conversion using live exchange rates

---

## 🧑‍💼 Roles & Permissions

### Admin
- Manage company and users
- Assign roles and managers
- Configure approval rules
- View and override all expenses

### Manager
- View team expenses
- Approve or reject claims
- View expenses in company currency

### Employee
- Submit expenses
- Upload receipts
- Track approval status
- View expense history

---

## 🔗 External APIs

- Country & Currency API  
  https://restcountries.com/v3.1/all?fields=name,currencies

- Currency Exchange API  
  https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}

---

## 🎨 Mockups
- UI & workflow design:  
  https://link.excalidraw.com/l/65VNwvy7c4X/4WSLZDTrhkA

---

## 🛠️ Tech Stack
- Frontend: React + Vite
- Backend: Node.js / Express
- Database: SQL (MySQL / PostgreSQL)
- OCR: Receipt text extraction
- APIs: REST-based services

---

## 🎯 Benefits
- Automated approvals
- Flexible approval workflows
- Reduced manual errors
- Transparent expense tracking
- Scalable for enterprise use

---

## 🏁 Conclusion

The Expense Management System modernizes expense handling by combining automation, conditional approvals, OCR technology, and multi-currency support into a single powerful platform.
