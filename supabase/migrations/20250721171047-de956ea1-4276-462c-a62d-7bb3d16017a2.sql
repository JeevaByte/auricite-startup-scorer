-- Insert sample subscription plans
INSERT INTO public.subscription_plans (name, price_monthly, price_yearly, features, max_assessments, is_active) VALUES
('Free', 0, 0, '["Basic Assessment", "Score Overview", "Limited History"]', 3, true),
('Premium', 29, 290, '["Unlimited Assessments", "Detailed Reports", "Recommendations", "Assessment History", "Email Reports", "Priority Support"]', -1, true),
('Enterprise', 99, 990, '["Everything in Premium", "Investor Matching", "Custom Scoring", "Team Collaboration", "API Access", "Dedicated Support"]', -1, true);