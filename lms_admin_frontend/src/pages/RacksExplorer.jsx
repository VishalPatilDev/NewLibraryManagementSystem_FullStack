import { useEffect, useMemo, useState } from "react";
import rackService from "../services/rackService";

const bookColors = [
    "bg-rose-700",
    "bg-amber-700",
    "bg-emerald-700",
    "bg-blue-800",
    "bg-indigo-800",
    "bg-orange-700",
    "bg-teal-700",
];

const RackExplorer = () => {
    const [racks, setRacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedFloor, setSelectedFloor] = useState("ALL");
    const [selectedSection, setSelectedSection] = useState("ALL");

    const loadRacks = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await rackService.getAll();
            setRacks(data ?? []);
        } catch (err) {
            console.error("RACK EXPLORER ERROR:", err);

            setError(
                err.response?.data?.message ||
                "Failed to load library racks."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRacks();
    }, []);

    /*
     * Get unique floors.
     *
     * Example:
     * First Floor
     * Ground Floor
     * Second Floor
     */
    const floors = useMemo(() => {
        return [
            ...new Set(
                racks
                    .map((rack) => rack.floorSection)
                    .filter(Boolean)
            ),
        ].sort((a, b) => a.localeCompare(b));
    }, [racks]);

    /*
     * Sections available for the currently selected floor.
     *
     * If ALL floors are selected, show sections from all floors.
     */
    const sections = useMemo(() => {
        const floorRacks =
            selectedFloor === "ALL"
                ? racks
                : racks.filter(
                    (rack) =>
                        rack.floorSection === selectedFloor
                );

        return [
            ...new Set(
                floorRacks
                    .map((rack) => rack.section)
                    .filter(Boolean)
            ),
        ].sort((a, b) => a.localeCompare(b));
    }, [racks, selectedFloor]);

    /*
     * When floor changes, reset section selection.
     */
    const handleFloorChange = (floor) => {
        setSelectedFloor(floor);
        setSelectedSection("ALL");
    };

    /*
     * Final filtered racks.
     */
    const filteredRacks = useMemo(() => {
        return racks.filter((rack) => {
            const floorMatches =
                selectedFloor === "ALL" ||
                rack.floorSection === selectedFloor;

            const sectionMatches =
                selectedSection === "ALL" ||
                rack.section === selectedSection;

            return floorMatches && sectionMatches;
        });
    }, [racks, selectedFloor, selectedSection]);

    /*
     * Statistics for selected view.
     */
    const stats = useMemo(() => {
        const totalCapacity = filteredRacks.reduce(
            (sum, rack) =>
                sum + (Number(rack.totalCapacity) || 0),
            0
        );

        const currentBookCount = filteredRacks.reduce(
            (sum, rack) =>
                sum + (Number(rack.currentBookCount) || 0),
            0
        );

        const availableCapacity = filteredRacks.reduce(
            (sum, rack) =>
                sum + (Number(rack.availableCapacity) || 0),
            0
        );

        const occupancyPercentage =
            totalCapacity > 0
                ? Math.round(
                    (currentBookCount / totalCapacity) *
                    10000
                ) / 100
                : 0;

        return {
            racks: filteredRacks.length,
            sections: new Set(
                filteredRacks
                    .map((rack) => rack.section)
                    .filter(Boolean)
            ).size,
            books: currentBookCount,
            capacity: totalCapacity,
            available: availableCapacity,
            occupancy: occupancyPercentage,
        };
    }, [filteredRacks]);

    const getOccupancy = (rack) => {
        if (
            rack.occupancyPercentage === null ||
            rack.occupancyPercentage === undefined
        ) {
            return 0;
        }

        return Math.min(
            100,
            Math.max(
                0,
                Number(rack.occupancyPercentage)
            )
        );
    };

    const getOccupancyColor = (occupancy) => {
        if (occupancy >= 85) {
            return "bg-red-500";
        }

        if (occupancy >= 60) {
            return "bg-yellow-400";
        }

        return "bg-emerald-500";
    };

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

    /*
     * Group filtered racks by section.
     *
     * This gives the page a visual structure like:
     *
     * First Floor
     *   Science
     *      Rack A01
     *      Rack A02
     *
     *   Mathematics
     *      Rack B01
     *      Rack B02
     */
    const racksBySection = useMemo(() => {
        const grouped = {};

        filteredRacks.forEach((rack) => {
            const section =
                rack.section || "General Collection";

            if (!grouped[section]) {
                grouped[section] = [];
            }

            grouped[section].push(rack);
        });

        return Object.entries(grouped).sort(
            ([a], [b]) => a.localeCompare(b)
        );
    }, [filteredRacks]);

    return (
        <div className="min-h-full bg-[#f7f3ea] px-1 pb-12">

            {/* Header */}
            <div className="mb-7">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                    <span className="h-px w-6 bg-amber-700" />
                    Library Navigation
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                    Rack Explorer
                </h1>

                <p className="mt-1 text-sm text-stone-500">
                    Find library racks by floor and section
                </p>
            </div>

            {/* Filters */}
            <section className="mb-7 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="font-bold text-slate-800">
                        Find a Rack
                    </h2>

                    <p className="mt-0.5 text-xs text-stone-500">
                        Select a floor and section to view
                        the corresponding racks.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">

                    {/* Floor */}
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                            Floor
                        </label>

                        <select
                            value={selectedFloor}
                            onChange={(e) =>
                                handleFloorChange(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
                        >
                            <option value="ALL">
                                All Floors
                            </option>

                            {floors.map((floor) => (
                                <option
                                    key={floor}
                                    value={floor}
                                >
                                    {floor}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Section */}
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                            Section
                        </label>

                        <select
                            value={selectedSection}
                            onChange={(e) =>
                                setSelectedSection(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-lg border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-100"
                        >
                            <option value="ALL">
                                All Sections
                            </option>

                            {sections.map((section) => (
                                <option
                                    key={section}
                                    value={section}
                                >
                                    {section}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Current selection */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-stone-500">
                        Showing:
                    </span>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {selectedFloor === "ALL"
                            ? "All Floors"
                            : selectedFloor}
                    </span>

                    <span className="text-stone-400">
                        /
                    </span>

                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                        {selectedSection === "ALL"
                            ? "All Sections"
                            : selectedSection}
                    </span>

                    {(selectedFloor !== "ALL" ||
                        selectedSection !== "ALL") && (
                            <button
                                onClick={() => {
                                    setSelectedFloor("ALL");
                                    setSelectedSection("ALL");
                                }}
                                className="ml-2 text-xs font-medium text-amber-700 hover:text-amber-900"
                            >
                                Clear filters
                            </button>
                        )}
                </div>
            </section>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-amber-700" />

                    <p className="text-sm text-stone-500">
                        Loading library racks...
                    </p>
                </div>
            )}

            {!loading && (
                <>
                    {/* Statistics */}
                    <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-5">

                        <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                                Racks
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-800">
                                {stats.racks}
                            </p>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                                Sections
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-800">
                                {stats.sections}
                            </p>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                                Books
                            </p>

                            <p className="mt-1 text-2xl font-bold text-slate-800">
                                {stats.books}
                            </p>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                                Available
                            </p>

                            <p className="mt-1 text-2xl font-bold text-emerald-700">
                                {stats.available}
                            </p>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium uppercase tracking-wider text-stone-400">
                                    Occupancy
                                </p>

                                <span className="text-xs font-semibold text-stone-500">
                                    {stats.occupancy}%
                                </span>
                            </div>

                            <p className="mt-1 text-2xl font-bold text-slate-800">
                                {stats.capacity || "—"}
                            </p>

                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                                <div
                                    className={`h-full rounded-full ${getOccupancyColor(
                                        stats.occupancy
                                    )}`}
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            stats.occupancy
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Empty */}
                    {filteredRacks.length === 0 && (
                        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-sm">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-2xl">
                                📚
                            </div>

                            <h3 className="font-bold text-slate-800">
                                No racks found
                            </h3>

                            <p className="mt-1 text-sm text-stone-500">
                                There are no racks matching
                                the selected floor and section.
                            </p>
                        </div>
                    )}

                    {/* Section-wise racks */}
                    {racksBySection.length > 0 && (
                        <div className="space-y-8">

                            {racksBySection.map(
                                ([section, sectionRacks]) => (
                                    <section
                                        key={section}
                                        className="overflow-hidden rounded-2xl border border-stone-200 bg-[#efe8da] shadow-sm"
                                    >

                                        {/* Section Header */}
                                        <div className="border-b border-stone-200 bg-white/80 px-5 py-4">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="h-2.5 w-2.5 rounded-full bg-amber-700" />

                                                        <h2 className="text-lg font-bold text-slate-800">
                                                            {section}
                                                        </h2>
                                                    </div>

                                                    <p className="mt-1 text-xs text-stone-500">
                                                        {selectedFloor ===
                                                            "ALL"
                                                            ? sectionRacks[0]
                                                                ?.floorSection ||
                                                            "Library"
                                                            : selectedFloor}
                                                        {" • "}
                                                        {sectionRacks.length}{" "}
                                                        rack
                                                        {sectionRacks.length !==
                                                            1
                                                            ? "s"
                                                            : ""}
                                                    </p>
                                                </div>

                                                <div className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
                                                    {sectionRacks.reduce(
                                                        (
                                                            sum,
                                                            rack
                                                        ) =>
                                                            sum +
                                                            (Number(
                                                                rack.currentBookCount
                                                            ) ||
                                                                0),
                                                        0
                                                    )}{" "}
                                                    books
                                                </div>
                                            </div>
                                        </div>

                                        {/* Racks */}
                                        <div className="grid gap-6 p-5 sm:grid-cols-2 xl:grid-cols-3">

                                            {sectionRacks.map(
                                                (
                                                    rack,
                                                    rackIndex
                                                ) => {
                                                    const occupancy =
                                                        getOccupancy(
                                                            rack
                                                        );

                                                    const visualBookCount =
                                                        getVisualBookCount(
                                                            rack
                                                        );

                                                    const isCapacityDefined =
                                                        rack.totalCapacity !==
                                                        null &&
                                                        rack.totalCapacity !==
                                                        undefined;

                                                    return (
                                                        <div
                                                            key={
                                                                rack.id
                                                            }
                                                            className="rounded-xl bg-[#8b5e34] p-3 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                                                        >

                                                            {/* Rack title */}
                                                            <div className="mb-2 flex items-center justify-between rounded-md bg-[#6f471f] px-3 py-2 text-white">

                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-bold">
                                                                        {
                                                                            rack.rackCode
                                                                        }
                                                                    </p>

                                                                    <p className="truncate text-[10px] text-amber-100">
                                                                        {
                                                                            rack.label
                                                                        }
                                                                    </p>
                                                                </div>

                                                                <span className="ml-2 flex-shrink-0 rounded-full bg-white/15 px-2 py-1 text-[10px]">
                                                                    Row{" "}
                                                                    {rack.rowNumber ??
                                                                        rackIndex +
                                                                        1}
                                                                </span>
                                                            </div>

                                                            {/* Location */}
                                                            <div className="mb-2 flex flex-wrap gap-1.5">
                                                                {rack.floorSection && (
                                                                    <span className="rounded-full bg-white/20 px-2 py-1 text-[9px] font-medium text-white">
                                                                        {
                                                                            rack.floorSection
                                                                        }
                                                                    </span>
                                                                )}

                                                                {rack.section && (
                                                                    <span className="rounded-full bg-white/20 px-2 py-1 text-[9px] font-medium text-white">
                                                                        {
                                                                            rack.section
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Bookshelf */}
                                                            <div className="rounded-sm bg-[#d5b98d] p-2">

                                                                {/* Upper shelf */}
                                                                <div className="flex h-20 items-end gap-1 overflow-hidden border-b-[5px] border-[#75491f] bg-[#e7d5b7] px-2 pb-1">

                                                                    {Array.from(
                                                                        {
                                                                            length: visualBookCount,
                                                                        }
                                                                    ).map(
                                                                        (
                                                                            _,
                                                                            index
                                                                        ) => (
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
                                                                                    Empty
                                                                                    shelf
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                </div>

                                                                {/* Lower shelf */}
                                                                <div className="mt-2 flex h-12 items-end gap-1 overflow-hidden border-b-[5px] border-[#75491f] bg-[#e7d5b7] px-2 pb-1">

                                                                    {Array.from(
                                                                        {
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
                                                                        }
                                                                    ).map(
                                                                        (
                                                                            _,
                                                                            index
                                                                        ) => (
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

                                                            {/* Capacity */}
                                                            <div className="mt-2 rounded-md bg-[#6f471f] px-3 py-2">

                                                                <div className="mb-1.5 flex items-center justify-between text-[10px] text-amber-50">
                                                                    <span>
                                                                        Rack
                                                                        capacity
                                                                    </span>

                                                                    <span className="font-semibold">
                                                                        {isCapacityDefined
                                                                            ? `${rack.currentBookCount ??
                                                                            0
                                                                            } / ${rack.totalCapacity}`
                                                                            : `${rack.currentBookCount ??
                                                                            0
                                                                            } books`}
                                                                    </span>
                                                                </div>

                                                                {isCapacityDefined && (
                                                                    <>
                                                                        <div className="h-1.5 overflow-hidden rounded-full bg-black/20">
                                                                            <div
                                                                                className={`h-full rounded-full ${getOccupancyColor(
                                                                                    occupancy
                                                                                )}`}
                                                                                style={{
                                                                                    width: `${occupancy}%`,
                                                                                }}
                                                                            />
                                                                        </div>

                                                                        <div className="mt-1.5 flex justify-between text-[9px] text-amber-100/80">
                                                                            <span>
                                                                                {
                                                                                    rack.currentBookCount
                                                                                }{" "}
                                                                                books
                                                                            </span>

                                                                            <span>
                                                                                {
                                                                                    rack.availableCapacity
                                                                                }{" "}
                                                                                spaces
                                                                            </span>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>

                                                            {/* Description */}
                                                            {rack.description && (
                                                                <p className="mt-2 truncate px-1 text-[10px] text-amber-100">
                                                                    {
                                                                        rack.description
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </section>
                                )
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RackExplorer;
