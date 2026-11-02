//package com.interviewai.entity;
//
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "interview_sessions")
//public class InterviewSession {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(name = "user_id", nullable = false)
//    private Long userId;
//
//    @Column(name = "topic", nullable = false)
//    private String topic;
//
//    @Column(name = "difficulty", nullable = false)
//    private String difficulty;
//
//    @Column(name = "question_count")
//    private int questionCount;
//
//    @Column(name = "overall_score")
//    private Double overallScore;
//
//    @Column(name = "status")
//    private String status; // "in_progress", "completed"
//
//    @Column(name = "created_at")
//    private LocalDateTime createdAt;
//
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//
//    public InterviewSession() {}
//
//    // Getters and Setters
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//    public Long getUserId() { return userId; }
//    public void setUserId(Long userId) { this.userId = userId; }
//    public String getTopic() { return topic; }
//    public void setTopic(String topic) { this.topic = topic; }
//    public String getDifficulty() { return difficulty; }
//    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
//    public int getQuestionCount() { return questionCount; }
//    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
//    public Double getOverallScore() { return overallScore; }
//    public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }
//    public String getStatus() { return status; }
//    public void setStatus(String status) { this.status = status; }
//    public LocalDateTime getCreatedAt() { return createdAt; }
//    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
//    public LocalDateTime getUpdatedAt() { return updatedAt; }
//    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
//}

package com.interviewai.entity;

import jakarta.persistence.*;
        import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_sessions")
@Data
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false)
    private String difficulty;

    @Column(name = "total_questions")
    private int totalQuestions;

    @Column(name = "answered_questions")
    private int answeredQuestions;

    @Column(name = "overall_score")
    private Double overallScore;

    private String status;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

