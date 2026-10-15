import { useEffect, useState } from "react";
import fineService from "../services/fineService";

import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import Badge from "../components/comman/Badge";
import usePermission from "../hooks/usePermission";

const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

const Fines = () => {
    const { hasPermission } = usePermission();

    const canRead = hasPermission("FINE_READ");
    const canManage = hasPermission("FINE_MANAGE");
    const canWaive = hasPermission("FINE_WAIVE");
    const canPay = hasPermission("FINE_PAY");

    const [fines, setFines] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const [pagination, setPagination] = useState({
        totalElements: 0,
        totalPages: 0,
    });

    const [selectedFine, setSelectedFine] = useState(null);
    const [modalMode, setModalMode] = useState(null);

    const [waiveReason, setWaiveReason] = useState("");

    // ---------------------------------------------------------
    // Load Razorpay checkout script
    // ---------------------------------------------------------

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const existingScript = document.querySelector(
                'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
            );

            if (existingScript) {
                existingScript.addEventListener("load", () =>
                    resolve(true)
                );

                existingScript.addEventListener("error", () =>
                    resolve(false)
                );

                return;
            }

            const script = document.createElement("script");

            script.src =
                "https://checkout.razorpay.com/v1/checkout.js";

            script.async = true;

            script.onload = () => resolve(true);

            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    };

    // ---------------------------------------------------------
    // Load fines
    // ---------------------------------------------------------

    const loadFines = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log("========== LOAD FINES ==========");

            const data = await fineService.getAll({
                page,
                size,
            });

            console.log("FINE RESPONSE:", data);

            const fineList =
                data?.content ??
                data?.data?.content ??
                data?.data ??
                data ??
                [];

            console.log("FINAL FINE LIST:", fineList);

            if (!Array.isArray(fineList)) {
                console.error(
                    "Fine response is not an array:",
                    fineList
                );

                setFines([]);
            } else {
                setFines(fineList);
            }

            setPagination({
                totalElements: data?.totalElements ?? 0,
                totalPages: data?.totalPages ?? 0,
            });
        } catch (err) {
            console.error("FINE API ERROR:", err);
            console.error("STATUS:", err.response?.status);
            console.error("RESPONSE:", err.response?.data);

            setFines([]);

            setError(
                err.response?.data?.message ||
                    `Failed to load fines (${
                        err.response?.status ||
                        "unknown error"
                    }).`
            );
        } finally {
            setLoading(false);

            console.log("========== FINES COMPLETE ==========");
        }
    };

    useEffect(() => {
        if (canRead || canManage) {
            loadFines();
        }
    }, [page, size, canRead, canManage]);

    // ---------------------------------------------------------
    // Formatting
    // ---------------------------------------------------------

    const formatCurrency = (value) => {
        const amount = Number(value ?? 0);

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
        }).format(amount);
    };

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
                return "bg-red-50 text-red-700";

            case "PAID":
                return "bg-green-50 text-green-700";

            case "WAIVED":
                return "bg-blue-50 text-blue-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getStatusLabel = (status) => {
        if (!status) return "—";

        return status.replaceAll("_", " ");
    };

    // ---------------------------------------------------------
    // Modals
    // ---------------------------------------------------------

    const openDetails = (fine) => {
        setSelectedFine(fine);
        setModalMode("details");
        setFormError(null);
    };

    const openWaive = (fine) => {
        setSelectedFine(fine);
        setWaiveReason("");
        setFormError(null);
        setModalMode("waive");
    };

    const closeModal = () => {
        if (saving) return;

        setModalMode(null);
        setSelectedFine(null);
        setWaiveReason("");
        setFormError(null);
    };

    // ---------------------------------------------------------
    // Waive
    // ---------------------------------------------------------

    const handleWaive = async () => {
        if (!selectedFine) return;

        const reason = waiveReason.trim();

        if (!reason) {
            setFormError("Waive reason is required.");
            return;
        }

        setSaving(true);
        setFormError(null);

        try {
            console.log("WAIVE FINE:", {
                id: selectedFine.id,
                reason,
            });

            await fineService.waive(selectedFine.id, {
                reason,
            });

            setModalMode(null);
            setSelectedFine(null);
            setWaiveReason("");

            await loadFines();
        } catch (err) {
            console.error("WAIVE FINE ERROR:", err);
            console.error("STATUS:", err.response?.status);
            console.error("RESPONSE:", err.response?.data);

            setFormError(
                err.response?.data?.message ||
                    "Failed to waive fine."
            );
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------------------------------------
    // Razorpay Payment
    // ---------------------------------------------------------

    const handlePayment = async (fine) => {
        if (!fine) return;

        if (!canPay) {
            setError(
                "You do not have permission to make fine payments."
            );
            return;
        }

        if (fine.status !== "PENDING") {
            setError(
                "Only pending fines can be paid."
            );
            return;
        }

        setSaving(true);
        setError(null);

        try {
            console.log(
                "========== START FINE PAYMENT =========="
            );

            console.log("Fine:", fine);

            // -------------------------------------------------
            // 1. Load Razorpay Checkout
            // -------------------------------------------------

            const razorpayLoaded =
                await loadRazorpayScript();

            if (!razorpayLoaded) {
                throw new Error(
                    "Unable to load Razorpay Checkout. Please check your internet connection."
                );
            }

            // -------------------------------------------------
            // 2. Create order on backend
            // -------------------------------------------------

            console.log(
                "Creating Razorpay order for fine:",
                fine.id
            );

            const order =
                await fineService.createPaymentOrder(
                    fine.id
                );

            console.log(
                "RAZORPAY ORDER RESPONSE:",
                order
            );

            if (!order?.razorpayOrderId) {
                throw new Error(
                    "Invalid payment order response from server."
                );
            }

            if (!order?.keyId) {
                throw new Error(
                    "Razorpay key ID was not returned by server."
                );
            }

            // -------------------------------------------------
            // 3. Open Razorpay Checkout
            // -------------------------------------------------

            const options = {
                key: order.keyId,

                amount: Math.round(
                    Number(order.amount) * 100
                ),

                currency:
                    order.currency || "INR",

                name: "PJSoftTech Library",

                description:
                    `Fine payment #${fine.id}`,

                order_id:
                    order.razorpayOrderId,

                prefill: {
                    name:
                        fine.memberName || "",
                },

                notes: {
                    fineId:
                        String(fine.id),

                    membershipNumber:
                        fine.membershipNumber || "",
                },

                theme: {
                    color: "#2563eb",
                },

                handler: async function (
                    response
                ) {
                    console.log(
                        "RAZORPAY SUCCESS:",
                        response
                    );

                    try {
                        setSaving(true);
                        setError(null);

                        // -----------------------------------------
                        // 4. Verify payment on backend
                        // -----------------------------------------

                        const verifyPayload = {
                            fineId: fine.id,

                            razorpayOrderId:
                                response.razorpay_order_id,

                            razorpayPaymentId:
                                response.razorpay_payment_id,

                            razorpaySignature:
                                response.razorpay_signature,
                        };

                        console.log(
                            "VERIFY PAYMENT PAYLOAD:",
                            verifyPayload
                        );

                        const verified =
                            await fineService.verifyPayment(
                                verifyPayload
                            );

                        console.log(
                            "PAYMENT VERIFIED:",
                            verified
                        );

                        // -----------------------------------------
                        // 5. Reload fines
                        // -----------------------------------------

                        await loadFines();

                        setError(null);

                        alert(
                            "Payment successful and fine marked as PAID."
                        );
                    } catch (verifyError) {
                        console.error(
                            "PAYMENT VERIFICATION ERROR:",
                            verifyError
                        );

                        console.error(
                            "STATUS:",
                            verifyError.response?.status
                        );

                        console.error(
                            "RESPONSE:",
                            verifyError.response?.data
                        );

                        setError(
                            verifyError.response?.data
                                ?.message ||
                                "Payment was completed, but verification failed. Please contact the administrator."
                        );
                    } finally {
                        setSaving(false);
                    }
                },

                modal: {
                    ondismiss: function () {
                        console.log(
                            "Razorpay checkout dismissed."
                        );

                        setSaving(false);
                    },
                },
            };

            console.log(
                "OPENING RAZORPAY:",
                options
            );

            const razorpay =
                new window.Razorpay(options);

            razorpay.on(
                "payment.failed",
                function (response) {
                    console.error(
                        "RAZORPAY PAYMENT FAILED:",
                        response
                    );

                    setSaving(false);

                    setError(
                        response?.error?.description ||
                            "Payment failed. Please try again."
                    );
                }
            );

            razorpay.open();

            console.log(
                "========== RAZORPAY OPENED =========="
            );
        } catch (err) {
            console.error(
                "PAYMENT ERROR:",
                err
            );

            console.error(
                "STATUS:",
                err.response?.status
            );

            console.error(
                "RESPONSE:",
                err.response?.data
            );

            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Unable to start payment."
            );

            setSaving(false);
        }
    };

    // ---------------------------------------------------------
    // Table
    // ---------------------------------------------------------

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
                        {row.memberName || "—"}
                    </p>

                    {row.membershipNumber && (
                        <p className="text-xs text-gray-400">
                            {row.membershipNumber}
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
                    <p className="max-w-[240px] truncate font-medium text-gray-800">
                        {row.bookTitle || "—"}
                    </p>

                    {row.barcode && (
                        <p className="text-xs text-gray-400">
                            Barcode: {row.barcode}
                        </p>
                    )}
                </div>
            ),
        },

        {
            key: "overdueDays",
            label: "Overdue",
            render: (row) => (
                <span
                    className={
                        Number(row.overdueDays) > 0
                            ? "font-semibold text-red-600"
                            : "text-gray-500"
                    }
                >
                    {row.overdueDays ?? 0} day
                    {Number(row.overdueDays) === 1
                        ? ""
                        : "s"}
                </span>
            ),
        },

        {
            key: "finePerDay",
            label: "Per Day",
            render: (row) => (
                <span className="text-gray-600">
                    {formatCurrency(row.finePerDay)}
                </span>
            ),
        },

        {
            key: "totalAmount",
            label: "Amount",
            render: (row) => (
                <span
                    className={
                        Number(row.totalAmount) > 0
                            ? "font-semibold text-red-600"
                            : "text-gray-500"
                    }
                >
                    {formatCurrency(
                        row.totalAmount
                    )}
                </span>
            ),
        },

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
            label: "Created",
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
                const isPending =
                    row.status === "PENDING";

                return (
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() =>
                                openDetails(row)
                            }
                            className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                            View
                        </button>

                        {canPay && isPending && (
                            <button
                                onClick={() =>
                                    handlePayment(row)
                                }
                                disabled={saving}
                                className="rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Processing..."
                                    : "Pay"}
                            </button>
                        )}

                        {canWaive && isPending && (
                            <button
                                onClick={() =>
                                    openWaive(row)
                                }
                                disabled={saving}
                                className="rounded-md bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                            >
                                Waive
                            </button>
                        )}
                    </div>
                );
            },
        },
    ];

    // ---------------------------------------------------------
    // Permission
    // ---------------------------------------------------------

    if (!canRead && !canManage) {
        return (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                You do not have permission to view fines.
            </div>
        );
    }

    // ---------------------------------------------------------
    // Render
    // ---------------------------------------------------------

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Fines
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage overdue fines, payments and waived fines
                    </p>
                </div>

                <button
                    onClick={loadFines}
                    disabled={loading || saving}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                    Refresh
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    <span>{error}</span>

                    <button
                        onClick={() =>
                            setError(null)
                        }
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
                        Total Fines
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
                data={fines}
                loading={loading}
                emptyMessage="No fines found."
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
                        ` • ${pagination.totalElements} fines`}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={size}
                        onChange={(e) => {
                            setSize(
                                Number(e.target.value)
                            );
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
                        disabled={
                            page === 0 ||
                            loading ||
                            saving
                        }
                        onClick={() =>
                            setPage(
                                (current) =>
                                    current - 1
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
                                pagination.totalPages -
                                    1 ||
                            loading ||
                            saving
                        }
                        onClick={() =>
                            setPage(
                                (current) =>
                                    current + 1
                            )
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* -------------------------------------------------
                Fine Details Modal
            ------------------------------------------------- */}

            {modalMode === "details" &&
                selectedFine && (
                    <Modal
                        title="Fine Details"
                        onClose={closeModal}
                    >
                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Fine ID
                                        </p>

                                        <p className="text-lg font-semibold text-gray-800">
                                            #
                                            {
                                                selectedFine.id
                                            }
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                            selectedFine.status
                                        )}`}
                                    >
                                        {getStatusLabel(
                                            selectedFine.status
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
                                        {selectedFine.memberName ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Membership Number
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {selectedFine.membershipNumber ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Book
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {selectedFine.bookTitle ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Barcode
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {selectedFine.barcode ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Loan ID
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        #
                                        {selectedFine.loanId ||
                                            "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Overdue Days
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {selectedFine.overdueDays ??
                                            0}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Fine Per Day
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {formatCurrency(
                                            selectedFine.finePerDay
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Total Amount
                                    </p>

                                    <p className="text-lg font-bold text-red-600">
                                        {formatCurrency(
                                            selectedFine.totalAmount
                                        )}
                                    </p>
                                </div>
                            </div>

                            {selectedFine.paidAt && (
                                <div className="rounded-lg bg-green-50 p-3">
                                    <p className="text-xs font-medium text-green-600">
                                        Paid At
                                    </p>

                                    <p className="text-sm text-green-800">
                                        {formatDateTime(
                                            selectedFine.paidAt
                                        )}
                                    </p>
                                </div>
                            )}

                            {selectedFine.waivedBy && (
                                <div className="rounded-lg bg-blue-50 p-3">
                                    <p className="text-xs font-medium text-blue-600">
                                        Waived By
                                    </p>

                                    <p className="text-sm text-blue-800">
                                        {selectedFine.waivedBy}
                                    </p>

                                    {selectedFine.waiveReason && (
                                        <>
                                            <p className="mt-2 text-xs font-medium text-blue-600">
                                                Reason
                                            </p>

                                            <p className="text-sm text-blue-800">
                                                {
                                                    selectedFine.waiveReason
                                                }
                                            </p>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                {canPay &&
                                    selectedFine.status ===
                                        "PENDING" && (
                                        <button
                                            onClick={() =>
                                                handlePayment(
                                                    selectedFine
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {saving
                                                ? "Processing..."
                                                : `Pay ${formatCurrency(
                                                      selectedFine.totalAmount
                                                  )}`}
                                        </button>
                                    )}

                                <button
                                    onClick={
                                        closeModal
                                    }
                                    disabled={saving}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

            {/* -------------------------------------------------
                Waive Fine Modal
            ------------------------------------------------- */}

            {modalMode === "waive" &&
                selectedFine && (
                    <Modal
                        title="Waive Fine"
                        onClose={closeModal}
                    >
                        <div className="space-y-4">
                            {formError && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                    {formError}
                                </div>
                            )}

                            <div className="rounded-lg bg-orange-50 p-4">
                                <p className="text-sm font-semibold text-orange-800">
                                    {selectedFine.bookTitle ||
                                        "Fine"}
                                </p>

                                <p className="mt-1 text-xs text-orange-600">
                                    Member:{" "}
                                    {selectedFine.memberName ||
                                        "—"}
                                </p>

                                <p className="mt-1 text-sm font-bold text-orange-800">
                                    Amount:{" "}
                                    {formatCurrency(
                                        selectedFine.totalAmount
                                    )}
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Waive Reason *
                                </label>

                                <textarea
                                    value={
                                        waiveReason
                                    }
                                    onChange={(e) =>
                                        setWaiveReason(
                                            e.target
                                                .value
                                        )
                                    }
                                    rows={4}
                                    maxLength={500}
                                    placeholder="Enter the reason for waiving this fine..."
                                    className={
                                        inputCls
                                    }
                                    disabled={
                                        saving
                                    }
                                />

                                <p className="mt-1 text-right text-xs text-gray-400">
                                    {
                                        waiveReason.length
                                    }
                                    /500
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={
                                        handleWaive
                                    }
                                    disabled={
                                        saving ||
                                        !waiveReason.trim()
                                    }
                                    className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                                >
                                    {saving
                                        ? "Waiving…"
                                        : "Waive Fine"}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
        </div>
    );
};

export default Fines;
