// Shared DTOs for scoring engine (used by backend + UI)
// Deterministic, portable, and versioned

export type StartupInput = {
  name: string;
  team: { size: number; domain_experience_years: number; exits?: number };
  market: { size_usd_b?: number; growth_pct?: number; region?: string };
  traction: { mrr_usd?: number; users?: number; growth_3m_pct?: number };
  moat: { ip?: boolean; network_effects?: boolean; switching_costs?: 'low'|'med'|'high' };
  financials: { runway_months?: number; burn_usd?: number };
  risk: { regulatory?: boolean; concentration?: boolean };
};

export type ScoreBreakdown = {
  ruleset_version: string;
  subscores: Record<'team'|'market'|'traction'|'moat'|'financials'|'risk', number>;
  weighted_total: number; // 0–100
  recommendations: string[];
};

// Minimal FinalScore envelope for consumers; flexible to include extra fields
export type FinalScore = {
  ruleset_version: string;
  breakdown: ScoreBreakdown;
  created_at: string; // ISO timestamp
};
