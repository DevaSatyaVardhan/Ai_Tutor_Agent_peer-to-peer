package com.anu.peerlearning.repository;

import com.anu.peerlearning.entity.PasswordResetToken;
import com.anu.peerlearning.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findTopByStudentOrderByCreatedAtDesc(Student student);

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);
}
