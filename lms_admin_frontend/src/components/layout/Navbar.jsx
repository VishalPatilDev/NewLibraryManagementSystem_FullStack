import { useState } from "react";
import { Link } from "react-router-dom";
import useApi from "../../hooks/useApi";

const Navbar = () => {
    const { currentUser, logout } = useApi();

    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        setOpen(false);
        logout();
    };

    return (
        <header className="sticky top-0 z-50 h-16 border-b border-blue-100 bg-white/95 shadow-sm backdrop-blur">

            <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo / Application Name */}
                <Link
                    to="/dashboard"
                    className="group flex items-center gap-3"
                >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-xl text-white shadow-sm shadow-blue-200 transition duration-200 group-hover:shadow-md group-hover:shadow-blue-200">
                        📚
                    </div>

                    <div className="leading-tight">
                        <h1 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg">
                            Library Management
                        </h1>

                        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-blue-600">
                            Staff Portal
                        </p>
                    </div>
                </Link>

                {/* Right Side */}
                <div className="relative">

                    <button
                        type="button"
                        onClick={() => setOpen((previous) => !previous)}
                        className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-1.5 transition-all duration-200 sm:gap-3 sm:px-3 ${
                            open
                                ? "border-blue-200 bg-blue-50 shadow-sm"
                                : "border-transparent hover:border-blue-100 hover:bg-blue-50/70"
                        }`}
                    >

                        {/* Avatar */}
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-sm font-bold text-blue-700 ring-2 ring-white shadow-sm">
                            {currentUser?.name?.charAt(0)?.toUpperCase()}
                        </div>

                        {/* User Info */}
                        <div className="hidden text-left sm:block">
                            <p className="max-w-32 truncate text-sm font-semibold text-slate-800">
                                {currentUser?.name}
                            </p>

                            <p className="mt-0.5 text-[11px] font-medium capitalize text-slate-500">
                                {currentUser?.role}
                            </p>
                        </div>

                        {/* Arrow */}
                        <span
                            className={`ml-0.5 text-[9px] font-bold text-slate-400 transition-transform duration-200 ${
                                open ? "rotate-180 text-blue-600" : ""
                            }`}
                        >
                            ▼
                        </span>

                    </button>

                    {/* Dropdown */}
                    {open && (
                        <div className="absolute right-0 mt-2.5 w-72 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-900/10">

                            {/* Dropdown Accent */}
                            <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />

                            {/* User Information */}
                            <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50/70 to-white px-4 py-4">

                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-base font-bold text-blue-700 ring-4 ring-white shadow-sm">
                                        {currentUser?.name?.charAt(0)?.toUpperCase()}
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-800">
                                            {currentUser?.name}
                                        </p>

                                        <p className="mt-0.5 truncate text-xs text-slate-500">
                                            {currentUser?.email}
                                        </p>
                                    </div>
                                </div>

                                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-700">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    {currentUser?.role}
                                </span>

                            </div>

                            {/* Menu */}
                            <div className="p-2">

                                <Link
                                    to="/profile"
                                    onClick={() => setOpen(false)}
                                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm transition group-hover:bg-blue-100">
                                        👤
                                    </span>

                                    <div>
                                        <p className="font-medium">
                                            My Profile
                                        </p>
                                        <p className="text-[10px] text-slate-400 group-hover:text-blue-400">
                                            Manage your account
                                        </p>
                                    </div>
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="group mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-sm transition group-hover:bg-red-100">
                                        🚪
                                    </span>

                                    <div>
                                        <p className="font-medium">
                                            Logout
                                        </p>
                                        <p className="text-[10px] text-red-400">
                                            Sign out of your account
                                        </p>
                                    </div>
                                </button>

                            </div>

                        </div>
                    )}

                </div>

            </div>

        </header>
    );
};

export default Navbar;
