
import { supabase } from '@/integrations/supabase/client';
import { AssessmentData } from '@/pages/Index';

// Test user data
const testUsers = [
  {
    email: 'test1@example.com',
    full_name: 'John Startup',
    company_name: 'TechVenture Inc'
  },
  {
    email: 'test2@example.com',
    full_name: 'Sarah Founder',
    company_name: 'InnovateCorp'
  },
  {
    email: 'test3@example.com',
    full_name: 'Mike Entrepreneur',
    company_name: 'DisruptTech'
  },
  {
    email: 'test4@example.com',
    full_name: 'Lisa Builder',
    company_name: 'ScaleUp Solutions'
  },
  {
    email: 'test5@example.com',
    full_name: 'David Visionary',
    company_name: 'FutureTech Labs'
  }
];

// Test assessment data
const testAssessments: AssessmentData[] = [
  {
    prototype: true,
    externalCapital: false,
    revenue: true,
    fullTimeTeam: true,
    termSheets: false,
    capTable: true,
    mrr: 'low',
    employees: '1-2',
    fundingGoal: 'productMarketFit',
    investors: 'angels',
    milestones: 'launch'
  },
  {
    prototype: true,
    externalCapital: true,
    revenue: true,
    fullTimeTeam: true,
    termSheets: true,
    capTable: true,
    mrr: 'medium',
    employees: '3-10',
    fundingGoal: 'scale',
    investors: 'vc',
    milestones: 'scale'
  },
  {
    prototype: false,
    externalCapital: false,
    revenue: false,
    fullTimeTeam: false,
    termSheets: false,
    capTable: false,
    mrr: 'none',
    employees: '1-2',
    fundingGoal: 'mvp',
    investors: 'none',
    milestones: 'concept'
  },
  {
    prototype: true,
    externalCapital: true,
    revenue: true,
    fullTimeTeam: true,
    termSheets: false,
    capTable: true,
    mrr: 'high',
    employees: '11-50',
    fundingGoal: 'scale',
    investors: 'vc',
    milestones: 'scale'
  },
  {
    prototype: true,
    externalCapital: false,
    revenue: false,
    fullTimeTeam: true,
    termSheets: false,
    capTable: false,
    mrr: 'none',
    employees: '1-2',
    fundingGoal: 'productMarketFit',
    investors: 'angels',
    milestones: 'launch'
  }
];

export const seedTestData = async (): Promise<void> => {
  try {
    console.log('Seeding test data...');
    
    // Note: In a real implementation, you would create test users through Supabase Auth
    // For now, we'll create profiles assuming the auth users exist
    
    // Create test profiles (this assumes auth users already exist)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(testUsers.map((user, index) => ({
        id: `test-user-${index + 1}`,
        email: user.email,
        full_name: user.full_name,
        company_name: user.company_name
      })));
    
    if (profileError) {
      console.error('Error seeding profiles:', profileError);
      return;
    }
    
    console.log('Test profiles seeded successfully');
    
    // Create test assessments
    for (let i = 0; i < testAssessments.length; i++) {
      const assessment = testAssessments[i];
      const userId = `test-user-${(i % testUsers.length) + 1}`;
      
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          user_id: userId,
          prototype: assessment.prototype,
          external_capital: assessment.externalCapital,
          revenue: assessment.revenue,
          full_time_team: assessment.fullTimeTeam,
          term_sheets: assessment.termSheets,
          cap_table: assessment.capTable,
          mrr: assessment.mrr,
          employees: assessment.employees,
          funding_goal: assessment.fundingGoal,
          investors: assessment.investors,
          milestones: assessment.milestones
        })
        .select()
        .single();
      
      if (assessmentError) {
        console.error('Error seeding assessment:', assessmentError);
        continue;
      }
      
      // Calculate and insert score
      const { calculateScore } = await import('./scoreCalculator');
      const scoreResult = calculateScore(assessment);
      
      const { error: scoreError } = await supabase
        .from('scores')
        .insert({
          assessment_id: assessmentData.id,
          user_id: userId,
          business_idea: scoreResult.businessIdea,
          business_idea_explanation: scoreResult.businessIdeaExplanation,
          financials: scoreResult.financials,
          financials_explanation: scoreResult.financialsExplanation,
          team: scoreResult.team,
          team_explanation: scoreResult.teamExplanation,
          traction: scoreResult.traction,
          traction_explanation: scoreResult.tractionExplanation,
          total_score: scoreResult.totalScore
        });
      
      if (scoreError) {
        console.error('Error seeding score:', scoreError);
        continue;
      }
    }
    
    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
