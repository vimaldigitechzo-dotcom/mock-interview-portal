package com.interviewai.repository;

import com.interviewai.entity.QuestionEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionEvaluationRepository extends JpaRepository<QuestionEvaluation, Long> {
    List<QuestionEvaluation> findBySessionId(Long sessionId);
    Optional<QuestionEvaluation> findByQuestionId(Long questionId);
    List<QuestionEvaluation> findBySessionIdAndQuestionId(Long sessionId, Long questionId);
}
