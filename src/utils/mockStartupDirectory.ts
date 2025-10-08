export interface MockStartup {
  id: string;
  company_name: string;
  full_name: string;
  tagline: string;
  description: string;
  sector: string[];
  stage: string;
  score: number;
  founded_year: number;
  team_size: number;
  seeking: string;
  traction_metrics: {
    mrr?: string;
    users?: string;
    growth?: string;
  };
  highlights: string[];
}

export const mockStartups: MockStartup[] = [
  {
    id: 'startup-001',
    company_name: 'VisionAI',
    full_name: 'Marcus Johnson',
    tagline: 'AI-powered computer vision for manufacturing quality control',
    description: 'We reduce defect rates by 95% using real-time AI visual inspection on production lines. Deployed in 50+ factories.',
    sector: ['AI/ML', 'Manufacturing', 'Enterprise'],
    stage: 'Series A',
    score: 847,
    founded_year: 2021,
    team_size: 28,
    seeking: '$3M Series A',
    traction_metrics: {
      mrr: '$85K',
      users: '52 enterprise clients',
      growth: '18% MoM'
    },
    highlights: [
      '95% defect detection accuracy',
      '52 paying enterprise customers',
      '$1M ARR reached in 18 months',
      'Ex-Tesla and Google engineers'
    ]
  },
  {
    id: 'startup-002',
    company_name: 'HealthPulse',
    full_name: 'Dr. Samantha Lee',
    tagline: 'Remote patient monitoring platform for chronic disease management',
    description: 'FDA-cleared wearable + AI platform helping doctors monitor chronic patients remotely. Reducing hospital readmissions by 40%.',
    sector: ['HealthTech', 'MedTech', 'AI/ML'],
    stage: 'Seed',
    score: 782,
    founded_year: 2022,
    team_size: 15,
    seeking: '$2M Seed',
    traction_metrics: {
      mrr: '$42K',
      users: '5,000 patients monitored',
      growth: '25% MoM'
    },
    highlights: [
      'FDA 510(k) cleared',
      'Partnership with 12 hospitals',
      '40% reduction in readmissions',
      '5 MDs on clinical advisory board'
    ]
  },
  {
    id: 'startup-003',
    company_name: 'GreenCharge',
    full_name: 'Elena Rodriguez',
    tagline: 'Smart EV charging network powered by renewable energy',
    description: 'Building the largest solar-powered EV charging network. 200+ stations installed. Carbon-neutral charging.',
    sector: ['CleanTech', 'Energy', 'Transportation'],
    stage: 'Series B',
    score: 891,
    founded_year: 2020,
    team_size: 65,
    seeking: '$10M Series B',
    traction_metrics: {
      mrr: '$420K',
      users: '15,000 active users',
      growth: '12% MoM'
    },
    highlights: [
      '200+ charging stations live',
      '$5M ARR with 35% margins',
      'Contracts with 3 major cities',
      'Team from Tesla, Rivian, Shell'
    ]
  },
  {
    id: 'startup-004',
    company_name: 'EduFlow',
    full_name: 'Jason Park',
    tagline: 'AI tutor personalizing K-12 education at scale',
    description: 'Adaptive learning platform using AI to personalize lessons for each student. Improving test scores by 32% on average.',
    sector: ['EdTech', 'AI/ML', 'SaaS'],
    stage: 'Seed',
    score: 745,
    founded_year: 2022,
    team_size: 12,
    seeking: '$1.5M Seed',
    traction_metrics: {
      mrr: '$28K',
      users: '8,500 students',
      growth: '30% MoM'
    },
    highlights: [
      '32% improvement in test scores',
      '45 schools using platform',
      'Featured in EdSurge',
      'Founded by Stanford education researchers'
    ]
  },
  {
    id: 'startup-005',
    company_name: 'SecureAPI',
    full_name: 'Rachel Kim',
    tagline: 'API security platform protecting against data breaches',
    description: 'Real-time API threat detection and response. Protecting $2B+ in transactions daily. Preventing attacks in <50ms.',
    sector: ['Cybersecurity', 'Enterprise', 'SaaS'],
    stage: 'Series A',
    score: 823,
    founded_year: 2021,
    team_size: 32,
    seeking: '$5M Series A',
    traction_metrics: {
      mrr: '$125K',
      users: '78 enterprise clients',
      growth: '20% MoM'
    },
    highlights: [
      '$1.5M ARR with Fortune 500 clients',
      'SOC 2 Type II certified',
      'Blocked 2M+ API attacks',
      'Ex-Cloudflare and Palo Alto Networks team'
    ]
  },
  {
    id: 'startup-006',
    company_name: 'FarmTech',
    full_name: 'Carlos Santos',
    tagline: 'IoT + AI for precision agriculture and crop optimization',
    description: 'Sensors and ML models helping farmers increase yields by 25% while reducing water usage 40%. Active on 500+ farms.',
    sector: ['AgriTech', 'IoT', 'Sustainability'],
    stage: 'Series A',
    score: 798,
    founded_year: 2020,
    team_size: 24,
    seeking: '$4M Series A',
    traction_metrics: {
      mrr: '$75K',
      users: '500+ farms',
      growth: '15% MoM'
    },
    highlights: [
      '25% average yield increase',
      '40% reduction in water usage',
      'Partnership with John Deere',
      '$900K ARR, 65% gross margins'
    ]
  },
  {
    id: 'startup-007',
    company_name: 'CreatorOS',
    full_name: 'Mia Thompson',
    tagline: 'All-in-one platform for content creators to monetize',
    description: 'Helping creators monetize through subscriptions, courses, and memberships. 10,000+ creators earning on our platform.',
    sector: ['Creator Economy', 'SaaS', 'Media'],
    stage: 'Seed',
    score: 756,
    founded_year: 2022,
    team_size: 18,
    seeking: '$2.5M Seed',
    traction_metrics: {
      mrr: '$55K',
      users: '10,000 creators',
      growth: '28% MoM'
    },
    highlights: [
      '$15M processed through platform',
      '10K+ active creators',
      'Take rate: 5% (vs Patreon\'s 12%)',
      'Featured in TechCrunch'
    ]
  },
  {
    id: 'startup-008',
    company_name: 'SupplyChain.ai',
    full_name: 'Wei Zhang',
    tagline: 'AI-powered supply chain optimization and forecasting',
    description: 'ML platform reducing supply chain costs by 20% and stockouts by 75%. Serving manufacturers and retailers.',
    sector: ['Logistics', 'AI/ML', 'Enterprise'],
    stage: 'Series A',
    score: 834,
    founded_year: 2021,
    team_size: 35,
    seeking: '$6M Series A',
    traction_metrics: {
      mrr: '$145K',
      users: '42 enterprise clients',
      growth: '16% MoM'
    },
    highlights: [
      '20% average cost reduction',
      '75% reduction in stockouts',
      '$1.7M ARR from enterprise deals',
      'Ex-Amazon and Walmart supply chain leaders'
    ]
  },
  {
    id: 'startup-009',
    company_name: 'FinFlow',
    full_name: 'Ahmed Hassan',
    tagline: 'Embedded finance platform for vertical SaaS companies',
    description: 'White-label financial services (banking, lending, payments) for B2B software companies. 80+ SaaS partners.',
    sector: ['FinTech', 'SaaS', 'B2B'],
    stage: 'Series B',
    score: 872,
    founded_year: 2020,
    team_size: 58,
    seeking: '$15M Series B',
    traction_metrics: {
      mrr: '$380K',
      users: '80 SaaS partners',
      growth: '22% MoM'
    },
    highlights: [
      '$4.5M ARR, 80% net revenue retention',
      '$1.2B payment volume processed',
      'Banking license in progress',
      'Team from Stripe, Square, Plaid'
    ]
  },
  {
    id: 'startup-010',
    company_name: 'QuantumSafe',
    full_name: 'Dr. Lisa Chen',
    tagline: 'Post-quantum cryptography solutions for enterprises',
    description: 'Preparing enterprises for quantum computing threats. NIST-approved algorithms. Protecting critical infrastructure.',
    sector: ['Cybersecurity', 'Deep Tech', 'Enterprise'],
    stage: 'Series A',
    score: 801,
    founded_year: 2021,
    team_size: 22,
    seeking: '$7M Series A',
    traction_metrics: {
      mrr: '$95K',
      users: '28 enterprise clients',
      growth: '18% MoM'
    },
    highlights: [
      'NIST-certified algorithms',
      'Government contracts secured',
      '5 Fortune 500 customers',
      'PhD team from MIT, Stanford'
    ]
  },
  {
    id: 'startup-011',
    company_name: 'BioScan',
    full_name: 'Dr. Robert Williams',
    tagline: 'AI-powered early cancer detection from blood tests',
    description: 'Single blood test detecting 12 cancer types at stage 1. 92% accuracy. Clinical trials in progress at Johns Hopkins.',
    sector: ['BioTech', 'HealthTech', 'AI/ML'],
    stage: 'Series A',
    score: 815,
    founded_year: 2020,
    team_size: 40,
    seeking: '$12M Series A',
    traction_metrics: {
      mrr: 'Pre-revenue',
      users: 'Clinical trials',
      growth: 'N/A'
    },
    highlights: [
      '92% detection accuracy in trials',
      'Partnership with Johns Hopkins',
      'Breakthrough device designation (FDA)',
      '3 oncologists, 2 AI PhDs on team'
    ]
  },
  {
    id: 'startup-012',
    company_name: 'CloudOps',
    full_name: 'Nina Patel',
    tagline: 'DevOps automation platform reducing cloud costs 40%',
    description: 'AI-driven cloud cost optimization and DevOps automation. Saving enterprises millions on AWS, Azure, GCP.',
    sector: ['SaaS', 'DevOps', 'Enterprise'],
    stage: 'Series A',
    score: 789,
    founded_year: 2021,
    team_size: 26,
    seeking: '$4M Series A',
    traction_metrics: {
      mrr: '$88K',
      users: '65 companies',
      growth: '19% MoM'
    },
    highlights: [
      '40% average cloud cost savings',
      '$1M+ ARR from mid-market',
      'Integration with all major clouds',
      'Ex-Google Cloud and AWS engineers'
    ]
  }
];
