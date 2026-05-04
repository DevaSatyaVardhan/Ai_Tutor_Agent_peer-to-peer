package com.anu.peerlearning.service;

import com.anu.peerlearning.entity.Student;
import com.anu.peerlearning.entity.Video;
import com.anu.peerlearning.repository.StudentRepository;
import com.anu.peerlearning.repository.VideoRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class WebsiteContextService {

    private final StudentRepository studentRepository;
    private final VideoRepository videoRepository;

    public WebsiteContextService(StudentRepository studentRepository, VideoRepository videoRepository) {
        this.studentRepository = studentRepository;
        this.videoRepository = videoRepository;
    }

    public String buildContext(Long userId) {
        StringBuilder sb = new StringBuilder();
        sb.append("Peer Learning Platform live context:\n");

        Optional<Student> studentOpt = studentRepository.findById(userId);
        if (studentOpt.isEmpty()) {
            sb.append("- Logged user not found in students table.\n");
            return sb.toString();
        }

        Student student = studentOpt.get();
        String dept = student.getDepartment() != null ? student.getDepartment() : "Unknown";

        sb.append("- Logged user id: ").append(userId).append("\n");
        sb.append("- Logged user name: ").append(nullSafe(student.getFullName())).append("\n");
        sb.append("- Roll number: ").append(nullSafe(student.getRollNumber())).append("\n");
        sb.append("- Department: ").append(dept).append("\n");

        long userVideoCount = videoRepository.countByStudentId(userId);
        sb.append("- Total videos uploaded by this user: ").append(userVideoCount).append("\n");

        List<Video> myRecent = videoRepository.findTop5ByStudentIdOrderByUploadDateDesc(userId);
        sb.append("- User recent uploaded videos (max 5):\n");
        if (myRecent.isEmpty()) {
            sb.append("  - none\n");
        } else {
            for (Video v : myRecent) {
                sb.append("  - ")
                    .append(nullSafe(v.getTitle()))
                    .append(" | subject=")
                    .append(nullSafe(v.getSubject()))
                    .append(" | uploaded=")
                    .append(v.getUploadDate() != null
                        ? v.getUploadDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                        : "unknown")
                    .append("\n");
            }
        }

        List<Video> deptRecent = videoRepository.findByDepartmentOrderByUploadDateDesc(dept);
        sb.append("- Department recent videos (max 5):\n");
        if (deptRecent.isEmpty()) {
            sb.append("  - none\n");
        } else {
            int limit = Math.min(5, deptRecent.size());
            for (int i = 0; i < limit; i++) {
                Video v = deptRecent.get(i);
                sb.append("  - ")
                    .append(nullSafe(v.getTitle()))
                    .append(" | by=")
                    .append(v.getStudent() != null ? nullSafe(v.getStudent().getFullName()) : "unknown")
                    .append(" | subject=")
                    .append(nullSafe(v.getSubject()))
                    .append("\n");
            }
        }

        return sb.toString();
    }

    private String nullSafe(String value) {
        return value != null ? value : "unknown";
    }
}
