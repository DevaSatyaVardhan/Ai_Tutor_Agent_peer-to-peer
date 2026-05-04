package com.anu.peerlearning.service;

import com.anu.peerlearning.dto.StudentRegistrationRequest;
import com.anu.peerlearning.entity.Student;
import com.anu.peerlearning.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class StudentService {
    
    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;
    
    public Student registerStudent(StudentRegistrationRequest request) {
        // Check if student already exists
        if (studentRepository.existsByRollNumber(request.getRollNumber())) {
            throw new RuntimeException("Student with roll number " + request.getRollNumber() + " already exists");
        }
        
        Student student = new Student(
            request.getFullName(),
            request.getDepartment(),
            request.getRollNumber(),
            request.getEmail()
        );

        student.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        student.setSecurityQuestion(request.getSecurityQuestion());
        student.setSecurityAnswerHash(passwordEncoder.encode(request.getSecurityAnswer()));
        
        return studentRepository.save(student);
    }
    
    public Optional<Student> getStudentByRollNumber(String rollNumber) {
        return studentRepository.findByRollNumber(rollNumber);
    }
    
    public boolean studentExists(String rollNumber) {
        return studentRepository.existsByRollNumber(rollNumber);
    }
    
    public long getStudentCount() {
        return studentRepository.count();
    }
}
