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

const generateMockInvestors = (): MockInvestor[] => {
  const firstNames = ['Sarah', 'James', 'Emma', 'David', 'Lisa', 'Michael', 'Sophie', 'Robert', 'Priya', 'Tom', 'Rachel', 'Alex', 'Jennifer', 'Daniel', 'Victoria', 'Christopher', 'Olivia', 'Matthew', 'Hannah', 'Andrew', 'Charlotte', 'William', 'Grace', 'Benjamin', 'Sophia', 'Samuel', 'Isabella', 'Thomas', 'Amelia', 'Joseph', 'Emily', 'Jack', 'Ava', 'Oliver', 'Mia', 'Harry', 'Ella', 'George', 'Lily', 'Charlie', 'Lucy', 'Oscar', 'Ruby', 'Jacob', 'Chloe', 'Noah', 'Freya', 'Henry', 'Evie', 'Sebastian'];
  const lastNames = ['Mitchell', 'Cooper', 'Thompson', 'Park', 'Rodriguez', 'Zhang', 'Williams', 'Johnson', 'Patel', 'Henderson', 'Green', 'Martinez', 'Taylor', 'Brown', 'Davies', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Walker', 'Wright', 'Robinson', 'Hughes', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Torres', 'Peterson', 'Gray', 'Ramirez', 'James', 'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price'];
  
  const orgTypes = ['Ventures', 'Capital', 'Angels', 'Fund', 'Partners', 'Investments', 'Syndicate', 'Group'];
  const sectors = [
    ['SaaS', 'Enterprise Software', 'B2B'],
    ['FinTech', 'Payments', 'Banking'],
    ['HealthTech', 'MedTech', 'Wellness'],
    ['AI/ML', 'Deep Tech', 'Data Science'],
    ['CleanTech', 'Clean Energy', 'Sustainability'],
    ['EdTech', 'Education', 'Learning Platforms'],
    ['PropTech', 'Real Estate', 'Construction'],
    ['FoodTech', 'AgriTech', 'Restaurants'],
    ['Marketplace', 'E-commerce', 'Retail'],
    ['Gaming', 'Entertainment', 'Media'],
    ['Cybersecurity', 'Enterprise Security', 'Privacy'],
    ['Logistics', 'Supply Chain', 'Transportation'],
    ['Consumer Tech', 'Mobile Apps', 'IoT'],
    ['BioTech', 'Life Sciences', 'Pharma'],
    ['Creator Economy', 'Social Media', 'Content'],
    ['DevOps', 'Infrastructure', 'Cloud'],
    ['Blockchain', 'Web3', 'Crypto'],
    ['Hardware', 'Manufacturing', 'Robotics'],
    ['Travel', 'Hospitality', 'Tourism'],
    ['LegalTech', 'RegTech', 'Compliance']
  ];
  
  const regions = ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Bristol', 'Cambridge', 'Oxford', 'Leeds', 'Liverpool', 'Newcastle', 'Brighton', 'Nottingham', 'Sheffield', 'Leicester', 'Glasgow', 'Cardiff', 'Belfast', 'Southampton', 'Reading', 'Milton Keynes', 'UK & Europe', 'UK & Ireland', 'UK National', 'Scotland', 'Wales', 'Northern Ireland'];
  
  const stages = [
    ['Pre-Seed'],
    ['Pre-Seed', 'Seed'],
    ['Seed'],
    ['Seed', 'Series A'],
    ['Series A'],
    ['Series A', 'Series B'],
    ['Series B'],
    ['Series B', 'Series C']
  ];
  
  const investors: MockInvestor[] = [];
  
  for (let i = 1; i <= 100; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / 2) % lastNames.length];
    const sectorChoice = sectors[i % sectors.length];
    const orgType = orgTypes[i % orgTypes.length];
    const stageChoice = stages[i % stages.length];
    
    const ticketMultiplier = i % 10 + 1;
    const ticketMin = ticketMultiplier * 25000;
    const ticketMax = ticketMin * (2 + (i % 5));
    
    const isVerified = i % 5 !== 0; // 80% verified
    const isQualified = i % 4 !== 0; // 75% qualified
    
    investors.push({
      id: `inv-${String(i).padStart(3, '0')}`,
      display_name: `${firstName} ${lastName}`,
      org_name: `${lastName} ${orgType}`,
      bio: `${i % 3 === 0 ? 'Former executive' : i % 3 === 1 ? 'Serial entrepreneur' : 'Industry expert'} with deep expertise in ${sectorChoice[0].toLowerCase()}. ${i % 2 === 0 ? 'Active mentor and advisor.' : 'Hands-on investor.'} ${i % 4 === 0 ? 'Focus on diverse and inclusive founders.' : ''}`,
      sectors: sectorChoice,
      ticket_min: ticketMin,
      ticket_max: ticketMax,
      region: regions[i % regions.length],
      verification_status: isVerified ? 'verified' : 'pending',
      is_qualified: isQualified,
      stage_preference: stageChoice,
      notable_investments: [
        `${sectorChoice[0].replace(/[^a-zA-Z]/g, '')}Start`,
        `${firstName}Tech`,
        `${lastName.slice(0, 4)}Ventures`
      ]
    });
  }
  
  return investors;
};

export const mockInvestors: MockInvestor[] = generateMockInvestors();
