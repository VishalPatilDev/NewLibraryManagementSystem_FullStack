import { useEffect, useMemo, useState } from "react";
import userService from "../services/userService";
import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog";
import Badge from "../components/comman/Badge";
import usePermission from "../hooks/usePermission";

const ROLES = ["ADMIN", "LIBRARIAN", "MEMBER"];

const emptyForm = {
    name: "",
    email: "",
    dateOfBirth: "",
    role: "MEMBER",
    active: true,
    currentPassword: "",
    newPassword: "",
};

const inputCls =
    "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100";

const actionBase =
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-1";

const Users = () => {
    const { isAdmin } = usePermission();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --------------------------------------------------
    // Modals
    // --------------------------------------------------

    const [editUser, setEditUser] = useState(null);
    const [deleteUser, setDeleteUser] = useState(null);
    const [roleUser, setRoleUser] = useState(null);
    const [statusUser, setStatusUser] = useState(null);
    const [passwordUser, setPasswordUser] = useState(null);

    // --------------------------------------------------
    // Form states
    // --------------------------------------------------

    const [editForm, setEditForm] = useState(emptyForm);
    const [roleValue, setRoleValue] = useState("");
    const [statusValue, setStatusValue] = useState(true);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
    });

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [showPasswordSection, setShowPasswordSection] = useState(false);


    // --------------------------------------------------
    // Load users
    // --------------------------------------------------

    const load = () => {
        setLoading(true);
        setError(null);

        userService
            .fetchAllUsers()
            .then(setUsers)
            .catch(() => setError("Failed to load users."))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    // --------------------------------------------------
    // Summary statistics
    // --------------------------------------------------

    const stats = useMemo(() => {
        const total = users.length;

        const active = users.filter(
            (user) => user.active
        ).length;

        const inactive = users.filter(
            (user) => !user.active
        ).length;

        const admins = users.filter(
            (user) => user.role === "ADMIN"
        ).length;

        const librarians = users.filter(
            (user) => user.role === "LIBRARIAN"
        ).length;

        const members = users.filter(
            (user) => user.role === "MEMBER"
        ).length;

        return {
            total,
            active,
            inactive,
            admins,
            librarians,
            members,
        };
    }, [users]);

    // --------------------------------------------------
    // Modal open handlers
    // --------------------------------------------------

    const openEdit = (user) => {
        setEditUser(user);

        setEditForm({
            name: user.name,
            email: user.email,
            dateOfBirth: user.dateOfBirth ?? "",
            role: user.role ?? "MEMBER",
            active: user.active ?? true,
            currentPassword: "",
            newPassword: "",
        });
    setShowPasswordSection(false);

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

        setPasswordForm({
            currentPassword: "",
            newPassword: "",
        });

        setFormError(null);
    };

    // --------------------------------------------------
    // Edit
    // --------------------------------------------------

    const handleEditSave = async () => {
        setSaving(true);
        setFormError(null);

        try {
            await userService.updateUserById(
                editUser.id,
                {
                    name: editForm.name,
                    email: editForm.email,
                    dateOfBirth: editForm.dateOfBirth,
                }
            );
            // Role
            if (editForm.role !== editUser.role) {
                await userService.updateUserRole(
                    editUser.id,
                    {
                        role: editForm.role,
                    }
                );
            }

            // Status
            if (editForm.active !== editUser.active) {
                await userService.updateUserStatus(
                    editUser.id,
                    {
                        active: editForm.active,
                    }
                );
            }

            // Password - only if entered
            if (
                editForm.currentPassword &&
                editForm.newPassword
            ) {
                await userService.changePassword(
                    editUser.id,
                    {
                        currentPassword:
                            editForm.currentPassword,
                        newPassword:
                            editForm.newPassword,
                    }
                );
            }

            setEditUser(null);
            load();
        } catch {
            setFormError(
                err?.response?.data?.message ||
                "Failed to update user.");
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Role
    // --------------------------------------------------

    const handleRoleSave = async () => {
        setSaving(true);
        setFormError(null);

        try {
            await userService.updateUserRole(
                roleUser.id,
                {
                    role: roleValue,
                }
            );

            setRoleUser(null);
            load();
        } catch {
            setFormError("Failed to update role.");
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Status
    // --------------------------------------------------

    const handleStatusSave = async () => {
        setSaving(true);
        setFormError(null);

        try {
            await userService.updateUserStatus(
                statusUser.id,
                {
                    active: statusValue,
                }
            );

            setStatusUser(null);
            load();
        } catch {
            setFormError("Failed to update status.");
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Password
    // --------------------------------------------------

    const handlePasswordSave = async () => {
        setSaving(true);
        setFormError(null);

        try {
            await userService.changePassword(
                passwordUser.id,
                passwordForm
            );

            setPasswordUser(null);
        } catch {
            setFormError("Failed to change password.");
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Delete
    // --------------------------------------------------

    const handleDelete = async () => {
        setSaving(true);
        setFormError(null);

        try {
            await userService.deleteUser(
                deleteUser.id
            );

            setDeleteUser(null);
            load();
        } catch {
            setFormError("Failed to delete user.");
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Table columns
    // --------------------------------------------------

    const columns = [
        {
            key: "id",
            label: "ID",
            render: (row) => (
                <span className="font-semibold text-slate-500">
                    #{row.id}
                </span>
            ),
        },

        {
            key: "name",
            label: "User",
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                        {row.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                            {row.name}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                            User #{row.id}
                        </p>
                    </div>
                </div>
            ),
        },

        {
            key: "email",
            label: "Email",
            render: (row) => (
                <span className="text-slate-600">
                    {row.email}
                </span>
            ),
        },

        {
            key: "dateOfBirth",
            label: "Date of Birth",
            render: (row) => (
                <span className="text-slate-500">
                    {row.dateOfBirth || "—"}
                </span>
            ),
        },

        {
            key: "role",
            label: "Role",
            render: (row) => (
                <Badge value={row.role} />
            ),
        },

        {
            key: "active",
            label: "Status",
            render: (row) => (
                <Badge
                    value={
                        row.active
                            ? "ACTIVE"
                            : "INACTIVE"
                    }
                />
            ),
        },

        {
            key: "createdAt",
            label: "Created",
            render: (row) =>
                row.createdAt
                    ? new Date(
                        row.createdAt.replace(
                            " ",
                            "T"
                        )
                    ).toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        }
                    )
                    : "—",
        },

        {
            key: "actions",
            label: "Actions",

            render: (row) => (
                <div className="flex min-w-[280px] flex-wrap gap-1.5">


                    {isAdmin && (
                        <>

                            <button
                                onClick={() =>
                                    setDeleteUser(
                                        row
                                    )
                                }
                                className={`${actionBase} bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500`}
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div className="min-h-full bg-slate-50/40">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                                <svg
                                    className="h-6 w-6"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle
                                        cx="9"
                                        cy="7"
                                        r="4"
                                    />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    Users
                                </h1>

                                <p className="mt-0.5 text-sm text-slate-500">
                                    Manage school library staff
                                    and member accounts
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
                SUMMARY CARDS
            ================================================= */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {/* Total */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Total Users
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {stats.total}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Registered accounts
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle
                                    cx="9"
                                    cy="7"
                                    r="4"
                                />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Active */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Active Users
                            </p>

                            <p className="mt-2 text-3xl font-bold text-emerald-600">
                                {stats.active}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Currently active
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_5px_rgba(16,185,129,0.12)]" />
                        </div>
                    </div>
                </div>

                {/* Inactive */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Inactive Users
                            </p>

                            <p className="mt-2 text-3xl font-bold text-red-500">
                                {stats.inactive}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Require attention
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                />
                                <path d="M15 9l-6 6" />
                                <path d="M9 9l6 6" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Roles */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                User Roles
                            </p>

                            <p className="mt-2 text-3xl font-bold text-violet-600">
                                {ROLES.length}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Admin · Librarian · Member
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path d="M12 2l3 6 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.9 3 1.1-6.5-4.7-4.6L9 8z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
                ROLE DISTRIBUTION
            ================================================= */}

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                    <h3 className="font-semibold text-slate-900">
                        User Distribution
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                        Overview of accounts by role
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Admin */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-red-500" />

                                <span className="text-sm font-semibold text-slate-700">
                                    Administrators
                                </span>
                            </div>

                            <span className="text-lg font-bold text-slate-900">
                                {stats.admins}
                            </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-red-500 transition-all"
                                style={{
                                    width: `${stats.total
                                        ? (stats.admins /
                                            stats.total) *
                                        100
                                        : 0
                                        }%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Librarian */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-violet-500" />

                                <span className="text-sm font-semibold text-slate-700">
                                    Librarians
                                </span>
                            </div>

                            <span className="text-lg font-bold text-slate-900">
                                {stats.librarians}
                            </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-violet-500 transition-all"
                                style={{
                                    width: `${stats.total
                                        ? (stats.librarians /
                                            stats.total) *
                                        100
                                        : 0
                                        }%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Members */}
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-blue-500" />

                                <span className="text-sm font-semibold text-slate-700">
                                    Members
                                </span>
                            </div>

                            <span className="text-lg font-bold text-slate-900">
                                {stats.members}
                            </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-blue-500 transition-all"
                                style={{
                                    width: `${stats.total
                                        ? (stats.members /
                                            stats.total) *
                                        100
                                        : 0
                                        }%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
                MAIN USERS SECTION
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Table Header */}
                <div className="border-b border-slate-100 px-5 py-5">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-semibold text-slate-900">
                                All Users
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                                Manage accounts, roles and
                                access status
                            </p>
                        </div>

                        <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                            {users.length} users loaded
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mx-5 mt-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                            !
                        </div>

                        <div>
                            <p className="font-semibold">
                                Unable to load users
                            </p>

                            <p className="mt-0.5 text-xs text-red-600">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <div className="min-w-[1100px] p-1">
                        <Table
                            columns={columns}
                            data={users}
                            loading={loading}
                            emptyMessage="No users found."
                            onRowClick={openEdit}
                        />
                    </div>
                </div>

                {/* =================================================
                    PAGINATION
                    Kept compatible with the existing page.
                ================================================= */}

                <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500">
                            Showing{" "}
                            <span className="font-semibold text-slate-700">
                                {users.length}
                            </span>{" "}
                            users
                        </p>

                        <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 hidden text-xs text-slate-400 sm:inline">
                                Rows per page
                            </span>

                            <select
                                defaultValue="10"
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            >
                                <option value="5">
                                    5
                                </option>
                                <option value="10">
                                    10
                                </option>
                                <option value="20">
                                    20
                                </option>
                                <option value="50">
                                    50
                                </option>
                            </select>

                            <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                disabled
                            >
                                ←
                                <span className="hidden sm:inline">
                                    Previous
                                </span>
                            </button>

                            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-bold text-white shadow-sm shadow-blue-600/20">
                                1
                            </span>

                            <button
                                type="button"
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                                <span className="hidden sm:inline">
                                    Next
                                </span>
                                →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
                EDIT USER MODAL
            ================================================= */}

            {editUser && (
                <Modal
                    title="Edit User"
                    onClose={() =>
                        setEditUser(null)
                    }
                >
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                                {editUser.name
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                            </div>

                            <div>
                                <p className="font-semibold text-slate-800">
                                    {editUser.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                    User #{editUser.id}
                                </p>
                            </div>
                        </div>

                        {formError && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Full Name
                            </label>

                            <input
                                className={inputCls}
                                value={
                                    editForm.name
                                }
                                onChange={(e) =>
                                    setEditForm(
                                        (p) => ({
                                            ...p,
                                            name: e
                                                .target
                                                .value,
                                        })
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Email Address
                            </label>

                            <input
                                className={inputCls}
                                type="email"
                                value={
                                    editForm.email
                                }
                                onChange={(e) =>
                                    setEditForm(
                                        (p) => ({
                                            ...p,
                                            email: e
                                                .target
                                                .value,
                                        })
                                    )
                                }
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Date of Birth
                            </label>

                            <input
                                className={inputCls}
                                type="date"
                                value={
                                    editForm.dateOfBirth
                                }
                                onChange={(e) =>
                                    setEditForm(
                                        (p) => ({
                                            ...p,
                                            dateOfBirth:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Role */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-600">
                                    Role
                                </label>

                                <select
                                    className={inputCls}
                                    value={editForm.role}
                                    onChange={(e) =>
                                        setEditForm((p) => ({
                                            ...p,
                                            role: e.target.value,
                                        }))
                                    }
                                >
                                    {ROLES.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-slate-600">
                                    Account Status
                                </label>

                                <select
                                    className={inputCls}
                                    value={editForm.active ? "true" : "false"}
                                    onChange={(e) =>
                                        setEditForm((p) => ({
                                            ...p,
                                            active: e.target.value === "true",
                                        }))
                                    }
                                >
                                    <option value="true">
                                        Active
                                    </option>

                                    <option value="false">
                                        Inactive
                                    </option>
                                </select>
                            </div>
                        </div>
                        {/* Change Password Toggle */}
<div className="border-t border-slate-100 pt-4">
    <button
        type="button"
        onClick={() =>
            setShowPasswordSection((prev) => !prev)
        }
        className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
    >
        {showPasswordSection
            ? "− Hide Change Password"
            : "+ Change Password"}
    </button>
</div>

{/* Password Section */}
{showPasswordSection && (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        <h3 className="mb-1 text-sm font-semibold text-slate-800">
            Change Password
        </h3>

        <p className="mb-4 text-xs text-slate-500">
            Enter the current password and the new password.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
            <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                    Current Password
                </label>

                <input
                    className={inputCls}
                    type="password"
                    value={editForm.currentPassword}
                    onChange={(e) =>
                        setEditForm((p) => ({
                            ...p,
                            currentPassword: e.target.value,
                        }))
                    }
                    placeholder="Current password"
                />
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                    New Password
                </label>

                <input
                    className={inputCls}
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) =>
                        setEditForm((p) => ({
                            ...p,
                            newPassword: e.target.value,
                        }))
                    }
                    placeholder="New password"
                />
            </div>
        </div>
    </div>
)}

{/* Actions */}
<div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
    <button
        onClick={() => setEditUser(null)}
        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
    >
        Cancel
    </button>

    <button
        onClick={handleEditSave}
        disabled={saving}
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
    >
        {saving ? "Saving..." : "Save Changes"}
    </button>
</div>


                        
                    </div>
                </Modal>
            )}

            {/* =================================================
                ROLE MODAL
            ================================================= */}

            {roleUser && (
                <Modal
                    title={`Change Role`}
                    onClose={() =>
                        setRoleUser(null)
                    }
                >
                    <div className="space-y-5">
                        <div className="rounded-xl bg-violet-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">
                                User
                            </p>

                            <p className="mt-1 font-semibold text-violet-900">
                                {roleUser.name}
                            </p>

                            <p className="mt-0.5 text-xs text-violet-600">
                                {roleUser.email}
                            </p>
                        </div>

                        {formError && (
                            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Select Role
                            </label>

                            <select
                                className={inputCls}
                                value={
                                    roleValue
                                }
                                onChange={(e) =>
                                    setRoleValue(
                                        e.target.value
                                    )
                                }
                            >
                                {ROLES.map(
                                    (role) => (
                                        <option
                                            key={
                                                role
                                            }
                                            value={
                                                role
                                            }
                                        >
                                            {role}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                onClick={() =>
                                    setRoleUser(
                                        null
                                    )
                                }
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleRoleSave
                                }
                                disabled={saving}
                                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                            >
                                {saving
                                    ? "Updating..."
                                    : "Update Role"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* =================================================
                STATUS MODAL
            ================================================= */}

            {statusUser && (
                <Modal
                    title="Change Account Status"
                    onClose={() =>
                        setStatusUser(null)
                    }
                >
                    <div className="space-y-5">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-800">
                                {statusUser.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                {statusUser.email}
                            </p>

                            <div className="mt-3">
                                <Badge
                                    value={
                                        statusUser.active
                                            ? "ACTIVE"
                                            : "INACTIVE"
                                    }
                                />
                            </div>
                        </div>

                        {formError && (
                            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Account Status
                            </label>

                            <select
                                className={inputCls}
                                value={
                                    statusValue
                                        ? "true"
                                        : "false"
                                }
                                onChange={(e) =>
                                    setStatusValue(
                                        e.target
                                            .value ===
                                        "true"
                                    )
                                }
                            >
                                <option value="true">
                                    Active
                                </option>

                                <option value="false">
                                    Inactive
                                </option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                onClick={() =>
                                    setStatusUser(
                                        null
                                    )
                                }
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleStatusSave
                                }
                                disabled={saving}
                                className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                            >
                                {saving
                                    ? "Updating..."
                                    : "Update Status"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* =================================================
                PASSWORD MODAL
            ================================================= */}

            {passwordUser && (
                <Modal
                    title="Change Password"
                    onClose={() =>
                        setPasswordUser(null)
                    }
                >
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 font-bold text-white">
                                {passwordUser.name
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                            </div>

                            <div>
                                <p className="font-semibold text-slate-800">
                                    {passwordUser.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {passwordUser.email}
                                </p>
                            </div>
                        </div>

                        {formError && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                Current Password
                            </label>

                            <input
                                className={inputCls}
                                type="password"
                                value={
                                    passwordForm.currentPassword
                                }
                                onChange={(e) =>
                                    setPasswordForm(
                                        (p) => ({
                                            ...p,
                                            currentPassword:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                                placeholder="Enter current password"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-semibold text-slate-600">
                                New Password
                            </label>

                            <input
                                className={inputCls}
                                type="password"
                                value={
                                    passwordForm.newPassword
                                }
                                onChange={(e) =>
                                    setPasswordForm(
                                        (p) => ({
                                            ...p,
                                            newPassword:
                                                e
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                                placeholder="Enter new password"
                            />
                        </div>

                        <div className="rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-700">
                            Use a strong password containing
                            a combination of letters, numbers
                            and special characters.
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                onClick={() =>
                                    setPasswordUser(
                                        null
                                    )
                                }
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handlePasswordSave
                                }
                                disabled={saving}
                                className="rounded-xl bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                                {saving
                                    ? "Changing..."
                                    : "Change Password"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* =================================================
                DELETE CONFIRM
            ================================================= */}

            {deleteUser && (
                <ConfirmDialog
                    message={`Are you sure you want to delete "${deleteUser.name}"? This action cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() =>
                        setDeleteUser(null)
                    }
                    loading={saving}
                />
            )}
        </div>
    );
};

export default Users;
