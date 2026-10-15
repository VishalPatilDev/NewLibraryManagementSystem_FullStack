import { NavLink } from "react-router-dom";
import usePermission from "../../hooks/usePermission";
import { navigation } from "../../config/navigation";

const Sidebar = () => {

    const { hasPermission } = usePermission();

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:bg-slate-800 hover:text-white"
        }`;

    return (
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto bg-slate-900">

            <div className="p-4">

                {navigation.map((section) => {

                    const visibleItems = section.items.filter(
                        (item) => {

                            console.log(
                                "Item:",
                                item.label,
                                "Permission:",
                                item.permission,
                                "Result:",
                                !item.permission || hasPermission(item.permission)
                            );
                            return !item.permission ||
                                hasPermission(item.permission)
                        });

                    if (visibleItems.length === 0) {
                        return null;
                    }

                    return (
                        <div
                            key={section.section}
                            className="mb-6"
                        >
                            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                {section.section}
                            </p>

                            <nav className="space-y-1">

                                {visibleItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={navLinkClass}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}

                            </nav>
                        </div>
                    );
                })}

                {/* Always available */}
                <div>

                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Account
                    </p>

                    <NavLink
                        to="/profile"
                        className={navLinkClass}
                    >
                        <span>👤</span>
                        <span>My Profile</span>
                    </NavLink>

                </div>

            </div>

        </aside>
    );
};

export default Sidebar;
