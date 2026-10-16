
package com.dsarecall.service;

import com.dsarecall.dto.AuthResponse;
import com.dsarecall.dto.LoginRequest;
import com.dsarecall.dto.RegisterRequest;
import com.dsarecall.model.AppUser;
import com.dsarecall.repository.UserRepository;
import com.dsarecall.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Username is already taken");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Email is already registered");
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));

        AppUser savedUser = userRepository.save(user);

        return new AuthResponse(
                jwtService.generateToken(savedUser),
                savedUser.getUsername(),
                savedUser.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.identifier().trim();

        AppUser user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(
                        identifier.toLowerCase(Locale.ROOT)))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email/username or password"));

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getUsername(), request.password()));

        return new AuthResponse(
                jwtService.generateToken(user),
                user.getUsername(),
                user.getEmail());
    }
}
