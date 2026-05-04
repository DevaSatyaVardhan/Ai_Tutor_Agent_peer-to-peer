package com.anu.peerlearning.dto;

import javax.validation.constraints.NotBlank;

public class VerifySecurityAnswerRequest {
    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    @NotBlank(message = "Security answer is required")
    private String securityAnswer;

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getSecurityAnswer() {
        return securityAnswer;
    }

    public void setSecurityAnswer(String securityAnswer) {
        this.securityAnswer = securityAnswer;
    }
}
