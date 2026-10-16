
package com.dsarecall.dto;

public record AuthResponse(
    String token,
    String username,
    String email
) {}
