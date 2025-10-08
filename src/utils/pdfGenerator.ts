import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ScoreResult, AssessmentData } from '@/utils/scoreCalculator';
import { RecommendationsData } from '@/utils/recommendationsService';

export interface PDFReportData {
  assessmentData: AssessmentData;
  scoreResult: ScoreResult;
  recommendations?: RecommendationsData;
  userProfile?: {
    name?: string;
    email?: string;
    company?: string;
  };
  generatedAt: string;
  includeDetailedAnalysis?: boolean;
  includeScoreBreakdown?: boolean;
  includeRecommendations?: boolean;
}

export const generatePDFReport = async (data: PDFReportData): Promise<void> => {
  try {
    // Create a temporary container for the PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px'; // A4 width in pixels
    container.style.backgroundColor = 'white';
    container.style.padding = '50px 40px';
    container.style.fontFamily = 'Inter, system-ui, sans-serif';
    container.style.fontSize = '14px';
    container.style.lineHeight = '1.7';
    container.style.color = '#1f2937';
    
    // Generate HTML content for PDF
    container.innerHTML = generatePDFContent(data);
    
    document.body.appendChild(container);

    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Convert HTML to canvas with better settings for multi-page content
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: container.scrollHeight, // Use actual content height
      scrollX: 0,
      scrollY: 0,
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Create PDF with proper multi-page handling
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if content exceeds one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download PDF with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `investment-readiness-comprehensive-report-${timestamp}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

const generatePDFContent = (data: PDFReportData): string => {
  const { assessmentData, scoreResult, recommendations, userProfile, generatedAt, includeDetailedAnalysis = true, includeScoreBreakdown = true, includeRecommendations = true } = data;
  const date = new Date(generatedAt).toLocaleDateString();
  
  return `
    <div style="max-width: 794px; margin: 0 auto; padding: 40px; line-height: 1.6; color: #333;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
        <h1 style="color: #2563eb; font-size: 28px; margin: 0 0 10px 0; font-weight: bold;">
          Investment Readiness Assessment Report
        </h1>
        <p style="color: #666; font-size: 14px; margin: 0;">Generated on ${date}</p>
        ${userProfile?.name ? `<p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">Prepared for: ${userProfile.name}</p>` : ''}
      </div>

      <!-- Executive Summary -->
      <div style="margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
        <h2 style="color: #2563eb; font-size: 20px; margin: 0 0 15px 0;">Executive Summary</h2>
        <div style="display: flex; align-items: center; margin-bottom: 15px;">
          <div style="font-size: 36px; font-weight: bold; color: #2563eb; margin-right: 20px;">
            ${scoreResult.totalScore}/999
          </div>
          <div>
            <div style="font-size: 18px; font-weight: bold; color: #333;">
              ${getGrade(scoreResult.totalScore)} Grade
            </div>
            <div style="color: #666; font-size: 14px;">
              ${getReadinessLevel(scoreResult.totalScore)}
            </div>
          </div>
        </div>
        <p style="margin: 0; color: #555;">
          ${getExecutiveSummary(scoreResult)}
        </p>
      </div>

      <!-- Score Breakdown -->
      ${includeScoreBreakdown ? `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2563eb; font-size: 20px; margin: 0 0 20px 0;">Score Breakdown</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          ${generateScoreCard('Business Idea', scoreResult.businessIdea, 100, '30%')}
          ${generateScoreCard('Financials', scoreResult.financials, 100, '25%')}
          ${generateScoreCard('Team', scoreResult.team, 100, '25%')}
          ${generateScoreCard('Traction', scoreResult.traction, 100, '20%')}
        </div>
      </div>
      ` : ''}

      <!-- Assessment Details -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2563eb; font-size: 20px; margin: 0 0 20px 0;">Assessment Details</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
            <div><strong>Prototype:</strong> ${getLabel(String(assessmentData.prototype), 'prototype')}</div>
            <div><strong>External Capital:</strong> ${getLabel(String(assessmentData.externalCapital), 'yesno')}</div>
            <div><strong>Revenue:</strong> ${getLabel(String(assessmentData.revenue), 'yesno')}</div>
            <div><strong>Full-time Team:</strong> ${getLabel(String(assessmentData.fullTimeTeam), 'yesno')}</div>
            <div><strong>Term Sheets:</strong> ${getLabel(String(assessmentData.termSheets), 'yesno')}</div>
            <div><strong>Cap Table:</strong> ${getLabel(String(assessmentData.capTable), 'yesno')}</div>
            <div><strong>MRR:</strong> ${getLabel(String(assessmentData.mrr), 'mrr')}</div>
            <div><strong>Employees:</strong> ${getLabel(String(assessmentData.employees), 'employees')}</div>
            <div><strong>Funding Goal:</strong> ${getLabel(String(assessmentData.fundingGoal), 'funding')}</div>
            <div><strong>Investors:</strong> ${getLabel(String(assessmentData.investors), 'investors')}</div>
            <div><strong>Milestones:</strong> ${getLabel(String(assessmentData.milestones), 'milestones')}</div>
          </div>
        </div>
      </div>

      <!-- Personalized Recommendations -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2563eb; font-size: 20px; margin: 0 0 20px 0; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">🎯 Personalized Recommendations</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0; font-style: italic;">
            Based on your assessment results, here are tailored recommendations to enhance your investment readiness:
          </p>
          ${recommendations && includeRecommendations ? generateRecommendationsSection(recommendations) : generateFallbackRecommendations(scoreResult, assessmentData)}
        </div>
      </div>
      
      <!-- Actionable Steps -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2563eb; font-size: 20px; margin: 0 0 20px 0; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">⚡ Actionable Steps to Improve Investor Readiness</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0; font-style: italic;">
            Prioritized action plan with timelines to accelerate your investment readiness:
          </p>
          ${generateActionableSteps(scoreResult, assessmentData)}
        </div>
      </div>
      
      <!-- Detailed Analysis Section -->
      ${includeDetailedAnalysis ? `
        <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
          <h2 style="color: #2563eb; font-size: 20px; margin: 0 0 20px 0; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">📊 Detailed Analysis & Investment Readiness Insights</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0 0 20px 0; font-style: italic;">
            Comprehensive analysis of your startup's strengths and areas for improvement across all key dimensions:
          </p>
          <div style="space-y: 15px;">
            ${generateDetailedAnalysis(scoreResult, assessmentData)}
          </div>
          
          <!-- Investor Readiness Matrix -->
          <div style="margin-top: 25px; padding: 20px; background: white; border-radius: 6px; border: 1px solid #e5e7eb;">
            <h3 style="color: #2563eb; font-size: 16px; margin: 0 0 15px 0;">🎯 Investment Readiness Matrix</h3>
            ${generateReadinessMatrix(scoreResult)}
          </div>
          
          <!-- Next Steps Summary -->
          <div style="margin-top: 25px; padding: 20px; background: #eff6ff; border-radius: 6px; border-left: 4px solid #2563eb;">
            <h3 style="color: #2563eb; font-size: 16px; margin: 0 0 15px 0;">🚀 Key Focus Areas</h3>
            ${generateKeyFocusAreas(scoreResult, assessmentData)}
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 40px; text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
        <p style="margin: 0;">This report was generated by the Investment Readiness Assessment Platform</p>
        <p style="margin: 5px 0 0 0;">For more information, visit our platform to retake the assessment or explore additional resources.</p>
      </div>
    </div>
  `;
};

const generateScoreCard = (title: string, score: number, maxScore: number, weight: string): string => {
  const percentage = Math.round((score / maxScore) * 100);
  const grade = getGradeForScore(score, maxScore);
  
  return `
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
      <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 10px;">
        <h3 style="color: #333; font-size: 16px; margin: 0;">${title}</h3>
        <span style="color: #666; font-size: 12px;">${weight}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="font-size: 24px; font-weight: bold; color: #2563eb;">
          ${score}/${maxScore}
        </div>
        <div>
          <div style="font-size: 14px; font-weight: bold; color: ${getGradeColor(grade)};">
            ${grade} Grade
          </div>
          <div style="color: #666; font-size: 12px;">
            ${percentage}%
          </div>
        </div>
      </div>
    </div>
  `;
};

const generateRecommendationsSection = (recommendations: RecommendationsData): string => {
  let content = '';
  
  Object.entries(recommendations).forEach(([category, recs]) => {
    if (Array.isArray(recs) && recs.length > 0) {
      content += `
        <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <h3 style="color: #2563eb; font-size: 16px; margin: 0 0 10px 0; text-transform: capitalize;">
            ${category.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <ul style="margin: 0; padding-left: 20px; color: #555;">
            ${recs.map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
          </ul>
        </div>
      `;
    }
  });
  
  return content;
};

const getGrade = (score: number): string => {
  if (score >= 800) return 'A';
  if (score >= 700) return 'B';
  if (score >= 600) return 'C';
  if (score >= 400) return 'D';
  return 'F';
};

const getGradeForScore = (score: number, maxScore: number): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A': return '#16a34a';
    case 'B': return '#2563eb';
    case 'C': return '#ea580c';
    case 'D': return '#dc2626';
    case 'F': return '#991b1b';
    default: return '#666';
  }
};

const getReadinessLevel = (score: number): string => {
  if (score >= 800) return 'Investment Ready';
  if (score >= 700) return 'Nearly Ready';
  if (score >= 600) return 'Developing';
  if (score >= 400) return 'Early Stage';
  return 'Pre-Investment';
};

const getExecutiveSummary = (scoreResult: ScoreResult): string => {
  const grade = getGrade(scoreResult.totalScore);
  const level = getReadinessLevel(scoreResult.totalScore);
  
  if (grade === 'A') {
    return 'Your startup demonstrates strong investment readiness across all key areas. You have built a solid foundation with clear market traction, robust financials, and a capable team. Continue refining your pitch and connecting with suitable investors.';
  } else if (grade === 'B') {
    return 'Your startup shows good potential with solid fundamentals in place. Focus on strengthening any weaker areas identified in the detailed breakdown to enhance your investment attractiveness.';
  } else if (grade === 'C') {
    return 'Your startup has a foundation to build upon but requires development in several key areas before being investment-ready. Prioritize the recommendations provided to improve your overall score.';
  } else {
    return 'Your startup is in the early stages and needs significant development across multiple areas before being investment-ready. Focus on building your minimum viable product, establishing initial traction, and assembling your core team.';
  }
};

const generateDetailedAnalysis = (scoreResult: ScoreResult, assessmentData: AssessmentData): string => {
  const analyses = [];
  
  // Business Idea Analysis
  if (scoreResult.businessIdea < 70) {
    analyses.push(`
      <div style="margin-bottom: 15px; padding: 15px; border-left: 4px solid #ea580c; background: #fff7ed;">
        <h4 style="color: #ea580c; margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Business Idea Enhancement</h4>
        <p style="margin: 0; font-size: 13px; color: #555;">Your business idea shows potential but needs refinement. Consider conducting more market research, validating your value proposition with potential customers, and clearly defining your unique selling points.</p>
      </div>
    `);
  }
  
  // Financial Analysis
  if (scoreResult.financials < 70) {
    analyses.push(`
      <div style="margin-bottom: 15px; padding: 15px; border-left: 4px solid #dc2626; background: #fef2f2;">
        <h4 style="color: #dc2626; margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Financial Structure</h4>
        <p style="margin: 0; font-size: 13px; color: #555;">Your financial foundation requires attention. Focus on developing detailed financial projections, establishing clear revenue streams, and preparing comprehensive financial statements that investors can review.</p>
      </div>
    `);
  }
  
  // Team Analysis
  if (scoreResult.team < 70) {
    analyses.push(`
      <div style="margin-bottom: 15px; padding: 15px; border-left: 4px solid #7c3aed; background: #faf5ff;">
        <h4 style="color: #7c3aed; margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Team Development</h4>
        <p style="margin: 0; font-size: 13px; color: #555;">Building a stronger team is crucial for investment readiness. Consider recruiting key personnel with complementary skills, establishing clear roles and responsibilities, and demonstrating your team's commitment through equity arrangements.</p>
      </div>
    `);
  }
  
  // Traction Analysis
  if (scoreResult.traction < 70) {
    analyses.push(`
      <div style="margin-bottom: 15px; padding: 15px; border-left: 4px solid #059669; background: #f0fdf4;">
        <h4 style="color: #059669; margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Market Traction</h4>
        <p style="margin: 0; font-size: 13px; color: #555;">Demonstrating market traction is essential for investor confidence. Focus on acquiring early customers, generating initial revenue, and showing consistent growth metrics that validate market demand.</p>
      </div>
    `);
  }
  
  // Investment Readiness Score Analysis
  const readinessAnalysis = `
    <div style="margin-bottom: 15px; padding: 15px; border-left: 4px solid #2563eb; background: #eff6ff;">
      <h4 style="color: #2563eb; margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">Investment Readiness Assessment</h4>
      <p style="margin: 0; font-size: 13px; color: #555;">
        Based on your overall score of ${scoreResult.totalScore}/999, you are at the "${getReadinessLevel(scoreResult.totalScore)}" stage. 
        ${scoreResult.totalScore >= 700 ? 
          'You have strong fundamentals in place and are well-positioned to engage with investors. Focus on perfecting your pitch and identifying the right investor targets.' :
          scoreResult.totalScore >= 500 ?
          'You have a solid foundation but need to strengthen key areas before approaching investors. Prioritize the highest-impact improvements identified in your recommendations.' :
          'You are in the early development phase. Focus on building core capabilities, establishing initial market validation, and assembling your foundational team before seeking investment.'
        }
      </p>
    </div>
  `;
  
  return [readinessAnalysis, ...analyses].join('');
};

const getLabel = (value: string, type: string): string => {
  switch (type) {
    case 'prototype':
      switch (value) {
        case 'idea': return 'Idea Stage';
        case 'mockup': return 'Mockup/Wireframe';
        case 'mvp': return 'MVP';
        case 'beta': return 'Beta Version';
        case 'launched': return 'Launched Product';
        default: return value;
      }
    case 'yesno':
      return value === 'yes' ? 'Yes' : 'No';
    case 'mrr':
      switch (value) {
        case 'none': return 'No Revenue';
        case 'under-1k': return 'Under $1K';
        case '1k-10k': return '$1K - $10K';
        case '10k-50k': return '$10K - $50K';
        case 'over-50k': return 'Over $50K';
        default: return value;
      }
    case 'employees':
      switch (value) {
        case 'solo': return 'Solo Founder';
        case '2-5': return '2-5 Employees';
        case '6-20': return '6-20 Employees';
        case 'over-20': return 'Over 20 Employees';
        default: return value;
      }
    case 'funding':
      switch (value) {
        case 'under-100k': return 'Under $100K';
        case '100k-500k': return '$100K - $500K';
        case '500k-2m': return '$500K - $2M';
        case 'over-2m': return 'Over $2M';
        default: return value;
      }
    case 'investors':
      switch (value) {
        case 'none': return 'No Investors';
        case 'friends-family': return 'Friends & Family';
        case 'angel': return 'Angel Investors';
        case 'vc': return 'Venture Capital';
        case 'institutional': return 'Institutional';
        default: return value;
      }
    case 'milestones':
      switch (value) {
        case 'concept': return 'Concept Validation';
        case 'prototype': return 'Prototype Complete';
        case 'first-customers': return 'First Customers';
        case 'revenue': return 'Revenue Generation';
        case 'growth': return 'Sustainable Growth';
        default: return value;
      }
    default:
      return value;
  }
};

const generateFallbackRecommendations = (scoreResult: ScoreResult, assessmentData: AssessmentData): string => {
  const recommendations = [];
  
  // Business Idea Recommendations
  if (scoreResult.businessIdea < 80) {
    recommendations.push({
      category: 'Business Idea',
      items: [
        'Conduct comprehensive market research to validate your target market size and opportunity',
        'Develop a clear and compelling value proposition that differentiates you from competitors',
        'Create detailed user personas and customer journey maps',
        'Test your assumptions through customer interviews and prototype validation'
      ]
    });
  }
  
  // Financial Recommendations
  if (scoreResult.financials < 80) {
    recommendations.push({
      category: 'Financial Planning',
      items: [
        'Develop detailed financial projections for 3-5 years including P&L, cash flow, and balance sheet',
        'Establish clear revenue streams and pricing strategy',
        'Create a comprehensive cap table and understand equity distribution',
        'Implement proper financial tracking and accounting systems'
      ]
    });
  }
  
  // Team Recommendations
  if (scoreResult.team < 80) {
    recommendations.push({
      category: 'Team Building',
      items: [
        'Recruit key team members with complementary skills in areas where you lack expertise',
        'Establish clear roles, responsibilities, and equity arrangements',
        'Consider advisory board members who can provide industry expertise and connections',
        'Demonstrate team commitment through full-time dedication to the venture'
      ]
    });
  }
  
  // Traction Recommendations
  if (scoreResult.traction < 80) {
    recommendations.push({
      category: 'Market Traction',
      items: [
        'Focus on acquiring and retaining early customers to demonstrate product-market fit',
        'Develop key performance indicators (KPIs) and track growth metrics consistently',
        'Build strategic partnerships that can accelerate market entry and growth',
        'Generate initial revenue and establish recurring revenue streams where possible'
      ]
    });
  }
  
  let content = '';
  recommendations.forEach(rec => {
    content += `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
        <h3 style="color: #2563eb; font-size: 16px; margin: 0 0 10px 0;">
          ${rec.category}
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #555;">
          ${rec.items.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}
        </ul>
      </div>
    `;
  });
  
  return content;
};

const generateActionableSteps = (scoreResult: ScoreResult, assessmentData: AssessmentData): string => {
  const steps = [];
  
  // Priority 1: Immediate Actions (0-30 days)
  const immediateActions = [];
  if (!assessmentData.capTable) {
    immediateActions.push('Create and document your cap table with current equity distribution');
  }
  if (!assessmentData.revenue) {
    immediateActions.push('Develop a clear revenue generation strategy and pricing model');
  }
  if (!assessmentData.fullTimeTeam) {
    immediateActions.push('Assess team commitment and consider transitioning key members to full-time');
  }
  
  // Priority 2: Short-term Goals (1-3 months)
  const shortTermActions = [];
  if (scoreResult.businessIdea < 70) {
    shortTermActions.push('Conduct 50+ customer interviews to validate your value proposition');
    shortTermActions.push('Complete competitive analysis and market sizing research');
  }
  if (scoreResult.financials < 70) {
    shortTermActions.push('Develop 3-year financial projections with monthly granularity for Year 1');
    shortTermActions.push('Implement financial tracking system and establish key metrics');
  }
  
  // Priority 3: Medium-term Goals (3-6 months)
  const mediumTermActions = [];
  if (scoreResult.traction < 70) {
    mediumTermActions.push('Launch pilot program with 10-20 early customers');
    mediumTermActions.push('Establish partnerships with key industry players');
  }
  if (scoreResult.team < 70) {
    mediumTermActions.push('Recruit critical team members for key functional areas');
    mediumTermActions.push('Form advisory board with industry experts');
  }
  
  let content = '';
  
  if (immediateActions.length > 0) {
    content += `
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
        <h3 style="color: #92400e; font-size: 16px; margin: 0 0 10px 0;">
          🚀 Immediate Actions (0-30 days)
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #92400e;">
          ${immediateActions.map(action => `<li style="margin-bottom: 8px;"><strong>${action}</strong></li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  if (shortTermActions.length > 0) {
    content += `
      <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
        <h3 style="color: #1d4ed8; font-size: 16px; margin: 0 0 10px 0;">
          📈 Short-term Goals (1-3 months)
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #1d4ed8;">
          ${shortTermActions.map(action => `<li style="margin-bottom: 8px;">${action}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  if (mediumTermActions.length > 0) {
    content += `
      <div style="background: #d1fae5; border: 1px solid #10b981; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
        <h3 style="color: #047857; font-size: 16px; margin: 0 0 10px 0;">
          🎯 Medium-term Goals (3-6 months)
        </h3>
        <ul style="margin: 0; padding-left: 20px; color: #047857;">
          ${mediumTermActions.map(action => `<li style="margin-bottom: 8px;">${action}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Investment Readiness Checklist
  content += `
    <div style="background: #f3f4f6; border: 1px solid #6b7280; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
      <h3 style="color: #374151; font-size: 16px; margin: 0 0 10px 0;">
        ✅ Investment Readiness Checklist
      </h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151;">
        <li style="margin-bottom: 8px;">Pitch deck with compelling story and clear ask</li>
        <li style="margin-bottom: 8px;">Financial model with realistic projections</li>
        <li style="margin-bottom: 8px;">Legal structure and IP protection in place</li>
        <li style="margin-bottom: 8px;">Due diligence materials prepared (data room)</li>
        <li style="margin-bottom: 8px;">Target investor list and warm introductions</li>
      </ul>
    </div>
  `;
  
  return content;
};

const generateReadinessMatrix = (scoreResult: ScoreResult): string => {
  const categories = [
    { name: 'Business Idea', score: scoreResult.businessIdea, maxScore: 100 },
    { name: 'Financials', score: scoreResult.financials, maxScore: 100 },
    { name: 'Team', score: scoreResult.team, maxScore: 100 },
    { name: 'Traction', score: scoreResult.traction, maxScore: 100 }
  ];

  let matrixContent = `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
  `;

  categories.forEach(category => {
    const percentage = Math.round((category.score / category.maxScore) * 100);
    const status = getReadinessStatus(percentage);
    const statusColor = getStatusColor(status);
    
    matrixContent += `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; text-align: center;">
        <div style="font-size: 14px; font-weight: bold; color: #333; margin-bottom: 8px;">${category.name}</div>
        <div style="font-size: 20px; font-weight: bold; color: #2563eb; margin-bottom: 4px;">${percentage}%</div>
        <div style="font-size: 12px; color: ${statusColor}; font-weight: bold;">${status}</div>
      </div>
    `;
  });

  matrixContent += `</div>`;
  return matrixContent;
};

const generateKeyFocusAreas = (scoreResult: ScoreResult, assessmentData: AssessmentData): string => {
  const focusAreas = [];
  
  // Identify top 3 priority areas based on scores and assessment data
  const priorities = [
    { area: 'Business Idea', score: scoreResult.businessIdea, priority: scoreResult.businessIdea < 70 ? 'High' : 'Medium' },
    { area: 'Financial Planning', score: scoreResult.financials, priority: scoreResult.financials < 70 ? 'High' : 'Medium' },
    { area: 'Team Building', score: scoreResult.team, priority: scoreResult.team < 70 ? 'High' : 'Medium' },
    { area: 'Market Traction', score: scoreResult.traction, priority: scoreResult.traction < 70 ? 'High' : 'Medium' }
  ].sort((a, b) => a.score - b.score).slice(0, 3);

  let content = `
    <div style="space-y: 10px;">
      <p style="margin: 0 0 15px 0; font-size: 13px; color: #555;">
        Based on your assessment, focus on these key areas to maximize your investment readiness:
      </p>
  `;

  priorities.forEach((item, index) => {
    const priorityColor = item.priority === 'High' ? '#dc2626' : '#ea580c';
    content += `
      <div style="display: flex; align-items: center; padding: 8px 12px; background: white; border-radius: 4px; border-left: 3px solid ${priorityColor}; margin-bottom: 8px;">
        <div style="font-weight: bold; color: ${priorityColor}; margin-right: 8px; font-size: 14px;">${index + 1}.</div>
        <div style="flex: 1;">
          <div style="font-weight: bold; color: #333; font-size: 13px;">${item.area}</div>
          <div style="font-size: 12px; color: #666;">Current Score: ${item.score}/100 • Priority: ${item.priority}</div>
        </div>
      </div>
    `;
  });

  content += `</div>`;
  return content;
};

const getReadinessStatus = (percentage: number): string => {
  if (percentage >= 80) return 'Excellent';
  if (percentage >= 70) return 'Good';
  if (percentage >= 60) return 'Fair';
  if (percentage >= 40) return 'Needs Work';
  return 'Critical';
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Excellent': return '#16a34a';
    case 'Good': return '#2563eb';
    case 'Fair': return '#ea580c';
    case 'Needs Work': return '#dc2626';
    case 'Critical': return '#991b1b';
    default: return '#666';
  }
};