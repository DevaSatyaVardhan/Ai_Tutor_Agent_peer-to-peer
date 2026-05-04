package com.anu.peerlearning.controller;

import com.anu.peerlearning.dto.AdminStudentSummary;
import com.anu.peerlearning.dto.VideoResponseDTO;
import com.anu.peerlearning.service.AdminService;
import com.anu.peerlearning.service.VideoService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final AdminService adminService;
    private final VideoService videoService;

    public AdminController(AdminService adminService, VideoService videoService) {
        this.adminService = adminService;
        this.videoService = videoService;
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents() {
        List<AdminStudentSummary> students = adminService.getStudentSummaries();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("students", students);
        response.put("count", students.size());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/students/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long studentId) {
        try {
            adminService.deleteStudent(studentId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Student deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/videos")
    public ResponseEntity<?> getAllVideos() {
        try {
            List<VideoResponseDTO> videos = videoService.getAllVideosDTO();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("videos", videos);
            response.put("count", videos.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/videos/{videoId}")
    public ResponseEntity<?> deleteVideo(@PathVariable Long videoId) {
        try {
            videoService.deleteVideoById(videoId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Video deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
