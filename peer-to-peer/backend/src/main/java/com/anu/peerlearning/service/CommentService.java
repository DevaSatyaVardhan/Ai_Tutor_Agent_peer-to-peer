package com.anu.peerlearning.service;

import com.anu.peerlearning.dto.CommentRequest;
import com.anu.peerlearning.entity.Comment;
import com.anu.peerlearning.entity.Student;
import com.anu.peerlearning.entity.Video;
import com.anu.peerlearning.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CommentService {
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private StudentService studentService;
    
    @Autowired
    private VideoService videoService;
    
    @Transactional
    public Comment addComment(Long videoId, CommentRequest request) {
        // Find student
        var studentOpt = studentService.getStudentByRollNumber(request.getStudentRollNumber());
        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student with roll number " + request.getStudentRollNumber() + " not found");
        }
        
        // Find video
        var videoOpt = videoService.getVideoById(videoId);
        if (videoOpt.isEmpty()) {
            throw new RuntimeException("Video with ID " + videoId + " not found");
        }
        
        Student student = studentOpt.get();
        Video video = videoOpt.get();
        
        Comment comment = new Comment(video, student, request.getCommentText());
        return commentRepository.save(comment);
    }
    
    public List<Comment> getCommentsByVideoId(Long videoId) {
        return commentRepository.findByVideoIdOrderByCommentDateDesc(videoId);
    }
}
