package com.interviewai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class AiService {

    @Value("${app.openai.api-key}" )
    private String apiKey;

    @Value("${app.openai.model}")
    private String model;

    //@Value("${app.openai.base-url:https://api.openai.com/v1}" )
    @Value("${app.openai.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Map<String, String>> generateQuestions(String topic, String difficulty, int count) {
        String prompt = String.format(
                "Generate %d technical interview questions on the topic '%s' at %s difficulty level. " +
                        "Return ONLY a JSON array. Each object should have a 'question' key. " +
                        "Do NOT include any explanation or markdown. Just the JSON array.",
                count, topic, difficulty
        );

        try {
            return callOpenAI(prompt, 0.7, true);
        } catch (Exception e) {
            System.err.println("AI question generation failed, using fallback: " + e.getMessage());
            return generateFallbackQuestions(topic, difficulty, count);
        }
    }

    public Map<String, Object> evaluateAnswer(String question, String answer, String difficulty, String topic) {
        String prompt = String.format(
                "Evaluate this interview answer.\n\nQuestion: '%s'\n\nAnswer: '%s'\n\nDifficulty: %s\nTopic: %s\n\n" +
                        "Rate on a scale of 0-100 for: correctnessScore, completenessScore, clarityScore, and overallScore. " +
                        "Also provide: feedback (2-3 sentences), strengths (2-3 bullet points), improvements (2-3 bullet points), " +
                        "and idealAnswer (a well-structured ideal answer). " +
                        "Return ONLY a JSON object with these exact keys: " +
                        "{\"correctnessScore\": 75, \"completenessScore\": 70, \"clarityScore\": 80, " +
                        "\"overallScore\": 75, \"feedback\": \"...\", \"strengths\": \"...\", \"improvements\": \"...\", \"idealAnswer\": \"...\"}",
                question, answer, difficulty, topic
        );

        try {
            List<Map<String, String>> parsed = callOpenAI(prompt, 0.3, false);
            if (!parsed.isEmpty()) {
                Map<String, String> eval = parsed.get(0);
                Map<String, Object> result = new HashMap<>();
                result.put("correctnessScore", Integer.parseInt(eval.getOrDefault("correctnessScore", "60")));
                result.put("completenessScore", Integer.parseInt(eval.getOrDefault("completenessScore", "60")));
                result.put("clarityScore", Integer.parseInt(eval.getOrDefault("clarityScore", "60")));
                result.put("overallScore", Integer.parseInt(eval.getOrDefault("overallScore", "60")));
                result.put("feedback", eval.getOrDefault("feedback", "Good attempt. Consider adding more detail."));
                result.put("strengths", eval.getOrDefault("strengths", "You covered the main concepts."));
                result.put("improvements", eval.getOrDefault("improvements", "Add more specific examples."));
                result.put("idealAnswer", eval.getOrDefault("idealAnswer", "A complete answer would define the concept, give an example, and mention trade-offs."));
                return result;
            }
        } catch (Exception e) {
            System.err.println("AI evaluation failed, using fallback: " + e.getMessage());
        }

        return generateFallbackEvaluation(question, answer);
    }

    private List<Map<String, String>> callOpenAI(String prompt, double temperature, boolean isQuestionGeneration) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", List.of(Map.of("role", "user", "content", prompt)));
        body.put("temperature", temperature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/chat/completions",
                HttpMethod.POST,
                request,
                Map.class
        );

        Map responseBody = response.getBody();
        if (responseBody == null) throw new RuntimeException("Empty response from AI API");

        List choices = (List) responseBody.get("choices");
        if (choices == null || choices.isEmpty()) throw new RuntimeException("No choices in response");

        Map firstChoice = (Map) choices.get(0);
        Map message = (Map) firstChoice.get("message");
        String content = (String) message.get("content");

        JsonNode root = objectMapper.readTree(content);

        if (isQuestionGeneration && root.isArray()) {
            List<Map<String, String>> questions = new ArrayList<>();
            for (JsonNode node : root) {
                JsonNode qNode = node.get("question");
                if (qNode != null) {
                    Map<String, String> q = new HashMap<>();
                    q.put("question", qNode.asText());
                    questions.add(q);
                }
            }
            return questions;
        } else if (!isQuestionGeneration) {
            Map<String, String> result = new HashMap<>();
            String[] keys = {"correctnessScore", "completenessScore", "clarityScore", "overallScore",
                    "feedback", "strengths", "improvements", "idealAnswer"};
            for (String key : keys) {
                JsonNode node = root.get(key);
                if (node != null) {
                    result.put(key, node.asText());
                }
            }
            return List.of(result);
        }

        return Collections.emptyList();
    }

    private List<Map<String, String>> generateFallbackQuestions(String topic, String difficulty, int count) {
        List<Map<String, String>> fallback = new ArrayList<>();
        String[] genericQuestions = {
                "Explain the key concepts and principles of " + topic + ".",
                "What are the most important design patterns used in " + topic + "?",
                "Describe a common challenge in " + topic + " at " + difficulty + " level and how you would solve it.",
                "How would you design a scalable system for " + topic + "?",
                "What are the best practices and common pitfalls in " + topic + "?",
                "Compare and contrast two approaches in " + topic + ". When would you use each?",
                "What optimizations would you apply to improve performance in " + topic + "?",
                "Explain a real-world use case where " + topic + " is critical.",
                "What are the security considerations in " + topic + "?",
                "How does " + topic + " work in a distributed or microservices architecture?"
        };

        for (int i = 0; i < Math.min(count, genericQuestions.length); i++) {
            Map<String, String> q = new HashMap<>();
            q.put("question", genericQuestions[i]);
            fallback.add(q);
        }
        return fallback;
    }

    private Map<String, Object> generateFallbackEvaluation(String question, String answer) {
        Map<String, Object> result = new HashMap<>();
        int wordCount = answer != null ? answer.split("\\s+").length : 0;
        int score = Math.min(80, 40 + Math.min(wordCount, 30) * 2);

        result.put("correctnessScore", score);
        result.put("completenessScore", Math.min(85, score + 5));
        result.put("clarityScore", Math.min(85, score + 5));
        result.put("overallScore", score);
        result.put("feedback", "Your answer addresses the question. Consider adding more specific examples and structured points for clarity.");
        result.put("strengths", "You covered the main points and provided a coherent response.");
        result.put("improvements", "Add concrete examples, mention edge cases, and organize with clear bullet points or numbered steps.");
        result.put("idealAnswer", "A complete answer would: (1) Define the core concept clearly, (2) Provide a real-world example, (3) Explain trade-offs or alternatives, (4) Mention best practices and common pitfalls.");

        return result;
    }
}

