package com.dsarecall.dto;

import com.dsarecall.model.Difficulty;
import com.dsarecall.model.VerificationStatus;
import java.time.LocalDate;

public record QuestionResponse(
        Long id,
        String title,
        String topic,
        Difficulty difficulty,
        String problemUrl,
        String approach,
        String stuckPoint,
        String pseudocode,
        String codeLanguage,
        VerificationStatus verificationStatus,
        String finalCode,
        String timeComplexity,
        String spaceComplexity,
        String notes,
        LocalDate dateSolved,
        LocalDate nextReviewDate,
        int reviewCount,
        int intervalDays,
        boolean isActive
) {
}