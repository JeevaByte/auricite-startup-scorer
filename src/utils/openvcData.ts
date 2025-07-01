
// Mock OpenVC investor database for MVP
export interface InvestorData {
  id: string;
  name: string;
  type: 'angel' | 'vc' | 'seed' | 'seriesA' | 'growth';
  checkSize: string;
  stage: string[];
  sectors: string[];
  location: string;
  description: string;
  website?: string;
  contact?: string;
}

export const openvcInvestors: InvestorData[] = [
  {
    id: '1',
    name: 'Seedcamp',
    type: 'seed',
    checkSize: '€100K - €250K',
    stage: ['Pre-Seed', 'Seed'],
    sectors: ['FinTech', 'SaaS', 'Marketplace', 'AI/ML'],
    location: 'London, UK',
    description: 'Europe\'s seed fund, helping founders build global companies.',
    website: 'https://seedcamp.com',
    contact: 'hello@seedcamp.com'
  },
  {
    id: '2',
    name: 'Accel',
    type: 'vc',
    checkSize: '$500K - $15M',
    stage: ['Seed', 'Series A', 'Series B'],
    sectors: ['Enterprise', 'Consumer', 'FinTech', 'HealthTech'],
    location: 'London, UK',
    description: 'Backing exceptional entrepreneurs from the earliest stages.',
    website: 'https://accel.com',
    contact: 'london@accel.com'
  },
  {
    id: '3',
    name: 'Index Ventures',
    type: 'vc',
    checkSize: '$1M - $100M',
    stage: ['Series A', 'Series B', 'Series C', 'Growth'],
    sectors: ['Enterprise', 'FinTech', 'Gaming', 'Security'],
    location: 'London, UK',
    description: 'Partnering with exceptional entrepreneurs across Europe and beyond.',
    website: 'https://indexventures.com'
  },
  {
    id: '4',
    name: 'Balderton Capital',
    type: 'vc',
    checkSize: '$1M - $25M',
    stage: ['Series A', 'Series B'],
    sectors: ['Enterprise', 'FinTech', 'Marketplace', 'AI/ML'],
    location: 'London, UK',
    description: 'Backing bold European founders building global technology companies.',
    website: 'https://baldertoncapital.com'
  },
  {
    id: '5',
    name: 'Jason Calacanis',
    type: 'angel',
    checkSize: '$25K - $100K',
    stage: ['Pre-Seed', 'Seed'],
    sectors: ['SaaS', 'Consumer', 'AI/ML'],
    location: 'Silicon Valley, USA',
    description: 'Serial entrepreneur and active angel investor.',
    website: 'https://calacanis.com'
  },
  {
    id: '6',
    name: 'Forward Partners',
    type: 'vc',
    checkSize: '£100K - £5M',
    stage: ['Pre-Seed', 'Seed', 'Series A'],
    sectors: ['E-commerce', 'Marketplace', 'Consumer'],
    location: 'London, UK',
    description: 'Applied VC - we don\'t just invest, we get our hands dirty.',
    website: 'https://forwardpartners.com'
  },
  {
    id: '7',
    name: 'Entrepreneur First',
    type: 'seed',
    checkSize: '£100K - £250K',
    stage: ['Pre-Seed'],
    sectors: ['Deep Tech', 'AI/ML', 'Biotech', 'FinTech'],
    location: 'London, UK',
    description: 'Building companies from exceptional individuals, not just ideas.',
    website: 'https://joinef.com'
  },
  {
    id: '8',
    name: 'Passion Capital',
    type: 'seed',
    checkSize: '£50K - £500K',
    stage: ['Pre-Seed', 'Seed'],
    sectors: ['Consumer', 'Marketplace', 'SaaS'],
    location: 'London, UK',
    description: 'Early-stage VC focused on consumer and enterprise startups.',
    website: 'https://passioncapital.com'
  },
  {
    id: '9',
    name: 'Notion Capital',
    type: 'vc',
    checkSize: '£500K - £10M',
    stage: ['Series A', 'Series B'],
    sectors: ['Enterprise Software', 'SaaS', 'B2B'],
    location: 'London, UK',
    description: 'Backing exceptional B2B software companies across Europe.',
    website: 'https://notion.vc'
  },
  {
    id: '10',
    name: 'Octopus Ventures',
    type: 'vc',
    checkSize: '£1M - £15M',
    stage: ['Series A', 'Series B', 'Growth'],
    sectors: ['HealthTech', 'FinTech', 'Deep Tech', 'Consumer'],
    location: 'London, UK',
    description: 'Backing the people, ideas and industries that will change the world.',
    website: 'https://octopusventures.com'
  }
];

export const getInvestorsByType = (type: string): InvestorData[] => {
  return openvcInvestors.filter(investor => investor.type === type);
};

export const getInvestorsByStage = (stage: string): InvestorData[] => {
  return openvcInvestors.filter(investor => investor.stage.includes(stage));
};

export const getInvestorsBySector = (sector: string): InvestorData[] => {
  return openvcInvestors.filter(investor => 
    investor.sectors.some(s => s.toLowerCase().includes(sector.toLowerCase()))
  );
};
