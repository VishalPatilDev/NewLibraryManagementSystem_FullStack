package com.pjsofttech.library.model;

public enum ReservationStatus {
    PENDING,       // Waiting for a copy to become available
    READY,         // Copy available, member notified
    FULFILLED,     // Member borrowed the reserved book
    CANCELLED,     // Cancelled by member or system
    EXPIRED        // Member did not pick up in time
}