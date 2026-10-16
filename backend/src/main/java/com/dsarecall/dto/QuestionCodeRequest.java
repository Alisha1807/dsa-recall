package com.dsarecall.dto;

import com.dsarecall.model.VerificationStatus;
import jakarta.validation.constraints.NotNull;

public record QuestionCodeRequest(
        String codeLanguage,
        @NotNull VerificationStatus verificationStatus,
        String finalCode,
        String timeComplexity,
        String spaceComplexity
) {}