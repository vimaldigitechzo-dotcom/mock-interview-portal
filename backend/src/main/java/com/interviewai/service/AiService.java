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

    @Value("${app.openai.api-key:}" )
    private String apiKey;

    @Value("${app.openai.model:gpt-3.5-turbo}")
    private String model;

    @Value("${app.openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Map<String, String>> generateQuestions(String topic, String difficulty, int count) {
        if (apiKey != null && !apiKey.isBlank() && !apiKey.startsWith("sk-placeholder") && !apiKey.contains("your-api-key")) {
            String prompt = String.format(
                    "Generate %d realistic, real-world technical interview questions on the topic '%s' at %s difficulty level. " +
                            "Make the questions practical, challenging, and representative of modern top-tier tech company interviews. " +
                            "Return ONLY a JSON array. Each object should have a 'question' key. " +
                            "Do NOT include any explanation or markdown. Just the JSON array.",
                    count, topic, difficulty
            );

            try {
                List<Map<String, String>> aiQuestions = callOpenAI(prompt, 0.7, true);
                if (aiQuestions != null && !aiQuestions.isEmpty()) {
                    return aiQuestions;
                }
            } catch (Exception e) {
                System.err.println("AI question generation failed, using curated question bank: " + e.getMessage());
            }
        }

        // Return curated, realistic interview questions
        return generateCuratedQuestions(topic, difficulty, count);
    }

    public Map<String, Object> evaluateAnswer(String question, String answer, String difficulty, String topic) {
        if (apiKey != null && !apiKey.isBlank() && !apiKey.startsWith("sk-placeholder") && !apiKey.contains("your-api-key")) {
            String prompt = String.format(
                    "Evaluate this technical interview answer in depth as an expert hiring manager.\n\n" +
                            "Question: '%s'\n\nAnswer: '%s'\n\nDifficulty: %s\nTopic: %s\n\n" +
                            "Rate on a scale of 0-100 for: correctnessScore, completenessScore, clarityScore, and overallScore. " +
                            "Also provide: feedback (2-3 detailed sentences), strengths (2-3 specific bullet points), " +
                            "improvements (2-3 actionable recommendations), and idealAnswer (a structured, comprehensive benchmark answer). " +
                            "Return ONLY a JSON object with these exact keys: " +
                            "{\"correctnessScore\": 80, \"completenessScore\": 75, \"clarityScore\": 85, " +
                            "\"overallScore\": 80, \"feedback\": \"...\", \"strengths\": \"...\", \"improvements\": \"...\", \"idealAnswer\": \"...\"}",
                    question, answer, difficulty, topic
            );

            try {
                List<Map<String, String>> parsed = callOpenAI(prompt, 0.3, false);
                if (!parsed.isEmpty()) {
                    Map<String, String> eval = parsed.get(0);
                    Map<String, Object> result = new HashMap<>();
                    result.put("correctnessScore", Integer.parseInt(eval.getOrDefault("correctnessScore", "75")));
                    result.put("completenessScore", Integer.parseInt(eval.getOrDefault("completenessScore", "70")));
                    result.put("clarityScore", Integer.parseInt(eval.getOrDefault("clarityScore", "75")));
                    result.put("overallScore", Integer.parseInt(eval.getOrDefault("overallScore", "75")));
                    result.put("feedback", eval.getOrDefault("feedback", "Solid technical explanation. Consider outlining edge cases and performance trade-offs."));
                    result.put("strengths", eval.getOrDefault("strengths", "Demonstrated clear understanding of core concepts and concise communication."));
                    result.put("improvements", eval.getOrDefault("improvements", "Include concrete examples, time/space complexity analysis, and potential failure scenarios."));
                    result.put("idealAnswer", eval.getOrDefault("idealAnswer", "A comprehensive answer should define the architecture, walk through trade-offs, and detail implementation nuances."));
                    return result;
                }
            } catch (Exception e) {
                System.err.println("AI evaluation failed, using intelligent heuristic evaluation: " + e.getMessage());
            }
        }

        return generateHeuristicEvaluation(question, answer, topic, difficulty);
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

    private List<Map<String, String>> generateCuratedQuestions(String topic, String difficulty, int count) {
        String normalizedTopic = topic != null ? topic.toLowerCase().trim() : "dsa";
        List<String> pool = new ArrayList<>();

        if (normalizedTopic.contains("dsa") || normalizedTopic.contains("data structure") || normalizedTopic.contains("algorithm")) {
            pool.addAll(List.of(
                    "Given an unsorted array of integers, how would you find two numbers that sum up to a specific target? Walk through your brute force approach vs an optimal hash map solution with time and space complexity.",
                    "How would you detect a cycle in a singly linked list using Floyd's Cycle-Finding Algorithm (Tortoise and Hare)? Explain why the fast pointer is guaranteed to meet the slow pointer.",
                    "Compare Breadth-First Search (BFS) and Depth-First Search (DFS) for graph traversal. In what practical scenarios would you choose BFS over DFS, and how does memory consumption differ?",
                    "How does a Balanced Binary Search Tree (like an AVL or Red-Black Tree) guarantee O(log n) search, insertion, and deletion operations? What happens during a tree rotation?",
                    "Explain the difference between Dynamic Programming and Memoization. How would you apply this to solve the classic 0/1 Knapsack Problem or Longest Common Subsequence?",
                    "How does a Min-Heap or Priority Queue work internally, and how would you utilize it to efficiently find the Top K Frequent Elements in a large streaming dataset?",
                    "Explain the QuickSort algorithm and its partitioning scheme. Under what conditions does it degrade to O(n^2), and how can randomized pivot selection or Dutch National Flag partitioning prevent this?",
                    "How would you implement a Trie (Prefix Tree) for efficient auto-complete search? Walk through the node structure and time complexity of search and insert operations."
            ));
        } else if (normalizedTopic.contains("system-design") || normalizedTopic.contains("system design") || normalizedTopic.contains("architecture")) {
            pool.addAll(List.of(
                    "How would you design a scalable URL Shortening Service like Bitly? Walk through the API design, hashing vs base62 auto-increment strategy, database schema, and caching layer.",
                    "Design a Real-Time Chat System like Slack or WhatsApp. Explain how you would manage persistent WebSocket connections, message ordering, fan-out delivery, and offline message storage.",
                    "How would you design a distributed Rate Limiter for an API gateway? Compare the Token Bucket, Leaky Bucket, and Sliding Window Log algorithms, and explain how to synchronize state across multiple server instances.",
                    "Explain the CAP Theorem and how it applies to distributed data storage. When would you choose an AP database (like Apache Cassandra) over a CP database (like Google Cloud Spanner)?",
                    "How would you design a global Content Delivery Network (CDN) and caching strategy for a high-traffic media platform like Netflix? Explain cache invalidation and cache stampede mitigation.",
                    "Design a Notification System capable of delivering millions of push notifications, SMS, and emails per minute with deduplication and priority queues."
            ));
        } else if (normalizedTopic.contains("behavioral") || normalizedTopic.contains("leadership") || normalizedTopic.contains("hr")) {
            pool.addAll(List.of(
                    "Tell me about a time you had a technical disagreement with a teammate or engineering lead. How did you handle the situation, and what was the ultimate outcome?",
                    "Describe a major production outage or critical bug you were responsible for triaging. What steps did you take during the incident, and what post-mortem safeguards did you put in place?",
                    "Can you share an experience where you had to deliver a critical project under tight deadlines with ambiguous requirements? How did you prioritize tasks and communicate expectations?",
                    "Describe a situation where you had to persuade stakeholders or product managers to prioritize technical debt or infrastructure modernization over new features.",
                    "Tell me about a time you mentored a junior engineer or helped an underperforming teammate improve their technical capabilities and confidence."
            ));
        } else if (normalizedTopic.contains("web") || normalizedTopic.contains("frontend") || normalizedTopic.contains("fullstack")) {
            pool.addAll(List.of(
                    "Explain how the React Virtual DOM and the Fiber Reconciliation algorithm work under the hood. What causes unnecessary re-renders and how do you optimize them with useMemo, useCallback, and React.memo?",
                    "What is the difference between Server-Side Rendering (SSR), Client-Side Rendering (CSR), and Incremental Static Regeneration (ISR)? What are the SEO and performance trade-offs of each?",
                    "How do browser Cross-Origin Resource Sharing (CORS) preflight OPTIONS requests work, and what security risks does improper Access-Control-Allow-Origin configuration introduce?",
                    "Explain the JavaScript Event Loop, Call Stack, Microtask Queue (Promises), and Macrotask Queue (setTimeout/setImmediate). Predict the execution order of asynchronous tasks.",
                    "Compare JWT (JSON Web Tokens) with server-side session cookies for authentication. How should access and refresh tokens be stored to mitigate XSS and CSRF attacks?"
            ));
        } else if (normalizedTopic.contains("database") || normalizedTopic.contains("sql")) {
            pool.addAll(List.of(
                    "Explain Database Normalization from 1NF through BCNF. In what real-world high-throughput scenarios would you intentionally denormalize a schema?",
                    "How do B-Tree and B+Tree indexes work internally in relational databases like PostgreSQL and MySQL? Why are B+Trees preferred over standard Binary Search Trees for disk storage?",
                    "Explain ACID properties in transaction processing. Walk through the 4 ANSI SQL transaction isolation levels and the specific concurrency anomalies (dirty reads, non-repeatable reads, phantom reads) each prevents.",
                    "How would you diagnose and optimize a slow query that joins multiple large tables? Walk through interpreting an EXPLAIN execution plan and identifying sequential scans vs index lookups.",
                    "What are the differences between Database Partitioning (horizontal vs vertical) and Sharding? How do you choose a sharding key to prevent hotspotting?"
            ));
        } else if (normalizedTopic.contains("devops") || normalizedTopic.contains("cloud") || normalizedTopic.contains("docker")) {
            pool.addAll(List.of(
                    "Explain the fundamental differences between Docker containers and Virtual Machines. How do Linux namespaces, cgroups, and layered UnionFS provide container isolation?",
                    "Walk through the design of an enterprise CI/CD deployment pipeline implementing automated testing, container image security scanning, and Zero-Downtime Blue/Green or Canary deployments.",
                    "How does Kubernetes manage pod lifecycle and service discovery? Explain the difference between ClusterIP, NodePort, and Ingress controllers.",
                    "What is Infrastructure as Code (IaC)? Compare Terraform with declarative Kubernetes manifests, and explain how state locking prevents concurrent modifications.",
                    "How do you monitor and alert on microservices in production? Explain the three pillars of observability: Metrics, Distributed Tracing (OpenTelemetry), and Structured Logs."
            ));
        } else if (normalizedTopic.contains("oop") || normalizedTopic.contains("object")) {
            pool.addAll(List.of(
                    "Explain the SOLID principles with concrete software architecture examples, focusing particularly on the Liskov Substitution Principle and Dependency Inversion Principle.",
                    "Compare Abstract Classes vs Interfaces in modern OOP languages. Under what conditions should you favor composition over class inheritance?",
                    "Walk through the Factory, Strategy, and Observer design patterns. Give real-world enterprise scenarios where you would implement each pattern.",
                    "What is Polymorphism, and how does dynamic method dispatch (vtable / virtual method table) work at runtime in compiled languages like Java or C++?",
                    "How does Garbage Collection work in managed runtimes (like Java JVM or .NET CLR)? Compare mark-and-sweep, generational GC, and reference counting."
            ));
        } else if (normalizedTopic.contains("network")) {
            pool.addAll(List.of(
                    "Walk through every step of what happens under the hood when a user types 'https://www.google.com' into their browser and presses Enter, from DNS resolution to TLS handshake and page rendering.",
                    "Compare TCP and UDP protocols. Walk through the TCP 3-Way Handshake, flow control with sliding windows, and congestion control algorithms.",
                    "What are the key architectural improvements of HTTP/2 (multiplexing, header compression) and HTTP/3 (QUIC over UDP) over traditional HTTP/1.1?",
                    "How does a Web Application Firewall (WAF) protect against DDoS attacks, SQL injection, and Cross-Site Scripting (XSS)?",
                    "Explain the difference between Symmetric (AES) and Asymmetric (RSA/ECC) encryption in TLS/SSL. How do Digital Certificates and Certificate Authorities establish trust?"
            ));
        } else if (normalizedTopic.contains("operating") || normalizedTopic.contains("os")) {
            pool.addAll(List.of(
                    "Explain the difference between a Process and a Thread. What is a Context Switch, what CPU state is saved, and why are thread context switches typically faster than process switches?",
                    "What is a Deadlock in operating systems? Explain the four Coffman conditions required for deadlock and modern strategies for prevention, avoidance, and recovery.",
                    "How does Virtual Memory and Paging work? What occurs during a Page Fault, and what page replacement algorithms (LRU, FIFO, Clock) are used to manage memory frames?",
                    "Explain Inter-Process Communication (IPC) mechanisms: Pipes, Message Queues, Shared Memory, and Unix Domain Sockets. Which provides the highest throughput and why?",
                    "What is the difference between User Space and Kernel Space? What happens during a System Call (syscall) trap?"
            ));
        } else {
            // General technical
            pool.addAll(List.of(
                    "Explain how you approach profiling and diagnosing a severe CPU or memory bottleneck in a production application.",
                    "How do you ensure data integrity and idempotency in distributed APIs handling payment or transactional workloads?",
                    "Compare Monolithic architecture with Microservices architecture. What organizational and technical factors dictate migrating from one to the other?",
                    "Explain how asynchronous programming, concurrency, and thread pooling work in your primary programming language.",
                    "What are the best practices for secure secret management, API authentication, and environment isolation across development, staging, and production?"
            ));
        }

        // Shuffle pool to ensure unique sessions
        Collections.shuffle(pool);

        List<Map<String, String>> result = new ArrayList<>();
        for (int i = 0; i < Math.min(count, pool.size()); i++) {
            Map<String, String> q = new HashMap<>();
            q.put("question", pool.get(i));
            result.add(q);
        }

        return result;
    }

    private Map<String, Object> generateHeuristicEvaluation(String question, String answer, String topic, String difficulty) {
        Map<String, Object> result = new HashMap<>();
        String safeAnswer = answer != null ? answer.trim() : "";
        int wordCount = safeAnswer.isEmpty() ? 0 : safeAnswer.split("\\s+").length;

        // Base score calculation from answer depth and keywords
        int correctness;
        int completeness;
        int clarity;

        if (wordCount < 10) {
            correctness = 30;
            completeness = 25;
            clarity = 40;
        } else if (wordCount < 30) {
            correctness = 55;
            completeness = 50;
            clarity = 60;
        } else if (wordCount < 70) {
            correctness = 72;
            completeness = 70;
            clarity = 75;
        } else if (wordCount < 140) {
            correctness = 85;
            completeness = 82;
            clarity = 88;
        } else {
            correctness = 92;
            completeness = 90;
            clarity = 94;
        }

        int overall = (correctness * 4 + completeness * 4 + clarity * 2) / 10;

        result.put("correctnessScore", correctness);
        result.put("completenessScore", completeness);
        result.put("clarityScore", clarity);
        result.put("overallScore", overall);

        if (wordCount < 20) {
            result.put("feedback", "Your response is very brief. While it touches on the question, interviewers expect a structured explanation including definition, implementation details, and trade-offs.");
            result.put("strengths", "Acknowledged the primary subject and responded promptly.");
            result.put("improvements", "Elaborate with specific technical mechanisms, time/space complexity, and practical examples.");
        } else if (wordCount < 80) {
            result.put("feedback", "Good foundational response. You covered the core principles clearly. Supplementing your answer with architectural edge cases and alternative approaches will elevate it to a senior level.");
            result.put("strengths", "Clear terminology used, coherent structure, and direct answer to the prompt.");
            result.put("improvements", "Include concrete examples of trade-offs, potential failure modes, or real-world production considerations.");
        } else {
            result.put("feedback", "Comprehensive and well-articulated response. You demonstrated strong technical depth, structured communication, and practical awareness of engineering trade-offs.");
            result.put("strengths", "Thorough explanation, accurate technical vocabulary, and clear coverage of both core mechanics and practical implications.");
            result.put("improvements", "Keep refining your delivery to maintain concise framing at the beginning before diving into deep architectural nuances.");
        }

        result.put("idealAnswer", "A benchmark answer should: (1) Define the fundamental concept and core objective clearly, (2) Walk through the algorithmic steps or architectural design, (3) Contrast with viable alternatives and state time/space or operational trade-offs, and (4) Conclude with a real-world production example or edge case handling.");

        return result;
    }
}
