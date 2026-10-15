package com.pjsofttech.library.service;

import com.pjsofttech.library.dto.request.*;
import com.pjsofttech.library.dto.response.AdminMemberRegistrationResponse;
import com.pjsofttech.library.dto.response.MemberResponse;
import com.pjsofttech.library.model.*;
import com.pjsofttech.library.repository.AcademicYearRepository;
import com.pjsofttech.library.repository.MemberRepository;
import com.pjsofttech.library.repository.UserRepository;
import com.pjsofttech.library.dto.response.RegisterUserResponseDto;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private AcademicYearRepository academicYearRepository;


    //Helper Methods

    private User findUserById(Long id){
        return userRepository.findById(id).orElseThrow(()->new RuntimeException("User Not Found"));
    }
    private  User userReqDto_to_User(RegisterUserRequestDto registerUserRequestDto){
        return User.builder()
                .name(registerUserRequestDto.getName())
                .email(registerUserRequestDto.getEmail())
                .password(passwordEncoder.encode(registerUserRequestDto.getPassword()))
                .role(Role.MEMBER)
                .dateOfBirth(registerUserRequestDto.getDateOfBirth())
                .active(true)
                .build();
    }
    private RegisterUserResponseDto user_to_userResponseDto(User user){
        return RegisterUserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .dateOfBirth(user.getDateOfBirth())
                .role(user.getRole())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .permissions(user.getRole().getPermissions())
                .build();
    }
    private static List<RegisterUserResponseDto> listOfUsersToListOfResponseUsers(List<User> users){
        return users.stream()
                .map(user->RegisterUserResponseDto.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .dateOfBirth(user.getDateOfBirth())
                        .role(user.getRole())
                        .active(user.isActive())
                        .createdAt(user.getCreatedAt())
                        .build()
                ).toList();
    }
    private String generateMembershipNumber() {
        String number;

        do {
            number = "MEM-" + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();
        } while (memberRepository.existsByMembershipNumber(number));

        return number;
    }



    //Actual Methods
    @Transactional
    public RegisterUserResponseDto register(RegisterUserRequestDto registerUserRequestDto) {
        if (userRepository.existsByEmail(registerUserRequestDto.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = userReqDto_to_User(registerUserRequestDto);
        userRepository.save(user);

        Member member = Member.builder()
                .phone(registerUserRequestDto.getPhone())
                .address(registerUserRequestDto.getAddress())
                .user(user)
                .membershipNumber(generateMembershipNumber())
                .membershipDate(LocalDate.now())
                .membershipExpiryDate(LocalDate.now().plusYears(1))
                .status(MemberStatus.ACTIVE)
                .build();
        memberRepository.save(member);
        return user_to_userResponseDto(user);
    }


    public List<RegisterUserResponseDto> fetchUsers() {
        return listOfUsersToListOfResponseUsers(userRepository.findAll());
    }

    public RegisterUserResponseDto fetchUserById(Long id) {
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("User Not Found"));
        return user_to_userResponseDto(user);
    }

    public RegisterUserResponseDto updateUserById(Long id, UpdateUserRequestDto updateUserRequestDto) {
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("User Not Found"));
        // Check if email is being changed
        if (!user.getEmail().equals(updateUserRequestDto.getEmail())
                && userRepository.existsByEmail(updateUserRequestDto.getEmail())) {
            throw new RuntimeException(
                    "Email already registered"
            );
        }
        user.setName(updateUserRequestDto.getName());
        user.setEmail(updateUserRequestDto.getEmail());
        user.setDateOfBirth(updateUserRequestDto.getDateOfBirth());
        User updatedUser = userRepository.save(user);
        return user_to_userResponseDto(updatedUser);
    }
    public String deleteUser(Long id){
        userRepository.deleteById(id);
        return "User with ID : "+id+" Successfully Deleted !";
    }

    public String changePassword(Long id, @Valid ChangePasswordRequestDto changePasswordRequestDto) {
        User user = userRepository.findById(id).orElseThrow(()->new RuntimeException("User Not Found"));
        if(!passwordEncoder.matches(
                changePasswordRequestDto.getCurrentPassword(),
                user.getPassword()
        )){
            throw new RuntimeException("Current password is incorrect");
        }
        // Don't allow same password
        if (passwordEncoder.matches(
                changePasswordRequestDto.getNewPassword(),
                user.getPassword())) {
            throw new RuntimeException(
                    "New password must be different from current password"
            );
        }
        user.setPassword(
                passwordEncoder.encode(changePasswordRequestDto.getNewPassword())
        );

        userRepository.save(user);
        return "Password Changed Successfully";
    }

    public RegisterUserResponseDto updateUserRole(
            Long id,
            AdminRoleUpdateDto dto) {
        User user = findUserById(id);
        user.setRole(dto.getRole());
        User updatedUser = userRepository.save(user);
        return user_to_userResponseDto(updatedUser);
    }

    public RegisterUserResponseDto updateUserStatus(
            Long id,
            UserStatusUpdateDto dto) {
        User user = findUserById(id);
        user.setActive(dto.isActive());
        User updatedUser = userRepository.save(user);
        return user_to_userResponseDto(updatedUser);
    }
    //*********************
    //Current User Operations
    //**********************
    //Get Current User
    public RegisterUserResponseDto getCurrentUser(
            String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User Not Found"));
        return user_to_userResponseDto(user);
    }

    //Update Current User
    public RegisterUserResponseDto updateCurrentUser(User loggedInUser, UpdateUserRequestDto updateUserRequestDto) {
        // Email is being changed
        if (!loggedInUser.getEmail().equals(updateUserRequestDto.getEmail())
                && userRepository.existsByEmail(updateUserRequestDto.getEmail())) {
            throw new RuntimeException(
                    "Email already registered"
            );
        }
        loggedInUser.setName(updateUserRequestDto.getName());
        loggedInUser.setEmail(updateUserRequestDto.getEmail());
        loggedInUser.setDateOfBirth(updateUserRequestDto.getDateOfBirth());
        userRepository.save(loggedInUser);
        return user_to_userResponseDto(loggedInUser);
    }

    //Change Password Of Current User
    public String changePassword(User loggedInUser,ChangePasswordRequestDto changePasswordRequestDto) {
        if(!passwordEncoder.matches(
                changePasswordRequestDto.getCurrentPassword(),
                loggedInUser.getPassword()
        )){
            throw new RuntimeException("Current password is incorrect");
        }
        // Don't allow same password
        if (passwordEncoder.matches(
                changePasswordRequestDto.getNewPassword(),
                loggedInUser.getPassword())) {
            throw new RuntimeException(
                    "New password must be different from current password"
            );
        }
        loggedInUser.setPassword(
                passwordEncoder.encode(changePasswordRequestDto.getNewPassword())
        );

        userRepository.save(loggedInUser);
        return "Password Changed Successfully";
    }

    @Transactional
    public AdminMemberRegistrationResponse registerMember(
            CreateMemberAdminRequest request) {

        // 1. Check duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // 2. Find academic year
        AcademicYear academicYear = academicYearRepository
                .findById(request.getAcademicYearId())
                .orElseThrow(() ->
                        new RuntimeException("Academic year not found"));

        // 3. Generate temporary password
        String temporaryPassword = request.getPassword();

        if (temporaryPassword == null || temporaryPassword.isBlank()) {
            temporaryPassword = "123456";
        }

        // 4. Create User
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(temporaryPassword))
                .role(Role.MEMBER)
                .dateOfBirth(request.getDateOfBirth())
                .active(true)
                .build();

        user = userRepository.save(user);

        // 5. Generate membership number
        String membershipNumber = generateMembershipNumber();

        // 6. Membership expiry
        LocalDate membershipExpiryDate =
                request.getMembershipExpiryDate() != null
                        ? request.getMembershipExpiryDate()
                        : LocalDate.now().plusYears(1);

        // 7. Create Member
        Member member = Member.builder()
                .user(user)
                .membershipNumber(membershipNumber)
                .phone(request.getPhone())
                .address(request.getAddress())
                .academicYear(academicYear)
                .membershipDate(LocalDate.now())
                .membershipExpiryDate(membershipExpiryDate)
                .status(MemberStatus.ACTIVE)
                .build();

        member = memberRepository.save(member);

        // 8. Return temporary password ONCE
        return AdminMemberRegistrationResponse.builder()
                .userId(user.getId())
                .memberId(member.getId())
                .name(user.getName())
                .email(user.getEmail())
                .membershipNumber(member.getMembershipNumber())
                .phone(member.getPhone())
                .address(member.getAddress())
                .academicYearId(academicYear.getId())
                .academicYear(academicYear.getYearLabel())
                .membershipDate(member.getMembershipDate())
                .membershipExpiryDate(member.getMembershipExpiryDate())
                .status(member.getStatus())
                .temporaryPassword(temporaryPassword)
                .build();
    }



    public Page<RegisterUserResponseDto> fetchUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::user_to_userResponseDto);
    }
}
