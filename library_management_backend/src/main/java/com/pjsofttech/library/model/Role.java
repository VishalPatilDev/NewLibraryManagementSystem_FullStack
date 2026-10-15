package com.pjsofttech.library.model;
import lombok.Getter;
import java.util.Set;

@Getter
public enum Role {
//    ADMIN(Set.of(Permissions.READ,Permissions.WRITE,Permissions.DELETE)),
//    LIBRARIAN(Set.of(Permissions.READ,Permissions.WRITE)),
//    MEMBER(Set.of(Permissions.READ));
ADMIN(Set.of(

        // Users
        Permissions.USER_CREATE,
        Permissions.USER_READ,
        Permissions.USER_UPDATE,
        Permissions.USER_DELETE,
        Permissions.USER_MANAGE_ROLE,
        Permissions.USER_MANAGE_STATUS,

        // Books
        Permissions.BOOK_READ,
        Permissions.BOOK_CREATE,
        Permissions.BOOK_UPDATE,
        Permissions.BOOK_DELETE,

        // Categories
        Permissions.CATEGORY_READ,
        Permissions.CATEGORY_CREATE,
        Permissions.CATEGORY_UPDATE,
        Permissions.CATEGORY_DELETE,

        // Authors
        Permissions.AUTHOR_READ,
        Permissions.AUTHOR_CREATE,
        Permissions.AUTHOR_UPDATE,
        Permissions.AUTHOR_DELETE,

        // Loans
        Permissions.LOAN_READ,
        Permissions.LOAN_CREATE,
        Permissions.LOAN_RETURN,
        Permissions.LOAN_RENEW,
        Permissions.LOAN_MANAGE,

        // Reservations
        Permissions.RESERVATION_READ,
        Permissions.RESERVATION_CREATE,
        Permissions.RESERVATION_CANCEL,
        Permissions.RESERVATION_MANAGE,

        // Fines
        Permissions.FINE_READ,
        Permissions.FINE_CREATE,
        Permissions.FINE_UPDATE,
        Permissions.FINE_WAIVE,
        Permissions.FINE_PAY,

        // Reports
        Permissions.REPORT_VIEW,

        // System
        Permissions.SYSTEM_SETTINGS,
        Permissions.AUDIT_LOG_READ,

        //AcademicYear
        Permissions.ACADEMIC_YEAR_CREATE,
        Permissions.ACADEMIC_YEAR_READ,
        Permissions.ACADEMIC_YEAR_UPDATE,


        //Rack
        Permissions.RACK_CREATE,
        Permissions.RACK_DELETE,
        Permissions.RACK_READ,
        Permissions.RACK_UPDATE
)),
    LIBRARIAN(Set.of(

            // Users
            Permissions.USER_READ,
            Permissions.USER_CREATE,
            Permissions.USER_UPDATE,
            Permissions.USER_MANAGE_STATUS,

            // Books
            Permissions.BOOK_READ,
            Permissions.BOOK_CREATE,
            Permissions.BOOK_UPDATE,

            // Categories
            Permissions.CATEGORY_READ,
            Permissions.CATEGORY_CREATE,
            Permissions.CATEGORY_UPDATE,

            // Authors
            Permissions.AUTHOR_READ,
            Permissions.AUTHOR_CREATE,
            Permissions.AUTHOR_UPDATE,

            // Loans
            Permissions.LOAN_READ,
            Permissions.LOAN_CREATE,
            Permissions.LOAN_RETURN,
            Permissions.LOAN_RENEW,
            Permissions.LOAN_MANAGE,

            // Reservations
            Permissions.RESERVATION_READ,
            Permissions.RESERVATION_MANAGE,

            // Fines
            Permissions.FINE_READ,
            Permissions.FINE_CREATE,
            Permissions.FINE_UPDATE,
            Permissions.FINE_WAIVE,

            // Reports
            Permissions.REPORT_VIEW,

            //AcademicYear
            Permissions.ACADEMIC_YEAR_CREATE,
            Permissions.ACADEMIC_YEAR_READ,
            Permissions.ACADEMIC_YEAR_UPDATE,


            //Rack
            Permissions.RACK_CREATE,
            Permissions.RACK_READ,
            Permissions.RACK_UPDATE
    )),


    MEMBER(Set.of(

            // Books / catalog
            Permissions.BOOK_READ,
            Permissions.CATEGORY_READ,
            Permissions.AUTHOR_READ,

            // Own loans
            Permissions.LOAN_READ,
            Permissions.LOAN_CREATE,
            Permissions.LOAN_RENEW,

            // Own reservations
            Permissions.RESERVATION_READ,
            Permissions.RESERVATION_CREATE,
            Permissions.RESERVATION_CANCEL,

            // Own fines
            Permissions.FINE_READ,
            Permissions.FINE_PAY,

            //AcademicYear
            Permissions.ACADEMIC_YEAR_READ,
            //Rack
            Permissions.RACK_READ
    ));

    private final Set<Permissions> permissions;

    Role(Set<Permissions> permissions){
        this.permissions = permissions;
    }
}
