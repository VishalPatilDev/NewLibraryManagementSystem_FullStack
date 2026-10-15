import { useEffect, useMemo, useState } from "react";
import memberService from "../services/memberService";
import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog";
import Badge from "../components/comman/Badge";
import usePermission from "../hooks/usePermission";
import axiosInstance from "../services/axiosInstance";

const emptyForm = {
    name: "",
    email: "",
    password: "",
    dateOfBirth: "",
    phone: "",
    address: "",
    academicYearId: "",
    membershipExpiryDate: "",
    status: "ACTIVE",
    memberType: "STUDENT",
};

const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelCls =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

const Members = () => {
    const { isAdmin, isLibrarian } = usePermission();

    const canManage = isAdmin || isLibrarian;
    const canDelete = isAdmin;

    const [members, setMembers] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);

    const [loading, setLoading] = useState(true);
    const [loadingAcademicYears, setLoadingAcademicYears] =
        useState(false);

    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const [modalMode, setModalMode] = useState(null);
    const [activeMember, setActiveMember] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [deleteMember, setDeleteMember] = useState(null);
    const [statusMember, setStatusMember] = useState(null);
    const [typeMember, setTypeMember] = useState(null);

    const [statusValue, setStatusValue] = useState("ACTIVE");
    const [typeValue, setTypeValue] = useState("STUDENT");

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [registrationResult, setRegistrationResult] = useState(null);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortBy, setSortBy] = useState("createdAt");
    const [direction, setDirection] = useState("desc");

    const [pagination, setPagination] = useState({
        totalElements: 0,
        totalPages: 0,
    });

    // --------------------------------------------------
    // Load Members
    // --------------------------------------------------

    const load = async (q = search) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                size,
                sortBy,
                direction,
            };

            const data = q
                ? await memberService.search({
                    keyword: q,
                    ...params,
                })
                : await memberService.getAll(params);

            setMembers(data?.content ?? []);

            setPagination({
                totalElements: data?.totalElements ?? 0,
                totalPages: data?.totalPages ?? 0,
            });
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                "Failed to load members."
            );
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------
    // Academic Years
    // --------------------------------------------------

    const loadAcademicYears = async () => {
        setLoadingAcademicYears(true);

        try {
            const response = await axiosInstance.get(
                "/academic-years"
            );

            const data = response.data.data ?? response.data;

            setAcademicYears(
                Array.isArray(data)
                    ? data
                    : data?.content ?? []
            );
        } catch (err) {
            console.error(
                "Failed to load academic years",
                err
            );
            setAcademicYears([]);
        } finally {
            setLoadingAcademicYears(false);
        }
    };

    useEffect(() => {
        load(search);
    }, [search, page, size, sortBy, direction]);

    useEffect(() => {
        if (canManage) {
            loadAcademicYears();
        }
    }, [canManage]);

    // --------------------------------------------------
    // Stats
    // --------------------------------------------------

    const stats = useMemo(() => {
        const active = members.filter(
            (m) => m.status === "ACTIVE"
        ).length;

        const blocked = members.filter(
            (m) => m.status === "BLOCKED"
        ).length;

        const expired = members.filter(
            (m) => m.status === "EXPIRED"
        ).length;

        const students = members.filter(
            (m) =>
                m.memberType === "STUDENT"
        ).length;

        return {
            active,
            blocked,
            expired,
            students,
        };
    }, [members]);

    // --------------------------------------------------
    // Forms
    // --------------------------------------------------

    const openCreate = () => {
        setActiveMember(null);
        setForm({ ...emptyForm });
        setFormError(null);
        setModalMode("create");
    };

    const openEdit = (member) => {
        setActiveMember(member);

        setForm({
            name: member.userName ?? "",
            email: member.userEmail ?? "",
            password: "",
            dateOfBirth: member.dateOfBirth ?? "",
            phone: member.phone ?? "",
            address: member.address ?? "",
            academicYearId:
                member.academicYear?.id ??
                member.academicYearId ??
                "",
            membershipExpiryDate:
                member.membershipExpiryDate ?? "",
            status: member.status ?? "ACTIVE",
            memberType: member.memberType ?? "STUDENT",
        });

        setFormError(null);
        setModalMode("edit");
    };

    const openStatus = (member) => {
        setStatusMember(member);
        setStatusValue(member.status ?? "ACTIVE");
        setFormError(null);
    };

    const openType = (member) => {
        setTypeMember(member);
        setTypeValue(member.memberType ?? "STUDENT");
        setFormError(null);
    };

    // --------------------------------------------------
    // Save Member
    // --------------------------------------------------

    const handleSave = async () => {
        setSaving(true);
        setFormError(null);

        try {
            if (modalMode === "create") {
                const payload = {
                    name: form.name.trim(),
                    email: form.email.trim(),
                    password:
                        form.password.trim() || null,
                    dateOfBirth:
                        form.dateOfBirth || null,
                    phone:
                        form.phone.trim() || null,
                    address:
                        form.address.trim() || null,
                    academicYearId:
                        form.academicYearId
                            ? Number(form.academicYearId)
                            : null,
                    membershipExpiryDate:
                        form.membershipExpiryDate ||
                        null,
                };

                const result =
                    await memberService.register(payload);

                setModalMode(null);
                setRegistrationResult(result);

                await load(search);
            } else {
                const payload = {
                    userId: activeMember.userId,
                    phone:
                        form.phone.trim() || null,
                    address:
                        form.address.trim() || null,
                    membershipExpiryDate:
                        form.membershipExpiryDate ||
                        null,
                    academicYearId:
                        form.academicYearId
                            ? Number(form.academicYearId)
                            : null,
                    status: form.status,
                    memberType: form.memberType,
                };

                await memberService.update(
                    activeMember.id,
                    payload
                );

                setModalMode(null);
                await load(search);
            }
        } catch (err) {
            console.error(err);

            setFormError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to save member."
            );
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
            await memberService.updateStatus(
                statusMember.id,
                statusValue
            );

            setStatusMember(null);
            await load(search);
        } catch (err) {
            setFormError(
                err?.response?.data?.message ||
                "Failed to update member status."
            );
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Member Type
    // --------------------------------------------------

    const handleTypeSave = async () => {
        setSaving(true);
        setFormError(null);

        try {
            await memberService.updateType(
                typeMember.id,
                typeValue
            );

            setTypeMember(null);
            await load(search);
        } catch (err) {
            setFormError(
                err?.response?.data?.message ||
                "Failed to update member type."
            );
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
            await memberService.remove(deleteMember.id);

            setDeleteMember(null);
            await load(search);
        } catch (err) {
            setFormError(
                err?.response?.data?.message ||
                "Failed to delete member."
            );
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // Copy Password
    // --------------------------------------------------

    const copyTemporaryPassword = async () => {
        if (!registrationResult?.temporaryPassword) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                registrationResult.temporaryPassword
            );
        } catch (err) {
            console.error(
                "Failed to copy password",
                err
            );
        }
    };

    // --------------------------------------------------
    // Search
    // --------------------------------------------------

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        load(search);
    };

    // --------------------------------------------------
    // Table
    // --------------------------------------------------

    const columns = [
        {
            key: "membershipNumber",
            label: "Member",
            render: (row) => (
                <div className="flex items-center gap-3" >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-sm">
                        {row.userName
                            ?.charAt(0)
                            ?.toUpperCase() || "M"}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                            {row.userName || "—"}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                            {row.membershipNumber ||
                                "No membership number"}
                        </p>
                    </div>
                </div>
            ),
        },

        {
            key: "userEmail",
            label: "Contact",
            render: (row) => (
                <div>
                    <p className="max-w-[220px] truncate text-sm text-slate-700">
                        {row.userEmail || "—"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                        {row.phone || "No phone number"}
                    </p>
                </div>
            ),
        },

        {
            key: "memberType",
            label: "Type",
            render: (row) => {
                const type =
                    row.memberType || "STUDENT";

                const styles = {
                    STUDENT:
                        "bg-blue-50 text-blue-700 ring-blue-600/10",
                    TEACHER:
                        "bg-purple-50 text-purple-700 ring-purple-600/10",
                    STAFF:
                        "bg-amber-50 text-amber-700 ring-amber-600/10",
                    PARENT:
                        "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
                };

                return (
                    <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles[type] ||
                            "bg-slate-50 text-slate-600 ring-slate-600/10"
                            }`}
                    >
                        {type}
                    </span>
                );
            },
        },

        {
            key: "academicYear",
            label: "Academic Year",
            render: (row) => (
                <span className="text-sm text-slate-600">
                    {row.academicYear?.yearLabel ||
                        row.academicYear ||
                        "—"}
                </span>
            ),
        },

        {
            key: "membershipDate",
            label: "Membership",
            render: (row) => (
                <div>
                    <p className="text-sm font-medium text-slate-700">
                        {row.membershipDate
                            ? new Date(
                                row.membershipDate
                            ).toLocaleDateString()
                            : "—"}
                    </p>

                    <p className="text-xs text-slate-400">
                        Joined
                    </p>
                </div>
            ),
        },

        {
            key: "membershipExpiryDate",
            label: "Expiry",
            render: (row) => (
                <div>
                    <p className="text-sm font-medium text-slate-700">
                        {row.membershipExpiryDate
                            ? new Date(
                                row.membershipExpiryDate
                            ).toLocaleDateString()
                            : "—"}
                    </p>

                    <p className="text-xs text-slate-400">
                        Expiry date
                    </p>
                </div>
            ),
        },

        {
            key: "status",
            label: "Status",
            render: (row) => (
                <Badge value={row.status} />
            ),
        },

        ...(canManage
            ? [
                {
                    key: "actions",
                    label: "Actions",
                    render: (row) => (
                        <div className="flex items-center gap-1.5">
                            {/* <button
                                title="Edit member"
                                onClick={() =>
                                    openEdit(row)
                                }
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                            >
                                Edit
                            </button> */}

                            {/* <button
                                title="Change status"
                                onClick={() =>
                                    openStatus(row)
                                }
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                            >
                                Status
                            </button>

                            <button
                                title="Change member type"
                                onClick={() =>
                                    openType(row)
                                }
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-600"
                            >
                                Type
                            </button> */}

                            {canDelete && (
                                <button
                                    title="Delete member"
                                    onClick={() =>
                                        setDeleteMember(
                                            row
                                        )
                                    }
                                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
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

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div className="min-h-full bg-slate-50/50 p-1">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-8a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Members
                            </h1>

                            <p className="text-sm text-slate-500">
                                Manage library members,
                                memberships and access.
                            </p>
                        </div>
                    </div>
                </div>

                {canManage && (
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-[0.98]"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Add Member
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Total Members
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {pagination.totalElements}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2m8-10a4 4 0 100-8 4 4 0 000 8zm10 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Active
                            </p>
                            <p className="mt-2 text-2xl font-bold text-emerald-600">
                                {stats.active}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <span className="h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Expired
                            </p>
                            <p className="mt-2 text-2xl font-bold text-orange-600">
                                {stats.expired}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                Students
                            </p>
                            <p className="mt-2 text-2xl font-bold text-purple-600">
                                {stats.students}
                            </p>
                        </div>

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 14l9-5-9-5-9 5 9 5z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 12v5c3 2 11 2 14 0v-5"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Toolbar */}
                <div className="border-b border-slate-100 p-4">
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"
                    >
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1 sm:max-w-md">
                                <svg
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                                    />
                                </svg>

                                <input
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="Search by name, email or membership..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <button
                                type="submit"
                                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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
                                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                >
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(
                                        e.target.value
                                    );
                                    setPage(0);
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            >
                                <option value="createdAt">
                                    Created Date
                                </option>

                                <option value="membershipDate">
                                    Membership Date
                                </option>

                                <option value="membershipExpiryDate">
                                    Expiry Date
                                </option>
                            </select>

                            <select
                                value={direction}
                                onChange={(e) => {
                                    setDirection(
                                        e.target.value
                                    );
                                    setPage(0);
                                }}
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            >
                                <option value="desc">
                                    Newest First
                                </option>

                                <option value="asc">
                                    Oldest First
                                </option>
                            </select>
                        </div>
                    </form>
                </div>

                {/* Error */}
                {error && (
                    <div className="m-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                        <svg
                            className="mt-0.5 h-5 w-5 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v4m0 4h.01M10.29 3.86l-7.5 13A2 2 0 004.52 20h14.96a2 2 0 001.73-3l-7.5-13a2 2 0 00-3.42 0z"
                            />
                        </svg>

                        <div>
                            <p className="font-semibold">
                                Unable to load members
                            </p>
                            <p className="mt-0.5 text-red-600/80">
                                {error}
                            </p>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        data={members}
                        loading={loading}
                         onRowClick={canManage ? openEdit : undefined}
                    />
                </div>

                {/* Pagination */}
                <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-700">
                            {pagination.totalElements}
                        </span>{" "}
                        total members
                    </div>

                    <div className="flex items-center gap-2">
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
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-600"
                        >
                            <option value={5}>5 / page</option>
                            <option value={10}>
                                10 / page
                            </option>
                            <option value={20}>
                                20 / page
                            </option>
                            <option value={30}>
                                30 / page
                            </option>
                        </select>

                        <button
                            disabled={page === 0}
                            onClick={() =>
                                setPage(
                                    (p) => p - 1
                                )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white shadow-sm">
                            {page + 1}
                        </span>

                        <button
                            disabled={
                                pagination.totalPages ===
                                0 ||
                                page >=
                                pagination.totalPages -
                                1
                            }
                            onClick={() =>
                                setPage(
                                    (p) => p + 1
                                )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* =====================================================
                CREATE / EDIT MODAL
            ====================================================== */}

            {modalMode && (
                <Modal
                    title={
                        modalMode === "create"
                            ? "Add New Member"
                            : "Edit Member"
                    }
                    onClose={() =>
                        setModalMode(null)
                    }
                >
                    <div className="max-h-[75vh] space-y-5 overflow-y-auto pr-1">
                        {formError && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                {formError}
                            </div>
                        )}

                        {modalMode === "create" && (
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                <div className="flex gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M13 16h-1v-4h-1m1-8a9 9 0 110 18 9 9 0 010-18z"
                                            />
                                        </svg>
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-blue-800">
                                            New member
                                            account
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-blue-700">
                                            The account will
                                            be created with
                                            the MEMBER role.
                                            Leave the
                                            password blank
                                            to generate one
                                            automatically.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label className={labelCls}>
                                    Full Name *
                                </label>

                                <input
                                    className={inputCls}
                                    value={form.name}
                                    disabled={
                                        modalMode ===
                                        "edit"
                                    }
                                    placeholder="Enter member name"
                                    onChange={(e) =>
                                        setForm(
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

                            {/* Email */}
                            <div className="sm:col-span-2">
                                <label className={labelCls}>
                                    Email Address *
                                </label>

                                <input
                                    className={inputCls}
                                    type="email"
                                    value={form.email}
                                    disabled={
                                        modalMode ===
                                        "edit"
                                    }
                                    placeholder="member@example.com"
                                    onChange={(e) =>
                                        setForm(
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

                            {/* Password */}
                            {modalMode === "create" && (
                                <div className="sm:col-span-2">
                                    <label
                                        className={
                                            labelCls
                                        }
                                    >
                                        Temporary Password
                                    </label>

                                    <input
                                        className={
                                            inputCls
                                        }
                                        type="text"
                                        placeholder="Leave blank to generate automatically"
                                        value={
                                            form.password
                                        }
                                        onChange={(e) =>
                                            setForm(
                                                (p) => ({
                                                    ...p,
                                                    password:
                                                        e
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                    />

                                    <p className="mt-1.5 text-xs text-slate-400">
                                        The generated
                                        password will
                                        only be shown
                                        after account
                                        creation.
                                    </p>
                                </div>
                            )}

                            {/* DOB */}
                            {modalMode === "create" && (
                                <div>
                                    <label
                                        className={
                                            labelCls
                                        }
                                    >
                                        Date of Birth
                                    </label>

                                    <input
                                        className={
                                            inputCls
                                        }
                                        type="date"
                                        value={
                                            form.dateOfBirth
                                        }
                                        onChange={(e) =>
                                            setForm(
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
                            )}

                            {/* Phone */}
                            <div>
                                <label className={labelCls}>
                                    Phone Number
                                </label>

                                <input
                                    className={inputCls}
                                    value={form.phone}
                                    placeholder="+91 98765 43210"
                                    onChange={(e) =>
                                        setForm(
                                            (p) => ({
                                                ...p,
                                                phone: e
                                                    .target
                                                    .value,
                                            })
                                        )
                                    }
                                />
                            </div>

                            {/* Address */}
                            <div className="sm:col-span-2">
                                <label className={labelCls}>
                                    Address
                                </label>

                                <textarea
                                    className={`${inputCls} resize-none`}
                                    rows={3}
                                    placeholder="Enter residential address"
                                    value={form.address}
                                    onChange={(e) =>
                                        setForm(
                                            (p) => ({
                                                ...p,
                                                address:
                                                    e
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                />
                            </div>

                            {/* Academic Year */}
                            <div>
                                <label className={labelCls}>
                                    Academic Year *
                                </label>

                                <select
                                    className={
                                        inputCls
                                    }
                                    value={
                                        form.academicYearId
                                    }
                                    onChange={(e) =>
                                        setForm(
                                            (p) => ({
                                                ...p,
                                                academicYearId:
                                                    e
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    disabled={
                                        loadingAcademicYears
                                    }
                                >
                                    <option value="">
                                        {loadingAcademicYears
                                            ? "Loading..."
                                            : "Select year"}
                                    </option>

                                    {academicYears.map(
                                        (year) => (
                                            <option
                                                key={
                                                    year.id
                                                }
                                                value={
                                                    year.id
                                                }
                                            >
                                                {
                                                    year.yearLabel
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                            {/* Member Type */}
                            {modalMode === "edit" && (
                                <div>
                                    <label className={labelCls}>
                                        Member Type
                                    </label>

                                    <select
                                        className={inputCls}
                                        value={form.memberType}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                memberType:
                                                    e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="STUDENT">
                                            Student
                                        </option>

                                        <option value="TEACHER">
                                            Teacher
                                        </option>

                                        <option value="STAFF">
                                            Staff
                                        </option>

                                        <option value="PARENT">
                                            Parent
                                        </option>
                                    </select>
                                </div>
                            )}

                            {/* Member Status */}
                            {modalMode === "edit" && (
                                <div>
                                    <label className={labelCls}>
                                        Account Status
                                    </label>

                                    <select
                                        className={inputCls}
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                status:
                                                    e.target.value,
                                            }))
                                        }
                                    >
                                        <option value="ACTIVE">
                                            Active
                                        </option>

                                        <option value="BLOCKED">
                                            Blocked
                                        </option>

                                        <option value="EXPIRED">
                                            Expired
                                        </option>
                                    </select>
                                </div>
                            )}


                            {/* Expiry */}
                            <div>
                                <label className={labelCls}>
                                    Membership Expiry
                                </label>

                                <input
                                    className={inputCls}
                                    type="date"
                                    value={
                                        form.membershipExpiryDate
                                    }
                                    onChange={(e) =>
                                        setForm(
                                            (p) => ({
                                                ...p,
                                                membershipExpiryDate:
                                                    e
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                />

                                {modalMode ===
                                    "create" && (
                                        <p className="mt-1.5 text-xs text-slate-400">
                                            Leave empty to
                                            use the default
                                            one-year
                                            membership.
                                        </p>
                                    )}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                onClick={() =>
                                    setModalMode(
                                        null
                                    )
                                }
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : modalMode ===
                                        "create"
                                        ? "Create Member"
                                        : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* =====================================================
                REGISTRATION RESULT
            ====================================================== */}

            {registrationResult && (
                <Modal
                    title="Member Created"
                    onClose={() =>
                        setRegistrationResult(
                            null
                        )
                    }
                >
                    <div className="space-y-5">
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>

                                <div>
                                    <p className="font-semibold text-emerald-800">
                                        Account created
                                        successfully
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                                        Share the
                                        temporary
                                        password
                                        securely. It
                                        won't be
                                        displayed again
                                        after closing
                                        this window.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Name
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {
                                        registrationResult.name
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Membership No.
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {
                                        registrationResult.membershipNumber
                                    }
                                </p>
                            </div>

                            <div className="col-span-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Email
                                </p>

                                <p className="mt-1 text-sm text-slate-700">
                                    {
                                        registrationResult.email
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                                Temporary Password
                            </p>

                            <div className="mt-2 flex gap-2">
                                <code className="flex flex-1 items-center overflow-hidden rounded-xl bg-white px-4 py-3 text-lg font-bold tracking-widest text-slate-800 shadow-sm">
                                    {
                                        registrationResult.temporaryPassword
                                    }
                                </code>

                                <button
                                    type="button"
                                    onClick={
                                        copyTemporaryPassword
                                    }
                                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-slate-100 pt-4">
                            <button
                                onClick={() =>
                                    setRegistrationResult(
                                        null
                                    )
                                }
                                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* =====================================================
                STATUS MODAL
            ====================================================== */}

            {statusMember && (
                <Modal
                    title="Change Member Status"
                    onClose={() =>
                        setStatusMember(null)
                    }
                >
                    <div className="space-y-5">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Member
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                                {statusMember.userName}
                            </p>

                            <p className="text-xs text-slate-400">
                                {
                                    statusMember.membershipNumber
                                }
                            </p>
                        </div>

                        {formError && (
                            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className={labelCls}>
                                Account Status
                            </label>

                            <select
                                className={inputCls}
                                value={statusValue}
                                onChange={(e) =>
                                    setStatusValue(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="ACTIVE">
                                    Active
                                </option>

                                <option value="BLOCKED">
                                    Blocked
                                </option>

                                <option value="EXPIRED">
                                    Expired
                                </option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                onClick={() =>
                                    setStatusMember(
                                        null
                                    )
                                }
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleStatusSave
                                }
                                disabled={saving}
                                className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50"
                            >
                                {saving
                                    ? "Updating..."
                                    : "Update Status"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* =====================================================
                TYPE MODAL
            ====================================================== */}

            {typeMember && (
                <Modal
                    title="Change Member Type"
                    onClose={() =>
                        setTypeMember(null)
                    }
                >
                    <div className="space-y-5">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Member
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                                {typeMember.userName}
                            </p>

                            <p className="text-xs text-slate-400">
                                {
                                    typeMember.membershipNumber
                                }
                            </p>
                        </div>

                        {formError && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                                {formError}
                            </div>
                        )}

                        <div>
                            <label className={labelCls}>
                                Member Type
                            </label>

                            <select
                                className={inputCls}
                                value={typeValue}
                                onChange={(e) =>
                                    setTypeValue(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="STUDENT">
                                    Student
                                </option>

                                <option value="TEACHER">
                                    Teacher
                                </option>

                                <option value="STAFF">
                                    Staff
                                </option>

                                <option value="PARENT">
                                    Parent
                                </option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                onClick={() =>
                                    setTypeMember(null)
                                }
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleTypeSave
                                }
                                disabled={saving}
                                className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700 disabled:opacity-50"
                            >
                                {saving
                                    ? "Updating..."
                                    : "Update Type"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* =====================================================
                DELETE
            ====================================================== */}

            {deleteMember && (
                <ConfirmDialog
                    message={`Delete member "${deleteMember.userName}"? This cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() =>
                        setDeleteMember(null)
                    }
                    loading={saving}
                />
            )}
        </div>
    );
};

export default Members;
