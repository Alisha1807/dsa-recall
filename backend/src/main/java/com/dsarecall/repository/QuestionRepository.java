package com.dsarecall.repository;

import com.dsarecall.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findAllByUser_IdOrderByNextReviewDateAsc(Long userId);

    List<Question> findAllByUser_IdAndNextReviewDateLessThanEqualOrderByNextReviewDateAsc(
            Long userId, LocalDate date);

    Optional<Question> findByIdAndUser_Id(Long id, Long userId);

    long countByUser_Id(Long userId);

    long countByUser_IdAndNextReviewDateLessThanEqual(
            Long userId, LocalDate date);
}
