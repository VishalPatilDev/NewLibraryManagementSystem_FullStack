import { useEffect, useState } from "react";
import publisherService from "../services/publisherService";

import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog";
import usePermission from "../hooks/usePermission";

const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

const emptyForm = {
    name: "",
    address: "",
    website: "",
    phone: "",
    email: "",
    country: "",
};

const Publishers = () => {
    const { hasPermission } = usePermission();

    const canRead = hasPermission("BOOK_READ");
    const canCreate = hasPermission("BOOK_CREATE");
    const canUpdate = hasPermission("BOOK_UPDATE");
    const canDelete = hasPermission("BOOK_DELETE");

    const [publishers, setPublishers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const [searchTerm, setSearchTerm] = useState("");
    const [activeSearch, setActiveSearch] = useState("");

    const [pagination, setPagination] = useState({
        totalElements: 0,
        totalPages: 0,
    });

    const [selectedPublisher, setSelectedPublisher] =
        useState(null);

    const [modalMode, setModalMode] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const loadPublishers = async () => {
        setLoading(true);
        setError(null);

        try {
            let data;

            if (activeSearch.trim()) {
                data = await publisherService.search({
                    name: activeSearch.trim(),
                    page,
                    size,
                });
            } else {
                /*
                 * The backend getAll() currently returns all publishers
                 * without pagination.
                 */
                data = await publisherService.getAll();
            }

            console.log("PUBLISHER RESPONSE:", data);

            const publisherList =
                data?.content ??
                data?.data?.content ??
                data?.data ??
                data ??
                [];

            if (Array.isArray(publisherList)) {
                setPublishers(publisherList);

                setPagination({
                    totalElements:
                        data?.totalElements ??
                        data?.data?.totalElements ??
                        publisherList.length,

                    totalPages:
                        data?.totalPages ??
                        data?.data?.totalPages ??
                        (publisherList.length > 0
                            ? Math.ceil(publisherList.length / size)
                            : 0),
                });
            } else {
                console.error(
                    "Publisher response is not an array:",
                    publisherList
                );

                setPublishers([]);
                setPagination({
                    totalElements: 0,
                    totalPages: 0,
                });
            }
        } catch (err) {
            console.error("PUBLISHER API ERROR:", err);
            console.error("STATUS:", err.response?.status);
            console.error("RESPONSE:", err.response?.data);

            setPublishers([]);

            setError(
                err.response?.data?.message ||
                `Failed to load publishers (${err.response?.status || "unknown error"
                }).`
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (canRead) {
            loadPublishers();
        }
    }, [page, size, activeSearch, canRead, searchTerm]);

    const handleSearch = () => {
        setPage(0);
        setActiveSearch(searchTerm.trim());
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setActiveSearch("");
        setPage(0);
    };

    const openCreate = () => {
        setForm(emptyForm);
        setFormError(null);
        setModalMode("create");
        setSelectedPublisher(null);
    };

    const openEdit = (publisher) => {
        setSelectedPublisher(publisher);

        setForm({
            name: publisher.name || "",
            address: publisher.address || "",
            website: publisher.website || "",
            phone: publisher.phone || "",
            email: publisher.email || "",
            country: publisher.country || "",
        });

        setFormError(null);
        setModalMode("edit");
    };

    const openDetails = (publisher) => {
        setSelectedPublisher(publisher);
        setModalMode("details");
    };

    const openDelete = (publisher) => {
        setSelectedPublisher(publisher);
        setModalMode("delete");
    };

    const closeModal = () => {
        if (saving) return;

        setModalMode(null);
        setSelectedPublisher(null);
        setForm(emptyForm);
        setFormError(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            setFormError("Publisher name is required.");
            return;
        }

        setSaving(true);
        setFormError(null);
        setError(null);

        const payload = {
            name: form.name.trim(),
            address: form.address.trim() || null,
            website: form.website.trim() || null,
            phone: form.phone.trim() || null,
            email: form.email.trim() || null,
            country: form.country.trim() || null,
        };

        try {
            if (modalMode === "create") {
                await publisherService.create(payload);
            } else if (
                modalMode === "edit" &&
                selectedPublisher
            ) {
                await publisherService.update(
                    selectedPublisher.id,
                    payload
                );
            }

            setModalMode(null);
            setSelectedPublisher(null);
            setForm(emptyForm);

            await loadPublishers();
        } catch (err) {
            console.error("SAVE PUBLISHER ERROR:", err);

            console.error(
                "STATUS:",
                err.response?.status
            );

            console.error(
                "RESPONSE:",
                err.response?.data
            );

            setFormError(
                err.response?.data?.message ||
                "Failed to save publisher."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPublisher) return;

        setSaving(true);
        setError(null);

        try {
            await publisherService.remove(
                selectedPublisher.id
            );

            setModalMode(null);
            setSelectedPublisher(null);

            await loadPublishers();
        } catch (err) {
            console.error(
                "DELETE PUBLISHER ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete publisher."
            );
        } finally {
            setSaving(false);
        }
    };

    const formatValue = (value) => {
        if (!value) return "—";
        return value;
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
            key: "name",
            label: "Publisher",
            render: (row) => (
                <div>
                    <p className="font-medium text-gray-800">
                        {row.name || "—"}
                    </p>

                    {row.country && (
                        <p className="text-xs text-gray-400">
                            {row.country}
                        </p>
                    )}
                </div>
            ),
        },

        {
            key: "contact",
            label: "Contact",
            render: (row) => (
                <div>
                    {row.email && (
                        <p className="text-sm text-gray-700">
                            {row.email}
                        </p>
                    )}

                    {row.phone && (
                        <p className="text-xs text-gray-400">
                            {row.phone}
                        </p>
                    )}

                    {!row.email && !row.phone && (
                        <span className="text-sm text-gray-400">
                            —
                        </span>
                    )}
                </div>
            ),
        },

        {
            key: "address",
            label: "Address",
            render: (row) => (
                <span className="block max-w-[280px] truncate text-sm text-gray-600">
                    {row.address || "—"}
                </span>
            ),
        },

        {
            key: "website",
            label: "Website",
            render: (row) => {
                if (!row.website) {
                    return (
                        <span className="text-gray-400">
                            —
                        </span>
                    );
                }

                const website = row.website.startsWith("http")
                    ? row.website
                    : `https://${row.website}`;

                return (
                    <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="max-w-[200px] truncate text-sm text-blue-600 hover:underline"
                    >
                        {row.website}
                    </a>
                );
            },
        },

        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex flex-wrap gap-1.5">
                    {/* <button
                        onClick={() => openDetails(row)}
                        className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                    >
                        View
                    </button> */}

                    {/* {canUpdate && (
                        <button
                            onClick={() => openEdit(row)}
                            className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                        >
                            Edit
                        </button>
                    )} */}

                    {canDelete && (
                        <button
                            onClick={() => openDelete(row)}
                            className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                        >
                            Delete
                        </button>
                    )}
                </div>
            ),
        },
    ];

    if (!canRead) {
        return (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                You do not have permission to view publishers.
            </div>
        );
    }

    const totalPages = pagination.totalPages;

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Publishers
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage book publishers and their contact
                        information
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={loadPublishers}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Refresh
                    </button>

                    {canCreate && (
                        <button
                            onClick={openCreate}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            + Add Publisher
                        </button>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch();
                            }
                        }}
                        placeholder="Search publisher by name..."
                        className={inputCls}
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Search
                        </button>

                        {activeSearch && (
                            <button
                                onClick={handleClearSearch}
                                disabled={loading}
                                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {activeSearch && (
                    <p className="mt-2 text-xs text-gray-500">
                        Searching for:{" "}
                        <span className="font-medium text-gray-700">
                            {activeSearch}
                        </span>
                    </p>
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
                        Total Publishers
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
                        {totalPages === 0 ? 0 : page + 1}
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
                data={publishers}
                loading={loading}
                emptyMessage={
                    activeSearch
                        ? "No publishers found for this search."
                        : "No publishers found."
                }
                onRowClick={openEdit}
            />

            {/* Pagination */}
            {totalPages > 0 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">
                        Showing page {page + 1} of{" "}
                        {totalPages}
                        {pagination.totalElements > 0 &&
                            ` • ${pagination.totalElements} publishers`}
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
                            {page + 1}
                        </span>

                        <button
                            disabled={
                                page >= totalPages - 1 ||
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
            )}

            {/* Create / Edit Modal */}
            {(modalMode === "create" ||
                modalMode === "edit") && (
                    <Modal
                        title={
                            modalMode === "create"
                                ? "Add Publisher"
                                : "Edit Publisher"
                        }
                        onClose={closeModal}
                    >
                        <div className="space-y-4">
                            {formError && (
                                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                    {formError}
                                </div>
                            )}

                            {/* Name */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Publisher Name *
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    maxLength={150}
                                    placeholder="Enter publisher name"
                                    className={inputCls}
                                    disabled={saving}
                                />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    maxLength={200}
                                    rows={3}
                                    placeholder="Enter publisher address"
                                    className={inputCls}
                                    disabled={saving}
                                />
                            </div>

                            {/* Website + Country */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Website
                                    </label>

                                    <input
                                        type="text"
                                        name="website"
                                        value={form.website}
                                        onChange={handleChange}
                                        maxLength={100}
                                        placeholder="https://example.com"
                                        className={inputCls}
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Country
                                    </label>

                                    <input
                                        type="text"
                                        name="country"
                                        value={form.country}
                                        onChange={handleChange}
                                        maxLength={50}
                                        placeholder="India"
                                        className={inputCls}
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            {/* Phone + Email */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Phone
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        maxLength={15}
                                        placeholder="Enter phone number"
                                        className={inputCls}
                                        disabled={saving}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        maxLength={100}
                                        placeholder="publisher@example.com"
                                        className={inputCls}
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleSave}
                                    disabled={
                                        saving ||
                                        !form.name.trim()
                                    }
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : modalMode === "create"
                                            ? "Create Publisher"
                                            : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

            {/* Details Modal */}
            {modalMode === "details" &&
                selectedPublisher && (
                    <Modal
                        title="Publisher Details"
                        onClose={closeModal}
                    >
                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Publisher ID
                                        </p>

                                        <p className="text-lg font-semibold text-gray-800">
                                            #
                                            {
                                                selectedPublisher.id
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs text-gray-400">
                                        Name
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {formatValue(
                                            selectedPublisher.name
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Country
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {formatValue(
                                            selectedPublisher.country
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Email
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {formatValue(
                                            selectedPublisher.email
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">
                                        Phone
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {formatValue(
                                            selectedPublisher.phone
                                        )}
                                    </p>
                                </div>

                                <div className="sm:col-span-2">
                                    <p className="text-xs text-gray-400">
                                        Website
                                    </p>

                                    {selectedPublisher.website ? (
                                        <a
                                            href={
                                                selectedPublisher.website.startsWith(
                                                    "http"
                                                )
                                                    ? selectedPublisher.website
                                                    : `https://${selectedPublisher.website}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            {
                                                selectedPublisher.website
                                            }
                                        </a>
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">
                                            —
                                        </p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <p className="text-xs text-gray-400">
                                        Address
                                    </p>

                                    <p className="text-sm font-medium text-gray-800">
                                        {formatValue(
                                            selectedPublisher.address
                                        )}
                                    </p>
                                </div>
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

            {/* Delete Confirmation */}
            {modalMode === "delete" &&
                selectedPublisher && (
                    <ConfirmDialog
                        title="Delete Publisher"
                        message={
                            `Are you sure you want to delete the publisher ` +
                            `"${selectedPublisher.name || "this publisher"}"?`
                        }
                        confirmText={
                            saving
                                ? "Deleting..."
                                : "Delete Publisher"
                        }
                        cancelText="Keep Publisher"
                        onConfirm={handleDelete}
                        onCancel={closeModal}
                        loading={saving}
                    />
                )}
        </div>
    );
};

export default Publishers;
