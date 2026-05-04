package com.anu.peerlearning.dto;

public class AuthResponse {
    private String role;
    private Long studentId;
    private String rollNumber;
    private String fullName;
    private String department;
    private String email;

    public AuthResponse() {}

    public AuthResponse(String role, Long studentId, String rollNumber, String fullName, String department, String email) {
        this.role = role;
        this.studentId = studentId;
        this.rollNumber = rollNumber;
        this.fullName = fullName;
        this.department = department;
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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
}
