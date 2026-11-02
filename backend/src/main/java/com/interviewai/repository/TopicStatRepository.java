package com.interviewai.repository;

import com.interviewai.entity.TopicStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TopicStatRepository extends JpaRepository<TopicStat, Long> {
    List<TopicStat> findByUserId(Long userId);
    Optional<TopicStat> findByUserIdAndTopic(Long userId, String topic);
}
