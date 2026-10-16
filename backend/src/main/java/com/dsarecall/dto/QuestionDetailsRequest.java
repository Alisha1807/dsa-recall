package com.dsarecall.dto;

import com.dsarecall.model.Difficulty;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record QuestionDetailsRequest(
        @NotBlank String title,
        @NotBlank String topic,
        Difficulty difficulty,
        String problemUrl,
        LocalDate dateSolved
) {}