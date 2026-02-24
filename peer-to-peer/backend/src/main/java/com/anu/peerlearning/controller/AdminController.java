package com.anu.peerlearning.controller;

import com.anu.peerlearning.dto.AdminStudentSummary;
import com.anu.peerlearning.service.AdminService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
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
}
