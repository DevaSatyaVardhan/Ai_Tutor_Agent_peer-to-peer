package com.anu.peerlearning.service;

import com.anu.peerlearning.entity.PasswordResetToken;
import com.anu.peerlearning.entity.Student;
import com.anu.peerlearning.repository.PasswordResetTokenRepository;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetService {
    private static final int RESET_MINUTES = 15;

    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(PasswordResetTokenRepository tokenRepository,
                                PasswordEncoder passwordEncoder) {
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String createResetToken(Student student) {
        String rawToken = UUID.randomUUID().toString().replace("-", "");
        String tokenHash = passwordEncoder.encode(rawToken);

        PasswordResetToken resetToken = new PasswordResetToken(
                student,
                tokenHash,
                LocalDateTime.now().plusMinutes(RESET_MINUTES)
        );
        tokenRepository.save(resetToken);

        return rawToken;
    }

    public PasswordResetToken validateToken(String rawToken) {
        return tokenRepository.findAll().stream()
                .filter(token -> !token.isUsed())
                .filter(token -> token.getExpiresAt().isAfter(LocalDateTime.now()))
                .filter(token -> passwordEncoder.matches(rawToken, token.getTokenHash()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));
    }

    public void markUsed(PasswordResetToken token) {
        token.setUsed(true);
        tokenRepository.save(token);
    }
}
