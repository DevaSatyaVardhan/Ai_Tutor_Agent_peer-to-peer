package com.anu.peerlearning.service;

import com.anu.peerlearning.dto.AiAgentChatRequest;
import com.anu.peerlearning.dto.AiAgentChatResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.ByteArrayResource;

import java.util.HashMap;
import java.util.Map;

@Service
public class AiAgentGatewayService {

    private static final Logger logger = LoggerFactory.getLogger(AiAgentGatewayService.class);

    private final RestTemplate restTemplate;
    private final WebsiteContextService websiteContextService;

    @Value("${ai.agent.url:http://127.0.0.1:8000}")
    private String aiAgentUrl;

    public AiAgentGatewayService(RestTemplate restTemplate, WebsiteContextService websiteContextService) {
        this.restTemplate = restTemplate;
        this.websiteContextService = websiteContextService;
    }

    public AiAgentChatResponse chat(AiAgentChatRequest request) {
        String url = aiAgentUrl + "/chat";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("user_id", String.valueOf(request.getUserId()));
        body.put("question", request.getQuestion());
        body.put("subject", (request.getSubject() == null || request.getSubject().isBlank()) ? "General" : request.getSubject());
        body.put("site_context", websiteContextService.buildContext(request.getUserId()));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            Map<String, Object> responseBody = response.getBody();
            Object answer = responseBody != null ? responseBody.get("answer") : null;
            return new AiAgentChatResponse(answer != null ? String.valueOf(answer) : "");
        } catch (HttpStatusCodeException ex) {
            logger.error("AI agent returned HTTP {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            String errorBody = ex.getResponseBodyAsString();
            if (errorBody != null && !errorBody.isBlank()) {
                return new AiAgentChatResponse("AI agent error: " + errorBody);
            }
            return new AiAgentChatResponse("AI agent returned an error response.");
        } catch (Exception ex) {
            logger.error("Error calling AI agent at {}: {}", url, ex.getMessage(), ex);
            return new AiAgentChatResponse("AI agent is unavailable right now.");
        }
    }

    public Map<String, Object> uploadPdf(MultipartFile file, String userId, String subject) {
        String url = aiAgentUrl + "/upload/pdf/" + userId + "/" + subject;
        return uploadFile(url, file);
    }

    public Map<String, Object> uploadImage(MultipartFile file, String userId, String subject) {
        String url = aiAgentUrl + "/upload/image/" + userId + "/" + subject;
        return uploadFile(url, file);
    }

    private Map<String, Object> uploadFile(String url, MultipartFile file) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        try {
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            return response.getBody() != null ? response.getBody() : Map.of("message", "Upload completed.");
        } catch (HttpStatusCodeException ex) {
            logger.error("AI upload returned HTTP {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return Map.of("message", "Upload failed at AI service", "error", ex.getResponseBodyAsString());
        } catch (Exception ex) {
            logger.error("Error uploading file to AI service at {}: {}", url, ex.getMessage(), ex);
            return Map.of("message", "Upload failed", "error", ex.getMessage());
        }
    }
}
