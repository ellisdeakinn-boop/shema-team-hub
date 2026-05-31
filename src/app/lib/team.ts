// Canonical Shema team roster — update here when roster changes.
// Used as datalist autocomplete on owner / editor / author fields.
export const TEAM = ["Shema", "Keon", "Ellis", "Rasharn", "Anna"] as const;

export type TeamMember = (typeof TEAM)[number];

export const TEAM_DATALIST_ID = "team-members";
