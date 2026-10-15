import { useEffect, useMemo, useState } from "react";
import useApi from "../hooks/useApi";
import userService from "../services/userService";
import Badge from "../components/comman/Badge";

const inputCls =
    "w-full rounded-xl border border-stone-300 bg-[#fffdf8] px-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-[#80613b] focus:ring-2 focus:ring-[#80613b]/10";

const roleConfig = {
    MEMBER: {
        label: "Library Member",
        description:
            "Your personal library account and borrowing profile",
        icon: "📚",
        color: "emerald",
        accent: "bg-emerald-700",
        soft: "bg-emerald-50",
        text: "text-emerald-800",
        border: "border-emerald-200",
    },

    LIBRARIAN: {
        label: "Librarian",
        description:
            "Library staff account for managing books and members",
        icon: "📖",
        color: "amber",
        accent: "bg-[#80613b]",
        soft: "bg-amber-50",
        text: "text-amber-900",
        border: "border-amber-200",
    },

    ADMIN: {
        label: "Library Administrator",
        description:
            "Administrative account with library system management access",
        icon: "🏛️",
        color: "purple",
        accent: "bg-purple-800",
        soft: "bg-purple-50",
        text: "text-purple-900",
        border: "border-purple-200",
    },
};

const Profile = () => {
    const { currentUser, fetchCurrentUser } = useApi();

    const [editMode, setEditMode] = useState(false);
    const [pwMode, setPwMode] = useState(false);

    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        dateOfBirth: "",
    });

    const [pwForm, setPwForm] = useState({
        currentPassword: "",
        newPassword: "",
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    /*
     * Keep the edit form synchronized when currentUser
     * is loaded asynchronously.
     */
    useEffect(() => {
        if (!currentUser) return;

        setEditForm({
            name: currentUser.name ?? "",
            email: currentUser.email ?? "",
            dateOfBirth: currentUser.dateOfBirth ?? "",
        });
    }, [currentUser]);

    const role = String(currentUser?.role ?? "MEMBER").toUpperCase();

    const roleInfo =
        roleConfig[role] ?? roleConfig.MEMBER;

    const isMember = role === "MEMBER";
    const isLibrarian = role === "LIBRARIAN";
    const isAdmin = role === "ADMIN";

    const avatar = useMemo(() => {
        return (
            currentUser?.name
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() ?? "?"
        );
    }, [currentUser?.name]);

    const memberSince = currentUser?.createdAt
        ? new Date(currentUser.createdAt).toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        )
        : "—";

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const handleEditSave = async () => {
        setSaving(true);
        clearMessages();

        try {
            await userService.updateCurrentUser(editForm);
            await fetchCurrentUser();

            setEditMode(false);
            setSuccess("Your library profile has been updated.");
        } catch (err) {
            console.error("PROFILE UPDATE ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to update your profile."
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSave = async () => {
        if (!pwForm.currentPassword || !pwForm.newPassword) {
            setError("Please enter both passwords.");
            return;
        }

        setSaving(true);
        clearMessages();

        try {
            await userService.changeCurrentUserPassword(pwForm);

            setPwMode(false);
            setPwForm({
                currentPassword: "",
                newPassword: "",
            });

            setSuccess("Your password has been changed successfully.");
        } catch (err) {
            console.error("PASSWORD CHANGE ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to change password. Check your current password."
            );
        } finally {
            setSaving(false);
        }
    };

    const openEdit = () => {
        setEditForm({
            name: currentUser?.name ?? "",
            email: currentUser?.email ?? "",
            dateOfBirth: currentUser?.dateOfBirth ?? "",
        });

        setEditMode(true);
        setPwMode(false);
        clearMessages();
    };

    const openPassword = () => {
        setPwMode((value) => !value);
        setEditMode(false);
        clearMessages();
    };

    if (!currentUser) {
        return (
            <div className="min-h-full bg-[#f7f3ea] p-6">
                <div className="mx-auto max-w-5xl">
                    <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0e7d8] text-3xl">
                            📚
                        </div>

                        <h2 className="text-lg font-bold text-stone-800">
                            Loading your library profile
                        </h2>

                        <p className="mt-1 text-sm text-stone-500">
                            Please wait while we retrieve your account details.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-[#f7f3ea] px-1 pb-12">
            <div className="mx-auto max-w-5xl">

                {/* Page Header */}
                <div className="mb-7">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#80613b]">
                        <span className="h-px w-7 bg-[#80613b]" />
                        School Library
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        My Library Profile
                    </h1>

                    <p className="mt-1 text-sm text-stone-500">
                        Manage your library account and personal information
                    </p>
                </div>

                {/* Notifications */}
                {success && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                        <span className="text-base">✓</span>
                        <span>{success}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <span className="text-base">!</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Library Identity Card */}
                <section className="relative mb-6 overflow-hidden rounded-2xl bg-[#4b3621] shadow-md">
                    {/* Decorative background */}
                    <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[28px] border-white/5" />
                    <div className="absolute -bottom-24 -left-10 h-48 w-48 rounded-full border-[20px] border-white/5" />

                    <div className="relative p-6 sm:p-7">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-5">
                                {/* Avatar */}
                                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-4 border-[#d9c09a] bg-[#f0e7d8] text-3xl font-bold text-[#5b4024] shadow-inner">
                                    {avatar}
                                </div>

                                <div className="min-w-0">
                                    <div className="mb-1 flex flex-wrap items-center gap-2">
                                        <h2 className="text-2xl font-bold text-white">
                                            {currentUser.name}
                                        </h2>

                                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-100">
                                            {roleInfo.label}
                                        </span>
                                    </div>

                                    <p className="truncate text-sm text-stone-300">
                                        {currentUser.email}
                                    </p>

                                    <p className="mt-2 max-w-lg text-xs leading-relaxed text-stone-400">
                                        {roleInfo.description}
                                    </p>
                                </div>
                            </div>

                            {/* Library role icon */}
                            <div className="hidden h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-3xl sm:flex">
                                {roleInfo.icon}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Role-specific information strip */}
                <section className="mb-6 grid gap-3 sm:grid-cols-3">

                    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                            Account Type
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${roleInfo.soft}`}>
                                {roleInfo.icon}
                            </span>

                            <span className={`text-sm font-semibold ${roleInfo.text}`}>
                                {roleInfo.label}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                            Member Since
                        </p>

                        <p className="mt-2 text-sm font-semibold text-stone-800">
                            {memberSince}
                        </p>
                    </div>

                    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                            Account Status
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-sm font-semibold text-emerald-700">
                                Active
                            </span>
                        </div>
                    </div>
                </section>

                {/* Main content */}
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

                    {/* Profile information */}
                    <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
                        <div className="border-b border-stone-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0e7d8]">
                                    👤
                                </div>

                                <div>
                                    <h3 className="font-bold text-stone-800">
                                        Personal Information
                                    </h3>

                                    <p className="text-xs text-stone-500">
                                        Details associated with your library account
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!editMode ? (
                            <div className="p-6">
                                <div className="divide-y divide-stone-100">

                                    <div className="flex items-center justify-between gap-5 py-4">
                                        <div>
                                            <p className="text-xs font-medium text-stone-400">
                                                Full Name
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-stone-800">
                                                {currentUser.name || "—"}
                                            </p>
                                        </div>

                                        <span className="text-lg">👤</span>
                                    </div>

                                    <div className="flex items-center justify-between gap-5 py-4">
                                        <div>
                                            <p className="text-xs font-medium text-stone-400">
                                                Email Address
                                            </p>
                                            <p className="mt-1 break-all text-sm font-semibold text-stone-800">
                                                {currentUser.email || "—"}
                                            </p>
                                        </div>

                                        <span className="text-lg">✉️</span>
                                    </div>

                                    <div className="flex items-center justify-between gap-5 py-4">
                                        <div>
                                            <p className="text-xs font-medium text-stone-400">
                                                Date of Birth
                                            </p>
                                            <p className="mt-1 text-sm font-semibold text-stone-800">
                                                {currentUser.dateOfBirth || "—"}
                                            </p>
                                        </div>

                                        <span className="text-lg">🎂</span>
                                    </div>

                                    <div className="flex items-center justify-between gap-5 py-4">
                                        <div>
                                            <p className="text-xs font-medium text-stone-400">
                                                Library Role
                                            </p>

                                            <div className="mt-1">
                                                <Badge value={currentUser.role} />
                                            </div>
                                        </div>

                                        <span className="text-lg">
                                            {roleInfo.icon}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-5 py-4">
                                        <div>
                                            <p className="text-xs font-medium text-stone-400">
                                                Account Created
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-stone-800">
                                                {memberSince}
                                            </p>
                                        </div>

                                        <span className="text-lg">📅</span>
                                    </div>
                                </div>

                                {/* Member-specific note */}
                                {isMember && (
                                    <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                        <div className="flex gap-3">
                                            <span className="text-lg">
                                                📚
                                            </span>

                                            <div>
                                                <p className="text-sm font-semibold text-emerald-900">
                                                    Welcome to the library
                                                </p>

                                                <p className="mt-1 text-xs leading-relaxed text-emerald-700">
                                                    Use your library account to
                                                    keep track of your books,
                                                    borrowing activity and
                                                    library services.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Librarian-specific note */}
                                {isLibrarian && (
                                    <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
                                        <div className="flex gap-3">
                                            <span className="text-lg">
                                                📖
                                            </span>

                                            <div>
                                                <p className="text-sm font-semibold text-amber-900">
                                                    Library Staff Account
                                                </p>

                                                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                                                    Your account is configured
                                                    for day-to-day library
                                                    operations and staff
                                                    services.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Admin-specific note */}
                                {isAdmin && (
                                    <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50 p-4">
                                        <div className="flex gap-3">
                                            <span className="text-lg">
                                                🏛️
                                            </span>

                                            <div>
                                                <p className="text-sm font-semibold text-purple-900">
                                                    Administrator Account
                                                </p>

                                                <p className="mt-1 text-xs leading-relaxed text-purple-800">
                                                    This account has
                                                    administrative access to
                                                    the school library system.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button
                                        onClick={openEdit}
                                        className="rounded-xl bg-[#80613b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6d512f]"
                                    >
                                        Edit Profile
                                    </button>

                                    <button
                                        onClick={openPassword}
                                        className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 p-6">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-stone-600">
                                        Full Name
                                    </label>

                                    <input
                                        className={inputCls}
                                        value={editForm.name}
                                        onChange={(e) =>
                                            setEditForm((p) => ({
                                                ...p,
                                                name: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-stone-600">
                                        Email Address
                                    </label>

                                    <input
                                        className={inputCls}
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) =>
                                            setEditForm((p) => ({
                                                ...p,
                                                email: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-stone-600">
                                        Date of Birth
                                    </label>

                                    <input
                                        className={inputCls}
                                        type="date"
                                        value={editForm.dateOfBirth}
                                        onChange={(e) =>
                                            setEditForm((p) => ({
                                                ...p,
                                                dateOfBirth: e.target.value,
                                            }))
                                        }
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setEditMode(false);
                                            clearMessages();
                                        }}
                                        className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleEditSave}
                                        disabled={saving}
                                        className="rounded-xl bg-[#80613b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6d512f] disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Right side */}
                    <aside className="space-y-5">

                        {/* Library card */}
                        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                            <div className="bg-[#4b3621] px-5 py-4 text-white">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                                    School Library
                                </p>

                                <p className="mt-1 font-bold">
                                    Library Account
                                </p>
                            </div>

                            <div className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f0e7d8] text-xl">
                                        {roleInfo.icon}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-stone-800">
                                            {currentUser.name}
                                        </p>

                                        <p className="text-xs text-stone-500">
                                            {roleInfo.label}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 border-t border-stone-100 pt-4">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-stone-400">
                                            Account status
                                        </span>

                                        <span className="font-semibold text-emerald-700">
                                            ● Active
                                        </span>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <span className="text-stone-400">
                                            Member since
                                        </span>

                                        <span className="font-medium text-stone-700">
                                            {memberSince}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100">
                                    🔐
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-stone-800">
                                        Account Security
                                    </h3>

                                    <p className="text-xs text-stone-500">
                                        Keep your account protected
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl bg-stone-50 p-3">
                                <p className="text-xs leading-relaxed text-stone-600">
                                    Change your password regularly and never
                                    share your library account credentials.
                                </p>
                            </div>

                            <button
                                onClick={openPassword}
                                className="mt-4 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
                            >
                                {pwMode
                                    ? "Close Password Form"
                                    : "Change Password"}
                            </button>
                        </div>

                        {/* Role explanation */}
                        <div className={`rounded-2xl border ${roleInfo.border} ${roleInfo.soft} p-5`}>
                            <div className="flex gap-3">
                                <span className="text-xl">
                                    {roleInfo.icon}
                                </span>

                                <div>
                                    <h3 className={`text-sm font-bold ${roleInfo.text}`}>
                                        {roleInfo.label}
                                    </h3>

                                    <p className={`mt-1 text-xs leading-relaxed ${roleInfo.text} opacity-80`}>
                                        {isMember &&
                                            "Your account is designed for accessing library services and managing your personal library activity."}

                                        {isLibrarian &&
                                            "Your account supports the daily operation of the school library and its collection."}

                                        {isAdmin &&
                                            "Your account is used to administer the library system, users and configuration."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Password Form */}
                {pwMode && !editMode && (
                    <section className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                        <div className="border-b border-stone-100 bg-[#faf8f3] px-6 py-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f0e7d8]">
                                    🔐
                                </div>

                                <div>
                                    <h3 className="font-bold text-stone-800">
                                        Change Password
                                    </h3>

                                    <p className="text-xs text-stone-500">
                                        Update the password used to access your
                                        library account
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-xl space-y-4 p-6">
                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-stone-600">
                                    Current Password
                                </label>

                                <input
                                    className={inputCls}
                                    type="password"
                                    value={pwForm.currentPassword}
                                    onChange={(e) =>
                                        setPwForm((p) => ({
                                            ...p,
                                            currentPassword:
                                                e.target.value,
                                        }))
                                    }
                                    autoComplete="current-password"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-stone-600">
                                    New Password
                                </label>

                                <input
                                    className={inputCls}
                                    type="password"
                                    value={pwForm.newPassword}
                                    onChange={(e) =>
                                        setPwForm((p) => ({
                                            ...p,
                                            newPassword: e.target.value,
                                        }))
                                    }
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
                                <p className="text-xs leading-relaxed text-amber-800">
                                    Choose a password that is difficult for
                                    others to guess. Do not share it with
                                    other students or library staff.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    onClick={() => {
                                        setPwMode(false);
                                        setPwForm({
                                            currentPassword: "",
                                            newPassword: "",
                                        });
                                        clearMessages();
                                    }}
                                    className="rounded-xl border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handlePasswordSave}
                                    disabled={saving}
                                    className="rounded-xl bg-[#4b3621] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#392818] disabled:opacity-50"
                                >
                                    {saving
                                        ? "Updating..."
                                        : "Update Password"}
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Profile;
