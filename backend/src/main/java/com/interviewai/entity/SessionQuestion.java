//package com.interviewai.entity;
//
//import jakarta.persistence.*;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "session_questions")
//public class SessionQuestion {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "session_id", nullable = false)
//    private InterviewSession session;
//
//    @Column(name = "question_number", nullable = false)
//    private int questionNumber;
//
//    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
//    private String questionText;
//
//    @Column(name = "question_difficulty", nullable = false)
//    private String questionDifficulty;
//
//    @Column(name = "user_answer", columnDefinition = "TEXT")
//    private String userAnswer;
//
//    @Column(nullable = false)
//    private String submitted = "pending";
//
//    @Column(name = "created_at")
//    private LocalDateTime createdAt = LocalDateTime.now();
//
//    // Getters and Setters
//    public Long getId() { return id; }
//    public void setId(Long id) { this.id = id; }
//
//    public InterviewSession getSession() { return session; }
//    public void setSession(InterviewSession session) { this.session = session; }
//
//    public int getQuestionNumber() { return questionNumber; }
//    public void setQuestionNumber(int questionNumber) { this.questionNumber = questionNumber; }
//
//    public String getQuestionText() { return questionText; }
//    public void setQuestionText(String questionText) { this.questionText = questionText; }
//
//    public String getQuestionDifficulty() { return questionDifficulty; }
//    public void setQuestionDifficulty(String questionDifficulty) { this.questionDifficulty = questionDifficulty; }
//
//    public String getUserAnswer() { return userAnswer; }
//    public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }
//
//    public String getSubmitted() { return submitted; }
//    public void setSubmitted(String submitted) { this.submitted = submitted; }
//
//    public LocalDateTime getCreatedAt() { return createdAt; }
//    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
//
//    public Object getTopicArea() {
//
//    }
//
//    public Object getDifficulty() {
//    }
//}

package com.interviewai.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_questions")
@Data
public class SessionQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(name = "question_number", nullable = false)
    private int questionNumber;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(name = "topic_area")
    private String topicArea;

    @Column(name = "question_difficulty")
    private String questionDifficulty;

    @Column(columnDefinition = "TEXT")
    private String userAnswer;

    private String submitted;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

}

