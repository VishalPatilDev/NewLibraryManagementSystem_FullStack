export const navigation = [
    {
        section: "Main",
        items: [
            {
                label: "Dashboard",
                path: "/dashboard",
                icon: "📊",
            },
        ],
    },

    {
        section: "Users And Members",
        items: [
            {
                label: "Users",
                path: "/users",
                icon: "👥",
                permission: "USER_READ",
            },
            {
                label: "Members",
                path: "/members",
                icon: "👥",
                permission: "USER_READ",
            },
        ],
    },

    {
        section: "Catalog",
        items: [
            {
                label: "Books",
                path: "/books",
                icon: "📚",
                permission: "BOOK_READ",
            },
            {
                label: "Authors",
                path: "/authors",
                icon: "✍️",
                permission: "AUTHOR_READ",
            },
            {
                label: "Categories",
                path: "/categories",
                icon: "🏷️",
                permission: "CATEGORY_READ",
            },

            {
                label: "Publishers",
                path: "/publishers",
                icon: "🏢",
                permission: "PUBLISHER_READ",
            },
            {
                label: "Editions",
                path: "/editions",
                icon: "📘",
                permission: "RACK_READ",
            },
            {
                label: "Racks",
                path: "/racks",
                icon: "🗄️",
                permission: "RACK_READ",
            },
            {
                label: "RackExplorer",
                path: "/racksExplorer",
                icon: "🗄️",
                permission: "RACK_READ",
            },


        ],
    },

    {
        section: "Library Operations",
        items: [
            {
                label: "Issue Books",
                path: "/loans",
                icon: "📖",
                permission: "LOAN_READ",
            },
            {
                label: "Reservations",
                path: "/reservations",
                icon: "📌",
                permission: "RESERVATION_READ",
            },
            {
                label: "Fines",
                path: "/fines",
                icon: "💰",
                permission: "FINE_READ",
            },
            {
                label: "Publishers",
                path: "/publishers",
                icon: "🏢",
                permission: "BOOK_READ",
            },
        ],
    },

    {
        section: "Reports",
        items: [

            {
                label: "AcademicYear",
                path: "/academicYear",
                icon: "🎓",
                permission: "ACADEMIC_YEAR_READ",
            },
        ],
    },
];
