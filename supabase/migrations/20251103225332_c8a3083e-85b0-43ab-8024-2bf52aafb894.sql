-- Seed 100 rows into investor_directory
WITH org_types AS (SELECT ARRAY['Ventures', 'Capital', 'Partners', 'Investments', 'Fund', 'Group', 'Holdings'] AS t),
titles AS (SELECT ARRAY['Partner', 'Principal', 'Managing Partner', 'Associate', 'GP', 'Investment Director', 'Senior Associate'] AS t),
sectors AS (SELECT ARRAY['SaaS', 'FinTech', 'HealthTech', 'AI/ML', 'Climate Tech', 'Cybersecurity', 'Marketplace', 'DevTools', 'EdTech', 'PropTech'] AS t),
stages AS (SELECT ARRAY['Pre-Seed', 'Seed', 'Series A', 'Series B'] AS t),
regions AS (SELECT ARRAY['North America', 'Europe', 'Asia', 'UK & Europe', 'Global', 'Latin America'] AS t)
INSERT INTO public.investor_directory (
  name, organization, title, email,
  sectors, stages, regions,
  ticket_min, ticket_max, bio,
  is_verified, is_active, visibility,
  website, linkedin_url, portfolio_companies,
  notable_investments, investment_thesis, created_at, updated_at
)
SELECT
  'Investor ' || gs AS name,
  'Demo ' || (SELECT t[1 + floor(random()*array_length(t,1))::int] FROM org_types) AS organization,
  (SELECT t[1 + floor(random()*array_length(t,1))::int] FROM titles) AS title,
  'investor' || gs || '@example.com' AS email,
  ARRAY[
    (SELECT t[1 + floor(random()*array_length(t,1))::int] FROM sectors),
    (SELECT t[1 + floor(random()*array_length(t,1))::int] FROM sectors)
  ]::text[] AS sectors,
  ARRAY[(SELECT t[1 + floor(random()*array_length(t,1))::int] FROM stages)]::text[] AS stages,
  ARRAY[(SELECT t[1 + floor(random()*array_length(t,1))::int] FROM regions)]::text[] AS regions,
  (25000 * (1 + floor(random()*10)::int))::bigint AS ticket_min,
  (250000 * (2 + floor(random()*20)::int))::bigint AS ticket_max,
  'Demo investor profile with interests in high-growth technology companies across various sectors and stages.' AS bio,
  (random() < 0.85) AS is_verified,
  true AS is_active,
  'public' AS visibility,
  'https://example.com/investor' || gs AS website,
  'https://linkedin.com/in/demo-investor-' || gs AS linkedin_url,
  ARRAY['AlphaCo', 'BetaCorp', 'GammaLabs']::text[] AS portfolio_companies,
  'NotableStartup Inc, TechCo Ltd' AS notable_investments,
  'Investing in product-led growth companies with strong technical teams and clear paths to profitability.' AS investment_thesis,
  now(), now()
FROM generate_series(1,100) AS gs;

-- Seed 100 rows into startup_directory
WITH sectors AS (SELECT ARRAY['AI/ML', 'HealthTech', 'FinTech', 'Climate Tech', 'Cybersecurity', 'EdTech', 'AgTech', 'PropTech', 'Marketplace', 'SaaS'] AS t),
stages AS (SELECT ARRAY['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth'] AS t),
regions AS (SELECT ARRAY['North America', 'Europe', 'Asia', 'UK & Europe', 'Global', 'Latin America'] AS t)
INSERT INTO public.startup_directory (
  company_name, sector, stage, region,
  readiness_score, team_size, location,
  seeking_funding, is_verified, is_active, visibility,
  description, tagline, founder_name,
  funding_goal, funding_raised, current_mrr,
  has_revenue, website, email, created_at, updated_at
)
SELECT
  'DemoTech ' || gs AS company_name,
  (SELECT t[1 + floor(random()*array_length(t,1))::int] FROM sectors) AS sector,
  (SELECT t[1 + floor(random()*array_length(t,1))::int] FROM stages) AS stage,
  (SELECT t[1 + floor(random()*array_length(t,1))::int] FROM regions) AS region,
  (60 + floor(random()*40)::int) AS readiness_score,
  (5 + floor(random()*60)::int)::text AS team_size,
  'City ' || (1 + floor(random()*200)::int) AS location,
  true AS seeking_funding,
  (random() < 0.8) AS is_verified,
  true AS is_active,
  'public' AS visibility,
  'Demo company focused on building scalable solutions for enterprise and consumer markets with innovative technology.' AS description,
  'Next-gen platform for digital transformation' AS tagline,
  'Founder ' || gs AS founder_name,
  (500000 * (1 + floor(random()*20)::int)) AS funding_goal,
  (250000 * floor(random()*20)::int) AS funding_raised,
  (10000 * floor(random()*100)::int) AS current_mrr,
  (random() < 0.7) AS has_revenue,
  'https://example.com/startup' || gs AS website,
  'contact' || gs || '@example.com' AS email,
  now(), now()
FROM generate_series(1,100) gs;