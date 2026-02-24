package com.anu.peerlearning.controller;

import com.anu.peerlearning.dto.VideoUploadRequest;
import com.anu.peerlearning.dto.VideoResponseDTO;
import com.anu.peerlearning.dto.DeleteVideosRequest;
import com.anu.peerlearning.entity.Video;
import com.anu.peerlearning.service.VideoService;
import com.anu.peerlearning.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/videos")
public class VideoController {

    @Autowired
    private VideoService videoService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadVideo(@Valid @RequestBody VideoUploadRequest request) {
        try {
            Video video = videoService.uploadVideo(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Video uploaded successfully");
            response.put("video", video);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/upload-file")
    public ResponseEntity<?> uploadVideoFile(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("department") String department,
            @RequestParam("subject") String subject,
            @RequestParam("studentRollNumber") String studentRollNumber,
            @RequestParam("file") MultipartFile file) {
        try {
            Video video = videoService.uploadVideoFile(title, description, department, subject, studentRollNumber,
                    file);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Video uploaded successfully");
            response.put("video", video);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());

            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<?> getVideosByDepartment(@PathVariable String department) {
        try {
            List<VideoResponseDTO> videos = videoService.getVideosByDepartmentDTO(department);
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

    @GetMapping("/search")
    public ResponseEntity<?> searchVideosBySubject(@RequestParam String subject) {
        try {
            List<VideoResponseDTO> videos = videoService.searchVideosBySubjectDTO(subject);

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

    @GetMapping("/{videoId}")
    public ResponseEntity<?> getVideoById(@PathVariable Long videoId) {
        try {
            var videoOpt = videoService.getVideoByIdDTO(videoId);
            if (videoOpt.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Video not found");
                return ResponseEntity.notFound().build();
            }

            // Increment view count
            videoService.incrementViewCount(videoId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("video", videoOpt.get());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<?> deleteVideos(@Valid @RequestBody DeleteVideosRequest request) {
        try {
            videoService.deleteVideos(request.getVideoIds());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("deletedCount", request.getVideoIds().size());
            response.put("message", "Selected videos deleted successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{videoId}")
    public ResponseEntity<?> deleteVideoById(@PathVariable Long videoId) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserPrincipal principal = null;
            if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
                principal = (UserPrincipal) authentication.getPrincipal();
            }

            videoService.deleteVideoById(videoId, principal);

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
