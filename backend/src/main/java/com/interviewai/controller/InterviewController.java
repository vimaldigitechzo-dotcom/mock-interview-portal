//package com.interviewai.controller;
//
//import com.interviewai.entity.*;
//import com.interviewai.entity.Recommendation;
//import com.interviewai.repository.*;
//import com.interviewai.service.AiService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.Authentication;
//import org.springframework.web.bind.annotation.*;
//
//import java.time.LocalDateTime;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@RestController
//@RequestMapping("/api/interview")
//public class InterviewController {
//
//    @Autowired
//    private InterviewSessionRepository sessionRepo;
//
//    @Autowired
//    private SessionQuestionRepository questionRepo;
//
//    @Autowired
//    private QuestionEvaluationRepository evalRepo;
//
//    @Autowired
//    private TopicStatRepository topicStatRepo;
//
//    @Autowired
//    private RecommendationRepository recommendationRepo;
//
//    @Autowired
//    private UserRepository userRepo;
//
//    @Autowired
//    private AiService aiService;
//
//    @GetMapping("/topics")
//    public ResponseEntity<?> getTopics() {
//        List<Map<String, String>> topics = List.of(
//            Map.of("id", "dsa", "name", "Data Structures & Algorithms", "description", "Arrays, trees, graphs, sorting, dynamic programming"),
//            Map.of("id", "system-design", "name", "System Design", "description", "Scalability, databases, caching, load balancing"),
//            Map.of("id", "behavioral", "name", "Behavioral", "description", "Leadership, teamwork, conflict resolution"),
//            Map.of("id", "database", "name", "Database Design", "description", "SQL, normalization, indexing, transactions"),
//            Map.of("id", "oop", "name", "Object-Oriented Programming", "description", "SOLID principles, design patterns, polymorphism"),
//            Map.of("id", "web-dev", "name", "Web Development", "description", "Frontend, backend, APIs, security"),
//            Map.of("id", "devops", "name", "DevOps & Cloud", "description", "CI/CD, Docker, Kubernetes, AWS/GCP"),
//            Map.of("id", "networking", "name", "Computer Networks", "description", "HTTP, TCP/IP, DNS, security protocols"),
//            Map.of("id", "operating-systems", "name", "Operating Systems", "description", "Processes, threads, memory management"),
//            Map.of("id", "ai-ml", "name", "AI & Machine Learning", "description", "Neural networks, algorithms, data pipelines")
//        );
//        return ResponseEntity.ok(topics);
//    }
//
//    @PostMapping("/start")
//    public ResponseEntity<?> startSession(@RequestBody Map<String, Object> request, Authentication authentication) {
//        Long userId = getUserId(authentication);
//        String topic = (String) request.get("topic");
//        String difficulty = (String) request.get("difficulty");
//        int numQuestions = request.get("numQuestions") != null ?
//            Integer.parseInt(request.get("numQuestions").toString()) : 5;
//
//        User user = userRepo.findById(userId).orElseThrow();
//
//        // Create session
//        InterviewSession session = new InterviewSession();
//        session.setUser(user);
//        session.setTopic(topic);
//        session.setDifficulty(difficulty);
//        session.setTotalQuestions(numQuestions);
//        session.setAnsweredQuestions(0);
//        session.setOverallScore(0.0);
//        session.setStatus("active");
//        session.setStartedAt(LocalDateTime.now());
//        session.setCreatedAt(LocalDateTime.now());
//        session = sessionRepo.save(session);
//
//        // Generate AI questions
//        List<Map<String, String>> aiQuestions = aiService.generateQuestions(topic, difficulty, numQuestions);
//
//        // Save questions
//        List<Map<String, Object>> savedQuestions = new ArrayList<>();
//        for (int i = 0; i < aiQuestions.size(); i++) {
//            SessionQuestion q = new SessionQuestion();
//            q.setSession(session);
//            q.setQuestionNumber(i + 1);
//            q.setQuestionText(aiQuestions.get(i).get("question"));
//            q.setQuestionDifficulty(difficulty);
//            q.setSubmitted("pending");
//            q.setCreatedAt(LocalDateTime.now());
//            q = questionRepo.save(q);
//
//            savedQuestions.add(Map.of(
//                "id", q.getId(),
//                "questionNumber", q.getQuestionNumber(),
//                "questionText", q.getQuestionText(),
//                "submitted", q.getSubmitted()
//            ));
//        }
//
//        return ResponseEntity.ok(Map.of(
//            "sessionId", session.getId(),
//            "questions", savedQuestions,
//            "topic", topic,
//            "difficulty", difficulty,
//            "totalQuestions", numQuestions
//        ));
//    }
//
//    /*@GetMapping("/session/{sessionId}")
//    public ResponseEntity<?> getSession(@PathVariable Long sessionId, Authentication authentication) {
//        InterviewSession session = sessionRepo.findById(sessionId).orElseThrow();
//        if (!session.getUser().getId().equals(getUserId(authentication))) {
//            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
//        }
//
//        List<SessionQuestion> questions = questionRepo.findBySessionIdOrderByQuestionNumber(sessionId);
//        List<Map<String, Object>> qList = questions.stream().map(q -> Map.<String, Object>of(
//            "id", q.getId(),
//            "questionNumber", q.getQuestionNumber(),
//            "questionText", q.getQuestionText(),
//            "userAnswer", q.getUserAnswer(),
//            "submitted", q.getSubmitted()
//        )).collect(Collectors.toList());
//
//        return ResponseEntity.ok(Map.of("session", serializeSession(session), "questions", qList));
//    }*/
//
//    @GetMapping("/session/{sessionId}")
//    public ResponseEntity<?> getSession(@PathVariable Long sessionId, Authentication authentication) {
//        InterviewSession session = sessionRepo.findById(sessionId).orElseThrow();
//        if (!session.getUser().getId().equals(getUserId(authentication))) {
//            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
//        }
//
//        List<SessionQuestion> questions = questionRepo.findBySessionIdOrderByQuestionNumber(sessionId);
//
//        // FIX: Use HashMap instead of Map.of() to handle null values
//        List<Map<String, Object>> qList = questions.stream().map(q -> {
//            Map<String, Object> map = new HashMap<>();
//            map.put("id", q.getId());
//            map.put("questionNumber", q.getQuestionNumber());
//            map.put("questionText", q.getQuestionText());
//            map.put("userAnswer", q.getUserAnswer());  // Can be null
//            map.put("submitted", q.getSubmitted() != null ? q.getSubmitted() : "pending");  // Can be null
//            map.put("topicArea", q.getTopicArea());
//            map.put("difficulty", q.getDifficulty());
//            return map;
//        }).collect(Collectors.toList());
//
//        return ResponseEntity.ok(Map.of("session", serializeSession(session), "questions", qList));
//    }
//
//
//    @PostMapping("/submit-answer")
//    public ResponseEntity<?> submitAnswer(@RequestBody Map<String, Object> request, Authentication authentication) {
//        Long userId = getUserId(authentication);
//        Long questionId = Long.parseLong(request.get("questionId").toString());
//        Long sessionId = Long.parseLong(request.get("sessionId").toString());
//        String answer = (String) request.get("answer");
//
//        InterviewSession session = sessionRepo.findById(sessionId).orElseThrow();
//        if (!session.getUser().getId().equals(userId)) {
//            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
//        }
//
//        SessionQuestion question = questionRepo.findById(questionId).orElseThrow();
//        question.setUserAnswer(answer);
//        question.setSubmitted("submitted");
//        questionRepo.save(question);
//
//        // AI Evaluation
//        Map<String, Object> evaluation = aiService.evaluateAnswer(
//            question.getQuestionText(), answer, session.getDifficulty(), session.getTopic()
//        );
//
//        // Save evaluation
//        QuestionEvaluation eval = new QuestionEvaluation();
//        eval.setQuestion(question);
//        eval.setSession(session);
//        eval.setCorrectnessScore((Integer) evaluation.get("correctnessScore"));
//        eval.setCompletenessScore((Integer) evaluation.get("completenessScore"));
//        eval.setClarityScore((Integer) evaluation.get("clarityScore"));
//        eval.setOverallScore((Integer) evaluation.get("overallScore"));
//        eval.setFeedback((String) evaluation.get("feedback"));
//        eval.setStrengths((String) evaluation.get("strengths"));
//        eval.setImprovements((String) evaluation.get("improvements"));
//        eval.setIdealAnswer((String) evaluation.get("idealAnswer"));
//        eval.setEvaluatedAt(LocalDateTime.now());
//        evalRepo.save(eval);
//
//        // Update session stats
//        List<SessionQuestion> allQuestions = questionRepo.findBySessionIdOrderByQuestionNumber(sessionId);
//        long answeredCount = allQuestions.stream().filter(q -> "submitted".equals(q.getSubmitted())).count();
//        List<QuestionEvaluation> evaluations = evalRepo.findBySessionId(sessionId);
//        double runningAvg = evaluations.stream().mapToDouble(e -> e.getOverallScore().doubleValue()).average().orElse(0);
//
//        session.setAnsweredQuestions((int) answeredCount);
//        session.setOverallScore(runningAvg);
//        sessionRepo.save(session);
//
//        return ResponseEntity.ok(Map.of(
//            "evaluation", evaluation,
//            "answeredCount", answeredCount,
//            "totalQuestions", session.getTotalQuestions(),
//            "overallScore", runningAvg
//        ));
//    }
//
//    @PostMapping("/complete/{sessionId}")
//    public ResponseEntity<?> completeSession(@PathVariable Long sessionId, Authentication authentication) {
//        Long userId = getUserId(authentication);
//        InterviewSession session = sessionRepo.findById(sessionId).orElseThrow();
//        if (!session.getUser().getId().equals(userId)) {
//            return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
//        }
//
//        session.setStatus("completed");
//        session.setCompletedAt(LocalDateTime.now());
//        sessionRepo.save(session);
//
//        List<QuestionEvaluation> evaluations = evalRepo.findBySessionId(sessionId);
//        double finalScore = evaluations.stream().mapToDouble(e -> e.getOverallScore().doubleValue()).average().orElse(0);
//
//        // Update topic stats
//        updateTopicStats(userId, session.getTopic(), finalScore, evaluations.size());
//
//        // Generate recommendations
//        generateRecommendations(userId);
//
//        // Get results
//        List<SessionQuestion> questions = questionRepo.findBySessionIdOrderByQuestionNumber(sessionId);
//        List<Map<String, Object>> results = questions.stream().map(q -> {
//            Map<String, Object> result = new HashMap<>();
//            result.put("questionId", q.getId());
//            result.put("questionNumber", q.getQuestionNumber());
//            result.put("questionText", q.getQuestionText());
//            result.put("userAnswer", q.getUserAnswer());
//            Optional<QuestionEvaluation> evalOpt = evalRepo.findByQuestionId(q.getId());
//            if (evalOpt.isPresent()) {
//                QuestionEvaluation eval = evalOpt.get();
//                result.put("evaluation", Map.of(
//                    "correctnessScore", eval.getCorrectnessScore(),
//                    "completenessScore", eval.getCompletenessScore(),
//                    "clarityScore", eval.getClarityScore(),
//                    "overallScore", eval.getOverallScore(),
//                    "feedback", eval.getFeedback(),
//                    "strengths", eval.getStrengths(),
//                    "improvements", eval.getImprovements(),
//                    "idealAnswer", eval.getIdealAnswer()
//                ));
//            }
//            return result;
//        }).collect(Collectors.toList());
//
//        session.setOverallScore(finalScore);
//
//        return ResponseEntity.ok(Map.of(
//            "session", serializeSession(session),
//            "results", results,
//            "finalScore", finalScore,
//            "totalQuestions", questions.size()
//        ));
//    }
//
//    private void updateTopicStats(Long userId, String topic, double sessionScore, int questionCount) {
//        Optional<TopicStat> existing = topicStatRepo.findByUserIdAndTopic(userId, topic);
//        if (existing.isPresent()) {
//            TopicStat stat = existing.get();
//            int newTotal = stat.getTotalSessions() + 1;
//            double newAvg = ((stat.getAverageScore() * stat.getTotalSessions()) + sessionScore) / newTotal;
//            double newBest = Math.max(stat.getBestScore(), sessionScore);
//            stat.setTotalSessions(newTotal);
//            stat.setTotalQuestions(stat.getTotalQuestions() + questionCount);
//            stat.setAverageScore(newAvg);
//            stat.setBestScore(newBest);
//            stat.setUpdatedAt(LocalDateTime.now());
//            topicStatRepo.save(stat);
//        } else {
//            User user = userRepo.findById(userId).orElseThrow();
//            TopicStat stat = new TopicStat();
//            stat.setUser(user);
//            stat.setTopic(topic);
//            stat.setTotalSessions(1);
//            stat.setTotalQuestions(questionCount);
//            stat.setAverageScore(sessionScore);
//            stat.setBestScore(sessionScore);
//            stat.setUpdatedAt(LocalDateTime.now());
//            topicStatRepo.save(stat);
//        }
//    }
//
//    private void generateRecommendations(Long userId) {
//        List<TopicStat> stats = topicStatRepo.findByUserId(userId);
//        if (stats.size() < 2) return;
//
//        List<TopicStat> sorted = stats.stream()
//            .sorted(Comparator.comparing(TopicStat::getAverageScore))
//            .collect(Collectors.toList());
//
//        Map<String, String> topicNames = new HashMap<>();
//        topicNames.put("dsa", "Data Structures & Algorithms");
//        topicNames.put("system-design", "System Design");
//        topicNames.put("behavioral", "Behavioral Interviews");
//        topicNames.put("database", "Database Design");
//        topicNames.put("oop", "Object-Oriented Programming");
//        topicNames.put("web-dev", "Web Development");
//        topicNames.put("devops", "DevOps & Cloud");
//        topicNames.put("networking", "Computer Networks");
//        topicNames.put("operating-systems", "Operating Systems");
//        topicNames.put("ai-ml", "AI & Machine Learning");
//
//        User user = userRepo.findById(userId).orElseThrow();
//        String[] priorities = {"high", "medium", "low"};
//
//        List<Recommendation> newRecs = new ArrayList<>();
//        for (int i = 0; i < Math.min(3, sorted.size()); i++) {
//            TopicStat stat = sorted.get(i);
//            String topicName = topicNames.getOrDefault(stat.getTopic(), stat.getTopic());
//            Recommendation rec = new Recommendation();
//            rec.setUser(user);
//            rec.setRecommendedTopic(topicName);
//            rec.setReason(String.format("Your average score in %s is %.1f/100. Focus on improving this area.", topicName, stat.getAverageScore()));
//            rec.setPriority(priorities[i]);
//            rec.setConfidence(Math.min(95.0, 50.0 + (100.0 - stat.getAverageScore()) * 0.5));
//            rec.setCreatedAt(LocalDateTime.now());
//            newRecs.add(rec);
//        }
//
//        recommendationRepo.saveAll(newRecs);
//    }
//
//    private Long getUserId(Authentication authentication) {
//        String email = authentication.getName();
//        User user = userRepo.findByEmail(email).orElseThrow();
//        return user.getId();
//    }
//
//    private Map<String, Object> serializeSession(InterviewSession session) {
//        Map<String, Object> map = new HashMap<>();
//        map.put("id", session.getId());
//        map.put("topic", session.getTopic());
//        map.put("difficulty", session.getDifficulty());
//        map.put("totalQuestions", session.getTotalQuestions());
//        map.put("answeredQuestions", session.getAnsweredQuestions());
//        map.put("overallScore", session.getOverallScore());
//        map.put("status", session.getStatus());
//        map.put("startedAt", session.getStartedAt().toString());
//        map.put("completedAt", session.getCompletedAt() != null ? session.getCompletedAt().toString() : null);
//        map.put("createdAt", session.getCreatedAt().toString());
//        return map;
//    }
//}

package com.interviewai.controller;

import com.interviewai.entity.*;
import com.interviewai.repository.*;
import com.interviewai.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interview" )
public class InterviewController {

    @Autowired
    private InterviewSessionRepository sessionRepo;

    @Autowired
    private SessionQuestionRepository questionRepo;

    @Autowired
    private QuestionEvaluationRepository evalRepo;

    @Autowired
    private TopicStatRepository topicStatRepo;

    @Autowired
    private RecommendationRepository recommendationRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private AiService aiService;

    @GetMapping("/topics")
    public ResponseEntity<?> getTopics() {
        List<Map<String, String>> topics = List.of(
                Map.of("id", "dsa", "name", "Data Structures & Algorithms", "description", "Arrays, trees, graphs, sorting, dynamic programming"),
                Map.of("id", "system-design", "name", "System Design", "description", "Scalability, databases, caching, load balancing"),
                Map.of("id", "behavioral", "name", "Behavioral", "description", "Leadership, teamwork, conflict resolution"),
                Map.of("id", "database", "name", "Database Design", "description", "SQL, normalization, indexing, transactions"),
                Map.of("id", "oop", "name", "Object-Oriented Programming", "description", "SOLID principles, design patterns, polymorphism"),
                Map.of("id", "web-dev", "name", "Web Development", "description", "Frontend, backend, APIs, security"),
                Map.of("id", "devops", "name", "DevOps & Cloud", "description", "CI/CD, Docker, Kubernetes, AWS/GCP"),
                Map.of("id", "networking", "name", "Computer Networks", "description", "HTTP, TCP/IP, DNS, security protocols"),
                Map.of("id", "operating-systems", "name", "Operating Systems", "description", "Processes, threads, memory management"),
                Map.of("id", "ai-ml", "name", "AI & Machine Learning", "description", "Neural networks, algorithms, data pipelines")
        );
        return ResponseEntity.ok(topics);
    }

    @PostMapping("/start")
    public ResponseEntity<?> startSession(@RequestBody Map<String, Object> request, Authentication authentication) {
        Long userId = getUserId(authentication);
        String topic = (String) request.get("topic");
        String difficulty = (String) request.get("difficulty");
        int numQuestions = request.get("numQuestions") != null ?
                Integer.parseInt(request.get("numQuestions").toString()) : 5;

        User user = userRepo.findById(userId).orElseThrow();

        // Create session
        InterviewSession session = new InterviewSession();
        session.setUser(user);
        session.setTopic(topic);
        session.setDifficulty(difficulty);
        session.setTotalQuestions(numQuestions);
        session.setAnsweredQuestions(0);
        session.setOverallScore(0.0);
        session.setStatus("active");
        session.setStartedAt(LocalDateTime.now());
        session.setCreatedAt(LocalDateTime.now());
        session = sessionRepo.save(session);

        // Generate AI questions
        List<Map<String, String>> aiQuestions = aiService.generateQuestions(topic, difficulty, numQuestions);

        // Save questions using HashMap to avoid null issues
        List<Map<String, Object>> savedQuestions = new ArrayList<>();
        for (int i = 0; i < aiQuestions.size(); i++) {
            SessionQuestion q = new SessionQuestion();
            q.setSession(session);
            q.setQuestionNumber(i + 1);
            q.setQuestionText(aiQuestions.get(i).get("question"));
            q.setQuestionDifficulty(difficulty);
            q.setSubmitted("pending");
            q.setCreatedAt(LocalDateTime.now());
            q = questionRepo.save(q);

            Map<String, Object> qMap = new HashMap<>();
            qMap.put("id", q.getId());
            qMap.put("questionNumber", q.getQuestionNumber());
            qMap.put("questionText", q.getQuestionText());
            qMap.put("submitted", q.getSubmitted());
            savedQuestions.add(qMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("questions", savedQuestions);
        response.put("topic", topic);
        response.put("difficulty", difficulty);
        response.put("totalQuestions", numQuestions);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<?> getSession(@PathVariable Long sessionId, Authentication authentication) {
        InterviewSession session = sessionRepo.findById(sessionId).orElseThrow();
        if (!session.getUser().getId().equals(getUserId(authentication))) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Access denied");
            return ResponseEntity.status(403).body(error);
        }

        List<SessionQuestion> questions = questionRepo.findBySessionIdOrderByQuestionNumber(sessionId);

        // Use HashMap to safely handle null values
        List<Map<String, Object>> qList = new ArrayList<>();
        for (SessionQuestion q : questions) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", q.getId());
            map.put("questionNumber", q.getQuestionNumber());
            map.put("questionText", q.getQuestionText());
            map.put("userAnswer", q.getUserAnswer() != null ? q.getUserAnswer() : "");
            map.put("submitted", q.getSubmitted() != null ? q.getSubmitted() : "pending");
            map.put("topicArea", q.getTopicArea() != null ? q.getTopicArea() : "");
            map.put("difficulty", q.getQuestionDifficulty() != null ? q.getQuestionDifficulty() : "");
            qList.add(map);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("session", serializeSession(session));
        response.put("questions", qList);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/submit-answer")
    public ResponseEntity<?> submitAnswer(@RequestBody Map<String, Object> request, Authentication authentication) {
        Long userId = getUserId(authentication);
        Long questionId = Long.parseLong(request.get("questionId").toString());
        Long sessionId = Long.parseLong(request.get("sessionId").toString());
        String answer = (String) request.get("answer");

        InterviewSession session = sessionRepo.findById(sessionId).orElseThrow();
        if (!session.getUser().getId().equals(userId)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Access denied");
            return ResponseEntity.status(403).body(error);
        }

        SessionQuestion question = questionRepo.findById(questionId).orElseThrow();
        question.setUserAnswer(answer);
        question.setSubmitted("submitted");
        questionRepo.save(question);

        // AI Evaluation
        Map<String, Object> evaluation = aiService.evaluateAnswer(
                question.getQuestionText(), answer, session.getDifficulty(), session.getTopic()
        );

        // Save evaluation
        QuestionEvaluation eval = new QuestionEvaluation();
        eval.setQuestion(question);
        eval.setSession(session);
        eval.setCorrectnessScore((Integer) evaluation.get("correctnessScore"));
        eval.setCompletenessScore((Integer) evaluation.get("completenessScore"));
        eval.setClarityScore((Integer) evaluation.get("clarityScore"));
        eval.setOverallScore((Integer) evaluation.get("overallScore"));
        eval.setFeedback((String) evaluation.get("feedback"));
        eval.setStrengths((String) evaluation.get("strengths"));
        eval.setImprovements((String) evaluation.get("improvements"));
        eval.setIdealAnswer((String) evaluation.get("idealAnswer"));
        eval.setEvaluatedAt(LocalDateTime.now());
        evalRepo.save(eval);

        // Update session stats
        List<SessionQuestion> allQuestions = questionRepo.findBySessionIdOrderByQuestionNumber(sessionId);
        long answeredCount = allQuestions.stream().filter(q -> "submitted".equals(q.getSubmitted())).count();
        List<QuestionEvaluation> evaluations = evalRepo.findBySessionId(sessionId);
        double runningAvg = evaluations.stream().mapToDouble(e -> e.getOverallScore().doubleValue()).average().orElse(0);

        session.setAnsweredQuestions((int) answeredCount);
        session.setOverallScore(runningAvg);
        sessionRepo.save(session);

        Map<String, Object> response = new HashMap<>();
        response.put("evaluation", evaluation);
        response.put("answeredCount", answeredCount);
        response.put("totalQuestions", session.getTotalQuestions());
        response.put("overallScore", runningAvg);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/complete/{sessionId}")
    public ResponseEntity<?> completeSession(@PathVariable Long sessionId, Authentication authentication) {
        Long userId = getUserId(authentication);
        InterviewSession session = sessionRepo.findById(sessionId).orElseThrow();
        if (!session.getUser().getId().equals(userId)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Access denied");
            return ResponseEntity.status(403).body(error);
        }

        session.setStatus("completed");
        session.setCompletedAt(LocalDateTime.now());
        sessionRepo.save(session);

        List<QuestionEvaluation> evaluations = evalRepo.findBySessionId(sessionId);
        double finalScore = evaluations.stream().mapToDouble(e -> e.getOverallScore().doubleValue()).average().orElse(0);

        // Update topic stats
        updateTopicStats(userId, session.getTopic(), finalScore, evaluations.size());

        // Generate recommendations
        generateRecommendations(userId);

        // Get results
        List<SessionQuestion> questions = questionRepo.findBySessionIdOrderByQuestionNumber(sessionId);
        List<Map<String, Object>> results = new ArrayList<>();
        for (SessionQuestion q : questions) {
            Map<String, Object> result = new HashMap<>();
            result.put("questionId", q.getId());
            result.put("questionNumber", q.getQuestionNumber());
            result.put("questionText", q.getQuestionText());
            result.put("userAnswer", q.getUserAnswer() != null ? q.getUserAnswer() : "");

            Optional<QuestionEvaluation> evalOpt = evalRepo.findByQuestionId(q.getId());
            if (evalOpt.isPresent()) {
                QuestionEvaluation eval = evalOpt.get();
                Map<String, Object> evalMap = new HashMap<>();
                evalMap.put("correctnessScore", eval.getCorrectnessScore());
                evalMap.put("completenessScore", eval.getCompletenessScore());
                evalMap.put("clarityScore", eval.getClarityScore());
                evalMap.put("overallScore", eval.getOverallScore());
                evalMap.put("feedback", eval.getFeedback());
                evalMap.put("strengths", eval.getStrengths());
                evalMap.put("improvements", eval.getImprovements());
                evalMap.put("idealAnswer", eval.getIdealAnswer());
                result.put("evaluation", evalMap);
            }
            results.add(result);
        }

        session.setOverallScore(finalScore);

        Map<String, Object> response = new HashMap<>();
        response.put("session", serializeSession(session));
        response.put("results", results);
        response.put("finalScore", finalScore);
        response.put("totalQuestions", questions.size());

        return ResponseEntity.ok(response);
    }

    private void updateTopicStats(Long userId, String topic, double sessionScore, int questionCount) {
        Optional<TopicStat> existing = topicStatRepo.findByUserIdAndTopic(userId, topic);
        if (existing.isPresent()) {
            TopicStat stat = existing.get();
            int newTotal = stat.getTotalSessions() + 1;
            double newAvg = ((stat.getAverageScore() * stat.getTotalSessions()) + sessionScore) / newTotal;
            double newBest = Math.max(stat.getBestScore(), sessionScore);
            stat.setTotalSessions(newTotal);
            stat.setTotalQuestions(stat.getTotalQuestions() + questionCount);
            stat.setAverageScore(newAvg);
            stat.setBestScore(newBest);
            stat.setUpdatedAt(LocalDateTime.now());
            topicStatRepo.save(stat);
        } else {
            User user = userRepo.findById(userId).orElseThrow();
            TopicStat stat = new TopicStat();
            stat.setUser(user);
            stat.setTopic(topic);
            stat.setTotalSessions(1);
            stat.setTotalQuestions(questionCount);
            stat.setAverageScore(sessionScore);
            stat.setBestScore(sessionScore);
            stat.setUpdatedAt(LocalDateTime.now());
            topicStatRepo.save(stat);
        }
    }

    private void generateRecommendations(Long userId) {
        List<TopicStat> stats = topicStatRepo.findByUserId(userId);
        if (stats.size() < 2) return;

        List<TopicStat> sorted = stats.stream()
                .sorted(Comparator.comparing(TopicStat::getAverageScore))
                .collect(Collectors.toList());

        Map<String, String> topicNames = new HashMap<>();
        topicNames.put("dsa", "Data Structures & Algorithms");
        topicNames.put("system-design", "System Design");
        topicNames.put("behavioral", "Behavioral Interviews");
        topicNames.put("database", "Database Design");
        topicNames.put("oop", "Object-Oriented Programming");
        topicNames.put("web-dev", "Web Development");
        topicNames.put("devops", "DevOps & Cloud");
        topicNames.put("networking", "Computer Networks");
        topicNames.put("operating-systems", "Operating Systems");
        topicNames.put("ai-ml", "AI & Machine Learning");

        User user = userRepo.findById(userId).orElseThrow();
        String[] priorities = {"high", "medium", "low"};

        List<Recommendation> newRecs = new ArrayList<>();
        for (int i = 0; i < Math.min(3, sorted.size()); i++) {
            TopicStat stat = sorted.get(i);
            String topicName = topicNames.getOrDefault(stat.getTopic(), stat.getTopic());
            Recommendation rec = new Recommendation();
            rec.setUser(user);
            rec.setRecommendedTopic(topicName);
            rec.setReason(String.format("Your average score in %s is %.1f/100. Focus on improving this area.", topicName, stat.getAverageScore()));
            rec.setPriority(priorities[i]);
            rec.setConfidence(Math.min(95.0, 50.0 + (100.0 - stat.getAverageScore()) * 0.5));
            rec.setCreatedAt(LocalDateTime.now());
            newRecs.add(rec);
        }

        recommendationRepo.saveAll(newRecs);
    }

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepo.findByEmail(email).orElseThrow();
        return user.getId();
    }

    private Map<String, Object> serializeSession(InterviewSession session) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", session.getId());
        map.put("topic", session.getTopic());
        map.put("difficulty", session.getDifficulty());
        map.put("totalQuestions", session.getTotalQuestions());
        map.put("answeredQuestions", session.getAnsweredQuestions());
        map.put("overallScore", session.getOverallScore());
        map.put("status", session.getStatus());
        map.put("startedAt", session.getStartedAt() != null ? session.getStartedAt().toString() : "");
        map.put("completedAt", session.getCompletedAt() != null ? session.getCompletedAt().toString() : "");
        map.put("createdAt", session.getCreatedAt() != null ? session.getCreatedAt().toString() : "");
        return map;
    }
}

