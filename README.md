# 📌 Collaborative Project Tool for Students

## 🚀 Overview

The **Collaborative Project Tool for Students** is a cloud-based full-stack application designed to help students efficiently manage group projects. It enables task tracking, file sharing, and seamless team collaboration through a centralized platform.

---

## 🎯 Problem Statement

Students working on group projects often struggle with:

* Task management
* Communication gaps
* File sharing issues

This platform solves these problems by providing a unified cloud-based solution.

---

## 🛠️ Features

* 📋 Project Management System
* ✅ Task Tracking
* 📂 File Sharing
* 👥 Team Collaboration Dashboard
* 🔔 Real-time updates (optional enhancement)

---

## 🏗️ Tech Stack

### 💻 Frontend

* React.js
* Tailwind CSS

### ⚙️ Backend

* Node.js
* Express.js

### 🗄️ Database

* MongoDB / DynamoDB

### ☁️ Cloud Services (AWS)

* DynamoDB – Store project and task data
* S3 – Store shared files
* EC2 – Host backend APIs
* API Gateway – Expose APIs
* Lambda – Serverless functions (optional enhancements)
* CloudWatch – Monitoring and logging
* CloudFront – Deliver frontend globally

---

## 📐 Architecture

User → CloudFront → S3 (Frontend)
↓
API Gateway
↓
EC2 (Backend)
↓
DynamoDB (Data) + S3 (Files)

![alt text](image.png)
link:
https://drive.google.com/file/d/1gZndCvo1FTC7XIfFzpMwcQrzQ1dJvl6A/view?usp=sharing
---

## 🧩 Tasks Implemented

1. Store project data in DynamoDB
2. Store shared files in S3
3. Implement collaboration APIs using EC2
4. Deploy APIs via API Gateway
5. Monitor system using CloudWatch
6. Deliver platform via CloudFront

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/project-management-tool.git
cd project-management-tool
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file:

```
PORT=5000
MONGO_URI=your_database_url
AWS_ACCESS_KEY=your_key
AWS_SECRET_KEY=your_secret
```

---

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### 4️⃣ Build Frontend for Production

```bash
npm run build
```

Upload the `/dist` folder contents to S3 and connect with CloudFront.

---

## 🌐 Deployment Steps

1. Upload frontend build files to S3
2. Configure CloudFront distribution
3. Deploy backend on EC2
4. Connect API Gateway to backend
5. Enable monitoring via CloudWatch

---

## 📊 Monitoring

* Logs and metrics are tracked using CloudWatch
* Helps in debugging and performance analysis

---

## 🔐 Security Considerations

* Use IAM roles for AWS services
* Secure API endpoints
* Enable HTTPS via CloudFront

---



## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---


