package com.anu.peerlearning.controller;

import com.anu.peerlearning.dto.AdminLoginRequest;
import com.anu.peerlearning.dto.AuthResponse;
import com.anu.peerlearning.dto.LoginRequest;
import com.anu.peerlearning.dto.ResetPasswordRequest;
import com.anu.peerlearning.dto.SecurityQuestionRequest;
import com.anu.peerlearning.dto.VerifySecurityAnswerRequest;
import com.anu.peerlearning.security.UserPrincipal;
import com.anu.peerlearning.service.AuthService;
import javax.servlet.http.HttpSession;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;

    public AuthController(AuthService authService, AuthenticationManager authenticationManager) {
        this.authService = authService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginStudent(@Valid @RequestBody LoginRequest request, HttpSession session) {
        try {
            AuthResponse authResponse = authService.authenticateStudent(request.getRollNumber(), request.getPassword());
            UserPrincipal principal = new UserPrincipal(
                    authResponse.getStudentId(),
                    authResponse.getRollNumber(),
                    authResponse.getDepartment(),
                    authResponse.getRole(),
                    authResponse.getFullName(),
                    authResponse.getEmail()
            );

            // Create authentication token and store in security context
            UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            Map<String, Object> body = new HashMap<>();
            body.put("success", true);
            body.put("user", authResponse);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            Map<String, Object> body = new HashMap<>();
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.status(401).body(body);
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@Valid @RequestBody AdminLoginRequest request, HttpSession session) {
        try {
            AuthResponse authResponse = authService.authenticateAdmin(request.getEmail(), request.getPassword());
            UserPrincipal principal = new UserPrincipal(
                    null,
                    null,
                    null,
                    authResponse.getRole(),
                    authResponse.getFullName(),
                    authResponse.getEmail()
            );

            // Create authentication token and store in security context
            UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            Map<String, Object> body = new HashMap<>();
            body.put("success", true);
            body.put("user", authResponse);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            Map<String, Object> body = new HashMap<>();
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.status(401).body(body);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();

        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/security-question")
    public ResponseEntity<?> getSecurityQuestion(@Valid @RequestBody SecurityQuestionRequest request) {
        try {
            String question = authService.getSecurityQuestion(request.getRollNumber());
            Map<String, Object> body = new HashMap<>();
            body.put("success", true);
            body.put("question", question);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            Map<String, Object> body = new HashMap<>();
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.status(400).body(body);
        }
    }

    @PostMapping("/verify-security")
    public ResponseEntity<?> verifySecurityAnswer(@Valid @RequestBody VerifySecurityAnswerRequest request) {
        try {
            String resetToken = authService.verifySecurityAnswer(request.getRollNumber(), request.getSecurityAnswer());
            Map<String, Object> body = new HashMap<>();
            body.put("success", true);
            body.put("resetToken", resetToken);
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            Map<String, Object> body = new HashMap<>();
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.status(400).body(body);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getResetToken(), request.getNewPassword());
            Map<String, Object> body = new HashMap<>();
            body.put("success", true);
            body.put("message", "Password reset successfully");
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            Map<String, Object> body = new HashMap<>();
            body.put("success", false);
            body.put("message", e.getMessage());
            return ResponseEntity.status(400).body(body);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = null;
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            principal = (UserPrincipal) authentication.getPrincipal();
        }
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("user", principal);
        return ResponseEntity.ok(body);
    }
}
