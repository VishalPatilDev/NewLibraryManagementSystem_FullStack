import { useEffect, useMemo, useState } from "react";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import dashboardService from "../services/dashboardService";

/* -------------------------------------------------------
   Small reusable components
------------------------------------------------------- */

const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    iconBg,
    valueColor = "text-slate-900",
}) => (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between">
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                    {title}
                </p>

                <p
                    className={`mt-2 text-3xl font-bold tracking-tight ${valueColor}`}
                >
                    {value ?? "—"}
                </p>

                {subtitle && (
                    <p className="mt-1 text-xs text-slate-400">
                        {subtitle}
                    </p>
                )}
            </div>

            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${iconBg}`}
            >
                {icon}
            </div>
        </div>
    </div>
);

const ChartCard = ({ title, description, children, className = "" }) => (
    <div
        className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}
    >
        <div className="mb-5">
            <h3 className="text-base font-semibold text-slate-800">
                {title}
            </h3>

            {description && (
                <p className="mt-1 text-xs text-slate-500">
                    {description}
                </p>
            )}
        </div>

        {children}
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
        return null;
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
            {label && (
                <p className="mb-2 text-xs font-semibold text-slate-600">
                    {label}
                </p>
            )}

            {payload.map((entry) => (
                <div
                    key={entry.dataKey}
                    className="flex items-center justify-between gap-6 text-sm"
                >
                    <span className="text-slate-500">
                        {entry.name}
                    </span>

                    <span className="font-semibold text-slate-800">
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

const EmptyChart = ({ message = "No data available" }) => (
    <div className="flex h-[280px] items-center justify-center rounded-xl bg-slate-50">
        <div className="text-center">
            <div className="text-3xl">📊</div>
            <p className="mt-2 text-sm font-medium text-slate-500">
                {message}
            </p>
        </div>
    </div>
);

/* -------------------------------------------------------
   Dashboard
------------------------------------------------------- */

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        dashboardService
            .getStats()
            .then(setStats)
            .catch(() => setError("Failed to load dashboard stats."))
            .finally(() => setLoading(false));
    }, []);

    /* ---------------------------------------------------
       Chart data
    --------------------------------------------------- */

    const collectionData = useMemo(() => {
        const total = Number(stats?.totalBookCopies ?? 0);
        const available = Number(stats?.availableCopies ?? 0);

        const issued = Math.max(total - available, 0);

        return [
            {
                name: "Available",
                copies: available,
            },
            {
                name: "Issued",
                copies: issued,
            },
        ];
    }, [stats]);

    const loanData = useMemo(() => {
        const active = Number(stats?.activeLoans ?? 0);
        const overdue = Number(stats?.overdueLoans ?? 0);

        /*
         * Overdue loans are normally included in active loans.
         * Therefore the non-overdue portion is active - overdue.
         */
        const current = Math.max(active - overdue, 0);

        return [
            {
                name: "Current",
                value: current,
            },
            {
                name: "Overdue",
                value: overdue,
            },
        ];
    }, [stats]);

    const fineData = useMemo(() => {
        return [
            {
                name: "Pending",
                amount: Number(stats?.totalPendingFineAmount ?? 0),
            },
            {
                name: "Paid",
                amount: Number(stats?.totalPaidFineAmount ?? 0),
            },
        ];
    }, [stats]);

    const memberData = useMemo(() => {
        const active = Number(stats?.activeMembers ?? 0);
        const total = Number(stats?.totalMembers ?? 0);

        return [
            {
                name: "Active",
                members: active,
            },
            {
                name: "Inactive",
                members: Math.max(total - active, 0),
            },
        ];
    }, [stats]);

    const hasCollectionData =
        collectionData.some((item) => item.copies > 0);

    const hasLoanData =
        loanData.some((item) => item.value > 0);

    const hasFineData =
        fineData.some((item) => item.amount > 0);

    const hasMemberData =
        memberData.some((item) => item.members > 0);

    /* ---------------------------------------------------
       Loading state
    --------------------------------------------------- */

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-32 animate-pulse rounded-2xl bg-slate-200"
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
                    <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
                </div>
            </div>
        );
    }

    /* ---------------------------------------------------
       Error state
    --------------------------------------------------- */

    if (error) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl">
                        ⚠️
                    </div>

                    <h3 className="mt-4 font-semibold text-red-800">
                        Unable to load dashboard
                    </h3>

                    <p className="mt-1 text-sm text-red-600">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    /* ---------------------------------------------------
       Main dashboard
    --------------------------------------------------- */

    return (
        <div className="space-y-7 pb-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 shadow-lg">
                {/* Decorative shapes */}
                <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/5" />
                <div className="absolute -bottom-32 right-32 h-72 w-72 rounded-full bg-white/5" />

                <div className="relative px-6 py-7 sm:px-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl ring-1 ring-white/20">
                            📚
                        </div>

                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
                                School Library
                            </p>

                            <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                Library Dashboard
                            </h1>
                        </div>
                    </div>

                    <p className="mt-5 max-w-2xl text-sm leading-6 text-blue-100">
                        A quick overview of your library collection,
                        members, borrowing activity and fines.
                    </p>
                </div>
            </section>

            {/* =================================================
                KEY METRICS
            ================================================= */}

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">
                        At a glance
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Current library statistics
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                    <StatCard
                        title="Total Books"
                        value={stats?.totalBooks}
                        subtitle="Unique titles"
                        icon="📚"
                        iconBg="bg-blue-50"
                        valueColor="text-blue-700"
                    />

                    <StatCard
                        title="Total Copies"
                        value={stats?.totalBookCopies}
                        subtitle="Physical copies"
                        icon="▣"
                        iconBg="bg-indigo-50"
                        valueColor="text-indigo-700"
                    />

                    <StatCard
                        title="Available Copies"
                        value={stats?.availableCopies}
                        subtitle="Ready to issue"
                        icon="✓"
                        iconBg="bg-emerald-50"
                        valueColor="text-emerald-700"
                    />

                    <StatCard
                        title="Total Members"
                        value={stats?.totalMembers}
                        subtitle="Registered members"
                        icon="👥"
                        iconBg="bg-violet-50"
                        valueColor="text-violet-700"
                    />

                    <StatCard
                        title="Active Members"
                        value={stats?.activeMembers}
                        subtitle="Currently active"
                        icon="●"
                        iconBg="bg-green-50"
                        valueColor="text-green-700"
                    />

                    <StatCard
                        title="Active Loans"
                        value={stats?.activeLoans}
                        subtitle="Currently issued"
                        icon="📖"
                        iconBg="bg-amber-50"
                        valueColor="text-amber-700"
                    />

                    <StatCard
                        title="Overdue Loans"
                        value={stats?.overdueLoans}
                        subtitle="Need attention"
                        icon="!"
                        iconBg="bg-red-50"
                        valueColor="text-red-700"
                    />

                    <StatCard
                        title="Reservations"
                        value={stats?.pendingReservations}
                        subtitle="Pending requests"
                        icon="▣"
                        iconBg="bg-orange-50"
                        valueColor="text-orange-700"
                    />
                </div>
            </section>

            {/* =================================================
                CHARTS ROW 1
            ================================================= */}

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Library activity
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Understand collection usage and borrowing activity
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                    {/* Collection chart */}
                    <ChartCard
                        title="Collection availability"
                        description="Available versus currently issued book copies"
                    >
                        {!hasCollectionData ? (
                            <EmptyChart />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={collectionData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -15,
                                        bottom: 5,
                                    }}
                                    barSize={55}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#e2e8f0"
                                    />

                                    <XAxis
                                        dataKey="name"
                                        tick={{
                                            fill: "#64748b",
                                            fontSize: 12,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                        tick={{
                                            fill: "#64748b",
                                            fontSize: 12,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{
                                            fill: "#f8fafc",
                                        }}
                                    />

                                    <Bar
                                        dataKey="copies"
                                        name="Copies"
                                        radius={[8, 8, 0, 0]}
                                        fill="#2563eb"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    {/* Loan pie chart */}
                    <ChartCard
                        title="Loan status"
                        description="Current loans compared with overdue loans"
                    >
                        {!hasLoanData ? (
                            <EmptyChart />
                        ) : (
                            <div className="relative">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={loanData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={75}
                                            outerRadius={110}
                                            paddingAngle={4}
                                            dataKey="value"
                                            nameKey="name"
                                        >
                                            <Cell fill="#10b981" />
                                            <Cell fill="#ef4444" />
                                        </Pie>

                                        <Tooltip />

                                        <Legend
                                            verticalAlign="bottom"
                                            height={30}
                                            iconType="circle"
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Center value */}
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-7">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-slate-800">
                                            {stats?.activeLoans ?? 0}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            Active loans
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ChartCard>
                </div>
            </section>

            {/* =================================================
                CHARTS ROW 2
            ================================================= */}

            <section>
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

                    {/* Fine chart */}
                    <ChartCard
                        title="Fine collection"
                        description="Pending versus collected fine amounts"
                    >
                        {!hasFineData ? (
                            <EmptyChart message="No fine records available" />
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={fineData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 0,
                                        bottom: 5,
                                    }}
                                    barSize={60}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#e2e8f0"
                                    />

                                    <XAxis
                                        dataKey="name"
                                        tick={{
                                            fill: "#64748b",
                                            fontSize: 12,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        tick={{
                                            fill: "#64748b",
                                            fontSize: 12,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) =>
                                            `₹${value}`
                                        }
                                    />

                                    <Tooltip
                                        formatter={(value) =>
                                            `₹${Number(value).toFixed(2)}`
                                        }
                                    />

                                    <Bar
                                        dataKey="amount"
                                        name="Amount"
                                        radius={[8, 8, 0, 0]}
                                    >
                                        {fineData.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={
                                                    index === 0
                                                        ? "#f43f5e"
                                                        : "#10b981"
                                                }
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </ChartCard>

                    {/* Members pie chart */}
                    <ChartCard
                        title="Member activity"
                        description="Active members compared with inactive members"
                    >
                        {!hasMemberData ? (
                            <EmptyChart />
                        ) : (
                            <div className="relative">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={memberData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={75}
                                            outerRadius={110}
                                            paddingAngle={4}
                                            dataKey="members"
                                            nameKey="name"
                                        >
                                            <Cell fill="#7c3aed" />
                                            <Cell fill="#cbd5e1" />
                                        </Pie>

                                        <Tooltip />

                                        <Legend
                                            verticalAlign="bottom"
                                            height={30}
                                            iconType="circle"
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-7">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-slate-800">
                                            {stats?.totalMembers ?? 0}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            Total members
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ChartCard>
                </div>
            </section>

            {/* =================================================
                FINE STATISTICS
            ================================================= */}

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Financial summary
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Current fine activity
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <StatCard
                        title="Pending Fines"
                        value={stats?.pendingFines}
                        subtitle="Unpaid records"
                        icon="₹"
                        iconBg="bg-rose-50"
                        valueColor="text-rose-700"
                    />

                    <StatCard
                        title="Paid Fines"
                        value={stats?.paidFines}
                        subtitle="Paid records"
                        icon="₹"
                        iconBg="bg-emerald-50"
                        valueColor="text-emerald-700"
                    />

                    <StatCard
                        title="Pending Amount"
                        value={
                            stats?.totalPendingFineAmount != null
                                ? `₹${Number(
                                    stats.totalPendingFineAmount
                                ).toFixed(2)}`
                                : "—"
                        }
                        subtitle="Yet to be collected"
                        icon="₹"
                        iconBg="bg-red-50"
                        valueColor="text-red-700"
                    />

                    <StatCard
                        title="Collected Amount"
                        value={
                            stats?.totalPaidFineAmount != null
                                ? `₹${Number(
                                    stats.totalPaidFineAmount
                                ).toFixed(2)}`
                                : "—"
                        }
                        subtitle="Total collected"
                        icon="₹"
                        iconBg="bg-green-50"
                        valueColor="text-green-700"
                    />
                </div>
            </section>

            {/* =================================================
                ATTENTION REQUIRED
            ================================================= */}

            <section>
                <div className="mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Attention required
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Items that may need staff action
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    {/* Overdue */}
                    <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl">
                                ⚠️
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Overdue loans
                                </p>

                                <p className="mt-1 text-2xl font-bold text-red-700">
                                    {stats?.overdueLoans ?? "—"}
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-slate-500">
                            Books that have passed their expected return date.
                        </p>
                    </div>

                    {/* Reservations */}
                    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-xl">
                                📌
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Pending reservations
                                </p>

                                <p className="mt-1 text-2xl font-bold text-orange-700">
                                    {stats?.pendingReservations ?? "—"}
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-slate-500">
                            Reservation requests waiting for staff action.
                        </p>
                    </div>

                    {/* Pending fine */}
                    <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-xl">
                                ₹
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Outstanding fines
                                </p>

                                <p className="mt-1 text-2xl font-bold text-rose-700">
                                    {stats?.totalPendingFineAmount != null
                                        ? `₹${Number(
                                            stats.totalPendingFineAmount
                                        ).toFixed(2)}`
                                        : "—"}
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 text-xs text-slate-500">
                            Total amount currently awaiting collection.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
