package com.anu.peerlearning.service;

import com.anu.peerlearning.dto.AdminStudentSummary;
import com.anu.peerlearning.entity.Student;
import com.anu.peerlearning.repository.CommentRepository;
import com.anu.peerlearning.repository.LikeRepository;
import com.anu.peerlearning.repository.StudentRepository;
import com.anu.peerlearning.repository.VideoRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class AdminService {
    private final StudentRepository studentRepository;
    private final VideoRepository videoRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;

    public AdminService(StudentRepository studentRepository,
                        VideoRepository videoRepository,
                        LikeRepository likeRepository,
                        CommentRepository commentRepository) {
        this.studentRepository = studentRepository;
        this.videoRepository = videoRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    public List<AdminStudentSummary> getStudentSummaries() {
        return studentRepository.findAll().stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    private AdminStudentSummary toSummary(Student student) {
        long videoCount = videoRepository.countByStudentId(student.getId());
        long likeCount = likeRepository.countByStudentId(student.getId());
        long commentCount = commentRepository.countByStudentId(student.getId());

        return new AdminStudentSummary(
                student.getId(),
                student.getFullName(),
                student.getRollNumber(),
                student.getDepartment(),
                student.getEmail(),
                student.getRegistrationDate(),
                videoCount,
                likeCount,
                commentCount
        );
    }
}
