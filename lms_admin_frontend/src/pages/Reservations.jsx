import { useEffect, useState } from "react";
import reservationService from "../services/reservationService";

import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog";
import usePermission from "../hooks/usePermission";
import memberService from "../services/memberService";
import bookService from "../services/bookService";


const Reservations = () => {
    const { hasPermission } = usePermission();

    const canRead = hasPermission("RESERVATION_READ");
    const canManage = hasPermission("RESERVATION_MANAGE");
    const canCancel = hasPermission("RESERVATION_CANCEL");
    const canCreate = hasPermission("RESERVATION_CREATE");


    const [reservations, setReservations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState(null);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const [pagination, setPagination] = useState({
        totalElements: 0,
        totalPages: 0,
    });

    const [selectedReservation, setSelectedReservation] =
        useState(null);

    const [modalMode, setModalMode] = useState(null);


    //Reserve 
    const [reserveForm, setReserveForm] = useState({
        memberId: "",
        bookId: "",
    });

    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);

    const [loadingMembers, setLoadingMembers] = useState(false);
    const [loadingBooks, setLoadingBooks] = useState(false);

    //Load Members and Books
    const loadMembers = async () => {
        setLoadingMembers(true);

        try {
            const data = await memberService.getAll({
                page: 0,
                size: 1000,
            });

            const memberList =
                data?.content ??
                data?.data?.content ??
                data?.data ??
                data ??
                [];

            setMembers(Array.isArray(memberList) ? memberList : []);
        } catch (err) {
            console.error("LOAD MEMBERS ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load members."
            );

            setMembers([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    const loadBooks = async () => {
        setLoadingBooks(true);

        try {
            const data = await bookService.getAll({
                page: 0,
                size: 1000,
            });

            const bookList =
                data?.content ??
                data?.data?.content ??
                data?.data ??
                data ??
                [];

            setBooks(Array.isArray(bookList) ? bookList : []);
        } catch (err) {
            console.error("LOAD BOOKS ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load books."
            );

            setBooks([]);
        } finally {
            setLoadingBooks(false);
        }
    };


    const handleReserve = async () => {
        if (!reserveForm.memberId || !reserveForm.bookId) {
            setError("Member ID and Book ID are required.");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            await reservationService.reserve({
                memberId: Number(reserveForm.memberId),
                bookId: Number(reserveForm.bookId),
            });

            setModalMode(null);

            setReserveForm({
                memberId: "",
                bookId: "",
            });

            await loadReservations();
        } catch (err) {
            console.error("RESERVE BOOK ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to reserve book."
            );
        } finally {
            setSaving(false);
        }
    };
    const openReserve = async () => {
        setReserveForm({
            memberId: "",
            bookId: "",
        });

        setSelectedReservation(null);
        setModalMode("reserve");
        setError(null);

        await Promise.all([
            loadMembers(),
            loadBooks(),
        ]);
    };




    const loadReservations = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await reservationService.getAll({
                page,
                size,
            });

            console.log("RESERVATION RESPONSE:", data);

            const reservationList =
                data?.content ??
                data?.data?.content ??
                data?.data ??
                data ??
                [];

            if (Array.isArray(reservationList)) {
                setReservations(reservationList);
            } else {
                console.error(
                    "Reservation response is not an array:",
                    reservationList
                );

                setReservations([]);
            }

            setPagination({
                totalElements: data?.totalElements ?? 0,
                totalPages: data?.totalPages ?? 0,
            });
        } catch (err) {
            console.error("RESERVATION API ERROR:", err);
            console.error("STATUS:", err.response?.status);
            console.error("RESPONSE:", err.response?.data);

            setReservations([]);

            setError(
                err.response?.data?.message ||
                `Failed to load reservations (${err.response?.status || "unknown error"
                }).`
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canRead || canManage) {
            loadReservations();
        }
    }, [page, size, canRead, canManage]);

    const formatDate = (value) => {
        if (!value) return "—";

        try {
            return new Date(value).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch {
            return value;
        }
    };

    const formatDateTime = (value) => {
        if (!value) return "—";

        try {
            return new Date(value).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return value;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-50 text-yellow-700";

            case "READY":
                return "bg-green-50 text-green-700";

            case "FULFILLED":
                return "bg-blue-50 text-blue-700";

            case "CANCELLED":
                return "bg-gray-100 text-gray-600";

            case "EXPIRED":
                return "bg-red-50 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusLabel = (status) => {
        if (!status) return "—";

        return status.replaceAll("_", " ");
    };

    const openDetails = (reservation) => {
        setSelectedReservation(reservation);
        setModalMode("details");
    };

    const openCancel = (reservation) => {
        setSelectedReservation(reservation);
        setModalMode("cancel");
    };

    const closeModal = () => {
        if (saving) return;

        setModalMode(null);
        setSelectedReservation(null);

        setReserveForm({
            memberId: "",
            bookId: "",
        });
    };


    const handleCancel = async () => {
        if (!selectedReservation) return;

        setSaving(true);
        setError(null);

        try {
            await reservationService.cancel(
                selectedReservation.id
            );

            setModalMode(null);
            setSelectedReservation(null);

            await loadReservations();
        } catch (err) {
            console.error("CANCEL RESERVATION ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to cancel reservation."
            );
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            key: "id",
            label: "ID",
            render: (row) => (
                <span className="font-medium text-gray-700">
                    #{row.id}
                </span>
            ),
        },

        {
            key: "member",
            label: "Member",
            render: (row) => (
                <div>
                    <p className="font-medium text-gray-800">
                        {row.memberName ||
                            row.member?.name ||
                            "—"}
                    </p>

                    {(row.membershipNumber ||
                        row.member?.membershipNumber) && (
                            <p className="text-xs text-gray-400">
                                {row.membershipNumber ||
                                    row.member?.membershipNumber}
                            </p>
                        )}
                </div>
            ),
        },

        {
            key: "book",
            label: "Book",
            render: (row) => (
                <div>
                    <p className="max-w-[260px] truncate font-medium text-gray-800">
                        {row.bookTitle ||
                            row.book?.title ||
                            "—"}
                    </p>

                    {(row.isbn || row.book?.isbn) && (
                        <p className="text-xs text-gray-400">
                            ISBN:{" "}
                            {row.isbn || row.book?.isbn}
                        </p>
                    )}
                </div>
            ),
        },

        // {
        //     key: "position",
        //     label: "Queue Position",
        //     render: (row) => (
        //         <span className="font-semibold text-gray-700">
        //             {row.queuePosition ??
        //                 row.position ??
        //                 "—"}
        //         </span>
        //     ),
        // },

        {
            key: "status",
            label: "Status",
            render: (row) => (
                <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                        row.status
                    )}`}
                >
                    {getStatusLabel(row.status)}
                </span>
            ),
        },

        {
            key: "createdAt",
            label: "Reserved",
            render: (row) => (
                <span className="text-sm text-gray-500">
                    {formatDate(row.createdAt)}
                </span>
            ),
        },

        {
            key: "actions",
            label: "Actions",
            render: (row) => {
                const canCancelReservation =
                    canCancel &&
                    row.status !== "CANCELLED" &&
                    row.status !== "FULFILLED" &&
                    row.status !== "EXPIRED";

                return (
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => openDetails(row)}
                            className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                            View
                        </button>

                        {canCancelReservation && (
                            <button
                                onClick={() =>
                                    openCancel(row)
                                }
                                className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    if (!canRead && !canManage) {
        return (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                You do not have permission to view reservations.
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Reservations
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage book reservations
                    </p>
                </div>

                <button
                    onClick={loadReservations}
                    disabled={loading}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                    Refresh
                </button>
                {canCreate && (
                    <button
                        onClick={openReserve}

                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        + Reserve Book
                    </button>
                )}

            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <span>{error}</span>

                    <button
                        onClick={() => setError(null)}
                        className="font-medium text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Summary */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Total Reservations
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-800">
                        {pagination.totalElements}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Current Page
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-800">
                        {pagination.totalPages === 0
                            ? 0
                            : page + 1}
                    </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Page Size
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-800">
                        {size}
                    </p>
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={reservations}
                loading={loading}
                emptyMessage="No reservations found."
            />

            {/* Pagination */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                    Showing page{" "}
                    {pagination.totalPages === 0
                        ? 0
                        : page + 1}{" "}
                    of {pagination.totalPages}
                    {pagination.totalElements > 0 &&
                        ` • ${pagination.totalElements} reservations`}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={size}
                        onChange={(e) => {
                            setSize(Number(e.target.value));
                            setPage(0);
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                    </select>

                    <button
                        disabled={page === 0 || loading}
                        onClick={() =>
                            setPage(
                                (current) => current - 1
                            )
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
                        {pagination.totalPages === 0
                            ? 0
                            : page + 1}
                    </span>

                    <button
                        disabled={
                            pagination.totalPages === 0 ||
                            page >=
                            pagination.totalPages - 1 ||
                            loading
                        }
                        onClick={() =>
                            setPage(
                                (current) => current + 1
                            )
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
            {modalMode === "reserve" && (
                <Modal
                    title="Reserve Book"
                    onClose={closeModal}
                >
                    <div className="space-y-4">
                        <div className="rounded-lg bg-blue-50 p-4">
                            <p className="text-sm font-semibold text-blue-800">
                                Reserve a Book
                            </p>

                            <p className="mt-1 text-xs text-blue-600">
                                Enter the member and book IDs to create a
                                reservation.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Member *
                            </label>

                            <select
                                value={reserveForm.memberId}
                                onChange={(e) =>
                                    setReserveForm((current) => ({
                                        ...current,
                                        memberId: e.target.value,
                                    }))
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                disabled={saving || loadingMembers}
                            >
                                <option value="">
                                    {loadingMembers
                                        ? "Loading members..."
                                        : "Select member"}
                                </option>

                                {members.map((member) => (
                                    <option
                                        key={member.id}
                                        value={member.id}
                                    >
                                        {member.userName || "Unnamed Member"}
                                        {member.membershipNumber
                                            ? ` — ${member.membershipNumber}`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Book *
                            </label>

                            <select
                                value={reserveForm.bookId}
                                onChange={(e) =>
                                    setReserveForm((current) => ({
                                        ...current,
                                        bookId: e.target.value,
                                    }))
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                disabled={saving || loadingBooks}
                            >
                                <option value="">
                                    {loadingBooks
                                        ? "Loading books..."
                                        : "Select book"}
                                </option>

                                {books.map((book) => (
                                    <option
                                        key={book.id}
                                        value={book.id}
                                    >
                                        {book.title || "Untitled Book"}
                                        {book.isbn
                                            ? ` — ISBN: ${book.isbn}`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={closeModal}
                                disabled={saving}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleReserve}
                                disabled={
                                    saving ||
                                    !reserveForm.memberId ||
                                    !reserveForm.bookId
                                }
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? "Reserving..." : "Reserve Book"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}


            {/* Details Modal */}
            {modalMode === "details" &&
                selectedReservation && (
                    <Modal
                        title="Reservation Details"
                        onClose={closeModal}
                    >
                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Reservation ID
                                        </p>

                                        <p className="text-lg font-semibold text-gray-800">
                                            #
                                            {
                                                selectedReservation.id
                                            }
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                            selectedReservation.status
                                        )}`}
                                    >
                                        {getStatusLabel(
                                            selectedReservation.status
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Member
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {selectedReservation.memberName ||
                                            selectedReservation
                                                .member?.name ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Membership Number
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {selectedReservation.membershipNumber ||
                                            selectedReservation
                                                .member
                                                ?.membershipNumber ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Book
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {selectedReservation.bookTitle ||
                                            selectedReservation
                                                .book?.title ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        ISBN
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {selectedReservation.bookIsbn ||
                                            selectedReservation
                                                .book?.isbn ||
                                            "—"}
                                    </p>
                                </div>

                                {/* <div>
                                    <p className="text-xs text-gray-400">
                                        Queue Position
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {selectedReservation.queuePosition ??
                                            selectedReservation.position ??
                                            "—"}
                                    </p>
                                </div> */}

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Status
                                    </p>

                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                            selectedReservation.status
                                        )}`}
                                    >
                                        {getStatusLabel(
                                            selectedReservation.status
                                        )}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Created
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {formatDateTime(
                                            selectedReservation.createdAt
                                        )}
                                    </p>
                                </div>

                                {/* <div>
                                    <p className="text-xs text-gray-400">
                                        Updated
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {formatDateTime(
                                            selectedReservation.updatedAt
                                        )}
                                    </p>
                                </div> */}
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={closeModal}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

            {/* Cancel Confirmation */}
            {modalMode === "cancel" &&
                selectedReservation && (
                    <ConfirmDialog
                        title="Cancel Reservation"
                        message={
                            `Are you sure you want to cancel the reservation for ` +
                            `"${selectedReservation.bookTitle ||
                            selectedReservation.book?.title ||
                            "this book"}"?`
                        }
                        confirmText={
                            saving
                                ? "Cancelling..."
                                : "Cancel Reservation"
                        }
                        cancelText="Keep Reservation"
                        onConfirm={handleCancel}
                        onCancel={closeModal}
                        loading={saving}
                    />
                )}
        </div>
    );
};

export default Reservations;
