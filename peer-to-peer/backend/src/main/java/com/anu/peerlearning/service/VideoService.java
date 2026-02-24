package com.anu.peerlearning.service;

import com.anu.peerlearning.dto.VideoUploadRequest;
import com.anu.peerlearning.entity.Student;
import com.anu.peerlearning.entity.Video;
import com.anu.peerlearning.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.anu.peerlearning.dto.VideoResponseDTO;
import java.util.stream.Collectors;

import java.util.List;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import com.anu.peerlearning.security.UserPrincipal;

@Service
public class VideoService {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private StudentService studentService;

    public Video uploadVideo(VideoUploadRequest request) {
        // Find student by roll number
        Optional<Student> studentOpt = studentService.getStudentByRollNumber(request.getStudentRollNumber());
        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student with roll number " + request.getStudentRollNumber() + " not found");
        }

        Student student = studentOpt.get();

        Video video = new Video(
                request.getTitle(),
                request.getDescription(),
                request.getDepartment(),
                request.getSubject(),
                request.getVideoUrl(),
                student);

        return videoRepository.save(video);
    }

    public Video uploadVideoFile(String title, String description, String department, String subject,
            String studentRollNumber, MultipartFile file) throws IOException {
        // Find student
        Optional<Student> studentOpt = studentService.getStudentByRollNumber(studentRollNumber);
        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student with roll number " + studentRollNumber + " not found");
        }

        // Save file
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null)
            originalFilename = "video.mp4";
        // Sanitize filename
        String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String fileName = UUID.randomUUID().toString() + "_" + sanitizedFilename;

        Path uploadPath = Paths.get("uploads");
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Generate URL
        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();

        Video video = new Video(
                title,
                description,
                department,
                subject,
                fileUrl,
                studentOpt.get());

        return videoRepository.save(video);
    }

    public List<Video> getVideosByDepartment(String department) {
        return videoRepository.findByDepartmentOrderByUploadDateDesc(department);
    }

    public List<Video> searchVideosBySubject(String subject) {
        return videoRepository.findByTitleContainingIgnoreCaseOrSubjectContainingIgnoreCaseOrderByUploadDateDesc(
                subject, subject);
    }

    public List<VideoResponseDTO> searchVideosBySubjectDTO(String subject) {
        return videoRepository.findByTitleContainingIgnoreCaseOrSubjectContainingIgnoreCaseOrderByUploadDateDesc(
            subject, subject)
                .stream()
                .map(this::toVideoResponseDTO)
                .collect(Collectors.toList());
    }

    public Optional<Video> getVideoById(Long videoId) {
        return videoRepository.findById(videoId);
    }

    @Transactional
    public void incrementViewCount(Long videoId) {
        videoRepository.incrementViewCount(videoId);
    }

    public List<VideoResponseDTO> getVideosByDepartmentDTO(String department) {
        return videoRepository.findByDepartmentOrderByUploadDateDesc(department)
                .stream()
                .map(this::toVideoResponseDTO)
                .collect(Collectors.toList());
    }

    private VideoResponseDTO toVideoResponseDTO(Video video) {
        return new VideoResponseDTO(
                video.getId(),
                video.getTitle(),
                video.getDescription(),
                video.getDepartment(),
                video.getSubject(),
                video.getVideoUrl(),
                video.getUploadDate(),
                video.getViewCount(),
                video.getStudent() != null ? video.getStudent().getFullName() : null,
                video.getStudent() != null ? video.getStudent().getRollNumber() : null,
                video.getStudent() != null ? video.getStudent().getId() : null);
    }

    public Optional<VideoResponseDTO> getVideoByIdDTO(Long videoId) {
        return videoRepository.findById(videoId)
                .map(this::toVideoResponseDTO);
    }

    public void deleteVideos(List<Long> videoIds) {
        videoRepository.deleteAllById(videoIds);
    }

    public void deleteVideoById(Long videoId, UserPrincipal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        var videoOpt = videoRepository.findById(videoId);
        if (videoOpt.isEmpty()) {
            throw new RuntimeException("Video not found");
        }

        Video video = videoOpt.get();
        boolean isAdmin = "ROLE_ADMIN".equals(principal.getRole());
        boolean isOwner = principal.getStudentId() != null
                && video.getStudent() != null
                && principal.getStudentId().equals(video.getStudent().getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You are not allowed to delete this video");
        }

        videoRepository.deleteById(videoId);
    }
}
