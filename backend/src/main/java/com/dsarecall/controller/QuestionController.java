
package com.dsarecall.controller;

import com.dsarecall.dto.QuestionCodeRequest;
import com.dsarecall.dto.QuestionDetailsRequest;
import com.dsarecall.dto.QuestionNotesRequest;
import com.dsarecall.dto.QuestionRequest;
import com.dsarecall.dto.QuestionResponse;
import com.dsarecall.service.QuestionService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping
    public ResponseEntity<QuestionResponse> create(
            @Valid @RequestBody QuestionRequest request,
            Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(questionService.create(principal.getName(), request));
    }

    @GetMapping
    public List<QuestionResponse> getAll(Principal principal) {
        return questionService.getAll(principal.getName());
    }

    @GetMapping("/due")
    public List<QuestionResponse> getDue(Principal principal) {
        return questionService.getDueForReview(principal.getName());
    }

    @GetMapping("/{id}")
    public QuestionResponse getById(
            @PathVariable Long id, Principal principal) {
        return questionService.getById(principal.getName(), id);
    }

    @PutMapping("/{id}")
    public QuestionResponse update(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request,
            Principal principal) {
        return questionService.update(principal.getName(), id, request);
    }

    @PatchMapping("/{id}/details")
    public QuestionResponse updateDetails(
            @PathVariable Long id,
            @Valid @RequestBody QuestionDetailsRequest request,
            Principal principal) {
        return questionService.updateDetails(
                principal.getName(), id, request);
    }

    @PatchMapping("/{id}/notes")
    public QuestionResponse updateNotes(
            @PathVariable Long id,
            @RequestBody QuestionNotesRequest request,
            Principal principal) {
        return questionService.updateNotes(
                principal.getName(), id, request);
    }

    @PatchMapping("/{id}/code")
    public QuestionResponse updateCode(
            @PathVariable Long id,
            @Valid @RequestBody QuestionCodeRequest request,
            Principal principal) {
        return questionService.updateCode(
                principal.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id, Principal principal) {
        questionService.delete(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(
            EntityNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(exception.getMessage());
    }
}
