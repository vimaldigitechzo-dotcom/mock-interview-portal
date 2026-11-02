package com.interviewai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "question_evaluations")
public class QuestionEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private SessionQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(name = "correctness_score")
    private Integer correctnessScore;

    @Column(name = "completeness_score")
    private Integer completenessScore;

    @Column(name = "clarity_score")
    private Integer clarityScore;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(columnDefinition = "TEXT")
    private String strengths;

    @Column(columnDefinition = "TEXT")
    private String improvements;

    @Column(name = "ideal_answer", columnDefinition = "TEXT")
    private String idealAnswer;

    @Column(name = "evaluated_at")
    private LocalDateTime evaluatedAt = LocalDateTime.now();

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SessionQuestion getQuestion() { return question; }
    public void setQuestion(SessionQuestion question) { this.question = question; }

    public InterviewSession getSession() { return session; }
    public void setSession(InterviewSession session) { this.session = session; }

    public Integer getCorrectnessScore() { return correctnessScore; }
    public void setCorrectnessScore(Integer correctnessScore) { this.correctnessScore = correctnessScore; }

    public Integer getCompletenessScore() { return completenessScore; }
    public void setCompletenessScore(Integer completenessScore) { this.completenessScore = completenessScore; }

    public Integer getClarityScore() { return clarityScore; }
    public void setClarityScore(Integer clarityScore) { this.clarityScore = clarityScore; }

    public Integer getOverallScore() { return overallScore; }
    public void setOverallScore(Integer overallScore) { this.overallScore = overallScore; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getStrengths() { return strengths; }
    public void setStrengths(String strengths) { this.strengths = strengths; }

    public String getImprovements() { return improvements; }
    public void setImprovements(String improvements) { this.improvements = improvements; }

    public String getIdealAnswer() { return idealAnswer; }
    public void setIdealAnswer(String idealAnswer) { this.idealAnswer = idealAnswer; }

    public LocalDateTime getEvaluatedAt() { return evaluatedAt; }
    public void setEvaluatedAt(LocalDateTime evaluatedAt) { this.evaluatedAt = evaluatedAt; }
}
