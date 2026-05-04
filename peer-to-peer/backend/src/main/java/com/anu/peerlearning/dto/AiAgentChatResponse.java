package com.anu.peerlearning.dto;

public class AiAgentChatResponse {

    private String answer;

    public AiAgentChatResponse() {}

    public AiAgentChatResponse(String answer) {
        this.answer = answer;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}
