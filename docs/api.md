# Scoring API

Source of truth rules: `config/scoring_rules.v0.1.0.json`

## DTOs (shared)
File: `/shared/types.ts`

```ts
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

export type FinalScore = {
  ruleset_version: string;
  breakdown: ScoreBreakdown;
  created_at: string; // ISO timestamp
};
```

## Endpoint
`POST /functions/v1/score-assessment`

Request body:
```json
{
  "assessmentData": { /* current app payload for Day 1 */ }
}
```

Response (Day 1):
```json
{
  "success": true,
  "result": { /* legacy shape maintained */ },
  "sector": "B2B SaaS",
  "configUsed": "json:v0.1.0",
  "ruleset_version": "v0.1.0"
}
```

Notes:
- Weights are locked from `config/scoring_rules.v0.1.0.json` and normalized for current categories.
- Day 2 will introduce a pure core scoring module and unified DTOs end-to-end.
