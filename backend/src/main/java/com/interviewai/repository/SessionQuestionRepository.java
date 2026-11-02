package com.interviewai.repository;

import com.interviewai.entity.SessionQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SessionQuestionRepository extends JpaRepository<SessionQuestion, Long> {
    List<SessionQuestion> findBySessionIdOrderByQuestionNumber(Long sessionId);
    List<SessionQuestion> findBySessionIdAndSubmitted(Long sessionId, String submitted);
}

//package com.interviewai.repository;
//
//import com.interviewai.entity.SessionQuestion;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//import java.util.List;
//
//@Repository
//public interface SessionQuestionRepository extends JpaRepository<SessionQuestion, Long> {
//    List<SessionQuestion> findBySessionIdOrderByQuestionNumber(Long sessionId);
//}

