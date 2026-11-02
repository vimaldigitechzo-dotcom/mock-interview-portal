//package com.interviewai.service;
//
//import com.fasterxml.jackson.databind.JsonNode;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.*;
//
//@Service
//public class AiService {
//
//    @Value("${app.openai.api-key}")
//    private String apiKey;
//
//    @Value("${app.openai.model}")
//    private String model;
//
//    private final RestTemplate restTemplate = new RestTemplate();
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    private static final Map<String, String> TOPIC_DESCRIPTIONS = createTopicDescriptions();
//
//    private static Map<String, String> createTopicDescriptions() {
//        Map<String, String> map = new HashMap<>();
//        map.put("dsa", "Data Structures and Algorithms (arrays, linked lists, trees, graphs, sorting, dynamic programming)");
//        map.put("system-design", "System Design (scalability, distributed systems, databases, caching, load balancing, microservices)");
//        map.put("behavioral", "Behavioral questions (leadership, teamwork, conflict resolution, project management, STAR method)");
//        map.put("database", "Database Design (SQL, normalization, indexing, ACID, transactions, NoSQL vs SQL)");
//        map.put("oop", "Object-Oriented Programming (SOLID principles, design patterns, inheritance, polymorphism, encapsulation)");
//        map.put("web-dev", "Web Development (React, Node.js, REST APIs, security, performance, accessibility)");
//        map.put("devops", "DevOps and Cloud (CI/CD, Docker, Kubernetes, AWS, monitoring, infrastructure as code)");
//        map.put("networking", "Computer Networks (TCP/IP, HTTP/HTTPS, DNS, security protocols, OSI model)");
//        map.put("operating-systems", "Operating Systems (processes, threads, memory management, file systems, scheduling)");
//        map.put("ai-ml", "AI and Machine Learning (neural networks, supervised/unsupervised learning, transformers, data pipelines)");
//        return Collections.unmodifiableMap(map);
//    }
//
//    public List<Map<String, String>> generateQuestions(String topic, String difficulty, int count) {
//        String topicDesc = TOPIC_DESCRIPTIONS.getOrDefault(topic, topic);
//
//        String systemPrompt = String.format(
//            "You are an expert technical interviewer. Generate exactly %d interview questions about %s at %s difficulty level. " +
//            "Each question should be specific, practical, and appropriate for a technical job interview. " +
//            "Return a JSON array with objects containing only a 'question' field.",
//            count, topicDesc, difficulty
//        );
//
//        String userPrompt = String.format(
//            "Generate exactly %d interview questions about: %s\n\nDifficulty: %s\n\nReturn a JSON array.",
//            count, topicDesc, difficulty
//        );
//
//        try {
//            String response = callOpenAI(systemPrompt, userPrompt);
//            return parseQuestions(response, count, topicDesc, difficulty);
//        } catch (Exception e) {
//            System.err.println("AI question generation failed, using fallback: " + e.getMessage());
//            return generateFallbackQuestions(count, topicDesc, difficulty);
//        }
//    }
//
//    public Map<String, Object> evaluateAnswer(String question, String answer, String difficulty, String topic) {
//        String systemPrompt = "You are an expert technical interviewer evaluating a candidate's answer to an interview question. " +
//            "Score the answer on three dimensions (0-100 each):\n" +
//            "1. Correctness: Is the answer technically accurate and does it demonstrate correct understanding?\n" +
//            "2. Completeness: Does the answer cover all important aspects? Is it thorough?\n" +
//            "3. Clarity: Is the answer well-structured, easy to follow, and clearly explained?\n\n" +
//            "Provide detailed written feedback, identify strengths and areas for improvement, and suggest an ideal answer.";
//
//        String userPrompt = String.format(
//            "Evaluate this answer:\n\nQuestion: %s\n\nCandidate's Answer: %s\n\nTopic: %s\nDifficulty: %s\n\n" +
//            "Return a JSON object with: correctnessScore (0-100), completenessScore (0-100), clarityScore (0-100), " +
//            "overallScore (0-100), feedback (detailed paragraph), strengths (paragraph), improvements (paragraph), " +
//            "idealAnswer (paragraph with model answer).",
//            question, answer, topic, difficulty
//        );
//
//        try {
//            String response = callOpenAI(systemPrompt, userPrompt);
//            return parseEvaluation(response);
//        } catch (Exception e) {
//            System.err.println("AI evaluation failed, using fallback: " + e.getMessage());
//            return getFallbackEvaluation();
//        }
//    }
//
//    private String callOpenAI(String systemPrompt, String userPrompt) {
//        String url = "https://api.openai.com/v1/chat/completions";
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        headers.setBearerAuth(apiKey);
//
//        Map<String, Object> requestBody = new HashMap<>();
//        requestBody.put("model", model);
//        requestBody.put("temperature", 0.7);
//
//        List<Map<String, String>> messages = new ArrayList<>();
//        messages.add(Map.of("role", "system", "content", systemPrompt));
//        messages.add(Map.of("role", "user", "content", userPrompt));
//        requestBody.put("messages", messages);
//        requestBody.put("response_format", Map.of("type", "json_object"));
//
//        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
//        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
//
//        if (response.getBody() != null) {
//            try {
//                JsonNode root = objectMapper.readTree(response.getBody());
//                return root.path("choices").get(0).path("message").path("content").asText();
//            } catch (Exception e) {
//                throw new RuntimeException("Failed to parse OpenAI response", e);
//            }
//        }
//        throw new RuntimeException("Empty response from OpenAI API");
//    }
//
//    private List<Map<String, String>> parseQuestions(String json, int count, String topicDesc, String difficulty) {
//        try {
//            JsonNode root = objectMapper.readTree(json);
//            JsonNode questionsNode = root.has("questions") ? root.get("questions") : root;
//
//            List<Map<String, String>> questions = new ArrayList<>();
//            for (JsonNode node : questionsNode) {
//                String question = node.has("question") ? node.get("question").asText() : node.asText();
//                questions.add(Map.of("question", question));
//            }
//
//            // Ensure we have the right count
//            while (questions.size() < count) {
//                questions.add(Map.of("question", "Additional question about " + topicDesc + " at " + difficulty + " level."));
//            }
//
//            return questions.subList(0, count);
//        } catch (Exception e) {
//            return generateFallbackQuestions(count, topicDesc, difficulty);
//        }
//    }
//
//    private Map<String, Object> parseEvaluation(String json) {
//        try {
//            JsonNode root = objectMapper.readTree(json);
//            Map<String, Object> eval = new HashMap<>();
//            eval.put("correctnessScore", root.has("correctnessScore") ? root.get("correctnessScore").asInt() : 50);
//            eval.put("completenessScore", root.has("completenessScore") ? root.get("completenessScore").asInt() : 50);
//            eval.put("clarityScore", root.has("clarityScore") ? root.get("clarityScore").asInt() : 50);
//            eval.put("overallScore", root.has("overallScore") ? root.get("overallScore").asInt() : 50);
//            eval.put("feedback", root.has("feedback") ? root.get("feedback").asText() : "Evaluation completed.");
//            eval.put("strengths", root.has("strengths") ? root.get("strengths").asText() : "Shows some understanding.");
//            eval.put("improvements", root.has("improvements") ? root.get("improvements").asText() : "Needs more depth.");
//            eval.put("idealAnswer", root.has("idealAnswer") ? root.get("idealAnswer").asText() : "A comprehensive answer would cover all aspects.");
//            return eval;
//        } catch (Exception e) {
//            return getFallbackEvaluation();
//        }
//    }
//
//    private List<Map<String, String>> generateFallbackQuestions(int count, String topicDesc, String difficulty) {
//        List<String> fallbacks = new ArrayList<>(List.of(
//            "Explain the key concepts of " + topicDesc + " and how they apply in practice.",
//            "Describe a real-world scenario where " + topicDesc + " concepts are critical.",
//            "Compare and contrast different approaches to " + topicDesc + " problems.",
//            "Explain the time and space complexity of common " + topicDesc + " algorithms.",
//            "Design a system that leverages " + topicDesc + " principles for optimal performance.",
//            "What are the common pitfalls in " + topicDesc + " and how do you avoid them?",
//            "Explain the trade-offs involved in " + topicDesc + " decisions.",
//            "How would you implement a solution for a " + topicDesc + " problem under constraints?",
//            "Describe the evolution of " + topicDesc + " over the past decade.",
//            "What metrics would you use to evaluate a " + topicDesc + " solution?"
//        ));
//
//        List<Map<String, String>> questions = new ArrayList<>();
//        for (int i = 0; i < count && i < fallbacks.size(); i++) {
//            questions.add(Map.of("question", fallbacks.get(i)));
//        }
//        return questions;
//    }
//
//    private Map<String, Object> getFallbackEvaluation() {
//        return Map.of(
//            "correctnessScore", 50,
//            "completenessScore", 50,
//            "clarityScore", 50,
//            "overallScore", 50,
//            "feedback", "Evaluation completed. The answer has been reviewed against the expected knowledge for this topic.",
//            "strengths", "The answer shows some understanding of the topic.",
//            "improvements", "Consider providing more specific examples and deeper technical details.",
//            "idealAnswer", "A comprehensive answer would cover all aspects of the question with specific examples and clear reasoning."
//        );
//    }
//}

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

