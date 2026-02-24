# Peer Learning Platform - Setup Guide

## Prerequisites

Before setting up the platform, ensure you have the following installed:

- **Java 11 or higher**
- **Maven 3.6 or higher**
- **MySQL 8.0 or higher**
- **Web browser** (Chrome, Firefox, Safari, Edge)

## Step 1: Database Setup

1. **Start MySQL Server**
   ```bash
   # Windows
   net start mysql
   
   # Linux/Mac
   sudo systemctl start mysql
   ```

2. **Create Database**
   ```sql
   mysql -u root -p
   CREATE DATABASE peer_learning;
   USE peer_learning;
   ```

3. **Run Schema Script**
   ```bash
   mysql -u root -p peer_learning < database/schema.sql
   ```

## Step 2: Backend Configuration

1. **Update Database Configuration**
   Edit `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   ```

2. **Build and Run Backend**
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

## Step 3: Frontend Setup

1. **Open Frontend**
   - Navigate to the `frontend` directory
   - Open `index.html` in your web browser
   - Or serve using a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server -p 8000
     ```

2. **Add University Logo**
   - Place the Adikavi Nannaya University logo in `frontend/assets/university-logo.png`
   - Update the logo path in `index.html` if needed

## Step 4: Testing the Platform

1. **Register a Student**
   - Click "Register" button
   - Fill in the registration form
   - Submit to create a student account

2. **Upload a Video**
   - Click "Upload Video" button
   - Fill in video details (title, description, department, subject, URL)
   - Use your roll number to upload

3. **View and Interact**
   - Browse videos by department
   - Click on videos to watch
   - Like and comment on videos

## API Endpoints

The backend provides the following REST endpoints:

- `POST /api/students/register` - Register a new student
- `POST /api/videos/upload` - Upload video information
- `GET /api/videos/department/{department}` - Get videos by department
- `GET /api/videos/search?subject={subject}` - Search videos by subject
- `GET /api/videos/{videoId}` - Get video details
- `POST /api/videos/{videoId}/likes` - Like a video
- `GET /api/videos/{videoId}/likes` - Get video likes
- `POST /api/videos/{videoId}/comments` - Add a comment
- `GET /api/videos/{videoId}/comments` - Get video comments

## Departments Supported

- Computer Science Engineering (CSE)
- Electronics and Communication Engineering (ECE)
- Electronics and Instrumentation Engineering (EIE)
- Civil Engineering
- Mechanical Engineering

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check username/password in `application.properties`
   - Ensure database `peer_learning` exists

2. **CORS Errors**
   - Backend has CORS enabled for all origins
   - If issues persist, check browser console for specific errors

3. **Video Not Loading**
   - Ensure video URL is accessible
   - Check if video format is supported by browser
   - Verify video URL is properly formatted

4. **Registration Fails**
   - Check if roll number already exists
   - Ensure all required fields are filled
   - Verify email format if provided

### Logs

Backend logs are available in the console where you started the Spring Boot application. Look for:
- Application startup messages
- Database connection status
- API request/response logs

## Security Notes

- This is a development setup
- For production, consider:
  - HTTPS configuration
  - Database security hardening
  - Input validation and sanitization
  - Rate limiting
  - Proper error handling

## Support

For technical support or questions about the platform, please contact the development team at Adikavi Nannaya University. 