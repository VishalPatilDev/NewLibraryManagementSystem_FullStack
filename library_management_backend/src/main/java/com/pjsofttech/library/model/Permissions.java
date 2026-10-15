package com.pjsofttech.library.model;

public enum Permissions {
//    READ, WRITE, DELETE
// =========================
// USER MANAGEMENT
// =========================
    USER_CREATE,
    USER_READ,
    USER_UPDATE,
    USER_DELETE,
    USER_MANAGE_ROLE,
    USER_MANAGE_STATUS,

    // =========================
    // BOOK MANAGEMENT
    // =========================
    BOOK_READ,
    BOOK_CREATE,
    BOOK_UPDATE,
    BOOK_DELETE,

    // =========================
    // CATALOG MANAGEMENT
    // =========================
    CATEGORY_READ,
    CATEGORY_CREATE,
    CATEGORY_UPDATE,
    CATEGORY_DELETE,

    AUTHOR_READ,
    AUTHOR_CREATE,
    AUTHOR_UPDATE,
    AUTHOR_DELETE,

    // =========================
    // BORROWING / LOANS
    // =========================
    LOAN_READ,
    LOAN_CREATE,
    LOAN_RETURN,
    LOAN_RENEW,
    LOAN_MANAGE,

    // =========================
    // RESERVATIONS
    // =========================
    RESERVATION_READ,
    RESERVATION_CREATE,
    RESERVATION_CANCEL,
    RESERVATION_MANAGE,

    // =========================
    // FINES
    // =========================
    FINE_READ,
    FINE_CREATE,
    FINE_UPDATE,
    FINE_WAIVE,
    FINE_PAY,

    // =========================
    // REPORTS
    // =========================
    REPORT_VIEW,

    // =========================
    // SYSTEM / ADMINISTRATION
    // =========================
    SYSTEM_SETTINGS,
    AUDIT_LOG_READ,

    //Academic Year
    ACADEMIC_YEAR_CREATE,
    ACADEMIC_YEAR_READ,
    ACADEMIC_YEAR_UPDATE,


    //RACK
    RACK_CREATE,
    RACK_READ,
    RACK_UPDATE,
    RACK_DELETE

}
