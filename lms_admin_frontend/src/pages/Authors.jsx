import { useEffect, useState } from "react";
import authorService from "../services/authorService";
import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog"
import usePermission from "../hooks/usePermission";

const emptyForm = { name: "", biography: "", nationality: "" };

const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

const Authors = () => {
    const { hasPermission } = usePermission();
    const canWrite = hasPermission("AUTHOR_CREATE");

    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const [modalMode, setModalMode] = useState(null); // "create" | "edit"
    const [activeAuthor, setActiveAuthor] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [deleteAuthor, setDeleteAuthor] = useState(null);

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    // Pagination
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(5);
    const [sortBy, setSortBy] = useState("name");

    const [pagination, setPagination] = useState({
        totalElements: 0,
        totalPages: 0,
    });



    const load = (q = search) => {
        setLoading(true);
        const params = {
            page,
            size,
            sortBy,
        };

        const call = q
            ? authorService.search({
                name: q,
                ...params
            })
            : authorService.getAll(params);
        call
            .then((data) => {
                setAuthors(data.content ?? []);

                setPagination({
                    totalElements: data.totalElements ?? 0,
                    totalPages: data.totalPages ?? 0,
                });
            })
            .catch(() => {
                setError("Failed to load authors.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => { load(search); }, [search, page, size, sortBy]);

    const openCreate = () => {
        setForm(emptyForm);
        setFormError(null);
        setModalMode("create");
    };

    const openEdit = (author) => {
        setActiveAuthor(author);
        setForm({ name: author.name, biography: author.biography ?? "", nationality: author.nationality ?? "" });
        setFormError(null);
        setModalMode("edit");
    };

    const handleSave = async () => {
        setSaving(true);
        setFormError(null);
        try {
            if (modalMode === "create") {
                await authorService.create(form);
            } else {
                await authorService.update(activeAuthor.id, form);
            }
            setModalMode(null);
            load(search);
        } catch {
            setFormError("Failed to save author.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await authorService.remove(deleteAuthor.id);
            setDeleteAuthor(null);
            load(search);
        } catch {
            setFormError("Failed to delete author.");
        } finally {
            setSaving(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        load(search);
    };

    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "nationality", label: "Nationality" },
        {
            key: "biography",
            label: "Biography",
            render: (row) => (
                <span className="block max-w-xs truncate text-gray-500">
                    {row.biography || "—"}
                </span>
            ),
        },
        {
            key: "createdAt",
            label: "Created",
            render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—",
        },
        ...(canWrite ? [{
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex gap-1.5">
                    {/* <button
                        onClick={() => openEdit(row)}
                        className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                    >
                        Edit
                    </button> */}
                    <button
                        onClick={() => setDeleteAuthor(row)}
                        className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                        Delete
                    </button>
                </div>
            ),
        }] : []),
    ];

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Authors</h2>
                    <p className="mt-1 text-sm text-gray-500">Browse and manage book authors</p>
                </div>
                {canWrite && (
                    <button
                        onClick={openCreate}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        + Add Author
                    </button>
                )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-4 flex gap-2">
                <input
                    className="w-64 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Search by name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
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
                        onClick={() => { setSearch(""); load(""); }}
                        className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                        Clear
                    </button>
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
                    <option value="name">Name</option>
                    <option value="nationality">Nationality</option>
                    <option value="createdAt">Created Date</option>
                </select>
            </form>



            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <Table columns={columns} data={authors} loading={loading} emptyMessage="No authors found." onRowClick={openEdit} />

            {/* Create / Edit Modal */}
            {modalMode && (
                <Modal
                    title={modalMode === "create" ? "Add Author" : "Edit Author"}
                    onClose={() => setModalMode(null)}
                >
                    <div className="space-y-3">
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Name *</label>
                            <input
                                className={inputCls}
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Nationality</label>
                            <input
                                className={inputCls}
                                value={form.nationality}
                                onChange={(e) => setForm((p) => ({ ...p, nationality: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Biography</label>
                            <textarea
                                className={`${inputCls} resize-none`}
                                rows={4}
                                value={form.biography}
                                onChange={(e) => setForm((p) => ({ ...p, biography: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setModalMode(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                                {saving ? "Saving…" : modalMode === "create" ? "Add Author" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {deleteAuthor && (
                <ConfirmDialog
                    message={`Delete author "${deleteAuthor.name}"? This cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteAuthor(null)}
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

export default Authors;