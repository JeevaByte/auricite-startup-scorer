import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types aligned with shared/types.ts
interface Team { size: number; domain_experience_years: number; exits?: number }
interface Market { size_usd_b?: number; growth_pct?: number; region?: string }
interface Traction { mrr_usd?: number; users?: number; growth_3m_pct?: number }
interface Moat { ip?: boolean; network_effects?: boolean; switching_costs?: 'low'|'med'|'high' }
interface Financials { runway_months?: number; burn_usd?: number }
interface Risk { regulatory?: boolean; concentration?: boolean }

interface StartupInput {
  name: string;
  team: Team; market: Market; traction: Traction; moat: Moat; financials: Financials; risk: Risk;
}

type Dimensions = 'team'|'market'|'traction'|'moat'|'financials'|'risk';

// Load default rules
import rules from '../score-assessment/scoring_rules.v0.1.0.json' assert { type: 'json' };

function scoreTeam(t: Team): number {
  let s = 0;
  s += Math.min(10, Math.floor(t.domain_experience_years / 2));
  if ((t.exits || 0) > 0) s += 2;
  if (t.size >= 3) s += 2;
  return Math.min(10, s);
}
function scoreMarket(m: Market): number {
  let s = 0;
  if ((m.size_usd_b || 0) >= 1) s += 5;
  if ((m.growth_pct || 0) >= 15) s += 3;
  if (m.region) s += 1;
  return Math.min(10, s);
}
function scoreTraction(t: Traction): number {
  let s = 0;
  if ((t.mrr_usd || 0) > 0) s += 5;
  if ((t.users || 0) > 1000) s += 3;
  if ((t.growth_3m_pct || 0) >= 20) s += 2;
  return Math.min(10, s);
}
function scoreMoat(m: Moat): number {
  let s = 0;
  if (m.ip) s += 4;
  if (m.network_effects) s += 4;
  if (m.switching_costs === 'med') s += 1; else if (m.switching_costs === 'high') s += 2;
  return Math.min(10, s);
}
function scoreFinancials(f: Financials): number {
  let s = 0;
  if ((f.runway_months || 0) >= 12) s += 5;
  if ((f.burn_usd || 0) <= 100000) s += 3;
  return Math.min(10, s);
}
function scoreRisk(r: Risk): number {
  let s = 10;
  if (r.regulatory) s -= 3;
  if (r.concentration) s -= 2;
  return Math.max(0, s);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const input: StartupInput = body.input;
    if (!input) {
      return new Response(JSON.stringify({ error: 'Missing input' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Compute subscores 0-10
    const subscores: Record<Dimensions, number> = {
      team: scoreTeam(input.team),
      market: scoreMarket(input.market),
      traction: scoreTraction(input.traction),
      moat: scoreMoat(input.moat),
      financials: scoreFinancials(input.financials),
      risk: scoreRisk(input.risk),
    };

    const dims = (rules as any).dimensions as Record<Dimensions, number>;
    const totalWeight = Object.values(dims).reduce((a, b) => a + b, 0);
    const weighted_total = Math.round(
      Object.entries(subscores).reduce((acc, [k, v]) => acc + v * (dims[k as Dimensions] || 0), 0) * (100 / (10 * totalWeight))
    );

    const response = {
      ruleset_version: (rules as any).version,
      subscores,
      weighted_total,
      recommendations: [] as string[],
    };

    return new Response(JSON.stringify(response), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('score-engine error', e);
    return new Response(JSON.stringify({ error: e.message || 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
