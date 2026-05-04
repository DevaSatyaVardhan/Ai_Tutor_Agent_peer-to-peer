package com.anu.peerlearning.dto;

import javax.validation.constraints.NotBlank;

public class VideoUploadRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Department is required")
    private String department;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Video URL is required")
    private String videoUrl;
    
    @NotBlank(message = "Student roll number is required")
    private String studentRollNumber;
    
    // Constructors
    public VideoUploadRequest() {}
    
    public VideoUploadRequest(String title, String description, String department, String subject, String videoUrl, String studentRollNumber) {
        this.title = title;
        this.description = description;
        this.department = department;
        this.subject = subject;
        this.videoUrl = videoUrl;
        this.studentRollNumber = studentRollNumber;
    }
    
    // Getters and Setters
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public String getSubject() {
        return subject;
    }
    
    public void setSubject(String subject) {
        this.subject = subject;
    }
    
    public String getVideoUrl() {
        return videoUrl;
    }
    
    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }
    
    public String getStudentRollNumber() {
        return studentRollNumber;
    }
    
    public void setStudentRollNumber(String studentRollNumber) {
        this.studentRollNumber = studentRollNumber;
    }
}
