package com.anu.peerlearning.dto;

import java.time.LocalDateTime;

public class AdminStudentSummary {
    private Long id;
    private String fullName;
    private String rollNumber;
    private String department;
    private String email;
    private LocalDateTime registrationDate;
    private long videoCount;
    private long likeCount;
    private long commentCount;
    private long activityCount;

    public AdminStudentSummary() {}

    public AdminStudentSummary(Long id, String fullName, String rollNumber, String department, String email,
                               LocalDateTime registrationDate, long videoCount, long likeCount, long commentCount) {
        this.id = id;
        this.fullName = fullName;
        this.rollNumber = rollNumber;
        this.department = department;
        this.email = email;
        this.registrationDate = registrationDate;
        this.videoCount = videoCount;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.activityCount = videoCount + likeCount + commentCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public long getVideoCount() {
        return videoCount;
    }

    public void setVideoCount(long videoCount) {
        this.videoCount = videoCount;
    }

    public long getLikeCount() {
        return likeCount;
    }

    public void setLikeCount(long likeCount) {
        this.likeCount = likeCount;
    }

    public long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(long commentCount) {
        this.commentCount = commentCount;
    }

    public long getActivityCount() {
        return activityCount;
    }

    public void setActivityCount(long activityCount) {
        this.activityCount = activityCount;
    }
}
