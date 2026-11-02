package com.interviewai.controller;

import com.interviewai.entity.InterviewSession;
import com.interviewai.entity.*;
import com.interviewai.entity.Recommendation;
import com.interviewai.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private InterviewSessionRepository sessionRepo;

    @Autowired
    private TopicStatRepository topicStatRepo;

    @Autowired
    private RecommendationRepository recommendationRepo;

    @Autowired
    private UserRepository userRepo;

    @GetMapping("/sessions")
    public ResponseEntity<?> getSessions(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<InterviewSession> sessions = sessionRepo.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> result = sessions.stream().map(this::serializeSession).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getProfileStats(Authentication authentication) {
        Long userId = getUserId(authentication);

        List<InterviewSession> completed = sessionRepo.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "completed");

        double avgScore = completed.stream()
            .mapToInt(s -> s.getOverallScore() != null ? s.getOverallScore().intValue() : 0)
            .average().orElse(0);

        int bestScore = completed.stream()
            .mapToInt(s -> s.getOverallScore() != null ? s.getOverallScore().intValue() : 0)
            .max().orElse(0);

        // Calculate streak
        int streak = calculateStreak(completed);

        return ResponseEntity.ok(Map.of(
            "totalSessions", completed.size(),
            "averageScore", Math.round(avgScore * 10.0) / 10.0,
            "bestScore", bestScore,
            "currentStreak", streak
        ));
    }

    @GetMapping("/topic-stats")
    public ResponseEntity<?> getTopicStats(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<TopicStat> stats = topicStatRepo.findByUserId(userId);
        List<Map<String, Object>> result = stats.stream().map(s -> Map.<String, Object>of(
            "topic", s.getTopic(),
            "totalSessions", s.getTotalSessions(),
            "totalQuestions", s.getTotalQuestions(),
            "averageScore", s.getAverageScore(),
            "bestScore", s.getBestScore()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<Recommendation> recs = recommendationRepo.findByUserIdOrderByPriorityDescConfidenceDesc(userId);
        List<Map<String, Object>> result = recs.stream().map(r -> Map.<String, Object>of(
            "id", r.getId(),
            "recommendedTopic", r.getRecommendedTopic(),
            "reason", r.getReason(),
            "priority", r.getPriority(),
            "confidence", r.getConfidence()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/score-history")
    public ResponseEntity<?> getScoreHistory(Authentication authentication) {
        Long userId = getUserId(authentication);
        List<InterviewSession> sessions = sessionRepo.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "completed");
        List<Map<String, Object>> result = sessions.stream().map(s -> Map.<String, Object>of(
            "id", s.getId(),
            "topic", s.getTopic(),
            "overallScore", s.getOverallScore(),
            "difficulty", s.getDifficulty(),
            "createdAt", s.getCreatedAt().toString()
        )).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    private int calculateStreak(List<InterviewSession> completed) {
        if (completed.isEmpty()) return 0;

        Set<String> dates = completed.stream()
            .map(s -> s.getCreatedAt().toLocalDate().toString())
            .collect(Collectors.toCollection(TreeSet::new));

        List<String> dateList = new ArrayList<>(dates);
        Collections.reverse(dateList);

        int streak = 0;
        LocalDate today = LocalDate.now();

        for (int i = 0; i < dateList.size(); i++) {
            LocalDate expected = today.minusDays(i);
            if (dateList.get(i).equals(expected.toString())) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
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
        map.put("startedAt", session.getStartedAt().toString());
        map.put("completedAt", session.getCompletedAt() != null ? session.getCompletedAt().toString() : null);
        map.put("createdAt", session.getCreatedAt().toString());
        return map;
    }
}
