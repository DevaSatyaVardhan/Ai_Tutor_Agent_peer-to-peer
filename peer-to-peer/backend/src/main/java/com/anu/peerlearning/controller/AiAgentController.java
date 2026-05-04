package com.anu.peerlearning.controller;

import com.anu.peerlearning.dto.AiAgentChatRequest;
import com.anu.peerlearning.dto.AiAgentChatResponse;
import com.anu.peerlearning.entity.AiChatMessage;
import com.anu.peerlearning.service.AiAgentGatewayService;
import com.anu.peerlearning.service.AiChatMemoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@Validated
public class AiAgentController {

    private final AiAgentGatewayService gatewayService;
    private final AiChatMemoryService memoryService;

    public AiAgentController(AiAgentGatewayService gatewayService, AiChatMemoryService memoryService) {
        this.gatewayService = gatewayService;
        this.memoryService = memoryService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiAgentChatResponse> chat(@Valid @RequestBody AiAgentChatRequest request) {
        memoryService.addUserMessage(request.getUserId(), request.getQuestion());
        AiAgentChatResponse response = gatewayService.chat(request);
        memoryService.addAssistantMessage(request.getUserId(), response.getAnswer());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/memory/{userId}")
    public ResponseEntity<List<AiChatMessage>> memory(@PathVariable Long userId) {
        return ResponseEntity.ok(memoryService.getRecentMessages(userId));
    }

    @PostMapping("/upload/pdf")
    public ResponseEntity<Map<String, Object>> uploadPdf(
        @RequestParam("file") MultipartFile file,
        @RequestParam("userId") String userId,
        @RequestParam(value = "subject", defaultValue = "General") String subject
    ) {
        Map<String, Object> result = gatewayService.uploadPdf(file, userId, subject);
        if (result.containsKey("error")) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(result);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/upload/image")
    public ResponseEntity<Map<String, Object>> uploadImage(
        @RequestParam("file") MultipartFile file,
        @RequestParam("userId") String userId,
        @RequestParam(value = "subject", defaultValue = "General") String subject
    ) {
        Map<String, Object> result = gatewayService.uploadImage(file, userId, subject);
        if (result.containsKey("error")) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(result);
        }
        return ResponseEntity.ok(result);
    }
}
