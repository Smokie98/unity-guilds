// Role-based access helpers for the Unity Guilds site

// Staff roles that can edit guild content
const STAFF_ROLES = [
  "newsletter_team",
  "mentor",
  "community_specialist",
  "twitch_staff",
  "super_admin",
];

// Super admin roles with full access
const SUPER_ADMIN_ROLES = ["super_admin", "twitch_staff", "community_specialist"];

// Check if user is staff for a specific guild
export function isGuildStaff(user, guild) {
  if (!user) return false;
  if (SUPER_ADMIN_ROLES.includes(user.role)) return true;
  return user.guild === guild && STAFF_ROLES.includes(user.role);
}

// Check if user is super admin (can manage all guilds)
export function isSuperAdmin(user) {
  if (!user) return false;
  return SUPER_ADMIN_ROLES.includes(user.role);
}

// Check if user is a member of a specific guild
export function isGuildMember(user, guild) {
  if (!user) return false;
  return user.guild === guild;
}

// Check if user can access admin panel
export function canAccessAdmin(user) {
  if (!user) return false;
  return STAFF_ROLES.includes(user.role);
}

// Check if user can edit a specific content type
export function canEdit(user, guild, contentType) {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;

  // Guild staff can edit their own guild's content
  if (user.guild === guild && STAFF_ROLES.includes(user.role)) {
    return true;
  }

  return false;
}

// Get the user's display role name
export function getRoleDisplayName(role) {
  const roleNames = {
    member: "Guild Member",
    newsletter_team: "Newsletter Team",
    mentor: "Mentor",
    community_specialist: "Community Specialist",
    twitch_staff: "Twitch Staff",
    super_admin: "Super Admin",
  };
  return roleNames[role] || "Member";
}
