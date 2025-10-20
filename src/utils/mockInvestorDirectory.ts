export interface MockInvestor {
  id: string;
  display_name: string;
  org_name: string;
  bio: string;
  sectors: string[];
  ticket_min: number;
  ticket_max: number;
  region: string;
  verification_status: 'verified' | 'pending';
  is_qualified: boolean;
  stage_preference: string[];
  notable_investments: string[];
}

export const mockInvestors: MockInvestor[] = [
  {
    id: 'inv-001',
    display_name: 'Sarah Mitchell',
    org_name: 'Mitchell Ventures',
    bio: 'Former VP at Stripe. Passionate about B2B SaaS and fintech innovation. Active mentor and advisor to early-stage founders.',
    sectors: ['SaaS', 'FinTech', 'Enterprise Software'],
    ticket_min: 25000,
    ticket_max: 100000,
    region: 'UK & Europe',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Pre-Seed', 'Seed'],
    notable_investments: ['PayFlow', 'CloudAuth', 'DataVault']
  },
  {
    id: 'inv-002',
    display_name: 'James Cooper',
    org_name: 'Angel Syndicate London',
    bio: 'Serial entrepreneur turned angel investor. Built and sold 3 companies. Focus on marketplace and consumer tech.',
    sectors: ['Marketplace', 'Consumer Tech', 'E-commerce'],
    ticket_min: 50000,
    ticket_max: 250000,
    region: 'London',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A'],
    notable_investments: ['FoodHub', 'StyleMatch', 'LocalMarket']
  },
  {
    id: 'inv-003',
    display_name: 'Emma Thompson',
    org_name: 'HealthTech Angels',
    bio: 'Healthcare industry veteran with 20 years experience. Investing in digital health and medtech startups.',
    sectors: ['HealthTech', 'MedTech', 'Wellness'],
    ticket_min: 30000,
    ticket_max: 150000,
    region: 'Manchester',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Pre-Seed', 'Seed'],
    notable_investments: ['HealthTrack', 'MediConnect', 'WellnessAI']
  },
  {
    id: 'inv-004',
    display_name: 'David Park',
    org_name: 'Cambridge Capital',
    bio: 'Cambridge-based investor focused on deep tech and AI. PhD in Computer Science. Looking for technical founding teams.',
    sectors: ['AI/ML', 'Deep Tech', 'Robotics'],
    ticket_min: 75000,
    ticket_max: 500000,
    region: 'Cambridge',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A'],
    notable_investments: ['AILabs', 'RoboTech', 'QuantumStart']
  },
  {
    id: 'inv-005',
    display_name: 'Lisa Rodriguez',
    org_name: 'Green Future Fund',
    bio: 'Impact investor specializing in climate tech and sustainability. Former sustainability director at major corporates.',
    sectors: ['CleanTech', 'Clean Energy', 'Sustainability'],
    ticket_min: 40000,
    ticket_max: 200000,
    region: 'Edinburgh',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Pre-Seed', 'Seed'],
    notable_investments: ['SolarScale', 'GreenGrid', 'EcoTech']
  },
  {
    id: 'inv-006',
    display_name: 'Michael Zhang',
    org_name: 'FinTech Ventures',
    bio: 'Ex-Goldman Sachs. Investing in financial services innovation and blockchain solutions.',
    sectors: ['FinTech', 'Blockchain', 'Payments'],
    ticket_min: 100000,
    ticket_max: 750000,
    region: 'London',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A', 'Series B'],
    notable_investments: ['CryptoExchange', 'PaymentFlow', 'BlockChain Solutions']
  },
  {
    id: 'inv-007',
    display_name: 'Sophie Williams',
    org_name: 'EdTech Angels',
    bio: 'Former teacher and education technology entrepreneur. Passionate about improving learning outcomes.',
    sectors: ['EdTech', 'Education', 'Learning Platforms'],
    ticket_min: 20000,
    ticket_max: 100000,
    region: 'Bristol',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Pre-Seed', 'Seed'],
    notable_investments: ['LearnApp', 'EduPlatform', 'SkillBuilder']
  },
  {
    id: 'inv-008',
    display_name: 'Robert Johnson',
    org_name: 'PropTech Investors',
    bio: 'Real estate industry expert investing in property technology and smart building solutions.',
    sectors: ['PropTech', 'Real Estate', 'Smart Buildings'],
    ticket_min: 50000,
    ticket_max: 300000,
    region: 'Birmingham',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A'],
    notable_investments: ['SmartSpace', 'PropManager', 'BuildTech']
  },
  {
    id: 'inv-009',
    display_name: 'Priya Patel',
    org_name: 'Diversity Capital',
    bio: 'Championing diverse founders. Focus on female and minority-led startups across all sectors.',
    sectors: ['SaaS', 'Consumer', 'HealthTech', 'FinTech'],
    ticket_min: 25000,
    ticket_max: 150000,
    region: 'Leicester',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Pre-Seed', 'Seed'],
    notable_investments: ['DiverseStart', 'InclusiveTech', 'EqualOpp']
  },
  {
    id: 'inv-010',
    display_name: 'Tom Henderson',
    org_name: 'Sports & Gaming Fund',
    bio: 'Former professional athlete. Investing in sports tech, gaming, and entertainment platforms.',
    sectors: ['Gaming', 'Sports Tech', 'Entertainment'],
    ticket_min: 30000,
    ticket_max: 200000,
    region: 'Leeds',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Pre-Seed', 'Seed'],
    notable_investments: ['GameHub', 'SportsTech', 'FanConnect']
  },
  {
    id: 'inv-011',
    display_name: 'Rachel Green',
    org_name: 'Cyber Security Angels',
    bio: 'Cybersecurity expert with 15 years in enterprise security. Looking for innovative security solutions.',
    sectors: ['Cybersecurity', 'Enterprise Security', 'Data Protection'],
    ticket_min: 75000,
    ticket_max: 400000,
    region: 'Oxford',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A'],
    notable_investments: ['SecureNet', 'DataGuard', 'CyberShield']
  },
  {
    id: 'inv-012',
    display_name: 'Alex Martinez',
    org_name: 'Future Food Fund',
    bio: 'Food industry innovator backing next-gen food tech, agritech, and sustainable food solutions.',
    sectors: ['FoodTech', 'AgriTech', 'Sustainability'],
    ticket_min: 40000,
    ticket_max: 250000,
    region: 'Brighton',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Pre-Seed', 'Seed', 'Series A'],
    notable_investments: ['FoodInnovate', 'AgriSolutions', 'PlantBased']
  }
];
