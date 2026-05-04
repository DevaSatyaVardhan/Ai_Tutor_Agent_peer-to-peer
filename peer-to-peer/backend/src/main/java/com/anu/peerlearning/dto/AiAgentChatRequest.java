package com.anu.peerlearning.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class AiAgentChatRequest {

    @NotNull
    private Long userId;

    @NotBlank
    private String question;

    private String subject;

    public AiAgentChatRequest() {}

    public AiAgentChatRequest(Long userId, String question) {
        this.userId = userId;
        this.question = question;
    }

    public AiAgentChatRequest(Long userId, String question, String subject) {
        this.userId = userId;
        this.question = question;
        this.subject = subject;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }
}
