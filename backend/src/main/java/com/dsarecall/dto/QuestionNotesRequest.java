package com.dsarecall.dto;

public record QuestionNotesRequest(
        String approach,
        String stuckPoint,
        String pseudocode,
        String notes
) {}