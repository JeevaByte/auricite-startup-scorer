// Mock data for investor dashboard

export interface MockStartup {
  id: string;
  company_name: string;
  display_name: string;
  sector: string[];
  stage: string;
  region: string;
  total_score: number;
  business_idea: number;
  team: number;
  traction: number;
  financials: number;
  funding_goal: string;
  mrr: string;
  employees: string;
  has_revenue: boolean;
  last_updated: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  user_id: string;
}

export interface MockSavedStartup extends MockStartup {
  saved_at: string;
  notes: string;
}

export interface MockPortfolioItem extends MockStartup {
  investment_amount: number;
  investment_date: string;
  equity_percentage: number;
  status: 'active' | 'exited' | 'closed';
  last_interaction: string;
}

export interface MockMatch extends MockStartup {
  match_score: number;
  match_reason: string[];
  status: 'pending' | 'accepted' | 'rejected';
}

export const mockStartups: MockStartup[] = [
  {
    id: '1',
    company_name: 'TechFlow AI',
    display_name: 'TechFlow AI',
    sector: ['SaaS', 'Artificial Intelligence', 'B2B'],
    stage: 'Seed',
    region: 'North America',
    total_score: 87,
    business_idea: 92,
    team: 85,
    traction: 82,
    financials: 89,
    funding_goal: '$2M - $5M',
    mrr: '$50K - $100K',
    employees: '11-25',
    has_revenue: true,
    last_updated: '2024-01-15',
    description: 'AI-powered workflow automation platform for enterprise teams. Reducing manual tasks by 70% with intelligent process optimization.',
    strengths: [
      'Strong technical team with ML expertise',
      'Growing MRR month-over-month',
      'Clear product-market fit',
      'Enterprise customers acquired'
    ],
    weaknesses: [
      'Early stage with limited runway',
      'Competitive market space'
    ],
    user_id: 'startup-user-1'
  },
  {
    id: '2',
    company_name: 'HealthBridge',
    display_name: 'HealthBridge',
    sector: ['HealthTech', 'Telemedicine', 'B2C'],
    stage: 'Series A',
    region: 'Europe',
    total_score: 78,
    business_idea: 75,
    team: 82,
    traction: 80,
    financials: 75,
    funding_goal: '$5M - $10M',
    mrr: '$100K - $250K',
    employees: '26-50',
    has_revenue: true,
    last_updated: '2024-01-14',
    description: 'Digital health platform connecting patients with specialists across Europe. 50K+ active users and partnerships with major hospitals.',
    strengths: [
      'Proven traction with 50K users',
      'Strategic hospital partnerships',
      'Experienced healthcare team',
      'Regulatory compliance in place'
    ],
    weaknesses: [
      'Customer acquisition cost is high',
      'Regulatory complexity across markets'
    ],
    user_id: 'startup-user-2'
  },
  {
    id: '3',
    company_name: 'GreenEnergy Solutions',
    display_name: 'GreenEnergy Solutions',
    sector: ['CleanTech', 'Energy', 'B2B'],
    stage: 'Series B',
    region: 'Asia Pacific',
    total_score: 92,
    business_idea: 95,
    team: 90,
    traction: 91,
    financials: 92,
    funding_goal: '$10M - $20M',
    mrr: '$500K - $1M',
    employees: '51-100',
    has_revenue: true,
    last_updated: '2024-01-13',
    description: 'Renewable energy solutions for commercial buildings. Deployed in 200+ locations with proven ROI and carbon reduction.',
    strengths: [
      'Excellent unit economics',
      'Strong recurring revenue model',
      'Proven environmental impact',
      'Government contracts secured'
    ],
    weaknesses: [
      'Capital intensive business model',
      'Long sales cycles'
    ],
    user_id: 'startup-user-3'
  },
  {
    id: '4',
    company_name: 'EduTech Pro',
    display_name: 'EduTech Pro',
    sector: ['EdTech', 'E-learning', 'B2C'],
    stage: 'Seed',
    region: 'North America',
    total_score: 68,
    business_idea: 70,
    team: 65,
    traction: 72,
    financials: 65,
    funding_goal: '$1M - $2M',
    mrr: '$10K - $25K',
    employees: '6-10',
    has_revenue: true,
    last_updated: '2024-01-12',
    description: 'Personalized learning platform for K-12 students using adaptive AI. Currently serving 5,000 students across 50 schools.',
    strengths: [
      'Strong user engagement metrics',
      'Positive educational outcomes',
      'Scalable tech platform'
    ],
    weaknesses: [
      'Limited team experience',
      'Seasonal revenue patterns',
      'Early traction stage'
    ],
    user_id: 'startup-user-4'
  },
  {
    id: '5',
    company_name: 'FinanceFlow',
    display_name: 'FinanceFlow',
    sector: ['FinTech', 'Payments', 'B2B'],
    stage: 'Series A',
    region: 'North America',
    total_score: 85,
    business_idea: 88,
    team: 87,
    traction: 83,
    financials: 82,
    funding_goal: '$5M - $10M',
    mrr: '$200K - $500K',
    employees: '26-50',
    has_revenue: true,
    last_updated: '2024-01-11',
    description: 'Modern payment infrastructure for SMBs. Processing $10M monthly with 500+ merchant customers.',
    strengths: [
      'Strong financial metrics',
      'Experienced fintech team',
      'Growing transaction volume',
      'Low churn rate'
    ],
    weaknesses: [
      'Competitive payments space',
      'Regulatory requirements'
    ],
    user_id: 'startup-user-5'
  },
  {
    id: '6',
    company_name: 'FoodTech Innovations',
    display_name: 'FoodTech Innovations',
    sector: ['FoodTech', 'Sustainability', 'B2C'],
    stage: 'Pre-seed',
    region: 'Europe',
    total_score: 62,
    business_idea: 68,
    team: 60,
    traction: 58,
    financials: 62,
    funding_goal: '$500K - $1M',
    mrr: '$5K - $10K',
    employees: '3-5',
    has_revenue: true,
    last_updated: '2024-01-10',
    description: 'Plant-based meal delivery service focused on sustainability. Early traction with 1,000+ subscribers in 3 cities.',
    strengths: [
      'Strong sustainability mission',
      'Growing consumer interest',
      'Passionate founding team'
    ],
    weaknesses: [
      'Very early stage',
      'Thin margins',
      'Limited geographic reach',
      'High customer acquisition cost'
    ],
    user_id: 'startup-user-6'
  },
  {
    id: '7',
    company_name: 'CyberShield',
    display_name: 'CyberShield',
    sector: ['Cybersecurity', 'Enterprise Software', 'B2B'],
    stage: 'Series A',
    region: 'North America',
    total_score: 89,
    business_idea: 91,
    team: 92,
    traction: 86,
    financials: 87,
    funding_goal: '$7M - $12M',
    mrr: '$300K - $500K',
    employees: '26-50',
    has_revenue: true,
    last_updated: '2024-01-09',
    description: 'Enterprise cybersecurity platform protecting cloud infrastructure. Serving Fortune 500 companies with 99.9% uptime.',
    strengths: [
      'World-class security team',
      'Enterprise customers',
      'Strong gross margins',
      'Critical market need'
    ],
    weaknesses: [
      'Long enterprise sales cycles',
      'Heavy R&D investment needed'
    ],
    user_id: 'startup-user-7'
  },
  {
    id: '8',
    company_name: 'PropTech Ventures',
    display_name: 'PropTech Ventures',
    sector: ['PropTech', 'Real Estate', 'B2B'],
    stage: 'Seed',
    region: 'Asia Pacific',
    total_score: 74,
    business_idea: 76,
    team: 73,
    traction: 75,
    financials: 72,
    funding_goal: '$2M - $4M',
    mrr: '$75K - $100K',
    employees: '11-25',
    has_revenue: true,
    last_updated: '2024-01-08',
    description: 'Digital platform for commercial real estate transactions. Streamlining property deals with blockchain verification.',
    strengths: [
      'Innovative blockchain integration',
      'Growing property network',
      'Strong industry partnerships'
    ],
    weaknesses: [
      'Market adoption challenges',
      'Regulatory uncertainty',
      'Capital-intensive model'
    ],
    user_id: 'startup-user-8'
  }
];

export const mockSavedStartups: MockSavedStartup[] = [
  {
    ...mockStartups[0],
    saved_at: '2024-01-10',
    notes: 'Impressive AI team. Schedule follow-up call for next week.'
  },
  {
    ...mockStartups[2],
    saved_at: '2024-01-08',
    notes: 'Strong metrics and environmental impact. Considering lead investment.'
  },
  {
    ...mockStartups[4],
    saved_at: '2024-01-05',
    notes: 'Good fintech team. Waiting for Q4 numbers before proceeding.'
  }
];

export const mockPortfolio: MockPortfolioItem[] = [
  {
    ...mockStartups[1],
    investment_amount: 500000,
    investment_date: '2023-06-15',
    equity_percentage: 8.5,
    status: 'active',
    last_interaction: '2024-01-05'
  },
  {
    ...mockStartups[6],
    investment_amount: 1000000,
    investment_date: '2023-09-20',
    equity_percentage: 12,
    status: 'active',
    last_interaction: '2024-01-12'
  }
];

export const mockMatches: MockMatch[] = [
  {
    ...mockStartups[0],
    match_score: 94,
    match_reason: [
      'Sector alignment with your investment thesis',
      'Stage matches your preferred investment stage',
      'Score above your minimum threshold (75+)',
      'Geographic preference match'
    ],
    status: 'pending'
  },
  {
    ...mockStartups[2],
    match_score: 91,
    match_reason: [
      'Strong financial metrics align with your criteria',
      'CleanTech sector matches your portfolio',
      'Series B stage fits your investment strategy'
    ],
    status: 'pending'
  },
  {
    ...mockStartups[4],
    match_score: 88,
    match_reason: [
      'FinTech expertise aligns with your background',
      'Revenue metrics exceed your requirements',
      'Team strength matches your preferences'
    ],
    status: 'accepted'
  },
  {
    ...mockStartups[6],
    match_score: 85,
    match_reason: [
      'Enterprise focus aligns with portfolio',
      'Strong technical team',
      'Cybersecurity is growing sector'
    ],
    status: 'pending'
  }
];

export const mockAnalytics = {
  dealFlowByMonth: [
    { month: 'Aug', count: 12 },
    { month: 'Sep', count: 18 },
    { month: 'Oct', count: 25 },
    { month: 'Nov', count: 31 },
    { month: 'Dec', count: 28 },
    { month: 'Jan', count: 35 }
  ],
  scoreDistribution: [
    { range: '0-40', count: 5 },
    { range: '40-60', count: 12 },
    { range: '60-75', count: 28 },
    { range: '75-85', count: 18 },
    { range: '85+', count: 8 }
  ],
  sectorBreakdown: [
    { sector: 'SaaS', count: 22, avgScore: 76 },
    { sector: 'FinTech', count: 15, avgScore: 81 },
    { sector: 'HealthTech', count: 12, avgScore: 74 },
    { sector: 'CleanTech', count: 8, avgScore: 79 },
    { sector: 'EdTech', count: 10, avgScore: 68 },
    { sector: 'Other', count: 4, avgScore: 71 }
  ],
  stageDistribution: [
    { stage: 'Pre-seed', count: 15 },
    { stage: 'Seed', count: 28 },
    { stage: 'Series A', count: 18 },
    { stage: 'Series B', count: 8 },
    { stage: 'Series C+', count: 2 }
  ],
  yourActivity: {
    startupsViewed: 47,
    startupsSaved: 12,
    startupsContacted: 5,
    comparisonsRun: 8
  }
};
