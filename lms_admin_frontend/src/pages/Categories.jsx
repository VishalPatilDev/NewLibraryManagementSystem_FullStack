import { useEffect, useState } from "react";
import categoryService from "../services/categoryService";
import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog";
import usePermission from "../hooks/usePermission";

const emptyForm = { name: "", description: "" };

const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

const Categories = () => {
    const { hasPermission } = usePermission();
    const canWrite = hasPermission("CATEGORY_CREATE");

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalMode, setModalMode] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [deleteCategory, setDeleteCategory] = useState(null);

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

    const load = () => {
        setLoading(true);
        const params = {
            page,
            size,
            sortBy
        }
        categoryService
            .getAll(params)
            .then((data) => {
                console.log("Categories : " + data)
                setCategories(data ?? [])
                setPagination({
                    totalElements: data.totalElements ?? 0,
                    totalPages: data.totalPages ?? 0,
                });
            })
            .catch(() => setError("Failed to load categories."))
            .finally(() => setLoading(false));
    };

    useEffect(load, [page,size,sortBy]);

    const openCreate = () => {
        setForm(emptyForm);
        setFormError(null);
        setModalMode("create");
    };

    const openEdit = (cat) => {
        setActiveCategory(cat);
        setForm({ name: cat.name, description: cat.description ?? "" });
        setFormError(null);
        setModalMode("edit");
    };

    const handleSave = async () => {
        setSaving(true);
        setFormError(null);
        try {
            if (modalMode === "create") {
                await categoryService.create(form);
            } else {
                await categoryService.update(activeCategory.id, form);
            }
            setModalMode(null);
            load();
        } catch {
            setFormError("Failed to save category.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await categoryService.remove(deleteCategory.id);
            setDeleteCategory(null);
            load();
        } catch {
            setFormError("Failed to delete category.");
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        {
            key: "description",
            label: "Description",
            render: (row) => (
                <span className="block max-w-xs truncate text-gray-500">
                    {row.description || "—"}
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
                    {/* <button onClick={() => openEdit(row)} className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100">Edit</button> */}
                    <button onClick={() => setDeleteCategory(row)} className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100">Delete</button>
                </div>
            ),
        }] : []),
    ];

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
                    <p className="mt-1 text-sm text-gray-500">Organise books by category</p>
                </div>
                {canWrite && (
                    <button onClick={openCreate} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                        + Add Category
                    </button>
                )}
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            <Table columns={columns} data={categories} loading={loading} emptyMessage="No categories yet." onRowClick={openEdit} />

            {modalMode && (
                <Modal
                    title={modalMode === "create" ? "Add Category" : "Edit Category"}
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
                            <label className="mb-1 block text-xs font-medium text-gray-600">Description</label>
                            <textarea
                                className={`${inputCls} resize-none`}
                                rows={3}
                                value={form.description}
                                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setModalMode(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                                {saving ? "Saving…" : modalMode === "create" ? "Add Category" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {deleteCategory && (
                <ConfirmDialog
                    message={`Delete category "${deleteCategory.name}"? Books in this category may be affected.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteCategory(null)}
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

export default Categories;