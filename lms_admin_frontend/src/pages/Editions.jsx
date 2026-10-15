import { useEffect, useState } from "react";
import editionService from "../services/editionService";
import bookService from "../services/bookService";
import publisherService from "../services/publisherService";
import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog";
import usePermission from "../hooks/usePermission";

const emptyForm = {
    bookId: "",
    editionNumber: 1,
    editionLabel: "",
    publicationYear: "",
    publicationDate: "",
    price: "",
    isbn: "",
    isLatest: false,
    publisherId: "",
};

const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

const Editions = () => {
    const { hasPermission } = usePermission();

    const canCreate = hasPermission("BOOK_CREATE");
    const canUpdate = hasPermission("BOOK_UPDATE");
    const canDelete = hasPermission("BOOK_DELETE");

    const [editions, setEditions] = useState([]);
    const [books, setBooks] = useState([]);
    const [publishers, setPublishers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");

    const [modalMode, setModalMode] = useState(null);
    const [activeEdition, setActiveEdition] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [deleteEdition, setDeleteEdition] = useState(null);
    const [latestEdition, setLatestEdition] = useState(null);

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    // Pagination
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);

    const loadEditions = async () => {
        setLoading(true);
        setError(null);

        try {
            /*
             * There is no GET /editions endpoint in your controller.
             *
             * So editions are loaded through each book:
             * GET /editions/book/{bookId}
             */
            const bookData = await bookService.getAll();

            const bookList = bookData?.content ?? bookData ?? [];

            setBooks(bookList);

            const editionResults = await Promise.all(
                bookList.map(async (book) => {
                    try {
                        const data = await editionService.getByBook(book.id);

                        return (data ?? []).map((edition) => ({
                            ...edition,
                            book: edition.book ?? book,
                        }));
                    } catch {
                        return [];
                    }
                })
            );

            const allEditions = editionResults.flat();

            setEditions(allEditions);
        } catch (err) {
            console.error("EDITION LOAD ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load editions."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadReferenceData = async () => {
        try {
            const bookData = await bookService.getAll();

            const bookList = bookData?.content ?? bookData ?? [];

            setBooks(bookList);

            /*
             * Remove this if publisherService is not available yet.
             */
            const publisherData = await publisherService.getAll();

            setPublishers(
                publisherData?.content ?? publisherData ?? []
            );
        } catch (err) {
            console.error("REFERENCE DATA ERROR:", err);

            /*
             * Books are still useful even if publishers fail.
             */
        }
    };

    useEffect(() => {
        loadEditions();
        loadReferenceData();
    }, []);

    const openCreate = () => {
        setForm({
            ...emptyForm,
            bookId: "",
            editionNumber: 1,
            isLatest: false,
        });

        setActiveEdition(null);
        setFormError(null);
        setModalMode("create");
    };

    const openEdit = (edition) => {
        setActiveEdition(edition);

        setForm({
            bookId: edition.bookId ?? edition.book?.id ?? "",
            editionNumber: edition.editionNumber ?? 1,
            editionLabel: edition.editionLabel ?? "",
            publicationYear: edition.publicationYear ?? "",
            publicationDate: edition.publicationDate ?? "",
            price: edition.price ?? "",
            isbn: edition.isbn ?? "",
            isLatest: edition.isLatest ?? false,
            publisherId:
                edition.publisherId ??
                edition.publisher?.id ??
                "",
        });

        setFormError(null);
        setModalMode("edit");
    };

    const handleSave = async () => {
        setSaving(true);
        setFormError(null);

        const payload = {
            bookId: Number(form.bookId),
            editionNumber: Number(form.editionNumber),
            editionLabel: form.editionLabel.trim() || null,

            publicationYear: form.publicationYear
                ? Number(form.publicationYear)
                : null,

            publicationDate:
                form.publicationDate || null,

            price:
                form.price !== ""
                    ? Number(form.price)
                    : null,

            isbn: form.isbn.trim() || null,

            isLatest: Boolean(form.isLatest),

            publisherId: form.publisherId
                ? Number(form.publisherId)
                : null,
        };

        try {
            if (modalMode === "create") {
                await editionService.create(payload);
            } else {
                await editionService.update(
                    activeEdition.id,
                    payload
                );
            }

            setModalMode(null);
            setActiveEdition(null);

            await loadEditions();
        } catch (err) {
            console.error("SAVE EDITION ERROR:", err);

            setFormError(
                err.response?.data?.message ||
                "Failed to save edition."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteEdition) return;

        setSaving(true);

        try {
            await editionService.remove(deleteEdition.id);

            setDeleteEdition(null);

            await loadEditions();
        } catch (err) {
            console.error("DELETE EDITION ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to delete edition."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleMarkLatest = async () => {
        if (!latestEdition) return;

        setSaving(true);

        try {
            await editionService.markAsLatest(
                latestEdition.id
            );

            setLatestEdition(null);

            await loadEditions();
        } catch (err) {
            console.error("MARK LATEST ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to mark edition as latest."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
    };

    const getBookName = (edition) => {
        if (edition.book?.title) {
            return edition.book.title;
        }

        const book = books.find(
            (b) =>
                Number(b.id) ===
                Number(
                    edition.bookId ??
                    edition.book?.id
                )
        );

        return book?.title ?? "—";
    };

    const filteredEditions = editions.filter((edition) => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return true;
        }

        const bookName = getBookName(edition);

        return (
            bookName.toLowerCase().includes(keyword) ||
            edition.editionLabel
                ?.toLowerCase()
                .includes(keyword) ||
            edition.isbn
                ?.toLowerCase()
                .includes(keyword) ||
            String(edition.editionNumber).includes(keyword)
        );
    });

    const totalPages = Math.ceil(
        filteredEditions.length / size
    );

    const paginatedEditions = filteredEditions.slice(
        page * size,
        page * size + size
    );

    const columns = [
        {
            key: "id",
            label: "ID",
        },

        {
            key: "book",
            label: "Book",
            render: (row) => (
                <span className="font-medium text-gray-800">
                    {getBookName(row)}
                </span>
            ),
        },

        {
            key: "editionNumber",
            label: "Edition",
            render: (row) => (
                <div>
                    <span className="font-medium text-gray-700">
                        {row.editionNumber}
                        {row.editionLabel
                            ? ` — ${row.editionLabel}`
                            : ""}
                    </span>

                    {row.isLatest && (
                        <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            Latest
                        </span>
                    )}
                </div>
            ),
        },

        {
            key: "publicationYear",
            label: "Year",
            render: (row) =>
                row.publicationYear ?? "—",
        },

        {
            key: "publicationDate",
            label: "Publication Date",
            render: (row) =>
                row.publicationDate
                    ? new Date(
                          row.publicationDate
                      ).toLocaleDateString()
                    : "—",
        },

        {
            key: "isbn",
            label: "ISBN",
            render: (row) =>
                row.isbn || "—",
        },

        {
            key: "price",
            label: "Price",
            render: (row) =>
                row.price != null
                    ? `₹${row.price}`
                    : "—",
        },

        {
            key: "publisher",
            label: "Publisher",
            render: (row) =>
                row.publisher?.name ||
                row.publisherName ||
                "—",
        },

        ...(canUpdate || canDelete
            ? [
                  {
                      key: "actions",
                      label: "Actions",
                      render: (row) => (
                          <div className="flex flex-wrap gap-1.5">
                              {/* {canUpdate && (
                                  <button
                                      onClick={() =>
                                          openEdit(row)
                                      }
                                      className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                                  >
                                      Edit
                                  </button>
                              )} */}

                              {canUpdate &&
                                  !row.isLatest && (
                                      <button
                                          onClick={() =>
                                              setLatestEdition(
                                                  row
                                              )
                                          }
                                          className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                      >
                                          Mark Latest
                                      </button>
                                  )}

                              {canDelete && (
                                  <button
                                      onClick={() =>
                                          setDeleteEdition(
                                              row
                                          )
                                      }
                                      className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                                  >
                                      Delete
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
                        Editions
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage different editions of library books
                    </p>
                </div>

                {canCreate && (
                    <button
                        onClick={openCreate}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        + Add Edition
                    </button>
                )}
            </div>

            {/* Search */}
            <form
                onSubmit={handleSearch}
                className="mb-4 flex gap-2"
            >
                <input
                    className="w-80 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Search by book, ISBN or edition…"
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
                data={paginatedEditions}
                loading={loading}
                emptyMessage="No editions found."
                onRowClick={openEdit}
            />

            {/* Create / Edit Modal */}
            {modalMode && (
                <Modal
                    title={
                        modalMode === "create"
                            ? "Add Edition"
                            : "Edit Edition"
                    }
                    onClose={() =>
                        setModalMode(null)
                    }
                >
                    <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
                        {formError && (
                            <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">
                                {formError}
                            </p>
                        )}

                        {/* Book */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Book *
                            </label>

                            <select
                                className={inputCls}
                                value={form.bookId}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        bookId:
                                            e.target.value,
                                    }))
                                }
                            >
                                <option value="">
                                    — Select Book —
                                </option>

                                {books.map((book) => (
                                    <option
                                        key={book.id}
                                        value={book.id}
                                    >
                                        {book.title}
                                        {book.isbn
                                            ? ` (${book.isbn})`
                                            : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Edition number + label */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Edition Number *
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    className={inputCls}
                                    value={
                                        form.editionNumber
                                    }
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            editionNumber:
                                                e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Edition Label
                                </label>

                                <input
                                    className={inputCls}
                                    placeholder="e.g. Revised Edition"
                                    value={
                                        form.editionLabel
                                    }
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            editionLabel:
                                                e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* Publication */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Publication Year
                                </label>

                                <input
                                    type="number"
                                    min="1000"
                                    max="2100"
                                    className={inputCls}
                                    value={
                                        form.publicationYear
                                    }
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            publicationYear:
                                                e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Publication Date
                                </label>

                                <input
                                    type="date"
                                    className={inputCls}
                                    value={
                                        form.publicationDate
                                    }
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            publicationDate:
                                                e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* ISBN + Price */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    ISBN
                                </label>

                                <input
                                    className={inputCls}
                                    placeholder="ISBN"
                                    value={form.isbn}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            isbn: e.target.value,
                                        }))
                                    }
                                />

                                <p className="mt-1 text-xs text-gray-400">
                                    10–20 characters
                                </p>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Price
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={inputCls}
                                    value={form.price}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            price: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* Publisher */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Publisher
                            </label>

                            <select
                                className={inputCls}
                                value={
                                    form.publisherId
                                }
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        publisherId:
                                            e.target.value,
                                    }))
                                }
                            >
                                <option value="">
                                    — Select Publisher —
                                </option>

                                {publishers.map(
                                    (publisher) => (
                                        <option
                                            key={
                                                publisher.id
                                            }
                                            value={
                                                publisher.id
                                            }
                                        >
                                            {
                                                publisher.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* Latest */}
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 p-3 hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={form.isLatest}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        isLatest:
                                            e.target.checked,
                                    }))
                                }
                                className="accent-blue-600"
                            />

                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Mark as latest edition
                                </p>

                                <p className="text-xs text-gray-400">
                                    This edition will become the
                                    latest edition for the book.
                                </p>
                            </div>
                        </label>

                        {/* Buttons */}
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
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving…"
                                    : modalMode ===
                                      "create"
                                    ? "Add Edition"
                                    : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            {deleteEdition && (
                <ConfirmDialog
                    message={`Delete edition ${deleteEdition.editionNumber} of "${getBookName(
                        deleteEdition
                    )}"? This is only allowed if the edition has no copies.`}
                    onConfirm={handleDelete}
                    onCancel={() =>
                        setDeleteEdition(null)
                    }
                    loading={saving}
                />
            )}

            {/* Mark Latest Confirmation */}
            {latestEdition && (
                <ConfirmDialog
                    message={`Mark edition ${latestEdition.editionNumber} of "${getBookName(
                        latestEdition
                    )}" as the latest edition?`}
                    onConfirm={handleMarkLatest}
                    onCancel={() =>
                        setLatestEdition(null)
                    }
                    loading={saving}
                />
            )}

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing page{" "}
                    {totalPages === 0
                        ? 0
                        : page + 1}{" "}
                    of {totalPages}
                </p>

                <div className="flex gap-2">
                    {/* Page Size */}
                    <select
                        value={size}
                        onChange={(e) => {
                            setSize(
                                Number(
                                    e.target.value
                                )
                            );
                            setPage(0);
                        }}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                        <option value={5}>
                            5
                        </option>

                        <option value={10}>
                            10
                        </option>

                        <option value={20}>
                            20
                        </option>

                        <option value={30}>
                            30
                        </option>
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

export default Editions;
