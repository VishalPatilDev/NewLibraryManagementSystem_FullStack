import { useEffect, useMemo, useState } from "react";
import rackService from "../services/rackService";
import Table from "../components/comman/Table";
import Modal from "../components/comman/Modal";
import ConfirmDialog from "../components/comman/ConfirmDialog";
import usePermission from "../hooks/usePermission";

const emptyForm = {
    rackCode: "",
    label: "",
    section: "",
    floorSection: "",
    rowNumber: "",
    totalCapacity: "",
    description: "",
};

const inputCls =
    "w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-800 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100";

const bookColors = [
    "bg-rose-700",
    "bg-amber-700",
    "bg-emerald-700",
    "bg-blue-800",
    "bg-indigo-800",
    "bg-orange-700",
    "bg-teal-700",
];

const Racks = () => {
    const { hasPermission } = usePermission();

    const canCreate = hasPermission("RACK_CREATE");
    const canUpdate = hasPermission("RACK_UPDATE");
    const canDelete = hasPermission("RACK_DELETE");

    const [racks, setRacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");

    const [modalMode, setModalMode] = useState(null);
    const [activeRack, setActiveRack] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const [deleteRack, setDeleteRack] = useState(null);

    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);




    const load = async (keyword = "") => {
        setLoading(true);
        setError(null);

        try {
            const data = keyword.trim()
                ? await rackService.search(keyword.trim())
                : await rackService.getAll();

            setRacks(data ?? []);
        } catch (err) {
            console.error("RACK API ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load racks."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const openCreate = () => {
        setForm({ ...emptyForm });
        setActiveRack(null);
        setFormError(null);
        setModalMode("create");
    };

    const openEdit = (rack) => {
        setActiveRack(rack);

        setForm({
            rackCode: rack.rackCode ?? "",
            label: rack.label ?? "",
            section: rack.section ?? "",
            floorSection: rack.floorSection ?? "",
            rowNumber: rack.rowNumber ?? "",
            totalCapacity: rack.totalCapacity ?? "",
            description: rack.description ?? "",
        });

        setFormError(null);
        setModalMode("edit");
    };

    const handleSave = async () => {
        setSaving(true);
        setFormError(null);

        const payload = {
            rackCode: form.rackCode.trim(),
            label: form.label.trim(),
            floorSection: form.floorSection.trim(),
            section: form.section.trim(),

            rowNumber: form.rowNumber
                ? Number(form.rowNumber)
                : null,
            totalCapacity: form.totalCapacity
                ? Number(form.totalCapacity)
                : null,
            description: form.description.trim(),
        };

        try {
            if (modalMode === "create") {
                await rackService.create(payload);
            } else {
                await rackService.update(activeRack.id, payload);
            }

            setModalMode(null);
            setActiveRack(null);
            setForm({ ...emptyForm });

            await load(search);
        } catch (err) {
            console.error("SAVE RACK ERROR:", err);

            setFormError(
                err.response?.data?.message ||
                `Failed to ${modalMode === "create"
                    ? "create"
                    : "update"
                } rack.`
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteRack) return;

        setSaving(true);

        try {
            await rackService.remove(deleteRack.id);

            setDeleteRack(null);

            await load(search);
        } catch (err) {
            console.error("DELETE RACK ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to delete rack."
            );

            setDeleteRack(null);
        } finally {
            setSaving(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        load(search);
    };

    const handleClearSearch = () => {
        setSearch("");
        load("");
    };

    /*
     * Real rack occupancy from backend.
     *
     * Backend:
     * currentBookCount
     * totalCapacity
     * availableCapacity
     * occupancyPercentage
     */

    const getOccupancy = (rack) => {
        if (
            rack.occupancyPercentage === null ||
            rack.occupancyPercentage === undefined
        ) {
            return 0;
        }

        return Math.min(
            100,
            Math.max(0, Number(rack.occupancyPercentage))
        );
    };

    /*
     * Number of visual books shown on the shelf.
     *
     * We don't want to render 100+ DOM elements for a rack
     * with capacity 100, so this is a visual representation
     * based on the REAL occupancy percentage.
     */
    const getVisualBookCount = (rack) => {
        const occupancy = getOccupancy(rack);

        if (occupancy <= 0) {
            return 0;
        }

        return Math.max(
            2,
            Math.round((occupancy / 100) * 16)
        );
    };

    const getOccupancyColor = (occupancy) => {
        if (occupancy >= 85) {
            return "bg-red-500";
        }

        if (occupancy >= 60) {
            return "bg-yellow-400";
        }

        return "bg-green-500";
    };

    const stats = useMemo(() => {
        const totalCapacity = racks.reduce(
            (sum, rack) =>
                sum + (Number(rack.totalCapacity) || 0),
            0
        );

        const currentBookCount = racks.reduce(
            (sum, rack) =>
                sum + (Number(rack.currentBookCount) || 0),
            0
        );

        const availableCapacity = racks.reduce(
            (sum, rack) =>
                sum + (Number(rack.availableCapacity) || 0),
            0
        );

        const configuredCapacity = racks.filter(
            (rack) =>
                rack.totalCapacity !== null &&
                rack.totalCapacity !== undefined
        ).length;

        const occupancyPercentage =
            totalCapacity > 0
                ? Math.round(
                    (currentBookCount / totalCapacity) *
                    10000
                ) / 100
                : 0;

        return {
            racks: racks.length,
            sections: new Set(
                racks
                    .map((rack) => rack.section)
                    .filter(Boolean)
            ).size,
            totalCapacity,
            currentBookCount,
            availableCapacity,
            configuredCapacity,
            occupancyPercentage,
        };
    }, [racks]);

    const columns = [
        {
            key: "id",
            label: "ID",
        },
        {
            key: "rackCode",
            label: "Rack Code",
            render: (row) => (
                <span className="font-semibold text-stone-800">
                    {row.rackCode}
                </span>
            ),
        },
        {
            key: "label",
            label: "Label",
        },
        {
            key: "floorSection",
            label: "Floor",
            render: (row) => row.floorSection || "—",
        },
        {
            key: "section",
            label: "Section",
            render: (row) => row.section || "—",
        },

        {
            key: "rowNumber",
            label: "Row",
            render: (row) => row.rowNumber ?? "—",
        },
        {
            key: "currentBookCount",
            label: "Books",
            render: (row) => (
                <span className="font-medium text-stone-700">
                    {row.currentBookCount ?? 0}
                </span>
            ),
        },
        {
            key: "totalCapacity",
            label: "Capacity",
            render: (row) => (
                <div className="min-w-[120px]">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-stone-700">
                            {row.currentBookCount ?? 0} /{" "}
                            {row.totalCapacity ?? "—"}
                        </span>

                        {row.occupancyPercentage !== null &&
                            row.occupancyPercentage !==
                            undefined && (
                                <span className="text-stone-400">
                                    {row.occupancyPercentage}%
                                </span>
                            )}
                    </div>

                    {row.totalCapacity && (
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100">
                            <div
                                className={`h-full rounded-full ${getOccupancyColor(
                                    getOccupancy(row)
                                )}`}
                                style={{
                                    width: `${getOccupancy(
                                        row
                                    )}%`,
                                }}
                            />
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: "availableCapacity",
            label: "Available",
            render: (row) => (
                <span className="font-medium text-emerald-700">
                    {row.availableCapacity ?? "—"}
                </span>
            ),
        },
        {
            key: "description",
            label: "Description",
            render: (row) => (
                <span className="block max-w-xs truncate text-stone-500">
                    {row.description || "—"}
                </span>
            ),
        },
        ...(canUpdate || canDelete
            ? [
                {
                    key: "actions",
                    label: "Actions",
                    render: (row) => (
                        <div className="flex gap-1.5">
                            {/* {canUpdate && (
                                <button
                                    onClick={() =>
                                        openEdit(row)
                                    }
                                    className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 hover:bg-stone-200"
                                >
                                    Edit
                                </button>
                            )} */}

                            {canDelete && (
                                <button
                                    onClick={() =>
                                        setDeleteRack(row)
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
        <div className="min-h-full bg-[#f7f3ea] px-1 pb-10">
            {/* Header */}
            <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                        <span className="h-px w-6 bg-amber-700" />
                        Library Storage
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                        Library Racks
                    </h2>

                    <p className="mt-1 text-sm text-stone-500">
                        Organize shelves, sections and book
                        storage
                    </p>
                </div>

                {canCreate && (
                    <button
                        onClick={openCreate}
                        className="rounded-lg bg-[#754c24] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5f3e1e]"
                    >
                        + Add Rack
                    </button>
                )}
            </div>

            {/* Stats */}
            <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-5">
                {/* Racks */}
                <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                        Total Racks
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                        {stats.racks}
                    </p>
                </div>

                {/* Sections */}
                <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                        Sections
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                        {stats.sections}
                    </p>
                </div>

                {/* Books */}
                <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                        Books on Racks
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                        {stats.currentBookCount}
                    </p>
                </div>

                {/* Available */}
                <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                    <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                        Available Space
                    </p>

                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                        {stats.availableCapacity}
                    </p>
                </div>

                {/* Capacity */}
                <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                            Capacity
                        </p>

                        <span className="text-xs font-semibold text-stone-500">
                            {stats.occupancyPercentage}%
                        </span>
                    </div>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                        {stats.totalCapacity || "—"}
                    </p>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                        <div
                            className={`h-full rounded-full ${getOccupancyColor(
                                stats.occupancyPercentage
                            )}`}
                            style={{
                                width: `${Math.min(
                                    100,
                                    stats.occupancyPercentage
                                )}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Shelf visualization */}
            {!loading && racks.length > 0 && (
                <section className="mb-8 overflow-hidden rounded-2xl border border-stone-200 bg-[#efe8da] shadow-sm">
                    <div className="border-b border-stone-200 bg-white/70 px-5 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-slate-800">
                                    Shelf View
                                </h3>

                                <p className="mt-0.5 text-xs text-stone-500">
                                    Current physical capacity of
                                    library racks
                                </p>
                            </div>

                            <div className="hidden items-center gap-4 text-xs text-stone-500 sm:flex">
                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                                    Available
                                </span>

                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
                                    Filling
                                </span>

                                <span className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
                                    Nearly Full
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
                        {racks.map((rack, rackIndex) => {
                            const occupancy =
                                getOccupancy(rack);

                            const visualBookCount =
                                getVisualBookCount(rack);

                            const isCapacityDefined =
                                rack.totalCapacity !== null &&
                                rack.totalCapacity !==
                                undefined;

                            return (
                                <div
                                    key={rack.id}
                                    className="group relative rounded-xl bg-[#8b5e34] p-3 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    {/* Rack Header */}
                                    <div className="mb-2 flex items-center justify-between rounded-md bg-[#6f471f] px-3 py-2 text-white">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold">
                                                {rack.rackCode}
                                            </p>

                                            <p className="truncate text-[10px] text-amber-100">
                                                {rack.floorSection
                                                    ? `${rack.floorSection} • ${rack.label} • ${rack.section || "Library Shelf"}`
                                                    : rack.label || "Library Shelf"}
                                            </p>

                                        </div>

                                        <span className="ml-2 flex-shrink-0 rounded-full bg-white/15 px-2 py-1 text-[10px]">
                                            Row{" "}
                                            {rack.rowNumber ??
                                                rackIndex + 1}
                                        </span>
                                    </div>

                                    {/* Bookshelf */}
                                    <div className="rounded-sm bg-[#d5b98d] p-2">
                                        {/* Upper shelf */}
                                        <div className="flex h-20 items-end gap-1 overflow-hidden border-b-[5px] border-[#75491f] bg-[#e7d5b7] px-2 pb-1">
                                            {Array.from({
                                                length: visualBookCount,
                                            }).map(
                                                (_, index) => (
                                                    <div
                                                        key={
                                                            index
                                                        }
                                                        className={`flex-shrink-0 rounded-t-[2px] ${bookColors[
                                                            (index +
                                                                rackIndex) %
                                                            bookColors.length
                                                        ]
                                                            }`}
                                                        style={{
                                                            width:
                                                                "12px",
                                                            height: `${42 +
                                                                ((index *
                                                                    7) %
                                                                    20)
                                                                }px`,
                                                        }}
                                                    >
                                                        <div className="mx-auto h-full w-px bg-white/20" />
                                                    </div>
                                                )
                                            )}

                                            {visualBookCount ===
                                                0 && (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <span className="text-[10px] text-stone-500">
                                                            Empty shelf
                                                        </span>
                                                    </div>
                                                )}
                                        </div>

                                        {/* Lower shelf */}
                                        <div className="mt-2 flex h-12 items-end gap-1 overflow-hidden border-b-[5px] border-[#75491f] bg-[#e7d5b7] px-2 pb-1">
                                            {Array.from({
                                                length: Math.max(
                                                    Math.round(
                                                        visualBookCount *
                                                        0.65
                                                    ),
                                                    visualBookCount >
                                                        0
                                                        ? 1
                                                        : 0
                                                ),
                                            }).map(
                                                (_, index) => (
                                                    <div
                                                        key={
                                                            index
                                                        }
                                                        className={`h-8 w-3 flex-shrink-0 rounded-t-[2px] ${bookColors[
                                                            (index +
                                                                rackIndex +
                                                                2) %
                                                            bookColors.length
                                                        ]
                                                            }`}
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Rack Capacity */}
                                    <div className="mt-2 rounded-md bg-[#6f471f] px-3 py-2">
                                        <div className="mb-1.5 flex items-center justify-between text-[10px] text-amber-50">
                                            <span className="truncate">
                                                {rack.section ||
                                                    "General Collection"}
                                            </span>

                                            <span className="ml-2 flex-shrink-0 font-semibold">
                                                {isCapacityDefined
                                                    ? `${rack.currentBookCount ?? 0} / ${rack.totalCapacity}`
                                                    : `${rack.currentBookCount ??
                                                    0
                                                    } books`}
                                            </span>
                                        </div>

                                        {isCapacityDefined && (
                                            <>
                                                <div className="h-1.5 overflow-hidden rounded-full bg-black/20">
                                                    <div
                                                        className={`h-full rounded-full transition-all ${getOccupancyColor(
                                                            occupancy
                                                        )}`}
                                                        style={{
                                                            width: `${occupancy}%`,
                                                        }}
                                                    />
                                                </div>

                                                <div className="mt-1.5 flex justify-between text-[9px] text-amber-100/80">
                                                    <span>
                                                        {rack.currentBookCount ??
                                                            0}{" "}
                                                        books
                                                    </span>

                                                    <span>
                                                        {rack.availableCapacity ??
                                                            0}{" "}
                                                        spaces left
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {(canUpdate ||
                                        canDelete) && (
                                            <div className="absolute right-2 top-2 hidden gap-1 group-hover:flex">
                                                {canUpdate && (
                                                    <button
                                                        onClick={() =>
                                                            openEdit(
                                                                rack
                                                            )
                                                        }
                                                        className="rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-stone-700 shadow"
                                                    >
                                                        Edit
                                                    </button>
                                                )}

                                                {canDelete && (
                                                    <button
                                                        onClick={() =>
                                                            setDeleteRack(
                                                                rack
                                                            )
                                                        }
                                                        className="rounded bg-red-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Search + management */}
            <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="border-b border-stone-100 px-5 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="font-bold text-slate-800">
                                Rack Directory
                            </h3>

                            <p className="text-xs text-stone-500">
                                Search and manage library shelves
                            </p>
                        </div>

                        <form
                            onSubmit={handleSearch}
                            className="flex gap-2"
                        >
                            <input
                                className="w-64 rounded-lg border border-stone-300 px-4 py-2 text-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
                                placeholder="Search rack..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                            <button
                                type="submit"
                                className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200"
                            >
                                Search
                            </button>

                            {search && (
                                <button
                                    type="button"
                                    onClick={
                                        handleClearSearch
                                    }
                                    className="rounded-lg px-3 py-2 text-sm text-stone-500 hover:text-stone-700"
                                >
                                    Clear
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {error && (
                    <div className="mx-5 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        data={racks}
                        loading={loading}
                        emptyMessage="No racks found."
                        onRowClick={openEdit}
                    />
                </div>
            </section>

            {/* Create / Edit Modal */}
            {modalMode && (
                <Modal
                    title={
                        modalMode === "create"
                            ? "Add Library Rack"
                            : "Edit Library Rack"
                    }
                    onClose={() =>
                        setModalMode(null)
                    }
                >
                    <div className="space-y-4">
                        {formError && (
                            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                {formError}
                            </p>
                        )}

                        {/* Rack Code */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-stone-600">
                                Rack Code *
                            </label>

                            <input
                                className={inputCls}
                                maxLength={20}
                                placeholder="e.g. RACK-A01"
                                value={form.rackCode}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        rackCode:
                                            e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Label */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-stone-600">
                                Label *
                            </label>

                            <input
                                className={inputCls}
                                maxLength={100}
                                placeholder="e.g. Fiction Section"
                                value={form.label}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        label:
                                            e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Floor Section + Section */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-stone-600">
                                    Floor Section
                                </label>

                                <input
                                    className={inputCls}
                                    maxLength={100}
                                    placeholder="e.g. First Floor"
                                    value={form.floorSection}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            floorSection: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-stone-600">
                                    Section
                                </label>

                                <input
                                    className={inputCls}
                                    maxLength={100}
                                    placeholder="e.g. Science"
                                    value={form.section}
                                    onChange={(e) =>
                                        setForm((p) => ({
                                            ...p,
                                            section: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        {/* Row */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-stone-600">
                                Row Number
                            </label>

                            <input
                                className={inputCls}
                                type="number"
                                min="1"
                                placeholder="e.g. 3"
                                value={form.rowNumber}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        rowNumber: e.target.value,
                                    }))
                                }
                            />
                        </div>


                        {/* Capacity */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-stone-600">
                                Total Capacity
                            </label>

                            <input
                                className={inputCls}
                                type="number"
                                min="1"
                                placeholder="e.g. 100"
                                value={form.totalCapacity}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        totalCapacity:
                                            e.target.value,
                                    }))
                                }
                            />

                            <p className="mt-1 text-xs text-stone-400">
                                Maximum number of book
                                copies this rack can hold.
                            </p>

                            {modalMode === "edit" &&
                                activeRack?.currentBookCount !=
                                null && (
                                    <p className="mt-1 text-xs text-amber-700">
                                        Currently holding{" "}
                                        <strong>
                                            {
                                                activeRack.currentBookCount
                                            }
                                        </strong>{" "}
                                        book copies. Capacity
                                        cannot be reduced below
                                        this number.
                                    </p>
                                )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="mb-1 block text-xs font-medium text-stone-600">
                                Description
                            </label>

                            <textarea
                                className={`${inputCls} resize-none`}
                                rows={3}
                                maxLength={300}
                                placeholder="Optional rack description..."
                                value={form.description}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        description:
                                            e.target.value,
                                    }))
                                }
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() =>
                                    setModalMode(null)
                                }
                                className="rounded-lg border border-stone-300 px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-lg bg-[#754c24] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5f3e1e] disabled:opacity-50"
                            >
                                {saving
                                    ? "Saving..."
                                    : modalMode ===
                                        "create"
                                        ? "Add Rack"
                                        : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            {deleteRack && (
                <ConfirmDialog
                    message={`Delete rack "${deleteRack.rackCode}"? This is only allowed if the rack contains no book copies.`}
                    onConfirm={handleDelete}
                    onCancel={() =>
                        setDeleteRack(null)
                    }
                    loading={saving}
                />
            )}
        </div>
    );
};

export default Racks;
