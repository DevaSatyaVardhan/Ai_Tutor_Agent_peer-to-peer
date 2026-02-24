package com.anu.peerlearning.dto;

import java.time.LocalDateTime;

public class VideoResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String department;
    private String subject;
    private String videoUrl;
    private LocalDateTime uploadDate;
    private int viewCount;
    private String uploaderName;
    private String uploaderRollNumber;
    private Long uploaderId;

    public VideoResponseDTO() {}

    public VideoResponseDTO(Long id, String title, String description, String department, String subject, String videoUrl, LocalDateTime uploadDate, int viewCount, String uploaderName, String uploaderRollNumber, Long uploaderId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.department = department;
        this.subject = subject;
        this.videoUrl = videoUrl;
        this.uploadDate = uploadDate;
        this.viewCount = viewCount;
        this.uploaderName = uploaderName;
        this.uploaderRollNumber = uploaderRollNumber;
        this.uploaderId = uploaderId;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
    public int getViewCount() { return viewCount; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }
    public String getUploaderName() { return uploaderName; }
    public void setUploaderName(String uploaderName) { this.uploaderName = uploaderName; }
    public String getUploaderRollNumber() { return uploaderRollNumber; }
    public void setUploaderRollNumber(String uploaderRollNumber) { this.uploaderRollNumber = uploaderRollNumber; }
    public Long getUploaderId() { return uploaderId; }
    public void setUploaderId(Long uploaderId) { this.uploaderId = uploaderId; }
}
