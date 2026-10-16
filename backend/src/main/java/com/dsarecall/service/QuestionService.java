
package com.dsarecall.service;

import com.dsarecall.dto.QuestionCodeRequest;
import com.dsarecall.dto.QuestionDetailsRequest;
import com.dsarecall.dto.QuestionNotesRequest;
import com.dsarecall.dto.QuestionRequest;
import com.dsarecall.dto.QuestionResponse;
import com.dsarecall.model.AppUser;
import com.dsarecall.model.Question;
import com.dsarecall.model.VerificationStatus;
import com.dsarecall.repository.QuestionRepository;
import com.dsarecall.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public QuestionService(
            QuestionRepository questionRepository,
            UserRepository userRepository) {
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
    }

    private AppUser getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found"));
    }

    public QuestionResponse create(
            String username, QuestionRequest request) {
        AppUser user = getUser(username);

        Question question = new Question();
        question.setUser(user);
        applyRequest(question, request);

        return toResponse(questionRepository.save(question));
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getAll(String username) {
        AppUser user = getUser(username);

        return questionRepository
                .findAllByUser_IdOrderByNextReviewDateAsc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuestionResponse getById(String username, Long id) {
        AppUser user = getUser(username);
        return toResponse(getOwnedQuestion(id, user.getId()));
    }

    public QuestionResponse update(
            String username, Long id, QuestionRequest request) {
        AppUser user = getUser(username);
        Question question = getOwnedQuestion(id, user.getId());

        applyRequest(question, request);

        return toResponse(questionRepository.save(question));
    }

    public QuestionResponse updateDetails(
            String username, Long id, QuestionDetailsRequest request) {
        Question question = getOwnedQuestion(
                id, getUser(username).getId());

        question.setTitle(request.title().trim());
        question.setTopic(request.topic().trim());
        question.setDifficulty(request.difficulty());
        question.setProblemUrl(request.problemUrl());

        if (request.dateSolved() != null) {
            question.setDateSolved(request.dateSolved());
        }

        return toResponse(questionRepository.save(question));
    }

    public QuestionResponse updateNotes(
            String username, Long id, QuestionNotesRequest request) {
        Question question = getOwnedQuestion(
                id, getUser(username).getId());

        question.setApproach(request.approach());
        question.setStuckPoint(request.stuckPoint());
        question.setPseudocode(request.pseudocode());
        question.setNotes(request.notes());

        return toResponse(questionRepository.save(question));
    }

    public QuestionResponse updateCode(
            String username, Long id, QuestionCodeRequest request) {
        Question question = getOwnedQuestion(
                id, getUser(username).getId());

        question.setCodeLanguage(request.codeLanguage());
        question.setVerificationStatus(request.verificationStatus());
        question.setFinalCode(request.finalCode());
        question.setTimeComplexity(request.timeComplexity());
        question.setSpaceComplexity(request.spaceComplexity());

        return toResponse(questionRepository.save(question));
    }

    public void delete(String username, Long id) {
        AppUser user = getUser(username);
        Question question = getOwnedQuestion(id, user.getId());

        question.setIsActive(false);
        questionRepository.save(question);
    }


    @Transactional(readOnly = true)
    public List<QuestionResponse> getDueForReview(String username) {
        AppUser user = getUser(username);

        return questionRepository
                .findAllByUser_IdAndNextReviewDateLessThanEqualOrderByNextReviewDateAsc(
                        user.getId(), LocalDate.now())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Question getOwnedQuestion(Long id, Long userId) {
        return questionRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Question not found"));
    }

    private void applyRequest(
            Question question, QuestionRequest request) {
        question.setTitle(request.title().trim());
        question.setTopic(request.topic().trim());
        question.setDifficulty(request.difficulty());
        question.setProblemUrl(request.problemUrl());
        question.setApproach(request.approach());
        question.setStuckPoint(request.stuckPoint());
        question.setPseudocode(request.pseudocode());
        question.setCodeLanguage(request.codeLanguage());
        question.setVerificationStatus(
                request.verificationStatus() != null
                        ? request.verificationStatus()
                        : VerificationStatus.NOT_TESTED);
        question.setFinalCode(request.finalCode());
        question.setTimeComplexity(request.timeComplexity());
        question.setSpaceComplexity(request.spaceComplexity());
        question.setNotes(request.notes());
    }

    private QuestionResponse toResponse(Question question) {
        return new QuestionResponse(
                question.getId(),
                question.getTitle(),
                question.getTopic(),
                question.getDifficulty(),
                question.getProblemUrl(),
                question.getApproach(),
                question.getStuckPoint(),
                question.getPseudocode(),
                question.getCodeLanguage(),
                question.getVerificationStatus(),
                question.getFinalCode(),
                question.getTimeComplexity(),
                question.getSpaceComplexity(),
                question.getNotes(),
                question.getDateSolved(),
                question.getNextReviewDate(),
                question.getReviewCount(),
                question.getIntervalDays(),
                question.isActive()
        );
    }
}
