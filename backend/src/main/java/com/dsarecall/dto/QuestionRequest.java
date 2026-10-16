package com.dsarecall.dto;

import com.dsarecall.model.Difficulty;
import com.dsarecall.model.VerificationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuestionRequest(
        @NotBlank
        @Size(max = 250)
        String title,

        @NotBlank
        @Size(max = 100)
        String topic,

        @NotNull
        Difficulty difficulty,

        @Size(max = 1000)
        String problemUrl,

        String approach,
        String stuckPoint,
        String pseudocode,

        @Size(max = 50)
        String codeLanguage,

        VerificationStatus verificationStatus,
        String finalCode,

        @Size(max = 100)
        String timeComplexity,

        @Size(max = 100)
        String spaceComplexity,

        String notes
) {
}