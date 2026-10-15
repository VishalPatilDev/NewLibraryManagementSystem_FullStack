





package com.pjsofttech.library.config;

import com.pjsofttech.library.model.*;
import com.pjsofttech.library.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final AuthorRepository authorRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final AcademicYearRepository academicYearRepository;
    private final RackRepository rackRepository;
    private final LoanRepository loanRepository;
    private final PasswordEncoder passwordEncoder;
    private final PublisherRepository publisherRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
//        if (userRepository.count() > 0) {
//            log.info("DataSeeder: database already has data — skipping.");
//            return;
//        }

        log.info("========================================================");
        log.info("  Starting Library Test Data Seeder (Two Academic Years) ");
        log.info("========================================================");

        // ── 1. Academic Years ───────────────────────────────────────────────
        AcademicYear year2024 = saveAcademicYear(
                "2024-2025",
                LocalDate.of(2024, 6, 1), LocalDate.of(2025, 5, 31),
                false, 5, 14, "5.00", "Previous academic year 2024-2025");

        AcademicYear year2025 = saveAcademicYear(
                "2025-2026",
                LocalDate.of(2025, 6, 1), LocalDate.of(2026, 5, 31),
                true, 5, 14, "5.00", "Current active academic year 2025-2026");

        // ── 2. Racks ────────────────────────────────────────────────────────
        List<Rack> racks = seedRacks();

        // ── 3. Categories ───────────────────────────────────────────────────
        List<Category> categories = seedCategories();

        // ── 4. Authors ──────────────────────────────────────────────────────
        List<Author> authors = seedAuthors();

        // ── 5. Publishers ───────────────────────────────────────────────────
        List<Publisher> publishers = seedPublishers();

        // ── 6. Staff (Admin + Librarians) ───────────────────────────────────
        User admin = saveUser("System Admin", "admin@library.com", "Admin@123",
                Role.ADMIN, LocalDate.of(1980, 3, 10));

        List<User> librarianUsers = List.of(
                saveUser("Jane Librarian",    "jane@library.com",    "Lib@12345", Role.LIBRARIAN, LocalDate.of(1990, 6, 15)),
                saveUser("Robert Librarian",  "robert@library.com",  "Lib@12345", Role.LIBRARIAN, LocalDate.of(1988, 9, 22)),
                saveUser("Priya Librarian",   "priya.lib@library.com", "Lib@12345", Role.LIBRARIAN, LocalDate.of(1993, 1, 8))
        );

        // ── 7. Books + Copies ───────────────────────────────────────────────
        List<Book> books = seedBooks(categories, authors, publishers, racks);

        // ── 8. Editions ─────────────────────────────────────────────────────
        seedEditions(books, publishers);

        // ── 9. Members — Year 2024-2025 ─────────────────────────────────────
        List<Member> prevMembers = seedPrevYearMembers(year2024);

        // ── 10. Members — Year 2025-2026 ────────────────────────────────────
        List<Member> currMembers = seedCurrYearMembers(year2025);

        // ── 11. Historical Loans + Fines (2024-2025) ────────────────────────
        seedHistoricalLoansAndFines(year2024, prevMembers, books, librarianUsers);

        // ── 12. Current Loans + Fines (2025-2026) ───────────────────────────
        seedCurrentLoansAndFines(year2025, currMembers, books, librarianUsers);

        // ── 13. Reservations ────────────────────────────────────────────────
        seedReservations(currMembers, books);

        // ── 14. Payments ────────────────────────────────────────────────────
        // Payments are created via Razorpay in real flow; seeded indirectly
        // through PAID fine status set in loan seeding above.

        log.info("========================================================");
        log.info("  Seeding Complete — Summary");
        log.info("  Academic Years : {}", academicYearRepository.count());
        log.info("  Racks          : {}", rackRepository.count());
        log.info("  Categories     : {}", categoryRepository.count());
        log.info("  Authors        : {}", authorRepository.count());
        log.info("  Publishers     : {}", publisherRepository.count());
        log.info("  Books          : {}", bookRepository.count());
        log.info("  Book Copies    : {}", bookCopyRepository.count());
        log.info("  Users          : {}", userRepository.count());
        log.info("  Members        : {}", memberRepository.count());
        log.info("  Loans          : {}", loanRepository.count());
        log.info("========================================================");
        log.info("  ADMIN      → admin@library.com     / Admin@123");
        log.info("  LIBRARIAN  → jane@library.com      / Lib@12345");
        log.info("  MEMBER (prev year) → aarav.2024@library.com / Member@123");
        log.info("  MEMBER (curr year) → rahul.2025@library.com / Member@123");
        log.info("========================================================");
    }

    // =========================================================================
    // 1. Academic Year
    // =========================================================================

    private AcademicYear saveAcademicYear(String label, LocalDate start, LocalDate end,
                                          boolean active, int maxBorrow, int loanDays,
                                          String finePerDay, String description) {
        return academicYearRepository.save(AcademicYear.builder()
                .yearLabel(label)
                .startDate(start).endDate(end)
                .isActive(active)
                .maxBorrowLimit(maxBorrow)
                .loanDurationDays(loanDays)
                .finePerDay(new BigDecimal(finePerDay))
                .description(description)
                .build());
    }

    // =========================================================================
    // 2. Racks (10 racks)
    // =========================================================================

    private List<Rack> seedRacks() {
        String[][] data = {
                {"A1", "Programming & CS",      "Ground Floor - East Wing",  "1", "80"},
                {"A2", "Information Technology", "Ground Floor - East Wing",  "2", "70"},
                {"B1", "Science & Physics",      "Ground Floor - West Wing",  "1", "70"},
                {"B2", "Mathematics",            "Ground Floor - West Wing",  "2", "60"},
                {"C1", "Literature",             "First Floor - North Wing",  "1", "90"},
                {"C2", "Fiction & Novels",       "First Floor - North Wing",  "2", "100"},
                {"D1", "History & Geography",    "First Floor - South Wing",  "1", "80"},
                {"D2", "Competitive Exams",      "First Floor - South Wing",  "2", "80"},
                {"E1", "Self Help",              "Second Floor",              "1", "60"},
                {"E2", "Reference & General",    "Second Floor",              "2", "60"},
        };
        List<Rack> result = new ArrayList<>();
        for (String[] r : data) {
            result.add(rackRepository.save(Rack.builder()
                    .rackCode(r[0]).label(r[1]).section(r[2])
                    .rowNumber(Integer.parseInt(r[3]))
                    .totalCapacity(Integer.parseInt(r[4]))
                    .description(r[1] + " collection")
                    .build()));
        }
        return result;
    }

    // =========================================================================
    // 3. Categories (10)
    // =========================================================================

    private List<Category> seedCategories() {
        String[][] data = {
                {"Programming",       "Software development and programming books"},
                {"Computer Science",  "Algorithms, data structures and CS theory"},
                {"Mathematics",       "Mathematics and numerical sciences"},
                {"Physics",           "Physics and physical sciences"},
                {"Chemistry",         "Chemistry and laboratory science"},
                {"Biology",           "Biology and life sciences"},
                {"History",           "World and Indian history"},
                {"Literature",        "Classic and modern literary works"},
                {"Fiction",           "Novels and fictional works"},
                {"Competitive Exams", "Preparation for competitive examinations"},
        };
        List<Category> result = new ArrayList<>();
        for (String[] c : data) {
            result.add(categoryRepository.save(Category.builder()
                    .name(c[0]).description(c[1]).build()));
        }
        return result;
    }

    // =========================================================================
    // 4. Authors (10)
    // =========================================================================

    private List<Author> seedAuthors() {
        String[][] data = {
                {"Robert C. Martin",    "Author of Clean Code and Agile principles.", "American"},
                {"Martin Fowler",       "Software engineer known for Refactoring.",   "British"},
                {"Joshua Bloch",        "Java designer, author of Effective Java.",   "American"},
                {"Herbert Schildt",     "Prolific technology and Java author.",        "American"},
                {"Thomas H. Cormen",    "Co-author of Introduction to Algorithms.",   "American"},
                {"Stephen Hawking",     "Theoretical physicist and cosmologist.",      "British"},
                {"Carl Sagan",          "Astronomer and science communicator.",        "American"},
                {"George Orwell",       "English novelist and essayist.",              "British"},
                {"R. K. Narayan",       "Indian novelist, creator of Malgudi.",        "Indian"},
                {"Ramesh Singh",        "Author of competitive exam guides.",          "Indian"},
        };
        List<Author> result = new ArrayList<>();
        for (String[] a : data) {
            result.add(authorRepository.save(Author.builder()
                    .name(a[0]).biography(a[1]).nationality(a[2]).build()));
        }
        return result;
    }

    // =========================================================================
    // 5. Publishers (10)
    // =========================================================================

    private List<Publisher> seedPublishers() {
        String[][] data = {
                {"Pearson",                  "India",  "Delhi"},
                {"O'Reilly Media",           "USA",    "California"},
                {"Addison-Wesley",           "USA",    "Boston"},
                {"McGraw Hill",              "USA",    "New York"},
                {"Oxford University Press",  "UK",     "Oxford"},
                {"Cambridge University Press","UK",    "Cambridge"},
                {"Tata McGraw Hill",         "India",  "Delhi"},
                {"S. Chand Publishing",      "India",  "Delhi"},
                {"Bloomsbury",               "UK",     "London"},
                {"Penguin Random House",     "India",  "Mumbai"},
        };
        List<Publisher> result = new ArrayList<>();
        int i = 1;
        for (String[] p : data) {
            result.add(publisherRepository.save(Publisher.builder()
                    .name(p[0]).country(p[1]).address(p[2])
                    .phone("9000000" + String.format("%03d", i))
                    .email("info" + i + "@pub.com")
                    .website("www.pub" + i + ".com")
                    .build()));
            i++;
        }
        return result;
    }

    // =========================================================================
    // 6. Users (Staff)
    // =========================================================================

    private User saveUser(String name, String email, String password,
                          Role role, LocalDate dob) {
        return userRepository.save(User.builder()
                .name(name).email(email)
                .password(passwordEncoder.encode(password))
                .role(role).dateOfBirth(dob).active(true).build());
    }

    // =========================================================================
    // 7. Books (12 books, each with 4-6 copies)
    // =========================================================================

    private List<Book> seedBooks(List<Category> cats, List<Author> auths,
                                 List<Publisher> pubs, List<Rack> racks) {
        // title, isbn, year, catIdx, authIdx, pubIdx, rackIdx, copies
        Object[][] data = {
                {"Clean Code",                      "9780132350884", 2008, 0, 0, 0, 0, 5},
                {"Effective Java",                  "9780134685991", 2018, 0, 2, 2, 0, 5},
                {"Refactoring",                     "9780201485677", 1999, 0, 1, 2, 0, 4},
                {"Introduction to Algorithms",      "9780262046305", 2022, 1, 4, 0, 1, 5},
                {"Head First Java",                 "9780596009205", 2005, 0, 3, 1, 0, 6},
                {"A Brief History of Time",         "9780553380163", 1988, 3, 5, 4, 2, 4},
                {"Cosmos",                          "9780345539434", 1980, 3, 6, 9, 2, 4},
                {"1984",                            "9780451524935", 1949, 8, 7, 9, 5, 6},
                {"Animal Farm",                     "9780451526342", 1945, 8, 7, 9, 5, 5},
                {"Swami and Friends",               "9788185986174", 1935, 7, 8, 9, 4, 4},
                {"Indian Economy",                  "9789352603640", 2024, 9, 9, 7, 7, 8},
                {"General Knowledge 2025",          "9789355011111", 2024, 9, 9, 6, 7, 8},
        };

        List<Book> result = new ArrayList<>();
        for (Object[] row : data) {
            Book book = bookRepository.save(Book.builder()
                    .title((String) row[0])
                    .isbn((String) row[1])
                    .description("Test book: " + row[0])
                    .publicationYear((Integer) row[2])
                    .language("English")
                    .category(cats.get((Integer) row[3]))
                    .authors(Set.of(auths.get((Integer) row[4])))
                    .publisher(pubs.get((Integer) row[5]))
                    .totalCopies(0).availableCopies(0)
                    .build());

            int copyCount = (Integer) row[7];
            Rack rack = racks.get((Integer) row[6]);
            addCopies(book, rack, copyCount);
            result.add(bookRepository.findById(book.getId()).orElseThrow());
        }
        return result;
    }

    private void addCopies(Book book, Rack rack, int count) {
        String prefix = book.getTitle().replaceAll("[^A-Za-z]", "").toUpperCase();
        prefix = prefix.length() > 4 ? prefix.substring(0, 4) : prefix;
        for (int i = 1; i <= count; i++) {
            bookCopyRepository.save(BookCopy.builder()
                    .book(book)
                    .barcode(prefix + "-" + String.format("%03d", i) + "-"
                            + UUID.randomUUID().toString().substring(0, 5).toUpperCase())
                    .status(CopyStatus.AVAILABLE)
                    .shelfLocation(rack.getRackCode() + "-" + String.format("%02d", i))
                    .purchaseDate(LocalDate.now().minusMonths(6L + i))
                    .rack(rack)
                    .build());
        }
        book.setTotalCopies(count);
        book.setAvailableCopies(count);
        bookRepository.save(book);
    }

    // =========================================================================
    // 8. Editions (at least 2 per book → 24 editions)
    // =========================================================================

    private void seedEditions(List<Book> books, List<Publisher> publishers) {
        int isbnSeed = 800000001;
        for (int i = 0; i < books.size(); i++) {
            Book book = books.get(i);
            int pubYear = book.getPublicationYear() != null ? book.getPublicationYear() : 2000;

            // First edition
            entityManager.persist(Edition.builder()
                    .book(book)
                    .editionNumber(1)
                    .editionLabel("1st Edition")
                    .publicationYear(pubYear)
                    .publicationDate(LocalDate.of(pubYear, 1, 15))
                    .price(new BigDecimal(300 + (i * 50)))
                    .isbn(String.valueOf(isbnSeed++))
                    .totalCopies(0).availableCopies(0)
                    .isLatest(false)
                    .publisher(publishers.get(i % publishers.size()))
                    .build());

            // Second (latest) edition
            int pubYear2 = Math.min(pubYear + 3, 2024);
            entityManager.persist(Edition.builder()
                    .book(book)
                    .editionNumber(2)
                    .editionLabel("Revised 2nd Edition")
                    .publicationYear(pubYear2)
                    .publicationDate(LocalDate.of(pubYear2, 6, 1))
                    .price(new BigDecimal(500 + (i * 60)))
                    .isbn(String.valueOf(isbnSeed++))
                    .totalCopies(0).availableCopies(0)
                    .isLatest(true)
                    .publisher(publishers.get((i + 1) % publishers.size()))
                    .build());
        }
        entityManager.flush();
    }

    // =========================================================================
    // 9. Previous Year Members (10, status EXPIRED)
    // =========================================================================

    private List<Member> seedPrevYearMembers(AcademicYear year) {
        String[][] people = {
                {"Aarav Sharma",   "aarav.2024@library.com"},
                {"Ananya Patil",   "ananya.2024@library.com"},
                {"Rohan Deshmukh", "rohan.2024@library.com"},
                {"Sneha Joshi",    "sneha.2024@library.com"},
                {"Vikram Singh",   "vikram.2024@library.com"},
                {"Neha Kulkarni",  "neha.2024@library.com"},
                {"Aditya Pawar",   "aditya.2024@library.com"},
                {"Isha Mehta",     "isha.2024@library.com"},
                {"Karan Shah",     "karan.2024@library.com"},
                {"Meera Nair",     "meera.2024@library.com"},
        };
        List<Member> result = new ArrayList<>();
        int n = 1;
        for (String[] p : people) {
            User user = saveUser(p[0], p[1], "Member@123", Role.MEMBER,
                    LocalDate.of(2000 + (n % 4), 1 + (n % 12), 5 + (n % 20)));
            Member member = memberRepository.save(Member.builder()
                    .user(user)
                    .membershipNumber("LIB-2024-" + String.format("%03d", n))
                    .phone("98" + String.format("%08d", n))
                    .address(n + ", Gandhi Road, Maharashtra")
                    .academicYear(year)
                    .membershipDate(LocalDate.of(2024, 6, 1).plusDays(n))
                    .membershipExpiryDate(year.getEndDate())
                    .status(n <= 8 ? MemberStatus.EXPIRED : MemberStatus.BLOCKED)
                    .build());
            result.add(member);
            n++;
        }
        return result;
    }

    // =========================================================================
    // 10. Current Year Members (12, mostly ACTIVE)
    // =========================================================================

    private List<Member> seedCurrYearMembers(AcademicYear year) {
        String[][] people = {
                {"Rahul Sharma",   "rahul.2025@library.com"},
                {"Priya Patel",    "priya.2025@library.com"},
                {"Amit Joshi",     "amit.2025@library.com"},
                {"Snehal Pawar",   "snehal.2025@library.com"},
                {"Riya Deshmukh",  "riya.2025@library.com"},
                {"Akash Kulkarni", "akash.2025@library.com"},
                {"Tanvi Shah",     "tanvi.2025@library.com"},
                {"Omkar Patil",    "omkar.2025@library.com"},
                {"Kavya Nair",     "kavya.2025@library.com"},
                {"Yash Verma",     "yash.2025@library.com"},
                {"Sakshi Gupta",   "sakshi.2025@library.com"},
                {"Dev Mehta",      "dev.2025@library.com"},
        };
        List<Member> result = new ArrayList<>();
        int n = 1;
        for (String[] p : people) {
            User user = saveUser(p[0], p[1], "Member@123", Role.MEMBER,
                    LocalDate.of(2001 + (n % 4), 1 + (n % 12), 1 + (n % 25)));
            MemberStatus status = (n == 11 || n == 12) ? MemberStatus.BLOCKED : MemberStatus.ACTIVE;
            Member member = memberRepository.save(Member.builder()
                    .user(user)
                    .membershipNumber("LIB-2025-" + String.format("%03d", n))
                    .phone("91" + String.format("%08d", n))
                    .address(n + ", School Road, Maharashtra")
                    .academicYear(year)
                    .membershipDate(year.getStartDate().plusDays(n * 2L))
                    .membershipExpiryDate(year.getEndDate())
                    .status(status)
                    .build());
            result.add(member);
            n++;
        }
        return result;
    }

    // =========================================================================
    // 11. Historical Loans + Fines (2024-2025)
    //     10 RETURNED loans; some with PAID fines, some clean
    // =========================================================================

    private void seedHistoricalLoansAndFines(AcademicYear year, List<Member> members,
                                             List<Book> books, List<User> librarians) {
        // Scenario matrix: overdueDays=0 means returned on time
        int[][] scenarios = {
                //  memberIdx, bookIdx, overdueDays, fineStatus (0=none,1=PAID,2=WAIVED)
                {0, 0,  0, 0},
                {1, 1,  0, 0},
                {2, 2,  3, 1},   // paid fine
                {3, 3,  0, 0},
                {4, 4,  7, 1},   // paid fine
                {5, 5,  0, 0},
                {6, 6,  5, 2},   // waived fine
                {7, 7,  0, 0},
                {8, 8,  2, 1},   // paid fine
                {9, 9,  0, 0},
        };

        LocalDate baseIssue = LocalDate.of(2024, 7, 1);

        for (int i = 0; i < scenarios.length; i++) {
            int[] s = scenarios[i];
            Member member = members.get(s[0]);
            Book book = books.get(s[1]);
            int overdueDays = s[2];

            BookCopy copy = findAvailableCopy(book);
            if (copy == null) continue;

            LocalDate issueDate = baseIssue.plusDays(i * 10L);
            LocalDate dueDate = issueDate.plusDays(year.getLoanDurationDays());
            LocalDate returnDate = overdueDays > 0
                    ? dueDate.plusDays(overdueDays)
                    : dueDate.minusDays(2);

            copy.setStatus(CopyStatus.AVAILABLE);
            bookCopyRepository.save(copy);

            Loan loan = loanRepository.save(Loan.builder()
                    .member(member).bookCopy(copy).academicYear(year)
                    .issueDate(issueDate).dueDate(dueDate).returnDate(returnDate)
                    .status(LoanStatus.RETURNED)
                    .renewedCount(i % 2)
                    .issuedBy(librarians.get(i % librarians.size()).getEmail())
                    .build());

            if (overdueDays > 0) {
                BigDecimal finePerDay = year.getFinePerDay();
                BigDecimal total = finePerDay.multiply(BigDecimal.valueOf(overdueDays));
                FineStatus fineStatus = s[3] == 1 ? FineStatus.PAID : FineStatus.WAIVED;

                Fine.FineBuilder fb = Fine.builder()
                        .loan(loan).overdueDays(overdueDays)
                        .finePerDay(finePerDay).totalAmount(total)
                        .status(fineStatus);

                if (fineStatus == FineStatus.PAID) {
                    fb.paidAt(returnDate.atTime(10, 0));
                } else {
                    fb.waivedBy("jane@library.com")
                            .waiveReason("End-of-year courtesy waiver");
                }
                entityManager.persist(fb.build());
            }
        }
        entityManager.flush();
    }

    // =========================================================================
    // 12. Current Loans + Fines (2025-2026)
    //     Mix of ACTIVE, OVERDUE, LOST; pending/waived fines
    // =========================================================================

    private void seedCurrentLoansAndFines(AcademicYear year, List<Member> members,
                                          List<Book> books, List<User> librarians) {
        // [memberIdx, bookIdx, loanStatusCode, overdueDays, fineStatusCode]
        // loanStatusCode: 0=ACTIVE, 1=OVERDUE, 2=LOST
        // fineStatusCode: 0=none, 1=PENDING, 2=WAIVED
        int[][] scenarios = {
                {0,  0,  0,  0, 0},   // active, no fine
                {1,  1,  0,  0, 0},   // active, no fine
                {2,  2,  0,  0, 0},   // active, no fine
                {3,  3,  1,  8, 1},   // overdue, pending fine
                {4,  4,  1,  5, 1},   // overdue, pending fine
                {5,  5,  1, 12, 2},   // overdue, waived fine
                {6,  6,  1,  3, 1},   // overdue, pending fine
                {7,  7,  2, 20, 1},   // lost, pending fine
                {8,  8,  2, 25, 2},   // lost, waived fine
                {9,  9,  0,  0, 0},   // active, no fine
                {0, 10,  1,  6, 1},   // member 0 second loan overdue
                {1, 11,  0,  0, 0},   // member 1 second loan active
        };

        LocalDate baseIssue = LocalDate.of(2025, 7, 1);
        // "Today" for this seeder context is always in the 2025-26 year
        LocalDate today = LocalDate.of(2026, 4, 15);

        for (int i = 0; i < scenarios.length; i++) {
            int[] s = scenarios[i];
            Member member = members.get(s[0]);
            if (member.getStatus() != MemberStatus.ACTIVE) continue;

            Book book = books.get(s[1]);
            int loanCode = s[2];
            int overdueDays = s[3];
            int fineCode = s[4];

            BookCopy copy = findAvailableCopy(book);
            if (copy == null) continue;

            LoanStatus loanStatus = loanCode == 0 ? LoanStatus.ACTIVE
                    : loanCode == 1 ? LoanStatus.OVERDUE
                      : LoanStatus.LOST;

            LocalDate issueDate = baseIssue.plusDays(i * 8L);
            LocalDate dueDate = issueDate.plusDays(year.getLoanDurationDays());

            CopyStatus copyStatus = loanStatus == LoanStatus.LOST ? CopyStatus.LOST : CopyStatus.ISSUED;
            copy.setStatus(copyStatus);
            bookCopyRepository.save(copy);

            Loan loan = loanRepository.save(Loan.builder()
                    .member(member).bookCopy(copy).academicYear(year)
                    .issueDate(issueDate).dueDate(dueDate)
                    .status(loanStatus)
                    .renewedCount(i % 3)
                    .issuedBy(librarians.get(i % librarians.size()).getEmail())
                    .build());

            book.setAvailableCopies(Math.max(0, book.getAvailableCopies() - 1));
            bookRepository.save(book);

            if (overdueDays > 0 && fineCode != 0) {
                BigDecimal finePerDay = year.getFinePerDay();
                BigDecimal total = finePerDay.multiply(BigDecimal.valueOf(overdueDays));
                FineStatus fineStatus = fineCode == 1 ? FineStatus.PENDING : FineStatus.WAIVED;

                Fine.FineBuilder fb = Fine.builder()
                        .loan(loan).overdueDays(overdueDays)
                        .finePerDay(finePerDay).totalAmount(total)
                        .status(fineStatus);

                if (fineStatus == FineStatus.WAIVED) {
                    fb.waivedBy("robert@library.com")
                            .waiveReason("Waived on librarian discretion");
                }
                entityManager.persist(fb.build());
            }
        }
        entityManager.flush();
    }

    // =========================================================================
    // 13. Reservations (10 reservations, mixed statuses)
    // =========================================================================

    private void seedReservations(List<Member> members, List<Book> books) {
        // [memberIdx, bookIdx, statusCode, daysAgo]
        // statusCode: 0=PENDING, 1=READY, 2=FULFILLED, 3=CANCELLED, 4=EXPIRED
        int[][] data = {
                {0,  10, 0, 5},
                {1,  11, 0, 3},
                {2,  10, 1, 7},
                {3,  11, 1, 10},
                {4,   9, 2, 20},
                {5,   8, 2, 15},
                {6,   7, 3, 12},
                {7,   6, 3, 8},
                {8,   5, 4, 25},
                {9,   4, 0, 2},
        };

        LocalDate base = LocalDate.of(2025, 8, 1);

        for (int[] row : data) {
            Member member = members.get(row[0]);
            if (member.getStatus() != MemberStatus.ACTIVE) continue;
            Book book = books.get(row[1]);

            ReservationStatus status = switch (row[2]) {
                case 1 -> ReservationStatus.READY;
                case 2 -> ReservationStatus.FULFILLED;
                case 3 -> ReservationStatus.CANCELLED;
                case 4 -> ReservationStatus.EXPIRED;
                default -> ReservationStatus.PENDING;
            };

            LocalDate resDate = base.plusDays(row[3]);

            Reservation res = Reservation.builder()
                    .member(member).book(book)
                    .reservationDate(resDate)
                    .expiryDate(resDate.plusDays(7))
                    .status(status)
                    .build();

            if (status == ReservationStatus.READY) {
                res.setNotifiedAt(resDate.atTime(10, 30));
            }
            entityManager.persist(res);
        }
        entityManager.flush();
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private BookCopy findAvailableCopy(Book book) {
        return bookCopyRepository.findFirstByBookIdAndStatus(book.getId(), CopyStatus.AVAILABLE)
                .orElse(null);
    }
}