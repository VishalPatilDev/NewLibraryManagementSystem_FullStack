import { useEffect, useState } from "react";
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
};

const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

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

    const [statusValue, setStatusValue] = useState("ACTIVE");
    // --------------------------------------------------
    // Member Type
    // --------------------------------------------------
    // Stores the member whose type is being changed.
    const [typeMember, setTypeMember] = useState(null);

    // Stores the selected type.
    // Must match your backend MemberType enum.
    const [typeValue, setTypeValue] = useState("STUDENT");


    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    // Response from admin member registration
    const [registrationResult, setRegistrationResult] = useState(null);

    // Pagination
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
    // Load Academic Years
    // --------------------------------------------------

    const loadAcademicYears = async () => {
        setLoadingAcademicYears(true);

        try {
            /*
             * Change this URL if your AcademicYearController
             * uses a different endpoint.
             *
             * Example:
             * GET /academic-years
             */

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
    // Create Member
    // --------------------------------------------------

    const openCreate = () => {
        setActiveMember(null);

        setForm({
            ...emptyForm,
        });

        setFormError(null);
        setModalMode("create");
    };

    // --------------------------------------------------
    // Edit Member
    // --------------------------------------------------

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
        });

        setFormError(null);
        setModalMode("edit");
    };

    // --------------------------------------------------
    // Status
    // --------------------------------------------------

    const openStatus = (member) => {
        setStatusMember(member);
        setStatusValue(member.status ?? "ACTIVE");
        setFormError(null);
    };

    // --------------------------------------------------
    // Member Type
    // --------------------------------------------------
    // Opens the member-type modal.
    const openType = (member) => {
        setTypeMember(member);

        // Use the current member type if available.
        // Defaults to STUDENT when no type is returned.
        setTypeValue(member.memberType ?? "STUDENT");

        setFormError(null);
    };


    // --------------------------------------------------
    // Save
    // --------------------------------------------------

    const handleSave = async () => {
        setSaving(true);
        setFormError(null);

        try {
            if (modalMode === "create") {
                const payload = {
                    name: form.name.trim(),
                    email: form.email.trim(),

                    /*
                     * If blank, backend generates the temporary
                     * password.
                     */
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
                        form.membershipExpiryDate || null,
                };

                const result =
                    await memberService.register(payload);

                /*
                 * Close create form and show temporary password.
                 */
                setModalMode(null);

                setRegistrationResult(result);

                await load(search);
            } else {
                /*
                 * Existing member update API.
                 *
                 * This assumes your MemberController PUT
                 * /members/{id} accepts MemberRequest.
                 */
                const payload = {
                    userId: activeMember.userId,

                    phone:
                        form.phone.trim() || null,

                    address:
                        form.address.trim() || null,

                    membershipExpiryDate:
                        form.membershipExpiryDate || null,

                    academicYearId:
                        form.academicYearId
                            ? Number(form.academicYearId)
                            : null,
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
    // Status Save
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
    // Member Type Save
    // --------------------------------------------------
    const handleTypeSave = async () => {
        setSaving(true);
        setFormError(null);

        try {
            // Calls:
            // PATCH /members/{id}/type?memberType=STUDENT
            //
            // memberService.updateType() should handle this request.
            await memberService.updateType(
                typeMember.id,
                typeValue
            );

            // Close the type modal.
            setTypeMember(null);

            // Reload members so the table shows the new type.
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
            await memberService.remove(
                deleteMember.id
            );

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
    // Copy Temporary Password
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
            key: "id",
            label: "ID",
        },

        {
            key: "membershipNumber",
            label: "Membership No.",
            render: (row) => (
                <span className="font-medium text-gray-700">
                    {row.membershipNumber}
                </span>
            ),
        },

        {
            key: "userName",
            label: "Name",
        },

        {
            key: "userEmail",
            label: "Email",
        },

        {
            key: "phone",
            label: "Phone",
            render: (row) => row.phone || "—",
        },

        {
            key: "academicYear",
            label: "Academic Year",
            render: (row) => (
                <span>
                    {row.academicYear?.yearLabel ||
                        row.academicYear ||
                        "—"}
                </span>
            ),
        },

        {
            key: "membershipDate",
            label: "Joined",
            render: (row) =>
                row.membershipDate
                    ? new Date(
                        row.membershipDate
                    ).toLocaleDateString()
                    : "—",
        },

        {
            key: "membershipExpiryDate",
            label: "Expiry",
            render: (row) =>
                row.membershipExpiryDate
                    ? new Date(
                        row.membershipExpiryDate
                    ).toLocaleDateString()
                    : "—",
        },

        {
            key: "status",
            label: "Status",
            render: (row) => (
                <Badge value={row.status} />
            ),
        },
        // --------------------------------------------------
        // Member Type Column
        // --------------------------------------------------
        {
            key: "memberType",
            label: "Member Type",
            render: (row) => (
                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                    {row.memberType || "STUDENT"}
                </span>
            ),
        },


        ...(canManage
            ? [
                {
                    key: "actions",
                    label: "Actions",

                    render: (row) => (
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                onClick={() =>
                                    openEdit(row)
                                }
                                className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                            >
                                Edit
                            </button>

                            <button
                                onClick={() =>
                                    openStatus(row)
                                }
                                className="rounded-md bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-600 hover:bg-yellow-100"
                            >
                                Status
                            </button>
                            {/* --------------------------------------------------
    MEMBER TYPE BUTTON
    Opens the modal where ADMIN/LIBRARIAN can change
    STUDENT / TEACHER / STAFF / PARENT
-------------------------------------------------- */}
<button
    onClick={() => openType(row)}
    className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-600 hover:bg-purple-100"
>
    Type
</button>


                            {canDelete && (
                                <button
                                    onClick={() =>
                                        setDeleteMember(
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

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Members
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage library members and memberships
                    </p>
                </div>

                {canManage && (
                    <button
                        onClick={openCreate}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        + Add Member
                    </button>
                )}
            </div>

            {/* Search */}
            <form
                onSubmit={handleSearch}
                className="mb-4 flex flex-wrap gap-2"
            >
                <input
                    className="w-64 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
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

                <select
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(0);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                        setDirection(e.target.value);
                        setPage(0);
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                    <option value="desc">
                        Newest
                    </option>

                    <option value="asc">
                        Oldest
                    </option>
                </select>
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
                data={members}
                loading={loading}
            />

            {/* =====================================================
                CREATE / EDIT MODAL
            ====================================================== */}

            {modalMode && (
                <Modal
                    title={
                        modalMode === "create"
                            ? "Add Member"
                            : "Edit Member"
                    }
                    onClose={() =>
                        setModalMode(null)
                    }
                >
                    <div className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
                        {formError && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {formError}
                            </div>
                        )}

                        {/* CREATE INFO */}
                        {modalMode === "create" && (
                            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                                The member will be created with
                                role <strong>MEMBER</strong>.
                                You can provide a temporary
                                password or leave it empty to let
                                the backend generate one.
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Name *
                            </label>

                            <input
                                className={inputCls}
                                value={form.name}
                                disabled={
                                    modalMode ===
                                    "edit"
                                }
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Email *
                            </label>

                            <input
                                className={inputCls}
                                type="email"
                                value={form.email}
                                disabled={
                                    modalMode ===
                                    "edit"
                                }
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        email: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Temporary Password */}
                        {modalMode === "create" && (
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Temporary Password
                                </label>

                                <input
                                    className={inputCls}
                                    type="text"
                                    placeholder="Leave blank to generate automatically"
                                    value={
                                        form.password
                                    }
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            password:
                                                e.target.value,
                                        }))
                                    }
                                />

                                <p className="mt-1 text-xs text-gray-500">
                                    The password will be shown
                                    once after the member is
                                    created.
                                </p>
                            </div>
                        )}

                        {/* Date of Birth */}
                        {modalMode === "create" && (
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Date of Birth
                                </label>

                                <input
                                    className={inputCls}
                                    type="date"
                                    value={
                                        form.dateOfBirth
                                    }
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            dateOfBirth:
                                                e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        )}

                        {/* Phone */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Phone
                            </label>

                            <input
                                className={inputCls}
                                value={form.phone}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        phone: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Address
                            </label>

                            <textarea
                                className={`${inputCls} resize-none`}
                                rows={3}
                                value={form.address}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        address:
                                            e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Academic Year */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Academic Year *
                            </label>

                            <select
                                className={inputCls}
                                value={
                                    form.academicYearId
                                }
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        academicYearId:
                                            e.target.value,
                                    }))
                                }
                                disabled={
                                    loadingAcademicYears
                                }
                            >
                                <option value="">
                                    {loadingAcademicYears
                                        ? "Loading academic years..."
                                        : "Select academic year"}
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

                        {/* Membership Expiry */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Membership Expiry
                            </label>

                            <input
                                className={inputCls}
                                type="date"
                                value={
                                    form.membershipExpiryDate
                                }
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        membershipExpiryDate:
                                            e.target.value,
                                    }))
                                }
                            />

                            {modalMode === "create" && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Leave empty to use one year
                                    from today.
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() =>
                                    setModalMode(
                                        null
                                    )
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
                                    ? "Saving..."
                                    : modalMode ===
                                        "create"
                                        ? "Add Member"
                                        : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* =====================================================
                TEMPORARY PASSWORD RESULT
            ====================================================== */}

            {registrationResult && (
                <Modal
                    title="Member Created Successfully"
                    onClose={() =>
                        setRegistrationResult(
                            null
                        )
                    }
                >
                    <div className="space-y-5">
                        <div className="rounded-lg bg-green-50 p-4">
                            <p className="text-sm font-medium text-green-800">
                                The member account has been
                                created successfully.
                            </p>

                            <p className="mt-1 text-xs text-green-700">
                                Give the temporary password to
                                the member. They can change it
                                after logging in.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Name
                                </p>

                                <p className="text-sm font-semibold text-gray-800">
                                    {
                                        registrationResult.name
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Email
                                </p>

                                <p className="text-sm text-gray-800">
                                    {
                                        registrationResult.email
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500">
                                    Membership Number
                                </p>

                                <p className="text-sm font-semibold text-gray-800">
                                    {
                                        registrationResult.membershipNumber
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Temporary Password */}
                        <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 p-4">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-yellow-700">
                                Temporary Password
                            </p>

                            <div className="flex items-center gap-2">
                                <code className="flex-1 rounded-lg bg-white px-4 py-3 text-lg font-bold tracking-wider text-gray-800 shadow-sm">
                                    {
                                        registrationResult.temporaryPassword
                                    }
                                </code>

                                <button
                                    type="button"
                                    onClick={
                                        copyTemporaryPassword
                                    }
                                    className="rounded-lg bg-yellow-500 px-4 py-3 text-sm font-semibold text-white hover:bg-yellow-600"
                                >
                                    Copy
                                </button>
                            </div>

                            <p className="mt-2 text-xs text-yellow-700">
                                Save or share this password
                                securely. It should not be
                                displayed again after closing
                                this window.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() =>
                                    setRegistrationResult(
                                        null
                                    )
                                }
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
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
                    title={`Change Status — ${statusMember.userName}`}
                    onClose={() =>
                        setStatusMember(null)
                    }
                >
                    <div className="space-y-4">
                        {formError && (
                            <p className="text-sm text-red-600">
                                {formError}
                            </p>
                        )}

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

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() =>
                                    setStatusMember(
                                        null
                                    )
                                }
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    handleStatusSave
                                }
                                disabled={saving}
                                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600 disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : "Update Status"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* =====================================================
                DELETE CONFIRM
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
            {/* =====================================================
    MEMBER TYPE MODAL
====================================================== */}

{typeMember && (
    <Modal
        title={`Change Member Type — ${typeMember.userName}`}
        onClose={() => setTypeMember(null)}
    >
        <div className="space-y-4">

            {/* Error message */}
            {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                    {formError}
                </div>
            )}

            {/* Current member information */}
            <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-500">
                    Member
                </p>

                <p className="text-sm font-semibold text-gray-800">
                    {typeMember.userName}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                    {typeMember.membershipNumber}
                </p>
            </div>

            {/* Member Type */}
            <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                    Member Type
                </label>

                <select
                    className={inputCls}
                    value={typeValue}
                    onChange={(e) =>
                        setTypeValue(e.target.value)
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

            {/* Buttons */}
            <div className="flex justify-end gap-3">

                <button
                    onClick={() => setTypeMember(null)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                    Cancel
                </button>

                <button
                    onClick={handleTypeSave}
                    disabled={saving}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
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
                PAGINATION
            ====================================================== */}

            <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    Showing page {page + 1} of{" "}
                    {pagination.totalPages}
                </p>

                <div className="flex gap-2">
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

                    <span className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
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

export default Members;
