export const PLAN_LIMITS = {
  free: { maxProjects: 2, maxQuotesPerProject: 3 },
  pro: { maxProjects: Infinity, maxQuotesPerProject: Infinity },
} as const;

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
}
