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
    display_name: 'Sarah Chen',
    org_name: 'Alpha Ventures',
    bio: 'Former Google PM turned VC. Focus on AI/ML and enterprise SaaS. 15+ years in tech. Invested in 30+ companies including 3 unicorns.',
    sectors: ['AI/ML', 'SaaS', 'Enterprise'],
    ticket_min: 500000,
    ticket_max: 3000000,
    region: 'North America',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A'],
    notable_investments: ['DataFlow AI', 'CloudSync', 'SecureNet']
  },
  {
    id: 'inv-002',
    display_name: 'Michael Roberts',
    org_name: 'FinTech Innovations Fund',
    bio: 'Ex-Goldman Sachs. Specialized in financial technology and digital banking. $200M AUM. Looking for revolutionary fintech startups.',
    sectors: ['FinTech', 'Blockchain', 'InsurTech'],
    ticket_min: 1000000,
    ticket_max: 5000000,
    region: 'Europe',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Series A', 'Series B'],
    notable_investments: ['PayFlow', 'CryptoSecure', 'BankOS']
  },
  {
    id: 'inv-003',
    display_name: 'Dr. Emily Watson',
    org_name: 'HealthTech Partners',
    bio: 'MD & investor. Focus on digital health, medical devices, and biotech. Partner at leading health-focused VC firm.',
    sectors: ['HealthTech', 'BioTech', 'MedTech'],
    ticket_min: 750000,
    ticket_max: 4000000,
    region: 'North America',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A'],
    notable_investments: ['HealthAI', 'MediTrack', 'BioGenix']
  },
  {
    id: 'inv-004',
    display_name: 'David Kim',
    org_name: 'Asia Growth Capital',
    bio: 'Serial entrepreneur with 3 exits. Now investing in Asia-Pacific startups. Focus on consumer tech and marketplace businesses.',
    sectors: ['E-Commerce', 'Consumer Tech', 'Marketplace'],
    ticket_min: 300000,
    ticket_max: 2000000,
    region: 'Asia Pacific',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Pre-Seed', 'Seed'],
    notable_investments: ['ShopNow', 'DeliverFast', 'SocialBuy']
  },
  {
    id: 'inv-005',
    display_name: 'Lisa Anderson',
    org_name: 'Green Future Ventures',
    bio: 'Impact investor focused on climate tech and sustainability. $150M fund dedicated to carbon-neutral solutions.',
    sectors: ['CleanTech', 'Sustainability', 'Energy'],
    ticket_min: 500000,
    ticket_max: 3000000,
    region: 'Europe',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A'],
    notable_investments: ['SolarGrid', 'EcoPack', 'CleanAir']
  },
  {
    id: 'inv-006',
    display_name: 'James Martinez',
    org_name: 'EdTech Accelerator',
    bio: 'Former education executive. Investing in edtech and future of learning. Passionate about democratizing education.',
    sectors: ['EdTech', 'Online Learning', 'SaaS'],
    ticket_min: 250000,
    ticket_max: 1500000,
    region: 'North America',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Pre-Seed', 'Seed'],
    notable_investments: ['LearnHub', 'SkillBoost', 'EduCloud']
  },
  {
    id: 'inv-007',
    display_name: 'Priya Sharma',
    org_name: 'Tech Frontier Capital',
    bio: 'Deep tech investor. Focus on quantum computing, robotics, and advanced materials. Looking for moonshot ideas.',
    sectors: ['Deep Tech', 'Robotics', 'Quantum'],
    ticket_min: 1000000,
    ticket_max: 7000000,
    region: 'North America',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Series A', 'Series B'],
    notable_investments: ['QuantumCore', 'RoboTech', 'NanoMaterials']
  },
  {
    id: 'inv-008',
    display_name: 'Thomas Berg',
    org_name: 'Nordic Innovation Fund',
    bio: 'Scandinavian investor. Focus on B2B SaaS and enterprise solutions. Strong network across Northern Europe.',
    sectors: ['SaaS', 'Enterprise', 'B2B'],
    ticket_min: 400000,
    ticket_max: 2500000,
    region: 'Europe',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A'],
    notable_investments: ['EnterpriseOS', 'WorkFlow', 'TeamSync']
  },
  {
    id: 'inv-009',
    display_name: 'Alexandra Cruz',
    org_name: 'Media & Entertainment Ventures',
    bio: 'Ex-Netflix executive. Investing in content creation, streaming, and creator economy platforms.',
    sectors: ['Media', 'Entertainment', 'Creator Economy'],
    ticket_min: 500000,
    ticket_max: 3500000,
    region: 'North America',
    verification_status: 'pending',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A'],
    notable_investments: ['StreamPro', 'CreatorHub', 'ContentAI']
  },
  {
    id: 'inv-010',
    display_name: 'Raj Patel',
    org_name: 'Mobility & Logistics Capital',
    bio: 'Transportation and logistics expert. Focus on supply chain innovation and mobility solutions.',
    sectors: ['Logistics', 'Transportation', 'Supply Chain'],
    ticket_min: 750000,
    ticket_max: 4000000,
    region: 'Asia Pacific',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Series A', 'Series B'],
    notable_investments: ['FastDeliver', 'SupplyChainAI', 'MobilityOS']
  },
  {
    id: 'inv-011',
    display_name: 'Maria Gonzalez',
    org_name: 'Latin America Ventures',
    bio: 'First VC fund focused exclusively on Latin American startups. $100M fund size. Strong local network.',
    sectors: ['FinTech', 'E-Commerce', 'SaaS'],
    ticket_min: 300000,
    ticket_max: 2000000,
    region: 'Latin America',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A'],
    notable_investments: ['PagoRapido', 'TechLatam', 'ConectaLatam']
  },
  {
    id: 'inv-012',
    display_name: 'Kevin O\'Brien',
    org_name: 'Cybersecurity Ventures',
    bio: 'Former CISO. Focus on cybersecurity, privacy tech, and data protection. 20+ years in information security.',
    sectors: ['Cybersecurity', 'Privacy Tech', 'Enterprise'],
    ticket_min: 500000,
    ticket_max: 4000000,
    region: 'North America',
    verification_status: 'verified',
    is_qualified: true,
    stage_preference: ['Seed', 'Series A', 'Series B'],
    notable_investments: ['SecureShield', 'PrivacyGuard', 'CyberDefense']
  }
];
