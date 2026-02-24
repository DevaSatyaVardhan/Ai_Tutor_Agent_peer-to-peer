package com.anu.peerlearning.security;

import java.util.Collections;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class UserPrincipal {
    private final Long studentId;
    private final String rollNumber;
    private final String department;
    private final String role;
    private final String name;
    private final String email;

    public UserPrincipal(Long studentId, String rollNumber, String department, String role, String name, String email) {
        this.studentId = studentId;
        this.rollNumber = rollNumber;
        this.department = department;
        this.role = role;
        this.name = name;
        this.email = email;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public String getDepartment() {
        return department;
    }

    public String getRole() {
        return role;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public List<GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(role));
    }
}
