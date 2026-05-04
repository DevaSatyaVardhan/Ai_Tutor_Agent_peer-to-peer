package com.anu.peerlearning.dto;

import javax.validation.constraints.NotBlank;

public class SecurityQuestionRequest {
    @NotBlank(message = "Roll number is required")
    private String rollNumber;

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }
}
