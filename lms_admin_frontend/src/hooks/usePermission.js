import useApi from "./useApi";

const usePermission = () => {
    const { currentUser } = useApi();

    const permissions = currentUser?.permissions ?? [];

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const hasAnyPermission = (requiredPermissions) => {
        return requiredPermissions.some((permission) =>
            permissions.includes(permission)
        );
    };

    const hasAllPermissions = (requiredPermissions) => {
        return requiredPermissions.every((permission) =>
            permissions.includes(permission)
        );
    };

    const isAdmin = currentUser?.role === "ADMIN";
    const isLibrarian = currentUser?.role === "LIBRARIAN";

    return {
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isAdmin,
        isLibrarian,
    };
};

export default usePermission;
