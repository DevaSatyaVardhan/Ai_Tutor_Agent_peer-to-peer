package com.anu.peerlearning.service;

import com.anu.peerlearning.dto.AuthResponse;
import com.anu.peerlearning.entity.Student;
import com.anu.peerlearning.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetService passwordResetService;
    private final String adminEmail;
    private final String adminPassword;

    public AuthService(StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder,
                       PasswordResetService passwordResetService,
                       @Value("${admin.email}") String adminEmail,
                       @Value("${admin.password}") String adminPassword) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetService = passwordResetService;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    public AuthResponse authenticateStudent(String rollNumber, String password) {
        Student student = studentRepository.findByRollNumber(rollNumber)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (student.getPasswordHash() == null || student.getPasswordHash().isEmpty()) {
            throw new RuntimeException("Password not set for this account. Please register again.");
        }

        if (!passwordEncoder.matches(password, student.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        return new AuthResponse(
                "ROLE_STUDENT",
                student.getId(),
                student.getRollNumber(),
                student.getFullName(),
                student.getDepartment(),
                student.getEmail()
        );
    }

    public AuthResponse authenticateAdmin(String email, String password) {
        if (!adminEmail.equalsIgnoreCase(email) || !adminPassword.equals(password)) {
            throw new RuntimeException("Invalid admin credentials");
        }

        return new AuthResponse(
                "ROLE_ADMIN",
                null,
                null,
                "Administrator",
                null,
                adminEmail
        );
    }

    public String getSecurityQuestion(String rollNumber) {
        Student student = studentRepository.findByRollNumber(rollNumber)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getSecurityQuestion() == null || student.getSecurityQuestion().isEmpty()) {
            throw new RuntimeException("Security question not set for this account");
        }

        return student.getSecurityQuestion();
    }

    public String verifySecurityAnswer(String rollNumber, String answer) {
        Student student = studentRepository.findByRollNumber(rollNumber)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getSecurityAnswerHash() == null || student.getSecurityAnswerHash().isEmpty()) {
            throw new RuntimeException("Security answer not set for this account");
        }

        if (!passwordEncoder.matches(answer, student.getSecurityAnswerHash())) {
            throw new RuntimeException("Invalid security answer");
        }

        return passwordResetService.createResetToken(student);
    }

    public void resetPassword(String resetToken, String newPassword) {
        var token = passwordResetService.validateToken(resetToken);
        Student student = token.getStudent();

        student.setPasswordHash(passwordEncoder.encode(newPassword));
        studentRepository.save(student);

        passwordResetService.markUsed(token);
    }
}
