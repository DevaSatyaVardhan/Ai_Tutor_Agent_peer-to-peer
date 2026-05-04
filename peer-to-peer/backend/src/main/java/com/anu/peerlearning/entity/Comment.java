package com.anu.peerlearning.entity;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "comments")
public class Comment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "video_id", nullable = false)
    @JsonIgnore
    private Video video;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
    
    @NotBlank(message = "Comment text is required")
    @Column(name = "comment_text", nullable = false)
    private String commentText;
    
    @Column(name = "comment_date")
    private LocalDateTime commentDate;
    
    // Constructors
    public Comment() {
        this.commentDate = LocalDateTime.now();
    }
    
    public Comment(Video video, Student student, String commentText) {
        this();
        this.video = video;
        this.student = student;
        this.commentText = commentText;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Video getVideo() {
        return video;
    }
    
    public void setVideo(Video video) {
        this.video = video;
    }
    
    public Student getStudent() {
        return student;
    }
    
    public void setStudent(Student student) {
        this.student = student;
    }
    
    public String getCommentText() {
        return commentText;
    }
    
    public void setCommentText(String commentText) {
        this.commentText = commentText;
    }
    
    public LocalDateTime getCommentDate() {
        return commentDate;
    }
    
    public void setCommentDate(LocalDateTime commentDate) {
        this.commentDate = commentDate;
    }
}
