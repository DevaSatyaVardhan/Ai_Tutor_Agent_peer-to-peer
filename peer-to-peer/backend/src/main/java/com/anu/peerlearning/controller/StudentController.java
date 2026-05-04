package com.anu.peerlearning.controller;

import com.anu.peerlearning.dto.StudentRegistrationRequest;
import com.anu.peerlearning.entity.Student;
import com.anu.peerlearning.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/students")
public class StudentController {
    
    @Autowired
    private StudentService studentService;
    
    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody StudentRegistrationRequest request) {
        try {
            Student student = studentService.registerStudent(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Student registered successfully");
            response.put("student", student);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/check/{rollNumber}")
    public ResponseEntity<?> checkStudentExists(@PathVariable String rollNumber) {
        boolean exists = studentService.studentExists(rollNumber);
        
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/count")
    public ResponseEntity<?> getStudentCount() {
        long count = studentService.getStudentCount();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("totalStudents", count);
        response.put("message", "Total registered students: " + count);
        
        return ResponseEntity.ok(response);
    }
}
