package com.interviewai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private com.interviewai.entity.User user;

    @Column(name = "recommended_topic", nullable = false)
    private String recommendedTopic;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false)
    private String priority = "medium";

    private Double confidence = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public com.interviewai.entity.User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getRecommendedTopic() { return recommendedTopic; }
    public void setRecommendedTopic(String recommendedTopic) { this.recommendedTopic = recommendedTopic; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
