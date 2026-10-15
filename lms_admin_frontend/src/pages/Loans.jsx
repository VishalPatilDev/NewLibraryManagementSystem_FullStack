import { useEffect, useState } from "react";
import loanService from "../services/loanService";
import memberService from "../services/memberService";
import bookService from "../services/bookService";

import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog";
import Badge from "../components/comman/Badge";
import usePermission from "../hooks/usePermission";
import fineService from "../services/fineService";

const emptyLoanForm = {
    memberId: "",
    bookId: "",
};

const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

const Loans = () => {
    const { hasPermission } = usePermission();

    const canIssue = hasPermission("LOAN_CREATE");
    const canReturn = hasPermission("LOAN_RETURN");
    const canRenew = hasPermission("LOAN_RENEW");
    const canManage = hasPermission("LOAN_MANAGE");

    const [loans, setLoans] = useState([]);
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [memberSearch, setMemberSearch] = useState("");
    const [bookSearch, setBookSearch] = useState("");

    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const [showBookDropdown, setShowBookDropdown] = useState(false);

    const filteredMembers = members.filter((member) => {
        const search = memberSearch.toLowerCase();

        return (
            member.userName?.toLowerCase().includes(search) ||
            member.membershipNumber?.toLowerCase().includes(search) ||
            member.userEmail?.toLowerCase().includes(search)
        );
    });

    const filteredBooks = books.filter((book) => {
        const search = bookSearch.toLowerCase();

        return (
            book.title?.toLowerCase().includes(search) ||
            book.isbn?.toLowerCase().includes(search)
        );
    });


    const [loading, setLoading] = useState(true);
    const [referenceLoading, setReferenceLoading] = useState(false);

    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);

    const [modalMode, setModalMode] = useState(null);
    const [form, setForm] = useState(emptyLoanForm);

    const [confirmAction, setConfirmAction] = useState(null);

    const [saving, setSaving] = useState(false);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const [filter, setFilter] = useState("ALL");

    const [pagination, setPagination] = useState({
        totalElements: 0,
        totalPages: 0,
    });

    const loadLoans = async () => {
        setLoading(true);
        setError(null);

        try {
            let data;

            if (filter === "OVERDUE") {
                data = await loanService.getOverdue({
                    page,
                    size,
                });
            } else {
                data = await loanService.getAll({
                    page,
                    size,
                    sortBy: "createdAt",
                    direction: "desc",
                });
            }

            console.log("LOAN RESPONSE:", data);

            setLoans(data.content ?? data ?? []);

            setPagination({
                totalElements: data.totalElements ?? 0,
                totalPages: data.totalPages ?? 0,
            });
        } catch (err) {
            console.error("LOAN API ERROR:", err);
            console.error("STATUS:", err.response?.status);
            console.error("RESPONSE:", err.response?.data);

            setError(
                err.response?.data?.message ||
                `Failed to load loans (${err.response?.status || "unknown error"}).`
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLoans();
    }, [page, size, filter]);

    const loadReferenceData = async () => {
        console.log("========== LOAD REFERENCE DATA ==========");

        setReferenceLoading(true);
        setFormError(null);

        try {
            console.log("Calling member API...");

            const memberResponse = await memberService.getAll({
                page: 0,
                size: 1000,
                // sortBy: "userName",
            });

            console.log("RAW MEMBER RESPONSE:", memberResponse);

            console.log("Calling book API...");

            const bookResponse = await bookService.getAll({
                page: 0,
                size: 1000,
                sortBy: "title",
            });

            console.log("RAW BOOK RESPONSE:", bookResponse);

            // Handle Spring Page response
            const memberList =
                memberResponse?.content ??
                memberResponse?.data?.content ??
                memberResponse?.data ??
                memberResponse ??
                [];

            const bookList =
                bookResponse?.content ??
                bookResponse?.data?.content ??
                bookResponse?.data ??
                bookResponse ??
                [];

            console.log("FINAL MEMBER LIST:", memberList);
            console.log("FINAL BOOK LIST:", bookList);

            if (!Array.isArray(memberList)) {
                console.error("Member response is not an array:", memberList);
                setMembers([]);
            } else {
                setMembers(memberList);
            }

            if (!Array.isArray(bookList)) {
                console.error("Book response is not an array:", bookList);
                setBooks([]);
            } else {
                setBooks(bookList);
            }
        } catch (err) {
            console.error("REFERENCE DATA ERROR:", err);
            console.error("STATUS:", err.response?.status);
            console.error("DATA:", err.response?.data);

            setMembers([]);
            setBooks([]);

            setFormError(
                err.response?.data?.message ||
                "Failed to load members or books."
            );
        } finally {
            setReferenceLoading(false);

            console.log("========== REFERENCE DATA COMPLETE ==========");
        }
    };



    // useEffect(() => {
    //     if (canIssue) {
    //         loadReferenceData();
    //     }
    // }, [canIssue]);

    const openIssue = async () => {
        setForm(emptyLoanForm);
        setFormError(null);
        setModalMode("issue");
        // Load members/books when the modal is opened
        await loadReferenceData();
    };

    const handleIssue = async () => {
        setFormError(null);

        if (!form.memberId) {
            setFormError("Please select a member.");
            return;
        }

        if (!form.bookId) {
            setFormError("Please select a book.");
            return;
        }

        setSaving(true);

        const payload = {
            memberId: Number(form.memberId),
            bookId: Number(form.bookId),
        };

        try {
            console.log("ISSUE LOAN PAYLOAD:", payload);

            await loanService.issueBook(payload);

            setModalMode(null);
            setForm(emptyLoanForm);

            await loadLoans();
        } catch (err) {
            console.error("ISSUE LOAN ERROR:", err);
            console.error("STATUS:", err.response?.status);
            console.error("RESPONSE:", err.response?.data);

            setFormError(
                err.response?.data?.message ||
                "Failed to issue book."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleReturn = async () => {
        if (!confirmAction) return;

        setSaving(true);

        try {
            await loanService.returnBook(confirmAction.id);

            setConfirmAction(null);

            await loadLoans();
        } catch (err) {
            console.error("RETURN BOOK ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to return book."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleRenew = async () => {
        if (!confirmAction) return;

        setSaving(true);

        try {
            await loanService.renewLoan(confirmAction.id);

            setConfirmAction(null);

            await loadLoans();
        } catch (err) {
            console.error("RENEW LOAN ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to renew loan."
            );
        } finally {
            setSaving(false);
        }
    };

    const getMemberName = (loan) => {
        if (loan.member?.name) {
            return loan.member.name;
        }

        if (loan.memberName) {
            return loan.memberName;
        }

        if (loan.member?.fullName) {
            return loan.member.fullName;
        }

        return loan.memberId ? `Member #${loan.memberId}` : "—";
    };

    const getBookTitle = (loan) => {
        if (loan.book?.title) {
            return loan.book.title;
        }

        if (loan.bookTitle) {
            return loan.bookTitle;
        }

        return loan.bookId ? `Book #${loan.bookId}` : "—";
    };

    const getStatus = (loan) => {
        if (loan.overdue === true) {
            return "OVERDUE";
        }

        if (loan.status) {
            return loan.status;
        }

        return "—";
    };

    const formatDate = (value) => {
        if (!value) return "—";

        try {
            return new Date(value).toLocaleDateString();
        } catch {
            return value;
        }
    };

    const columns = [
        {
            key: "id",
            label: "ID",
        },
        {
            key: "member",
            label: "Member",
            render: (row) => (
                <div>
                    <p className="font-medium text-gray-800">
                        {getMemberName(row)}
                    </p>

                    {row.memberId && (
                        <p className="text-xs text-gray-400">
                            ID: {row.memberId}
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
                    <p className="font-medium text-gray-800">
                        {getBookTitle(row)}
                    </p>

                    {row.book?.isbn && (
                        <p className="text-xs text-gray-400">
                            ISBN: {row.book.isbn}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: "issueDate",
            label: "Issued",
            render: (row) =>
                formatDate(
                    row.issueDate ||
                    row.issuedAt ||
                    row.loanDate ||
                    row.createdAt
                ),
        },
        {
            key: "dueDate",
            label: "Due Date",
            render: (row) => {
                const overdue =
                    row.overdue === true ||
                    (row.dueDate &&
                        new Date(row.dueDate) < new Date() &&
                        row.status !== "RETURNED");

                return (
                    <span
                        className={
                            overdue
                                ? "font-semibold text-red-600"
                                : "text-gray-600"
                        }
                    >
                        {formatDate(row.dueDate)}
                    </span>
                );
            },
        },
        {
            key: "returnDate",
            label: "Returned",
            render: (row) =>
                formatDate(
                    row.returnDate
                ),
        },
        {
            key: "status",
            label: "Status",
            render: (row) => (
                <Badge value={getStatus(row)} />
            ),
        },
        {
            key: "fine",
            label: "Fine",
            render: (row) => {
                const fine =
                    row.fineAmount ?? 0;

                return (
                    <span
                        className={
                            Number(fine) > 0
                                ? "font-semibold text-red-600"
                                : "text-gray-500"
                        }
                    >
                        ₹{Number(fine).toFixed(2)}
                    </span>
                );
            },
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => {
                const status = getStatus(row);

                const isActive =
                    status === "ACTIVE" ||
                    status === "BORROWED" ||
                    status === "ISSUED" ||
                    status === "OVERDUE";

                const canRenewLoan =
                    isActive &&
                    canRenew;

                const canReturnLoan =
                    isActive &&
                    canReturn;

                return (
                    <div className="flex flex-wrap gap-1.5">
                        {canReturnLoan && (
                            <button
                                onClick={() =>
                                    setConfirmAction({
                                        type: "return",
                                        id: row.id,
                                        title: getBookTitle(row),
                                    })
                                }
                                className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                            >
                                Return
                            </button>
                        )}

                        {canRenewLoan && (
                            <button
                                onClick={() =>
                                    setConfirmAction({
                                        type: "renew",
                                        id: row.id,
                                        title: getBookTitle(row),
                                    })
                                }
                                className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                            >
                                Renew
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="grid-cols-2 flex gap-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Issued
                    </h2>

                    {/* <p className="mt-1 text-sm text-gray-500">
                        Manage book issues, returns, renewals and overdue loans
                    </p> */}
                    <div>
                    <button className="rounded ">Fines</button>
                </div>
                </div>
                

                {canIssue && (
                    <button
                        onClick={openIssue}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        + Issue Book
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <button
                    onClick={() => {
                        setFilter("ALL");
                        setPage(0);
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === "ALL"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    Issued
                </button>

                <button
                    onClick={() => {
                        setFilter("OVERDUE");
                        setPage(0);
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === "OVERDUE"
                        ? "bg-red-600 text-white"
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                >
                    Overdue
                </button>

                <button
                    onClick={loadLoans}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                    Refresh
                </button>
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

            {/* Table */}
            <Table
                columns={columns}
                data={loans}
                loading={loading}
                emptyMessage={
                    filter === "OVERDUE"
                        ? "No overdue loans."
                        : "No loans found."
                }
            />

            {/* Issue Book Modal */}
            {modalMode === "issue" && (
                <Modal
                    title="Issue Book"
                    onClose={() => setModalMode(null)}
                >
                    <div className="space-y-4">
                        {formError && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {formError}
                            </div>
                        )}

                        {referenceLoading ? (
                            <p className="py-6 text-center text-sm text-gray-400">
                                Loading members and books…
                            </p>
                        ) : (
                            <>
                                {/* Member */}
                                <div className="relative">
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Member *
                                    </label>

                                    <input
                                        type="text"
                                        className={inputCls}
                                        placeholder="Search member..."
                                        value={memberSearch}
                                        onFocus={() => setShowMemberDropdown(true)}
                                        onChange={(e) => {
                                            setMemberSearch(e.target.value);
                                            setShowMemberDropdown(true);

                                            // Clear previously selected member
                                            setForm((prev) => ({
                                                ...prev,
                                                memberId: "",
                                            }));
                                        }}
                                    />


                                    {showMemberDropdown && (
                                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                            {filteredMembers.length > 0 ? (
                                                filteredMembers.map((member) => (
                                                    <button
                                                        key={member.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                memberId: member.id,
                                                            }));

                                                            setMemberSearch(
                                                                member.userName ||
                                                                `Member #${member.id}`
                                                            );
                                                            setShowMemberDropdown(false);

                                                        }}
                                                        className="block w-full px-4 py-3 text-left hover:bg-blue-50"
                                                    >
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {member.userName ||
                                                                `Member #${member.id}`}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {member.membershipNumber}
                                                            {member.userEmail &&
                                                                ` • ${member.userEmail}`}
                                                        </p>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="px-4 py-3 text-sm text-gray-500">
                                                    No members found.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Book */}
                                <div className="relative">
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Book *
                                    </label>

                                    <input
                                        type="text"
                                        className={inputCls}
                                        placeholder="Search book by title or ISBN..."
                                        value={bookSearch}
                                        onFocus={() => setShowBookDropdown(true)}
                                        onChange={(e) => {
                                            setBookSearch(e.target.value);
                                            setShowBookDropdown(true);

                                            // Clear previously selected member
                                            setForm((prev) => ({
                                                ...prev,
                                                bookId: "",
                                            }));
                                        }}
                                    // onChange={(e) => setBookSearch(e.target.value)}
                                    />

                                    {showBookDropdown && (
                                        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                            {filteredBooks.length > 0 ? (
                                                filteredBooks.map((book) => (
                                                    <button
                                                        key={book.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setForm((prev) => ({
                                                                ...prev,
                                                                bookId: book.id,
                                                            }));

                                                            setBookSearch(book.title);
                                                            setShowBookDropdown(false);

                                                        }}
                                                        className="block w-full px-4 py-3 text-left hover:bg-blue-50"
                                                    >
                                                        <p className="text-sm font-medium text-gray-800">
                                                            {book.title}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            {book.isbn &&
                                                                `ISBN: ${book.isbn}`}
                                                            {book.availableCopies !== undefined &&
                                                                ` • ${book.availableCopies} available`}
                                                        </p>
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="px-4 py-3 text-sm text-gray-500">
                                                    No books found.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Selected book information */}
                                {form.bookId && (
                                    <div className="rounded-lg bg-blue-50 p-3">
                                        {(() => {
                                            const selectedBook = books.find(
                                                (book) =>
                                                    Number(book.id) ===
                                                    Number(form.bookId)
                                            );

                                            if (!selectedBook) return null;

                                            return (
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-blue-800">
                                                        {selectedBook.title}
                                                    </p>

                                                    {selectedBook.isbn && (
                                                        <p className="text-xs text-blue-600">
                                                            ISBN:{" "}
                                                            {selectedBook.isbn}
                                                        </p>
                                                    )}

                                                    {selectedBook.availableCopies !==
                                                        undefined && (
                                                            <p className="text-xs text-blue-600">
                                                                Available copies:{" "}
                                                                {
                                                                    selectedBook.availableCopies
                                                                }
                                                            </p>
                                                        )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() =>
                                            setModalMode(null)
                                        }
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleIssue}
                                        disabled={saving}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Issuing…"
                                            : "Issue Book"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </Modal>
            )}

            {/* Confirmation Dialog */}
            {confirmAction && (
                <ConfirmDialog
                    message={
                        confirmAction.type === "return"
                            ? `Return "${confirmAction.title}"?`
                            : `Renew "${confirmAction.title}"?`
                    }
                    onConfirm={
                        confirmAction.type === "return"
                            ? handleReturn
                            : handleRenew
                    }
                    onCancel={() =>
                        setConfirmAction(null)
                    }
                    loading={saving}
                />
            )}

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing page {pagination.totalPages === 0 ? 0 : page + 1}{" "}
                    of {pagination.totalPages}
                    {pagination.totalElements > 0 &&
                        ` • ${pagination.totalElements} loans`}
                </p>

                <div className="flex gap-2">
                    {/* Page Size */}
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
                    </select>

                    <button
                        disabled={page === 0}
                        onClick={() =>
                            setPage((p) => p - 1)
                        }
                        className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
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
                            page >= pagination.totalPages - 1
                        }
                        onClick={() =>
                            setPage((p) => p + 1)
                        }
                        className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Loans;
