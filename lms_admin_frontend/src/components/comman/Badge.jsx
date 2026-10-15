const colorMap = {
    ADMIN: "bg-purple-100 text-purple-700",
    LIBRARIAN: "bg-blue-100 text-blue-700",
    MEMBER: "bg-gray-100 text-gray-700",
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-red-100 text-red-700",
    AVAILABLE: "bg-green-100 text-green-700",
    BORROWED: "bg-yellow-100 text-yellow-700",
    LOST: "bg-red-100 text-red-700",
    DAMAGED: "bg-orange-100 text-orange-700",
    RESERVED: "bg-indigo-100 text-indigo-700",
};

const Badge = ({ value }) => {
    const cls = colorMap[value] ?? "bg-gray-100 text-gray-600";
    return (
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
            {value}
        </span>
    );
};

export default Badge;