package com.pjsofttech.library.controller;

import com.pjsofttech.library.dto.request.AuthenticationRequestDto;
import com.pjsofttech.library.dto.request.RegisterUserRequestDto;
import com.pjsofttech.library.service.UserService;
import com.pjsofttech.library.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pjsofttech/library")
public class WelcomeController {
    @Autowired
    private UserService userService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private AuthenticationManager authenticationManager;

    @GetMapping("/health")
    public ResponseEntity<?> health(){
        return ResponseEntity.ok("Healthy");
    }
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterUserRequestDto registerUserRequestDto){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.register(registerUserRequestDto));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthenticationRequestDto authenticationRequestDto){
        authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(authenticationRequestDto.getEmail(), authenticationRequestDto.getPassword()));
        return ResponseEntity.status(HttpStatus.OK)
                .body(jwtUtil.generateToken(authenticationRequestDto.getEmail()));
    }

}
