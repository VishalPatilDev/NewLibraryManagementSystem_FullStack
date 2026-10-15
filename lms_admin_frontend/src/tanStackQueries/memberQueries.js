import memberService from "../services/memberService";

/*
 * Query key factory
 *
 * Keeping query keys in one place prevents accidental
 * inconsistencies throughout the application.
 */
export const memberKeys = {
    all: ["members"],

    lists: () => [...memberKeys.all, "list"],

    list: (params) => [
        ...memberKeys.lists(),
        params,
    ],

    detail: (id) => [
        ...memberKeys.all,
        "detail",
        id,
    ],
};

/*
 * Fetch members.
 *
 * This function decides whether we are doing:
 *
 * GET /members
 *
 * or:
 *
 * GET /members/search
 */
export const getMembers = async ({
    queryKey,
}) => {
    const [, , params] = queryKey;

    const {
        keyword,
        page,
        size,
        sortBy,
        direction,
    } = params;

    if (keyword?.trim()) {
        return memberService.search({
            keyword: keyword.trim(),
            page,
            size,
            sortBy,
            direction,
        });
    }

    return memberService.getAll({
        page,
        size,
        sortBy,
        direction,
    });
};

/*
 * Fetch academic years.
 */
export const getAcademicYears = async () => {
    const response = await memberService.getAcademicYears();

    return Array.isArray(response)
        ? response
        : response?.content ?? [];
};
