package com.pjsofttech.library.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {
//    private final String secrete = "This-is-my-jwt-secrete-key-so-that-jwt-can-understand-it-is-of-32-bit";
@Value("${jwt.secret}")
private String secrete;
    @Value("${jwt.expiration}")
    private Long expiration;
    private final SecretKey key = Keys.hmacShaKeyFor(secrete.getBytes());

    public String generateToken(String username){
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis()+expiration)) //More than 60 hours from the jwt is generated
                .signWith(key)
                .compact();
    }

    private Claims extractClaims(String token){
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token.trim())
                .getPayload();
    }

    public String extractUsername(String token){
        Claims payload = extractClaims(token);
        return payload.getSubject();
    }

    public boolean validateToken(UserDetails userDetails, String username, String token){
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token){
        return extractClaims(token).getExpiration().before(new Date());
    }





}
