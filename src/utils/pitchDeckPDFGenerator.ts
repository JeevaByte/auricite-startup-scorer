import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PitchDeckAnalysis {
  pitchDeckAnalysis?: {
    problemStatement: { score: number; feedback: string; keyInsights: string[] };
    solutionClarity: { score: number; feedback: string; keyInsights: string[] };
    marketOpportunity: { score: number; feedback: string; marketSize: string; targetAudience: string };
    businessModel: { score: number; feedback: string; revenueStreams: string[]; scalability: string };
    traction: { score: number; feedback: string; metrics: string[]; momentum: string };
    team: { score: number; feedback: string; strengths: string[]; gaps: string[] };
    financials: { score: number; feedback: string; assumptions: string[]; projectionQuality: string };
    askAndExit: { score: number; feedback: string; clarity: string; alignment: string };
  };
  suggestions?: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    impact: string;
    implementation: string;
    timeline?: string;
  }>;
  industryBenchmarks?: {
    clarityIndustryAvg: number;
    engagementIndustryAvg: number;
    percentileRanking: number;
    competitiveAdvantage: string;
  };
  overallScore: number;
}

export const generatePitchDeckPDF = async (
  analysis: PitchDeckAnalysis,
  fileName: string,
  companyName?: string
): Promise<void> => {
  try {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '794px';
    container.style.backgroundColor = 'white';
    container.style.padding = '40px';
    container.style.fontFamily = 'Inter, system-ui, sans-serif';
    
    container.innerHTML = generatePitchDeckPDFContent(analysis, fileName, companyName);
    document.body.appendChild(container);

    await new Promise(resolve => setTimeout(resolve, 1000));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: container.scrollHeight,
    });

    document.body.removeChild(container);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const timestamp = new Date().toISOString().split('T')[0];
    pdf.save(`pitch-deck-analysis-${timestamp}.pdf`);
  } catch (error) {
    console.error('Error generating pitch deck PDF:', error);
    throw error;
  }
};

const generatePitchDeckPDFContent = (
  analysis: PitchDeckAnalysis,
  fileName: string,
  companyName?: string
): string => {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const overallScore = analysis.overallScore || 70;
  const grade = overallScore >= 85 ? 'A' : overallScore >= 75 ? 'B+' : overallScore >= 65 ? 'B' : overallScore >= 55 ? 'C+' : 'C';

  return `
    <div style="max-width: 794px; margin: 0 auto; background: white; font-size: 13px; line-height: 1.6; color: #1f2937;">
      
      <!-- Cover Page -->
      <div style="min-height: 1000px; padding: 80px 40px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; text-align: center; border-radius: 12px; margin-bottom: 30px;">
        <h1 style="font-size: 48px; font-weight: 800; margin: 0 0 20px 0;">Pitch Deck Analysis</h1>
        <h2 style="font-size: 28px; font-weight: 400; opacity: 0.95; margin: 0 0 60px 0;">${companyName || 'Investment Readiness Report'}</h2>
        
        <div style="background: rgba(255,255,255,0.12); padding: 40px; border-radius: 20px; backdrop-filter: blur(10px); margin: 0 auto; max-width: 500px;">
          <div style="font-size: 96px; font-weight: 900; margin: 0 0 12px 0; letter-spacing: -2px;">${overallScore}</div>
          <div style="font-size: 24px; margin: 0 0 8px 0;">Overall Deck Score</div>
          <div style="font-size: 32px; font-weight: 700; margin: 0; opacity: 0.95;">Grade: ${grade}</div>
        </div>
        
        <div style="margin-top: 80px; font-size: 16px; opacity: 0.85;">
          <p style="margin: 0;">Generated on ${date}</p>
          <p style="margin: 8px 0 0 0;">File: ${fileName}</p>
        </div>
      </div>

      <!-- Executive Summary -->
      <div style="padding: 32px; background: #f8fafc; border-radius: 12px; margin-bottom: 30px; border-left: 6px solid #4f46e5;">
        <h2 style="color: #4f46e5; font-size: 28px; margin: 0 0 20px 0; font-weight: 700;">📋 Executive Summary</h2>
        
        ${generateExecutiveSummary(analysis)}
        
        <div style="margin-top: 24px; padding: 20px; background: white; border-radius: 8px;">
          <h3 style="font-size: 18px; color: #374151; margin: 0 0 12px 0; font-weight: 600;">Key Findings</h3>
          ${generateKeyFindings(analysis)}
        </div>
      </div>

      <!-- Slide-by-Slide Analysis -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #4f46e5; font-size: 28px; margin: 0 0 24px 0; font-weight: 700;">🔍 Slide-by-Slide Breakdown</h2>
        ${generateSlideAnalysis(analysis)}
      </div>

      <!-- Detailed Feedback -->
      <div style="padding: 32px; background: #fef3c7; border-radius: 12px; margin-bottom: 30px; border-left: 6px solid #f59e0b;">
        <h2 style="color: #d97706; font-size: 28px; margin: 0 0 24px 0; font-weight: 700;">💡 Priority Recommendations</h2>
        ${generateDetailedFeedback(analysis)}
      </div>

      <!-- Q&A Readiness -->
      <div style="padding: 32px; background: #eff6ff; border-radius: 12px; margin-bottom: 30px; border-left: 6px solid #3b82f6;">
        <h2 style="color: #1e40af; font-size: 28px; margin: 0 0 20px 0; font-weight: 700;">❓ Investor Q&A Preparation</h2>
        <p style="margin: 0 0 16px 0; color: #4b5563;">Top 10 questions investors will likely ask based on your deck:</p>
        ${generateQAReadiness(analysis)}
      </div>

      <!-- Action Plan -->
      <div style="padding: 32px; background: #ecfdf5; border-radius: 12px; margin-bottom: 30px; border-left: 6px solid #10b981;">
        <h2 style="color: #059669; font-size: 28px; margin: 0 0 20px 0; font-weight: 700;">✅ Implementation Roadmap</h2>
        ${generateActionPlan(analysis)}
      </div>

      <!-- Industry Benchmarks -->
      ${analysis.industryBenchmarks ? `
        <div style="padding: 32px; background: #faf5ff; border-radius: 12px; margin-bottom: 30px; border-left: 6px solid #7c3aed;">
          <h2 style="color: #7c3aed; font-size: 28px; margin: 0 0 20px 0; font-weight: 700;">📊 Industry Benchmark Comparison</h2>
          <p style="margin: 0 0 16px 0; color: #4b5563;">Your deck ranks at the <strong>${analysis.industryBenchmarks.percentileRanking}th percentile</strong> compared to successful pitch decks.</p>
          <div style="background: white; padding: 20px; border-radius: 8px;">
            ${analysis.industryBenchmarks.competitiveAdvantage}
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 60px; padding: 30px; text-align: center; border-top: 2px solid #e5e7eb; color: #6b7280;">
        <h3 style="color: #374151; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">AI-Powered Pitch Deck Analysis</h3>
        <p style="margin: 0; font-size: 13px;">Generated using advanced AI to provide investor-grade feedback</p>
        <p style="margin: 8px 0 0 0; font-size: 12px; opacity: 0.8;">This report is confidential and intended for internal use only</p>
      </div>
    </div>
  `;
};

const generateExecutiveSummary = (analysis: PitchDeckAnalysis): string => {
  const score = analysis.overallScore || 70;
  
  if (score >= 85) {
    return `
      <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px;">
        <strong style="color: #059669;">🎉 Excellent work!</strong> Your pitch deck demonstrates strong investor readiness across all key areas. 
        The narrative flow is compelling, financials are well-structured, and your ask is clear. With minor refinements, 
        this deck is ready to present to investors.
      </p>
    `;
  } else if (score >= 70) {
    return `
      <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px;">
        <strong style="color: #3b82f6;">👍 Strong foundation!</strong> Your pitch deck covers the essential elements investors look for. 
        Focus on strengthening the areas marked as "high priority" below to elevate your deck to the next level and 
        maximize your chances of securing funding.
      </p>
    `;
  } else {
    return `
      <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px;">
        <strong style="color: #f59e0b;">⚠️ Needs improvement</strong> Your pitch deck has good bones but requires significant work 
        in several critical areas before presenting to investors. Prioritize the high-impact recommendations below, 
        particularly around problem clarity, market sizing, and financial projections.
      </p>
    `;
  }
};

const generateKeyFindings = (analysis: PitchDeckAnalysis): string => {
  const findings: string[] = [];
  const pdAnalysis = analysis.pitchDeckAnalysis;
  
  if (pdAnalysis) {
    if (pdAnalysis.problemStatement.score >= 80) findings.push('✅ Strong problem statement with clear customer pain points');
    else if (pdAnalysis.problemStatement.score < 60) findings.push('❌ Problem statement needs more clarity and quantification');
    
    if (pdAnalysis.marketOpportunity.score >= 80) findings.push('✅ Well-researched market opportunity with TAM/SAM/SOM breakdown');
    else if (pdAnalysis.marketOpportunity.score < 60) findings.push('❌ Market sizing requires more rigorous data and sources');
    
    if (pdAnalysis.traction.score >= 75) findings.push('✅ Impressive traction metrics demonstrating product-market fit');
    else if (pdAnalysis.traction.score < 55) findings.push('❌ Limited traction data - focus on acquiring early customers');
    
    if (pdAnalysis.financials.score >= 75) findings.push('✅ Comprehensive financial projections with clear assumptions');
    else if (pdAnalysis.financials.score < 60) findings.push('❌ Financial model needs more detail and realistic assumptions');
  }
  
  return findings.length > 0 
    ? `<ul style="margin: 0; padding-left: 20px; color: #4b5563;">${findings.map(f => `<li style="margin-bottom: 6px;">${f}</li>`).join('')}</ul>`
    : '<p style="margin: 0; color: #6b7280; font-style: italic;">Detailed findings not available</p>';
};

const generateSlideAnalysis = (analysis: PitchDeckAnalysis): string => {
  const pdAnalysis = analysis.pitchDeckAnalysis;
  if (!pdAnalysis) return '<p style="color: #6b7280; font-style: italic;">Detailed slide analysis not available</p>';
  
  const sections = [
    { name: 'Problem Statement', data: pdAnalysis.problemStatement, icon: '🎯' },
    { name: 'Solution', data: pdAnalysis.solutionClarity, icon: '💡' },
    { name: 'Market Opportunity', data: { ...pdAnalysis.marketOpportunity, keyInsights: [pdAnalysis.marketOpportunity.marketSize, pdAnalysis.marketOpportunity.targetAudience] }, icon: '🌍' },
    { name: 'Business Model', data: { ...pdAnalysis.businessModel, keyInsights: pdAnalysis.businessModel.revenueStreams }, icon: '💰' },
    { name: 'Traction', data: { ...pdAnalysis.traction, keyInsights: pdAnalysis.traction.metrics }, icon: '📈' },
    { name: 'Team', data: { ...pdAnalysis.team, keyInsights: pdAnalysis.team.strengths }, icon: '👥' },
    { name: 'Financials', data: { ...pdAnalysis.financials, keyInsights: pdAnalysis.financials.assumptions }, icon: '📊' },
    { name: 'Funding Ask', data: { ...pdAnalysis.askAndExit, keyInsights: [pdAnalysis.askAndExit.clarity, pdAnalysis.askAndExit.alignment] }, icon: '🎯' }
  ];
  
  return sections.map(section => `
    <div style="background: white; padding: 24px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #e5e7eb;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="color: #374151; font-size: 18px; margin: 0; font-weight: 600;">${section.icon} ${section.name}</h3>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="background: ${getScoreColor(section.data.score)}; color: white; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 14px;">
            ${section.data.score}/100
          </div>
        </div>
      </div>
      <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 14px;">${section.data.feedback}</p>
      ${section.data.keyInsights && section.data.keyInsights.length > 0 ? `
        <div style="margin-top: 12px; padding: 12px; background: #f9fafb; border-radius: 6px;">
          <strong style="color: #374151; font-size: 13px;">Key Insights:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #6b7280; font-size: 13px;">
            ${section.data.keyInsights.slice(0, 3).map(insight => `<li style="margin-bottom: 4px;">${insight}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `).join('');
};

const generateDetailedFeedback = (analysis: PitchDeckAnalysis): string => {
  if (!analysis.suggestions || analysis.suggestions.length === 0) {
    return '<p style="color: #6b7280; font-style: italic;">No specific recommendations available</p>';
  }
  
  const sortedSuggestions = [...analysis.suggestions].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return sortedSuggestions.map(suggestion => `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid ${getPriorityColor(suggestion.priority)};">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <h3 style="color: #374151; font-size: 16px; margin: 0; font-weight: 600;">${suggestion.category}</h3>
        <div style="display: flex; gap: 8px;">
          <span style="background: ${getPriorityColor(suggestion.priority)}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
            ${suggestion.priority}
          </span>
          ${suggestion.timeline ? `<span style="background: #e5e7eb; color: #374151; padding: 4px 12px; border-radius: 16px; font-size: 11px; font-weight: 600;">${suggestion.timeline}</span>` : ''}
        </div>
      </div>
      <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 500; font-size: 14px;">${suggestion.suggestion}</p>
      <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 13px;"><strong>Impact:</strong> ${suggestion.impact}</p>
      <p style="margin: 0; color: #4b5563; font-size: 13px;"><strong>How to implement:</strong> ${suggestion.implementation}</p>
    </div>
  `).join('');
};

const generateQAReadiness = (analysis: PitchDeckAnalysis): string => {
  const commonQuestions = [
    { q: 'What is your customer acquisition cost (CAC) and lifetime value (LTV)?', area: 'Financials' },
    { q: 'Who are your main competitors and how do you differentiate?', area: 'Market' },
    { q: 'What are your unit economics and path to profitability?', area: 'Business Model' },
    { q: 'How will you use the funding and what milestones will you achieve?', area: 'Ask' },
    { q: 'What is your go-to-market strategy and sales pipeline?', area: 'Traction' },
    { q: 'What are your key risks and how are you mitigating them?', area: 'Risk' },
    { q: 'How defensible is your solution? Do you have IP or network effects?', area: 'Moat' },
    { q: 'What traction have you achieved so far? MRR? User growth?', area: 'Metrics' },
    { q: 'Why is your team uniquely positioned to execute on this opportunity?', area: 'Team' },
    { q: 'What is the size of your addressable market (TAM/SAM/SOM)?', area: 'Market Size' }
  ];
  
  return `
    <div style="background: white; padding: 20px; border-radius: 8px;">
      <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
        ${commonQuestions.map(qa => `
          <li style="margin-bottom: 12px;">
            <strong>${qa.q}</strong><br/>
            <span style="color: #6b7280; font-size: 12px;">Area: ${qa.area}</span>
          </li>
        `).join('')}
      </ol>
      <p style="margin: 16px 0 0 0; padding: 12px; background: #fef3c7; border-radius: 6px; color: #78350f; font-size: 13px;">
        💡 <strong>Tip:</strong> Prepare 2-3 sentence answers for each question and practice with your team
      </p>
    </div>
  `;
};

const generateActionPlan = (analysis: PitchDeckAnalysis): string => {
  const immediateActions = [
    'Review and update all numerical claims with sources',
    'Simplify complex slides to one key message each',
    'Add customer testimonials or case studies to traction slide'
  ];
  
  const shortTermGoals = [
    'Conduct competitive analysis and update positioning',
    'Refine financial model with scenario analysis',
    'Create detailed use of funds breakdown'
  ];
  
  const longTermStrategy = [
    'Build comprehensive investor FAQ document',
    'Develop investor persona-specific deck variants',
    'Create quarterly update template for investors'
  ];
  
  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
      <div style="background: white; padding: 20px; border-radius: 8px; border-top: 4px solid #dc2626;">
        <h3 style="color: #dc2626; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">Immediate (1-2 days)</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 13px;">
          ${immediateActions.map(action => `<li style="margin-bottom: 8px;">${action}</li>`).join('')}
        </ul>
      </div>
      <div style="background: white; padding: 20px; border-radius: 8px; border-top: 4px solid #f59e0b;">
        <h3 style="color: #f59e0b; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">Short-term (1-2 weeks)</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 13px;">
          ${shortTermGoals.map(goal => `<li style="margin-bottom: 8px;">${goal}</li>`).join('')}
        </ul>
      </div>
      <div style="background: white; padding: 20px; border-radius: 8px; border-top: 4px solid #059669;">
        <h3 style="color: #059669; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">Long-term (1+ month)</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 13px;">
          ${longTermStrategy.map(strategy => `<li style="margin-bottom: 8px;">${strategy}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#059669';
  if (score >= 65) return '#3b82f6';
  if (score >= 50) return '#f59e0b';
  return '#dc2626';
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return '#dc2626';
    case 'medium': return '#f59e0b';
    case 'low': return '#059669';
    default: return '#6b7280';
  }
};
