package com.anu.peerlearning.service;

import com.anu.peerlearning.entity.AiChatMessage;
import com.anu.peerlearning.repository.AiChatMessageRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class AiChatMemoryService {

    private final AiChatMessageRepository repository;

    public AiChatMemoryService(AiChatMessageRepository repository) {
        this.repository = repository;
    }

    public void addUserMessage(Long userId, String content) {
        repository.save(new AiChatMessage(userId, "user", content));
    }

    public void addAssistantMessage(Long userId, String content) {
        repository.save(new AiChatMessage(userId, "assistant", content));
    }

    public List<AiChatMessage> getRecentMessages(Long userId) {
        List<AiChatMessage> newestFirst = repository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
        Collections.reverse(newestFirst); // chronological
        return newestFirst;
    }
}
