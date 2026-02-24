# Peer-to-Peer Teaching and Learning Platform

## Adikavi Nannaya University – College of Engineering

A web platform where students can upload, view, and share recorded video lectures created by their peers. The system encourages collaborative learning with a simple registration-based access.

## Features

- **No Login Required**: Simple one-time registration system
- **Video Upload & Viewing**: Upload and watch peer-created video lectures
- **Department Categorization**: Videos organized by engineering departments
- **Engagement Features**: Like and comment on videos
- **University Branding**: Adikavi Nannaya University branding throughout

## Departments Supported

- Computer Science Engineering (CSE)
- Electronics and Communication Engineering (ECE)
- Electronics and Instrumentation Engineering (EIE)
- Civil Engineering
- Mechanical Engineering

## Tech Stack

### Frontend
- HTML5, CSS3, Bootstrap 5
- Vanilla JavaScript
- Responsive design

### Backend
- Java with Spring Boot
- REST APIs
- MySQL Database

## Project Structure

```
peer-to-peer/
├── frontend/                 # Frontend application
│   ├── index.html           # Main landing page
│   ├── register.html        # Registration page
│   ├── upload.html          # Video upload page
│   ├── view.html            # Video viewing page
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   └── assets/              # Images and other assets
├── backend/                 # Spring Boot application
│   ├── src/
│   ├── pom.xml
│   └── application.properties
└── database/                # Database scripts
    └── schema.sql
```

## Getting Started

### Prerequisites
- Java 11 or higher
- Maven
- MySQL 8.0
- Web browser

### Installation

1. **Database Setup**
   ```sql
   CREATE DATABASE peer_learning;
   USE peer_learning;
   ```

2. **Backend Setup**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Frontend Setup**
   - Open `frontend/index.html` in your web browser
   - Or serve using a local server

## API Endpoints

- `POST /api/students/register` - Register a new student
- `POST /api/videos/upload` - Upload video information
- `GET /api/videos/department/{department}` - Get videos by department
- `POST /api/videos/{videoId}/like` - Like a video
- `POST /api/videos/{videoId}/comments` - Add a comment
- `GET /api/videos/{videoId}/comments` - Get comments for a video

## Contributing

This project is designed for Adikavi Nannaya University students to collaborate and share educational content.

## License

This project is for educational purposes at Adikavi Nannaya University. 