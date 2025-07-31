-- Update Premium plan pricing
UPDATE public.subscription_plans 
SET 
  price_monthly = 29.00,
  price_yearly = 290.00,
  updated_at = now()
WHERE name = 'Premium';

-- Also update Advanced plan if it exists to be more reasonable
UPDATE public.subscription_plans 
SET 
  price_monthly = 19.00,
  price_yearly = 190.00,
  updated_at = now()
WHERE name = 'Advanced';