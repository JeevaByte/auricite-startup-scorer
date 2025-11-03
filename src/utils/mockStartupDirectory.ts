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

const generateMockStartups = (): MockStartup[] => {
  const companyPrefixes = ['Vision', 'Cloud', 'Smart', 'Quantum', 'Eco', 'Rapid', 'Neo', 'Apex', 'Flux', 'Zen', 'Pulse', 'Nova', 'Spark', 'Titan', 'Nexus', 'Vertex', 'Summit', 'Surge', 'Bright', 'Swift', 'Prime', 'Core', 'Edge', 'Peak', 'Wave', 'Flow', 'Vibe', 'Alpha', 'Beta', 'Gamma', 'Delta', 'Sigma', 'Omega', 'Ionic', 'Atomic', 'Cosmic', 'Solar', 'Lunar', 'Terra', 'Aqua', 'Aero', 'Pyro', 'Hydro', 'Electro', 'Nano', 'Micro', 'Mega', 'Ultra', 'Hyper', 'Super'];
  const companySuffixes = ['AI', 'Tech', 'Labs', 'Systems', 'Solutions', 'Innovations', 'Dynamics', 'Works', 'Hub', 'Platform', 'OS', 'Ventures', 'Studio', 'Digital', 'Cloud', 'Data', 'Soft', 'Ware', 'Net', 'Link', 'Sync', 'Core', 'Pro', 'Max', 'Plus', 'Prime', 'Base', 'Logic', 'Mind', 'Sense', 'Vision', 'Scope', 'View', 'Path', 'Way', 'Route', 'Line', 'Wire', 'Grid', 'Node', 'Port', 'Gate', 'Bridge', 'Chain', 'Loop', 'Ring', 'Sphere', 'Globe', 'World', 'Space'];
  
  const firstNames = ['Marcus', 'Samantha', 'Elena', 'Jason', 'Rachel', 'Carlos', 'Mia', 'Wei', 'Ahmed', 'Lisa', 'Robert', 'Nina', 'David', 'Sarah', 'James', 'Emma', 'Michael', 'Sophie', 'Daniel', 'Olivia', 'Thomas', 'Hannah', 'Christopher', 'Victoria', 'Matthew', 'Grace', 'Andrew', 'Charlotte', 'William', 'Sophia', 'Benjamin', 'Isabella', 'Samuel', 'Amelia', 'Joseph', 'Emily', 'Jack', 'Ava', 'Oliver', 'Mia', 'Harry', 'Ella', 'George', 'Lily', 'Charlie', 'Lucy', 'Oscar', 'Ruby', 'Jacob', 'Chloe'];
  const lastNames = ['Johnson', 'Lee', 'Rodriguez', 'Park', 'Kim', 'Santos', 'Thompson', 'Zhang', 'Hassan', 'Chen', 'Williams', 'Patel', 'Taylor', 'Brown', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Walker', 'Wright', 'Robinson', 'Hughes', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price'];
  
  const sectors = [
    ['AI/ML', 'Enterprise', 'SaaS'],
    ['HealthTech', 'MedTech', 'AI/ML'],
    ['FinTech', 'Payments', 'B2B'],
    ['CleanTech', 'Energy', 'Sustainability'],
    ['EdTech', 'SaaS', 'B2C'],
    ['Cybersecurity', 'Enterprise', 'SaaS'],
    ['AgriTech', 'IoT', 'Sustainability'],
    ['FoodTech', 'Consumer', 'Marketplace'],
    ['PropTech', 'Real Estate', 'SaaS'],
    ['Logistics', 'Supply Chain', 'AI/ML'],
    ['Creator Economy', 'Media', 'SaaS'],
    ['Gaming', 'Entertainment', 'Mobile'],
    ['BioTech', 'Healthcare', 'R&D'],
    ['DevOps', 'Infrastructure', 'Enterprise'],
    ['E-commerce', 'Retail', 'Consumer'],
    ['Travel', 'Hospitality', 'Marketplace'],
    ['LegalTech', 'SaaS', 'Enterprise'],
    ['HR Tech', 'SaaS', 'B2B'],
    ['MarTech', 'Advertising', 'SaaS'],
    ['InsurTech', 'FinTech', 'B2B']
  ];
  
  const stages = ['Pre-Seed', 'Seed', 'Seed', 'Series A', 'Series A', 'Series B'];
  const seekingAmounts = ['$500K Pre-Seed', '$1M Seed', '$1.5M Seed', '$2M Seed', '$3M Series A', '$5M Series A', '$7M Series A', '$10M Series B', '$15M Series B'];
  
  const startups: MockStartup[] = [];
  
  for (let i = 1; i <= 100; i++) {
    const companyName = `${companyPrefixes[i % companyPrefixes.length]}${companySuffixes[i % companySuffixes.length]}`;
    const founderName = `${i % 5 === 0 ? 'Dr. ' : ''}${firstNames[i % firstNames.length]} ${lastNames[Math.floor(i / 2) % lastNames.length]}`;
    const sectorChoice = sectors[i % sectors.length];
    const stage = stages[i % stages.length];
    const score = 700 + (i % 200); // Scores between 700-899
    const teamSize = 5 + (i % 60); // Team size 5-64
    const foundedYear = 2018 + (i % 6); // Founded 2018-2023
    const seeking = seekingAmounts[i % seekingAmounts.length];
    
    const mrrOptions = ['$12K', '$25K', '$38K', '$52K', '$75K', '$95K', '$125K', '$180K', '$240K', '$350K', 'Pre-revenue'];
    const usersOptions = ['500 users', '2,000 users', '5,000 users', '10,000 users', '25,000 users', '50K+ users', '15 enterprise clients', '32 companies', '68 customers', 'Clinical trials'];
    const growthOptions = ['15% MoM', '18% MoM', '22% MoM', '25% MoM', '30% MoM', '35% MoM', 'N/A'];
    
    const highlight1Options = [
      `${10 + (i % 90)}% improvement in key metric`,
      `${50 + (i % 150)} paying customers`,
      `$${100 + (i % 900)}K ARR achieved`,
      `Partnership with ${i % 2 === 0 ? 'Fortune 500' : 'major'} company`,
      `Featured in ${i % 3 === 0 ? 'TechCrunch' : i % 3 === 1 ? 'Forbes' : 'Wired'}`,
      `${2 + (i % 8)}X revenue growth YoY`,
      `${i % 3 === 0 ? 'Patent pending' : 'Proprietary'} technology`,
      `Team from ${i % 2 === 0 ? 'Google, Meta' : 'Amazon, Microsoft'}`,
      `${80 + (i % 15)}% customer retention`,
      `${20 + (i % 60)}% gross margins`
    ];
    
    startups.push({
      id: `startup-${String(i).padStart(3, '0')}`,
      company_name: companyName,
      full_name: founderName,
      tagline: `${i % 2 === 0 ? 'AI-powered' : i % 3 === 0 ? 'Next-gen' : 'Revolutionary'} ${sectorChoice[0].toLowerCase()} solution for ${i % 2 === 0 ? 'enterprises' : 'businesses'}`,
      description: `${companyName} is ${i % 2 === 0 ? 'transforming' : 'revolutionizing'} ${sectorChoice[0].toLowerCase()} with ${i % 3 === 0 ? 'cutting-edge AI technology' : i % 3 === 1 ? 'innovative solutions' : 'scalable platform'}. ${i % 2 === 0 ? 'Helping companies save time and money.' : 'Deployed across multiple industries with proven results.'}`,
      sector: sectorChoice,
      stage: stage,
      score: score,
      founded_year: foundedYear,
      team_size: teamSize,
      seeking: seeking,
      traction_metrics: {
        mrr: mrrOptions[i % mrrOptions.length],
        users: usersOptions[i % usersOptions.length],
        growth: growthOptions[i % growthOptions.length]
      },
      highlights: [
        highlight1Options[i % highlight1Options.length],
        `${5 + (i % 95)}% market penetration in target segment`,
        `${teamSize} person team with ${2 + (i % 8)} PhDs`,
        `${i % 2 === 0 ? 'SOC 2 compliant' : i % 3 === 0 ? 'ISO certified' : 'Award-winning platform'}`
      ]
    });
  }
  
  return startups;
};

export const mockStartups: MockStartup[] = generateMockStartups();
