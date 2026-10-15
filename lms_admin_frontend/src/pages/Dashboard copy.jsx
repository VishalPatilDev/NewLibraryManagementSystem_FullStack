import { useEffect, useState } from "react";
import dashboardService from "../services/dashboardService";

const StatCard = ({ icon, label, value, color }) => (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`mt-1 text-3xl font-bold ${color}`}>
                    {value ?? "—"}
                </p>
            </div>
            <span className="text-3xl">{icon}</span>
        </div>
    </div>
);

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

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center text-gray-400">
                Loading dashboard…
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl bg-red-50 p-6 text-center text-red-600">
                {error}
            </div>
        );
    }

    const cards = [
        { icon: "📚", label: "Total Books", value: stats?.totalBooks, color: "text-blue-600" },
        { icon: "📦", label: "Total Copies", value: stats?.totalBookCopies, color: "text-indigo-600" },
        { icon: "✅", label: "Available Copies", value: stats?.availableCopies, color: "text-green-600" },
        { icon: "👥", label: "Total Members", value: stats?.totalMembers, color: "text-purple-600" },
        { icon: "🟢", label: "Active Members", value: stats?.activeMembers, color: "text-emerald-600" },
        { icon: "📖", label: "Active Loans", value: stats?.activeLoans, color: "text-yellow-600" },
        { icon: "⚠️", label: "Overdue Loans", value: stats?.overdueLoans, color: "text-red-600" },
        { icon: "📌", label: "Pending Reservations", value: stats?.pendingReservations, color: "text-orange-600" },
        { icon: "💰", label: "Pending Fines", value: stats?.pendingFines, color: "text-rose-600" },
        { icon: "💰", label: "Paid Fines", value: stats?.paidFines, color: "text-rose-600" },

        {
            icon: "💵",
            label: "Pending Fine",
            value: stats?.totalPendingFineAmount != null ? `₹${Number(stats.totalPendingFineAmount).toFixed(2)}` : "—",
            color: "text-red-700",
        },
        {
            icon: "💵",
            label: "Paid Fine",
            value: stats?.totalPaidFineAmount != null ? `₹${Number(stats.totalPaidFineAmount).toFixed(2)}` : "—",
            color: "text-green-700",
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="mt-1 text-sm text-gray-500">
                    Overview of library activity
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cards.map((card) => (
                    <StatCard key={card.label} {...card} />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;