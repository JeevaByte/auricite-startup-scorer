-- Clean up duplicate subscription plans and create the 3 plans you want
-- First, deactivate old duplicate plans
UPDATE subscription_plans SET is_active = false WHERE id IN (
  'c31446b6-2886-44df-acbf-6508d2f1ae42', -- Old Free plan
  'cb5df36e-dc51-425b-8a78-88645acfc71c', -- Old Premium plan  
  '473bcc12-0eba-4bf3-9d76-ad988f511292'  -- Old Enterprise plan
);

-- Update the remaining Free plan
UPDATE subscription_plans 
SET name = 'Free', 
    features = '["Basic Assessment", "Score Overview", "Limited History"]',
    max_assessments = 1,
    price_monthly = 0,
    price_yearly = 0
WHERE id = '72644487-f218-471d-b318-8a4453f019cb';

-- Update one Premium plan to be Advanced
UPDATE subscription_plans 
SET name = 'Advanced', 
    features = '["Unlimited Assessments", "Detailed Reports", "Assessment History", "Email Reports"]',
    max_assessments = 10,
    price_monthly = 19,
    price_yearly = 190
WHERE id = 'add74036-9f59-4498-bccd-cc3fd145db4d';

-- Keep the Enterprise plan as Premium
UPDATE subscription_plans 
SET name = 'Premium', 
    features = '["Everything in Advanced", "Investor Matching", "Custom Scoring", "Priority Support", "API Access"]',
    max_assessments = -1,
    price_monthly = 39,
    price_yearly = 390
WHERE id = 'afce03e1-2af3-4343-b7da-a0656630a6ff';