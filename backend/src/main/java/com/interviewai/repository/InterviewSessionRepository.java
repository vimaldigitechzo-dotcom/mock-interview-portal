package com.interviewai.repository;

import com.interviewai.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {

    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<InterviewSession> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);

    @Query("SELECT s FROM InterviewSession s WHERE s.user.id = :userId AND s.status = 'completed' ORDER BY s.createdAt DESC")
    List<InterviewSession> findRecentCompletedByUserId(@Param("userId") Long userId);

    long countByUserId(Long userId);

    @Query("SELECT AVG(s.overallScore) FROM InterviewSession s WHERE s.user.id = :userId AND s.status = 'completed'")
    Double getAverageScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(s.overallScore) FROM InterviewSession s WHERE s.user.id = :userId AND s.status = 'completed'")
    Double getBestScoreByUserId(@Param("userId") Long userId);
}

//package com.interviewai.repository;
//
//import com.interviewai.entity.InterviewSession;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//import java.util.List;
//
//@Repository
//public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
//    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(Long userId);
//    List<InterviewSession> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
//    long countByUserId(Long userId);
//}


