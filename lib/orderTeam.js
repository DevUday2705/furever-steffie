// Who can own an order. Shared by the API and the admin pages, so keep this
// file free of server-only imports.
export const ORDER_TEAM = [
    { email: "artygirl360@gmail.com", name: "Chetna" },
    { email: "udaykulkarniu10@gmail.com", name: "Uday" },
];

export const DEFAULT_ORDER_OWNER = ORDER_TEAM[0].email;

export const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const isOrderTeamMember = (email) =>
    ORDER_TEAM.some((member) => member.email === normalizeEmail(email));

// Orders placed before ownership existed have no assignedTo and are Chetna's.
export const getOrderOwner = (order) => normalizeEmail(order?.assignedTo) || DEFAULT_ORDER_OWNER;

export const getStaffName = (email) =>
    ORDER_TEAM.find((member) => member.email === normalizeEmail(email))?.name || email || "Unknown";
