package com.anu.peerlearning.dto;

import javax.validation.constraints.NotBlank;

public class CommentRequest {
    
    @NotBlank(message = "Comment text is required")
    private String commentText;
    
    private String studentRollNumber;
    
    // Constructors
    public CommentRequest() {}
    
    public CommentRequest(String commentText, String studentRollNumber) {
        this.commentText = commentText;
        this.studentRollNumber = studentRollNumber;
    }
    
    // Getters and Setters
    public String getCommentText() {
        return commentText;
    }
    
    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }
    
    public String getStudentRollNumber() {
        return studentRollNumber;
    }
    
    public void setStudentRollNumber(String studentRollNumber) {
        this.studentRollNumber = studentRollNumber;
    }
}
