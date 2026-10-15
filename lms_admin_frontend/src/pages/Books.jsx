import { useEffect, useState } from "react";
import bookService from "../services/bookService";
import authorService from "../services/authorService";
import categoryService from "../services/categoryService";
import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog";
import Badge from "../components/comman/Badge";
import usePermission from "../hooks/usePermission";
import publisherService from "../services/publisherService";


const emptyBookForm = {
    title: "",
    isbn: "",
    description: "",
    publicationYear: "",
    language: "",
    categoryId: "",
    authorIds: [],
    publisherId: "",
};

const emptyCopyForm = {
    barcode: "",
    status: "AVAILABLE",
    rackId: "",
    shelfLocation: "",
    purchaseDate: "",
};

const COPY_STATUSES = ["AVAILABLE", "BORROWED", "RESERVED", "LOST", "DAMAGED"];

const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

const Books = () => {
    const { hasPermission } = usePermission();
    const canWrite = hasPermission("BOOK_CREATE");

    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    // Reference data
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);

    // Modals
    const [modalMode, setModalMode] = useState(null); // "create" | "edit"
    const [activeBook, setActiveBook] = useState(null);
    const [form, setForm] = useState(emptyBookForm);
    const [deleteBook, setDeleteBook] = useState(null);

    // Copies
    const [copiesBook, setCopiesBook] = useState(null);
    const [copies, setCopies] = useState([]);
    const [copiesLoading, setCopiesLoading] = useState(false);
    const [addCopyMode, setAddCopyMode] = useState(false);
    const [copyForm, setCopyForm] = useState(emptyCopyForm);

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);
    const [sortBy, setSortBy] = useState("title");

    const [pagination, setPagination] = useState({
        totalElements: 0,
        totalPages: 0,
    });

    const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);

    const [publishers, setPublishers] = useState([]);


    const loadBooks = (q = search) => {
        setLoading(true);
        setError(null);
        const params = {
            page,
            size,
            sortBy,
        };

        const call = q
            ? bookService.search({ title: q, ...params })
            : bookService.getAll(params);

        call
            .then((data) => {
                console.log("BOOK RESPONSE:", data);
                setBooks(data.content ?? []);
                setPagination({
                    totalElements: data.totalElements ?? 0,
                    totalPages: data.totalPages ?? 0,
                });
            })
            .catch((err) => {
                console.error("BOOK API ERROR:", err);
                console.error("STATUS:", err.response?.status);
                console.error("RESPONSE:", err.response?.data);

                setError(
                    err.response?.data?.message ||
                    `Failed to load books (${err.response?.status || "unknown error"}).`
                );
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadBooks(search);
        // authorService.getAll(params).then(setAuthors).catch(() => { });
        // categoryService.getAll(params).then(setCategories).catch(() => { });
    }, [search, page, size, sortBy]);

    useEffect(() => {
        const loadReferenceData = async () => {
            try {
                const [authorData, categoryData, publisherData] = await Promise.all([
                    authorService.getAll({
                        page: 0,
                        size: 1000,
                        sortBy: "name",
                    }),
                    categoryService.getAll({
                        page: 0,
                        size: 1000,
                        sortBy: "name",
                    }),
                    publisherService.getAll({
                        page: 0,
                        size: 1000,
                        sortBy: "name",
                    }),
                ]);

                setAuthors(authorData.content ?? authorData ?? []);
                setCategories(categoryData.content ?? categoryData ?? []);
                setPublishers(publisherData.content ?? publisherData ?? [])
            } catch (err) {
                console.error("Failed to load reference data", err);
            }
        };

        loadReferenceData();
    }, []);

    const openCreate = () => {
        setForm(emptyBookForm);
        setFormError(null);
        setModalMode("create");
    };

    const openEdit = async (book) => {
        setActiveBook(book);
        setForm({
            title: book.title,
            isbn: book.isbn,
            description: book.description ?? "",
            publicationYear: book.publicationYear ?? "",
            language: book.language ?? "",
            categoryId: book.category?.id ?? "",
            publisherId: book.publisher?.id ?? "",
            authorIds: book.authors?.map((a) => a.id) ?? [],
        });
        setFormError(null);
        setModalMode("edit");
        // Load copies for this book
        setCopiesLoading(true);
        setCopies([]);

        try {
            const data = await bookService.getCopies(book.id);
            setCopies(data);
        } catch {
            setCopies([]);
        } finally {
            setCopiesLoading(false);
        }
    };
    const closeBookModal = () => {
        setModalMode(null);
        setActiveBook(null);
        setCopies([]);
        setAddCopyMode(false);
        setCopyForm(emptyCopyForm);
        setFormError(null);
    };


    const handleSave = async () => {

        setFormError(null);
        if (!form.title.trim()) {
            setFormError("Title is required.");
            return;
        }

        if (!form.isbn.trim()) {
            setFormError("ISBN is required.");
            return;
        }

        if (!form.publisherId) {
            setFormError("Publisher is required.");
            return;
        }

        if (form.authorIds.length === 0) {
            setFormError("At least one author is required.");
            return;
        }
        setSaving(true);
        const payload = {
            ...form,
            publicationYear: form.publicationYear ? Number(form.publicationYear) : undefined,
            categoryId: form.categoryId ? Number(form.categoryId) : undefined,
            publisherId: form.publisherId
                ? Number(form.publisherId)
                : undefined,
            authorIds: form.authorIds.map(Number),
        };
        try {
            if (modalMode === "create") {
                await bookService.create(payload);
            } else {
                await bookService.update(activeBook.id, payload);
            }
            setModalMode(null);
            loadBooks(search);
        } catch {
            setFormError("Failed to save book.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await bookService.remove(deleteBook.id);
            setDeleteBook(null);
            loadBooks(search);
        } catch {
            setFormError("Failed to delete book.");
        } finally {
            setSaving(false);
        }
    };

    const openCopies = async (book) => {
        setCopiesBook(book);
        setCopiesLoading(true);
        setAddCopyMode(false);
        setCopyForm({ ...emptyCopyForm, bookId: book.id });
        try {
            const data = await bookService.getCopies(book.id);
            setCopies(data);
        } catch {
            setCopies([]);
        } finally {
            setCopiesLoading(false);
        }
    };

    const handleAddCopy = async () => {
        setSaving(true);
        setFormError(null);
        try {
            await bookService.addCopy({ ...copyForm, bookId: copiesBook.id });
            setCopyForm(emptyCopyForm);
            setAddCopyMode(false);
            const data = await bookService.getCopies(copiesBook.id);
            setCopies(data);
        } catch {
            setFormError("Failed to add copy.");
        } finally {
            setSaving(false);
        }
    };

    const handleCopyStatusChange = async (copyId, status) => {
        try {
            await bookService.updateCopyStatus(copyId, status);
            const data = await bookService.getCopies(copiesBook.id);
            setCopies(data);
        } catch {
            // silent
        }
    };

    const toggleAuthor = (id) => {
        setForm((prev) => ({
            ...prev,
            authorIds: prev.authorIds.includes(id)
                ? prev.authorIds.filter((a) => a !== id)
                : [...prev.authorIds, id],
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadBooks(search);
    };

    const columns = [
        { key: "id", label: "ID" },
        { key: "title", label: "Title" },
        { key: "isbn", label: "ISBN" },
        {
            key: "authors",
            label: "Authors",
            render: (row) =>
                row.authors?.map((a) => a.name).join(", ") || "—",
        },
        {
            key: "category",
            label: "Category",
            render: (row) => row.category?.name ?? "—",
        },
        { key: "publicationYear", label: "Year" },
        {
            key: "copies",
            label: "Copies",
            render: (row) => (
                <span className="text-gray-600">
                    <span className="font-semibold text-green-600">{row.availableCopies}</span>
                    {" / "}
                    {row.totalCopies} available
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex flex-wrap gap-1.5">
                    {/* <button
                        onClick={() => openCopies(row)}
                        className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                    >
                        Copies
                    </button> */}
                    {canWrite && (
                        <>
                            {/* <button onClick={() => openEdit(row)} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100">Edit</button> */}
                            <button onClick={() => setDeleteBook(row)} className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Delete</button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Books</h2>
                    <p className="mt-1 text-sm text-gray-500">Manage the library catalog</p>
                </div>
                {canWrite && (
                    <button onClick={openCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                        + Add Book
                    </button>
                )}
            </div>

            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <input
                    className="w-72 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Search by title…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">Search</button>
                {search && (
                    <button type="button" onClick={() => { setSearch(""); loadBooks(""); }} className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Clear</button>
                )}
                {/* Sort By */}
                <select
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(0);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                    <option value="title">Title</option>
                    <option value="isbn">ISBN</option>
                    <option value="category">Category</option>
                </select>
            </form>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <Table columns={columns} data={books} loading={loading} emptyMessage="No books in the catalog." onRowClick={openEdit} />


            {/* Create / Edit Book Modal */}
            {modalMode && (
                <Modal
                    title={modalMode === "create" ? "Add Book" : "Edit Book"}
                    // onClose={() => setModalMode(null)}
                    onClose={closeBookModal}

                >
                    <div className="max-h-[70vh] space-y-3  overflow-y-auto pr-1 ">
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Title *</label>
                            <input className={inputCls} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">ISBN *</label>
                            <input className={inputCls} value={form.isbn} onChange={(e) => setForm((p) => ({ ...p, isbn: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">Publication Year</label>
                                <input className={inputCls} type="number" value={form.publicationYear} onChange={(e) => setForm((p) => ({ ...p, publicationYear: e.target.value }))} />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">Language</label>
                                <input className={inputCls} value={form.language} onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Category</label>
                            <select className={inputCls} value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}>
                                <option value="">— Select category —</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Publisher *
                            </label>

                            <select
                                className={inputCls}
                                value={form.publisherId}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        publisherId: e.target.value,
                                    }))
                                }
                            >
                                <option value="">— Select publisher —</option>

                                {publishers.map((publisher) => (
                                    <option key={publisher.id} value={publisher.id}>
                                        {publisher.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Authors *</label>
                            <div className="max-h-36 overflow-y-auto rounded-lg border border-gray-200 p-2 space-y-1">
                                {authors.map((a) => (
                                    <label key={a.id} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-50 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.authorIds.includes(a.id)}
                                            onChange={() => toggleAuthor(a.id)}
                                            className="accent-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">{a.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div> */}
                        <div className="relative">
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Authors *
                            </label>

                            <button
                                type="button"
                                onClick={() => setAuthorDropdownOpen((prev) => !prev)}
                                className={`${inputCls} flex items-center justify-between text-left`}
                            >
                                <span className={form.authorIds.length === 0 ? "text-gray-400" : "text-gray-800"}>
                                    {form.authorIds.length === 0
                                        ? "Select authors..."
                                        : `${form.authorIds.length} author${form.authorIds.length > 1 ? "s" : ""} selected`}
                                </span>

                                <span className="text-gray-400">
                                    {authorDropdownOpen ? "▲" : "▼"}
                                </span>
                            </button>

                            {authorDropdownOpen && (
                                <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                                    <div className="max-h-56 overflow-y-auto p-2">
                                        {authors.length === 0 ? (
                                            <p className="px-2 py-2 text-sm text-gray-400">
                                                No authors available.
                                            </p>
                                        ) : (
                                            authors.map((author) => {
                                                const selected = form.authorIds.includes(author.id);

                                                return (
                                                    <label
                                                        key={author.id}
                                                        className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-gray-50"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            onChange={() => toggleAuthor(author.id)}
                                                            className="h-4 w-4 accent-blue-600"
                                                        />

                                                        <span className="text-sm text-gray-700">
                                                            {author.name}
                                                        </span>
                                                    </label>
                                                );
                                            })
                                        )}
                                    </div>

                                    {form.authorIds.length > 0 && (
                                        <div className="border-t border-gray-100 px-3 py-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        authorIds: [],
                                                    }))
                                                }
                                                className="text-xs font-medium text-red-600 hover:text-red-700"
                                            >
                                                Clear selection
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                            <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                        </div>
                        {modalMode === "edit" && (
                            <div className="border-t border-gray-200 pt-5">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-800">
                                            Book Copies
                                        </h3>

                                        <p className="mt-0.5 text-xs text-gray-500">
                                            Manage physical copies of this book.
                                        </p>
                                    </div>

                                    {canWrite && !addCopyMode && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAddCopyMode(true);
                                                setFormError(null);
                                                setCopyForm(emptyCopyForm);
                                            }}
                                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                                        >
                                            + Add Copy
                                        </button>
                                    )}
                                </div>

                                {/* Copies List */}
                                {copiesLoading ? (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                                        <p className="text-sm text-gray-400">
                                            Loading copies...
                                        </p>
                                    </div>
                                ) : copies.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                                        <p className="text-sm font-medium text-gray-600">
                                            No copies available
                                        </p>

                                        <p className="mt-1 text-xs text-gray-400">
                                            Add a physical copy to this book.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-2">
                                        {copies.map((copy) => (
                                            <div
                                                key={copy.id}
                                                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-700">
                                                        {copy.barcode}
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        {copy.shelfLocation || "No shelf location"}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Badge value={copy.status} />

                                                    {canWrite && (
                                                        <select
                                                            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 outline-none focus:border-blue-500"
                                                            value={copy.status}
                                                            onChange={(e) =>
                                                                handleCopyStatusChange(
                                                                    copy.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                        >
                                                            {COPY_STATUSES.map((status) => (
                                                                <option
                                                                    key={status}
                                                                    value={status}
                                                                >
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add Copy Form */}
                                {addCopyMode && (
                                    <div className="mt-4 space-y-3 rounded-lg border border-blue-100 bg-blue-50/40 p-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-800">
                                                Add New Copy
                                            </h4>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAddCopyMode(false);
                                                    setCopyForm(emptyCopyForm);
                                                }}
                                                className="text-xs font-medium text-gray-500 hover:text-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>

                                        {formError && (
                                            <p className="text-xs text-red-600">
                                                {formError}
                                            </p>
                                        )}

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Barcode *
                                            </label>

                                            <input
                                                className={inputCls}
                                                value={copyForm.barcode}
                                                onChange={(e) =>
                                                    setCopyForm((p) => ({
                                                        ...p,
                                                        barcode: e.target.value,
                                                    }))
                                                }
                                                placeholder="Enter barcode"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                                    Status
                                                </label>

                                                <select
                                                    className={inputCls}
                                                    value={copyForm.status}
                                                    onChange={(e) =>
                                                        setCopyForm((p) => ({
                                                            ...p,
                                                            status: e.target.value,
                                                        }))
                                                    }
                                                >
                                                    {COPY_STATUSES.map((status) => (
                                                        <option
                                                            key={status}
                                                            value={status}
                                                        >
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                                    Shelf Location
                                                </label>

                                                <input
                                                    className={inputCls}
                                                    value={copyForm.shelfLocation}
                                                    onChange={(e) =>
                                                        setCopyForm((p) => ({
                                                            ...p,
                                                            shelfLocation: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="e.g. A-12"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                                Purchase Date
                                            </label>

                                            <input
                                                className={inputCls}
                                                type="date"
                                                value={copyForm.purchaseDate}
                                                onChange={(e) =>
                                                    setCopyForm((p) => ({
                                                        ...p,
                                                        purchaseDate: e.target.value,
                                                    }))
                                                }
                                            />
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleAddCopy}
                                                disabled={saving}
                                                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {saving ? "Adding..." : "Add Copy"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                // onClick={() => setModalMode(null)} 
                                onClick={closeBookModal}

                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                                {saving ? "Saving…" : modalMode === "create" ? "Add Book" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Copies Modal */}
            {copiesBook && (
                <Modal title={`Copies — ${copiesBook.title}`} onClose={() => setCopiesBook(null)}>
                    <div className="space-y-4">
                        {copiesLoading ? (
                            <p className="text-center text-gray-400">Loading copies…</p>
                        ) : copies.length === 0 ? (
                            <p className="text-center text-gray-400">No copies yet.</p>
                        ) : (
                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {copies.map((copy) => (
                                    <div key={copy.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">{copy.barcode}</p>
                                            <p className="text-xs text-gray-500">{copy.shelfLocation || "No shelf"}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge value={copy.status} />
                                            {canWrite && (
                                                <select
                                                    className="rounded border border-gray-200 px-1 py-0.5 text-xs text-gray-600"
                                                    value={copy.status}
                                                    onChange={(e) => handleCopyStatusChange(copy.id, e.target.value)}
                                                >
                                                    {COPY_STATUSES.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {canWrite && (
                            <>
                                {!addCopyMode ? (
                                    <button
                                        onClick={() => { setAddCopyMode(true); setFormError(null); }}
                                        className="w-full rounded-lg border border-dashed border-blue-300 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                                    >
                                        + Add Copy
                                    </button>
                                ) : (
                                    <div className="space-y-3 rounded-lg border border-gray-200 p-3">
                                        {formError && <p className="text-xs text-red-600">{formError}</p>}
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">Barcode *</label>
                                            <input className={inputCls} value={copyForm.barcode} onChange={(e) => setCopyForm((p) => ({ ...p, barcode: e.target.value }))} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">Status</label>
                                                <select className={inputCls} value={copyForm.status} onChange={(e) => setCopyForm((p) => ({ ...p, status: e.target.value }))}>
                                                    {COPY_STATUSES.map((s) => <option key={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-gray-600">Shelf Location</label>
                                                <input className={inputCls} value={copyForm.shelfLocation} onChange={(e) => setCopyForm((p) => ({ ...p, shelfLocation: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-gray-600">Purchase Date</label>
                                            <input className={inputCls} type="date" value={copyForm.purchaseDate} onChange={(e) => setCopyForm((p) => ({ ...p, purchaseDate: e.target.value }))} />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setAddCopyMode(false)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">Cancel</button>
                                            <button onClick={handleAddCopy} disabled={saving} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                                                {saving ? "Adding…" : "Add Copy"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </>
                        )}
                    </div>
                </Modal>
            )}

            {deleteBook && (
                <ConfirmDialog
                    message={`Delete "${deleteBook.title}"? All copies will also be removed.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteBook(null)}
                    loading={saving}
                />
            )}
            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing page {page + 1} of {pagination.totalPages}
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
                        onClick={() => setPage((p) => p - 1)}
                        className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                    >
                        Previous
                    </button>

                    <span className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
                        {page + 1}
                    </span>

                    <button
                        disabled={page >= pagination.totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                        className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                    >
                        Next
                    </button>
                </div>
            </div>

        </div>

    );
};

export default Books;