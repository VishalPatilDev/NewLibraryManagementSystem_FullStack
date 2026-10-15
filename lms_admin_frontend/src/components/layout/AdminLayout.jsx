import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100">

            {/* Top Navbar */}
            <Navbar />

            <div className="flex">

                {/* Sidebar */}
                <Sidebar />

                {/* Page Content */}
                <main className="min-h-[calc(100vh-4rem)] flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default AdminLayout;
