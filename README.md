# 🎓 Peer-to-Peer Learning Platform with AI Tutor

> **A full-stack learning platform that enables students to share educational resources, watch learning content, and interact with an AI-powered tutor for intelligent document-based question answering.**

---

# ✨ Features

### 👨‍🎓 Student Portal
- Secure student registration and login
- Browse learning resources department-wise
- Watch educational videos
- Upload learning materials via file or URL
- Password recovery functionality

### 👨‍💼 Admin Portal
- Secure administrator authentication
- Manage users and learning resources
- Monitor uploaded educational content

### 🤖 AI Tutor
- Ask questions about uploaded documents
- Supports PDF and image-based learning materials
- Context-aware responses using Retrieval-Augmented Generation (RAG)
- Semantic document retrieval using vector embeddings

---

# 🚀 Tech Stack

| Category | Technologies |
|----------|--------------|
| 💻 Backend | Java 17, Spring Boot, Spring Security, Spring Data JPA |
| 🎨 Frontend | HTML, CSS, JavaScript |
| 🗄️ Database | MySQL |
| 🔐 Authentication | JWT |
| 🤖 AI Service | Python, FastAPI |
| 🧠 AI & Retrieval | Chroma Vector Database, RAG |

---

# 🏗️ System Architecture

```text
                   ┌────────────────────┐
                   │      Students      │
                   └─────────┬──────────┘
                             │
                             ▼
                     Frontend (HTML/CSS/JS)
                             │
          ┌──────────────────┴──────────────────┐
          ▼                                     ▼
 Spring Boot Backend                    AI Tutor Service
(Authentication, APIs,              (FastAPI + RAG Engine)
 User Management,
 Content Management)
          │                                     │
          ▼                                     ▼
      MySQL Database                  Chroma Vector Database
```

---

# 📚 Core Modules

- 👤 User Authentication
- 📹 Learning Content Management
- 📂 File Upload Management
- 🏫 Department-wise Resource Browsing
- 🔍 AI Tutor with Semantic Search
- 📖 PDF-Based Question Answering
- 🖼️ Image-Based Question Answering

---

# 📂 Project Structure

```text
Peer-to-Peer-Learning-Platform/
│
├── backend/
├── frontend/
├── ai-tutor/
├── database/
└── README.md
```

---

# ⚙️ Prerequisites

Before running the project, install:

- ☕ Java 17+
- 📦 Maven 3.8+
- 🐬 MySQL 8+
- 🐍 Python 3.10+

---

# ▶️ Getting Started

## 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd Peer-to-Peer-Learning-Platform
```

---

## 2️⃣ Configure the Database

- Create a MySQL database.
- Update the database connection settings in the backend configuration file.

---

## 3️⃣ Start the Backend

```bash
mvn clean install
mvn spring-boot:run
```

---

## 4️⃣ Launch the Frontend

Serve the frontend using any static web server.

Example:

```bash
python -m http.server
```

---

## 5️⃣ Start the AI Tutor

```bash
python -m venv .venv
pip install -r requirements.txt
uvicorn app:app --reload
```

---

# 🤖 AI Tutor Workflow

1. Upload PDF documents or images.
2. Documents are converted into semantic embeddings.
3. Embeddings are stored in Chroma Vector Database.
4. User queries retrieve the most relevant document chunks.
5. The AI generates context-aware responses using Retrieval-Augmented Generation (RAG).

---

# 🔒 Security Features

- JWT-based Authentication
- Spring Security Authorization
- Protected API Endpoints
- Secure User Login
- Role-Based Access Control

---

# 💡 Future Enhancements

- 🔊 Voice-Based AI Tutor
- 💬 Real-Time Chat
- 📱 Mobile Responsive UI Improvements
- ☁️ Cloud Deployment
- 👥 Collaborative Learning Features
- 📊 Learning Analytics Dashboard
- 🧠 Conversation Memory
- 🌐 Web Search Integration

---

# 📄 License

This project is developed for **educational and demonstration purposes**.

---

# ⭐ Support

If you found this project helpful, consider giving it a **⭐ Star** on GitHub!