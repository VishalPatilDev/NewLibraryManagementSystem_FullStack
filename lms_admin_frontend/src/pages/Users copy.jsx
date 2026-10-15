import { useEffect, useState } from "react";
import userService from "../services/userService";
import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog";
import Badge from "../components/comman/Badge";
import usePermission from "../hooks/usePermission";

const ROLES = ["ADMIN", "LIBRARIAN", "MEMBER"];

const emptyForm = { name: "", email: "", dateOfBirth: "" };

const Users = () => {
    const { isAdmin } = usePermission();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modals
    const [editUser, setEditUser] = useState(null);
    const [deleteUser, setDeleteUser] = useState(null);
    const [roleUser, setRoleUser] = useState(null);
    const [statusUser, setStatusUser] = useState(null);
    const [passwordUser, setPasswordUser] = useState(null);

    // Form states
    const [editForm, setEditForm] = useState(emptyForm);
    const [roleValue, setRoleValue] = useState("");
    const [statusValue, setStatusValue] = useState(true);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const load = () => {
        setLoading(true);
        userService
            .fetchAllUsers()
            .then(setUsers)
            .catch(() => setError("Failed to load users."))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const openEdit = (user) => {
        setEditUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            dateOfBirth: user.dateOfBirth ?? "",
        });
        setFormError(null);
    };

    const openRole = (user) => {
        setRoleUser(user);
        setRoleValue(user.role);
        setFormError(null);
    };

    const openStatus = (user) => {
        setStatusUser(user);
        setStatusValue(user.active);
        setFormError(null);
    };

    const openPassword = (user) => {
        setPasswordUser(user);
        setPasswordForm({ currentPassword: "", newPassword: "" });
        setFormError(null);
    };

    const handleEditSave = async () => {
        setSaving(true);
        setFormError(null);
        try {
            await userService.updateUserById(editUser.id, editForm);
            setEditUser(null);
            load();
        } catch {
            setFormError("Failed to update user.");
        } finally {
            setSaving(false);
        }
    };

    const handleRoleSave = async () => {
        setSaving(true);
        setFormError(null);
        try {
            await userService.updateUserRole(roleUser.id, { role: roleValue });
            setRoleUser(null);
            load();
        } catch {
            setFormError("Failed to update role.");
        } finally {
            setSaving(false);
        }
    };

    const handleStatusSave = async () => {
        setSaving(true);
        setFormError(null);
        try {
            await userService.updateUserStatus(statusUser.id, { active: statusValue });
            setStatusUser(null);
            load();
        } catch {
            setFormError("Failed to update status.");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        setSaving(true);
        setFormError(null);
        try {
            await userService.changePassword(passwordUser.id, passwordForm);
            setPasswordUser(null);
        } catch {
            setFormError("Failed to change password.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        setSaving(true);
        try {
            await userService.deleteUser(deleteUser.id);
            setDeleteUser(null);
            load();
        } catch {
            setFormError("Failed to delete user.");
        } finally {
            setSaving(false);
        }
    };

    const inputCls =
        "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "dateOfBirth", label: "DOB" },
        {
            key: "role",
            label: "Role",
            render: (row) => <Badge value={row.role} />,
        },
        {
            key: "active",
            label: "Status",
            render: (row) => <Badge value={row.active ? "ACTIVE" : "INACTIVE"} />,
        },
        {
            key: "createdAt",
            label: "Created",
            render: (row) => {
                console.log("createdAt:", row.createdAt, typeof row.createdAt);
                return row.createdAt
                    ? new Date(row.createdAt.replace(" ", "T")).toLocaleDateString("en-IN")
                    : "—";
            },

        },

        {
            key: "actions",
            label: "Actions",
            render: (row) => (
                <div className="flex flex-wrap gap-1.5">
                    <button
                        onClick={() => openEdit(row)}
                        className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                    >
                        Edit
                    </button>
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => openRole(row)}
                                className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-600 hover:bg-purple-100"
                            >
                                Role
                            </button>
                            <button
                                onClick={() => openStatus(row)}
                                className="rounded-md bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-100"
                            >
                                Status
                            </button>
                            <button
                                onClick={() => openPassword(row)}
                                className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                            >
                                Password
                            </button>
                            <button
                                onClick={() => setDeleteUser(row)}
                                className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Users</h2>
                <p className="mt-1 text-sm text-gray-500">Manage library staff and members</p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <Table columns={columns} data={users} loading={loading} emptyMessage="No users found." />

            {/* Edit Modal */}
            {editUser && (
                <Modal title="Edit User" onClose={() => setEditUser(null)}>
                    <div className="space-y-3">
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Name</label>
                            <input
                                className={inputCls}
                                value={editForm.name}
                                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Email</label>
                            <input
                                className={inputCls}
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Date of Birth</label>
                            <input
                                className={inputCls}
                                type="date"
                                value={editForm.dateOfBirth}
                                onChange={(e) => setEditForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setEditUser(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Role Modal */}
            {roleUser && (
                <Modal title={`Change Role — ${roleUser.name}`} onClose={() => setRoleUser(null)}>
                    <div className="space-y-4">
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <select
                            className={inputCls}
                            value={roleValue}
                            onChange={(e) => setRoleValue(e.target.value)}
                        >
                            {ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setRoleUser(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleRoleSave} disabled={saving} className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">
                                {saving ? "Saving…" : "Update Role"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Status Modal */}
            {statusUser && (
                <Modal title={`Change Status — ${statusUser.name}`} onClose={() => setStatusUser(null)}>
                    <div className="space-y-4">
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <select
                            className={inputCls}
                            value={statusValue ? "true" : "false"}
                            onChange={(e) => setStatusValue(e.target.value === "true")}
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setStatusUser(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleStatusSave} disabled={saving} className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600 disabled:opacity-50">
                                {saving ? "Saving…" : "Update Status"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Password Modal */}
            {passwordUser && (
                <Modal title={`Change Password — ${passwordUser.name}`} onClose={() => setPasswordUser(null)}>
                    <div className="space-y-3">
                        {formError && <p className="text-sm text-red-600">{formError}</p>}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">Current Password</label>
                            <input
                                className={inputCls}
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">New Password</label>
                            <input
                                className={inputCls}
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setPasswordUser(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handlePasswordSave} disabled={saving} className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50">
                                {saving ? "Saving…" : "Change Password"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirm */}
            {deleteUser && (
                <ConfirmDialog
                    message={`Are you sure you want to delete "${deleteUser.name}"? This action cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteUser(null)}
                    loading={saving}
                />
            )}
        </div>
    );
};

export default Users;