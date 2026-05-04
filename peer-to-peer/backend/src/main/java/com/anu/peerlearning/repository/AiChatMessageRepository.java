package com.anu.peerlearning.repository;

import com.anu.peerlearning.entity.AiChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {

    List<AiChatMessage> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
