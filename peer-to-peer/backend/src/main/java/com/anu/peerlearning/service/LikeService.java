package com.anu.peerlearning.service;

import com.anu.peerlearning.entity.Like;
import com.anu.peerlearning.entity.Student;
import com.anu.peerlearning.entity.Video;
import com.anu.peerlearning.repository.LikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LikeService {
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private StudentService studentService;
    
    @Autowired
    private VideoService videoService;
    
    @Transactional
    public Like likeVideo(Long videoId, String studentRollNumber) {
        // Find student
        var studentOpt = studentService.getStudentByRollNumber(studentRollNumber);
        if (studentOpt.isEmpty()) {
            throw new RuntimeException("Student with roll number " + studentRollNumber + " not found");
        }
        
        // Find video
        var videoOpt = videoService.getVideoById(videoId);
        if (videoOpt.isEmpty()) {
            throw new RuntimeException("Video with ID " + videoId + " not found");
        }
        
        Student student = studentOpt.get();
        Video video = videoOpt.get();
        
        // Check if already liked
        if (likeRepository.existsByVideoIdAndStudentId(videoId, student.getId())) {
            throw new RuntimeException("Video already liked by this student");
        }
        
        Like like = new Like(video, student);
        return likeRepository.save(like);
    }
    
    public List<Like> getLikesByVideoId(Long videoId) {
        return likeRepository.findByVideoId(videoId);
    }
    
    public long getLikeCountByVideoId(Long videoId) {
        return likeRepository.countByVideoId(videoId);
    }
    
    public boolean hasStudentLikedVideo(Long videoId, String studentRollNumber) {
        var studentOpt = studentService.getStudentByRollNumber(studentRollNumber);
        if (studentOpt.isEmpty()) {
            return false;
        }
        
        return likeRepository.existsByVideoIdAndStudentId(videoId, studentOpt.get().getId());
    }
}
