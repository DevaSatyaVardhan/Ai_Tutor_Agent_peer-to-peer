package com.anu.peerlearning.controller;

import com.anu.peerlearning.entity.Comment;
import com.anu.peerlearning.service.CommentService;
import com.anu.peerlearning.dto.CommentRequest;
import com.anu.peerlearning.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/videos/{videoId}/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping
    public ResponseEntity<?> addComment(@PathVariable Long videoId, @Valid @RequestBody CommentRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
                throw new RuntimeException("Unauthorized");
            }

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            request.setStudentRollNumber(principal.getRollNumber());

            Comment comment = commentService.addComment(videoId, request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Comment added successfully");
            response.put("comment", comment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping
    public ResponseEntity<?> getComments(@PathVariable Long videoId) {
        try {
            List<Comment> comments = commentService.getCommentsByVideoId(videoId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("comments", comments);
            response.put("count", comments.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
