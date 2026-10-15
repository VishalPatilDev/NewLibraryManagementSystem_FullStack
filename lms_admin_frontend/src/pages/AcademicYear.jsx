import { useEffect, useState } from "react";
import academicYearService from "../services/academicYearService";
import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog";
import usePermission from "../hooks/usePermission";

const emptyForm = {
    yearLabel: "",
    startDate: "",
    endDate: "",
    maxBorrowLimit: 5,
    loanDurationDays: 14,
    finePerDay: "",
    description: "",
};

const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

const AcademicYears = () => {
    const { hasPermission } = usePermission();

    const canWrite = hasPermission("ACADEMIC_YEAR_CREATE");
    const canUpdate = hasPermission("ACADEMIC_YEAR_UPDATE");

    const [academicYears, setAcademicYears] = useState([]);
    const [activeYear, setActiveYear] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");

    const [modalMode, setModalMode] = useState(null); // create | edit
    const [selectedYear, setSelectedYear] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const [activateYear, setActivateYear] = useState(null);

    // Pagination
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);

    const loadAcademicYears = () => {
        setLoading(true);
        setError(null);

        Promise.all([
            academicYearService.getAll(),
            academicYearService.getActive(),
        ])
            .then(([years, active]) => {
                setAcademicYears(years ?? []);
                setActiveYear(active ?? null);
            })
            .catch((err) => {
                console.error("ACADEMIC YEAR ERROR:", err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load academic years."
                );
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        loadAcademicYears();
    }, []);

    const openCreate = () => {
        setForm({
            ...emptyForm,
            maxBorrowLimit: 5,
            loanDurationDays: 14,
        });

        setFormError(null);
        setSelectedYear(null);
        setModalMode("create");
    };

    const openEdit = (year) => {
        setSelectedYear(year);

        setForm({
            yearLabel: year.yearLabel ?? "",
            startDate: year.startDate ?? "",
            endDate: year.endDate ?? "",
            maxBorrowLimit: year.maxBorrowLimit ?? 5,
            loanDurationDays: year.loanDurationDays ?? 14,
            finePerDay: year.finePerDay ?? "",
            description: year.description ?? "",
        });

        setFormError(null);
        setModalMode("edit");
    };

    const handleSave = async () => {
        setSaving(true);
        setFormError(null);

        const payload = {
            yearLabel: form.yearLabel.trim(),
            startDate: form.startDate,
            endDate: form.endDate,
            maxBorrowLimit: Number(form.maxBorrowLimit),
            loanDurationDays: Number(form.loanDurationDays),
            finePerDay:
                form.finePerDay === ""
                    ? null
                    : Number(form.finePerDay),
            description: form.description.trim(),
        };

        try {
            if (modalMode === "create") {
                await academicYearService.create(payload);
            } else {
                await academicYearService.update(
                    selectedYear.id,
                    payload
                );
            }

            setModalMode(null);
            setSelectedYear(null);
            loadAcademicYears();
        } catch (err) {
            console.error("SAVE ACADEMIC YEAR ERROR:", err);

            setFormError(
                err.response?.data?.message ||
                "Failed to save academic year."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleActivate = async () => {
        if (!activateYear) return;

        setSaving(true);

        try {
            await academicYearService.activate(activateYear.id);

            setActivateYear(null);
            loadAcademicYears();
        } catch (err) {
            console.error("ACTIVATE ACADEMIC YEAR ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to activate academic year."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
    };

    const filteredYears = academicYears.filter((year) => {
        if (!search.trim()) return true;

        const keyword = search.toLowerCase();

        return (
            year.yearLabel?.toLowerCase().includes(keyword) ||
            year.description?.toLowerCase().includes(keyword)
        );
    });

    const totalPages = Math.ceil(filteredYears.length / size);

    const paginatedYears = filteredYears.slice(
        page * size,
        page * size + size
    );

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString();
    };

    const isActive = (year) => {
        if (!activeYear || !year) return false;

        return activeYear.id === year.id;
    };

    const columns = [
        {
            key: "yearLabel",
            label: "Academic Year",
            render: (row) => (
                <span className="font-medium text-gray-800">
                    {row.yearLabel}
                </span>
            ),
        },
        {
            key: "startDate",
            label: "Start Date",
            render: (row) => formatDate(row.startDate),
        },
        {
            key: "endDate",
            label: "End Date",
            render: (row) => formatDate(row.endDate),
        },
        {
            key: "maxBorrowLimit",
            label: "Borrow Limit",
            render: (row) => (
                <span className="text-gray-700">
                    {row.maxBorrowLimit ?? "—"}
                </span>
            ),
        },
        {
            key: "loanDurationDays",
            label: "Loan Days",
            render: (row) => (
                <span className="text-gray-700">
                    {row.loanDurationDays ?? "—"} days
                </span>
            ),
        },
        {
            key: "finePerDay",
            label: "Fine / Day",
            render: (row) => (
                <span className="text-gray-700">
                    {row.finePerDay != null
                        ? `₹${row.finePerDay}`
                        : "—"}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (row) =>
                isActive(row) ? (
                    <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        Active
                    </span>
                ) : (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                        Inactive
                    </span>
                ),
        },
        ...(canUpdate
            ? [
                {
                    key: "actions",
                    label: "Actions",
                    render: (row) => (
                        <div className="flex flex-wrap gap-1.5">
                            {/* <button
                                onClick={() => openEdit(row)}
                                className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                            >
                                Edit
                            </button> */}

                            {!isActive(row) && (
                                <button
                                    onClick={() =>
                                        setActivateYear(row)
                                    }
                                    className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                >
                                    Activate
                                </button>
                            )}
                        </div>
                    ),
                },
            ]
            : []),
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Academic Years
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage academic years and library borrowing rules
                    </p>
                </div>

                {canWrite && (
                    <button
                        onClick={openCreate}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        + Add Academic Year
                    </button>
                )}
            </div>

            {/* Active Academic Year */}
            {activeYear && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
                                Current Academic Year
                            </p>

                            <p className="mt-1 text-lg font-semibold text-green-800">
                                {activeYear.yearLabel}
                            </p>

                            <p className="mt-1 text-sm text-green-700">
                                {formatDate(activeYear.startDate)}
                                {" — "}
                                {formatDate(activeYear.endDate)}
                            </p>
                        </div>

                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Active
                        </span>
                    </div>
                </div>
            )}

            {/* Search */}
            <form
                onSubmit={handleSearch}
                className="mb-4 flex gap-2"
            >
                <input
                    className="w-72 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Search academic year…"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(0);
                    }}
                />

                <button
                    type="submit"
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                    Search
                </button>

                {search && (
                    <button
                        type="button"
                        onClick={() => {
                            setSearch("");
                            setPage(0);
                        }}
                        className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                        Clear
                    </button>
                )}
            </form>

            {/* Error */}
            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Table */}
            <Table
                columns={columns}
                data={paginatedYears}
                loading={loading}
                emptyMessage="No academic years found."
                onRowClick={openEdit}
            />

            {/* Create / Edit Modal */}
            {modalMode && (
                <Modal
                    title={
                        modalMode === "create"
                            ? "Add Academic Year"
                            : "Edit Academic Year"
                    }
                    onClose={() => setModalMode(null)}
                >
                    <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                        {formError && (
                            <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">
                                {formError}
                            </p>
                        )}

                        {/* Year Label */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Year Label *
                            </label>

                            <input
                                className={inputCls}
                                placeholder="e.g. 2024-2025"
                                value={form.yearLabel}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        yearLabel: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Start Date *
                                </label>

                                <input
                                    type="date"
                                    className={inputCls}
                                    value={form.startDate}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            startDate: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    End Date *
                                </label>

                                <input
                                    type="date"
                                    className={inputCls}
                                    value={form.endDate}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            endDate: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* Borrow settings */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Max Borrow Limit
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    className={inputCls}
                                    value={form.maxBorrowLimit}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            maxBorrowLimit:
                                                e.target.value,
                                        }))
                                    }
                                />

                                <p className="mt-1 text-xs text-gray-400">
                                    1 - 20 books
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Loan Duration
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    className={inputCls}
                                    value={form.loanDurationDays}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            loanDurationDays:
                                                e.target.value,
                                        }))
                                    }
                                />

                                <p className="mt-1 text-xs text-gray-400">
                                    1 - 60 days
                                </p>
                            </div>
                        </div>

                        {/* Fine */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Fine Per Day
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="e.g. 5.00"
                                className={inputCls}
                                value={form.finePerDay}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        finePerDay: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Description
                            </label>

                            <textarea
                                className={`${inputCls} resize-none`}
                                rows={4}
                                placeholder="Optional description..."
                                value={form.description}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        description: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setModalMode(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving…"
                                    : modalMode === "create"
                                        ? "Add Academic Year"
                                        : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Activate Confirmation */}
            {activateYear && (
                <ConfirmDialog
                    message={`Activate academic year "${activateYear.yearLabel}"? This will make it the current active academic year.`}
                    onConfirm={handleActivate}
                    onCancel={() => setActivateYear(null)}
                    loading={saving}
                />
            )}

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing page{" "}
                    {totalPages === 0 ? 0 : page + 1} of{" "}
                    {totalPages}
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

                    {totalPages > 0 && (
                        <span className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
                            {page + 1}
                        </span>
                    )}

                    <button
                        disabled={
                            totalPages === 0 ||
                            page >= totalPages - 1
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

export default AcademicYears;
