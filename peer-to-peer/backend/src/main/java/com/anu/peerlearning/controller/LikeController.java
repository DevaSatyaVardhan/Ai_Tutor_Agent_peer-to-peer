package com.anu.peerlearning.controller;

import com.anu.peerlearning.entity.Like;
import com.anu.peerlearning.service.LikeService;
import com.anu.peerlearning.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/videos/{videoId}/likes")
public class LikeController {
    
    @Autowired
    private LikeService likeService;
    
    @PostMapping
    public ResponseEntity<?> likeVideo(@PathVariable Long videoId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
                throw new RuntimeException("Unauthorized");
            }

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            Like like = likeService.likeVideo(videoId, principal.getRollNumber());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Video liked successfully");
            response.put("like", like);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getLikesByVideoId(@PathVariable Long videoId) {
        try {
            List<Like> likes = likeService.getLikesByVideoId(videoId);
            long likeCount = likeService.getLikeCountByVideoId(videoId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("likes", likes);
            response.put("count", likeCount);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/check")
    public ResponseEntity<?> checkIfLiked(@PathVariable Long videoId, @RequestParam String studentRollNumber) {
        try {
            boolean hasLiked = likeService.hasStudentLikedVideo(videoId, studentRollNumber);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hasLiked", hasLiked);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
}
