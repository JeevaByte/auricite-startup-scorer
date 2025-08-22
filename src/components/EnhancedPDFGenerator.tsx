import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface EnhancedAnalysis {
  sentiment: string;
  clarity: number;
  engagement: number;
  readability: number;
  persuasiveness: number;
  overallScore: number;
  industryBenchmarks?: {
    clarityIndustryAvg: number;
    engagementIndustryAvg: number;
    readabilityIndustryAvg: number;
    persuasivenessIndustryAvg: number;
    percentileRanking: number;
    competitiveAdvantage: string;
  };
  personaAnalysis?: {
    investorAppeal: { score: number; feedback: string };
    customerAppeal: { score: number; feedback: string };
    partnerAppeal: { score: number; feedback: string };
    mediaAppeal: { score: number; feedback: string };
  };
  strengths: Array<{
    area: string;
    description: string;
    score: number;
  }>;
  suggestions: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    impact: string;
    implementation: string;
    timeline?: string;
    effortLevel?: string;
  }>;
  contentHeatmap?: {
    highImpactSections: string[];
    mediumImpactSections: string[];
    lowImpactSections: string[];
    improvementZones: string[];
  };
  predictiveInsights?: {
    successProbability: number;
    conversionLikelihood: number;
    investorInterestScore: number;
    viralPotential: number;
  };
  actionPlan?: {
    immediateActions: string[];
    shortTermGoals: string[];
    longTermStrategy: string[];
  };
}

export const generateEnhancedPDF = async (
  analysis: EnhancedAnalysis,
  contentType: string,
  companyInfo?: { name?: string; logo?: string }
): Promise<void> => {
  try {
    // Create temporary container for PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '794px'; // A4 width
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Inter, system-ui, sans-serif';
    container.style.fontSize = '14px';
    container.style.lineHeight = '1.6';
    container.style.color = '#1f2937';
    
    container.innerHTML = generateEnhancedPDFContent(analysis, contentType, companyInfo);
    document.body.appendChild(container);

    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: container.scrollHeight,
    });

    document.body.removeChild(container);

    // Generate PDF
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
    const filename = `ai-content-analysis-${contentType}-${timestamp}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating enhanced PDF:', error);
    throw error;
  }
};

const generateEnhancedPDFContent = (
  analysis: EnhancedAnalysis,
  contentType: string,
  companyInfo?: { name?: string; logo?: string }
): string => {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const contentTypeName = contentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return `
    <div style="max-width: 794px; margin: 0 auto; background: white;">
      <!-- Cover Page -->
      <div style="min-height: 1000px; padding: 60px 40px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; margin-bottom: 40px;">
        ${companyInfo?.logo ? `<img src="${companyInfo.logo}" alt="Company Logo" style="max-width: 120px; max-height: 120px; margin-bottom: 40px; border-radius: 12px;">` : ''}
        <h1 style="font-size: 48px; font-weight: 700; margin: 0 0 20px 0; line-height: 1.2;">
          AI-Powered Content Analysis
        </h1>
        <h2 style="font-size: 28px; font-weight: 400; margin: 0 0 40px 0; opacity: 0.9;">
          ${contentTypeName} Performance Report
        </h2>
        <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 16px; backdrop-filter: blur(10px);">
          <div style="font-size: 72px; font-weight: 800; margin: 0 0 10px 0;">
            ${analysis.overallScore}
          </div>
          <div style="font-size: 20px; opacity: 0.9;">
            Overall Performance Score
          </div>
        </div>
        <div style="margin-top: 60px; font-size: 16px; opacity: 0.8;">
          Generated on ${date}
        </div>
        ${companyInfo?.name ? `<div style="font-size: 18px; margin-top: 10px; font-weight: 500;">Prepared for ${companyInfo.name}</div>` : ''}
      </div>

      <!-- Executive Summary -->
      <div style="padding: 40px; background: #f8fafc; border-radius: 16px; margin-bottom: 40px; border-left: 8px solid #3b82f6;">
        <h2 style="color: #1e40af; font-size: 32px; margin: 0 0 24px 0; font-weight: 700;">
          📊 Executive Summary
        </h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h3 style="color: #374151; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">Performance Metrics</h3>
            <div style="space-y: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: #6b7280;">Clarity</span>
                <span style="font-weight: 600; color: ${getScoreColor(analysis.clarity)};">${analysis.clarity}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: #6b7280;">Engagement</span>
                <span style="font-weight: 600; color: ${getScoreColor(analysis.engagement)};">${analysis.engagement}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: #6b7280;">Readability</span>
                <span style="font-weight: 600; color: ${getScoreColor(analysis.readability)};">${analysis.readability}%</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #6b7280;">Persuasiveness</span>
                <span style="font-weight: 600; color: ${getScoreColor(analysis.persuasiveness)};">${analysis.persuasiveness}%</span>
              </div>
            </div>
          </div>
          
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h3 style="color: #374151; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">Industry Comparison</h3>
            ${analysis.industryBenchmarks ? `
              <div style="margin-bottom: 16px;">
                <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Percentile Ranking</div>
                <div style="font-size: 24px; font-weight: 700; color: #059669;">${analysis.industryBenchmarks.percentileRanking}th</div>
              </div>
              <div style="color: #374151; font-size: 14px; line-height: 1.6;">
                ${analysis.industryBenchmarks.competitiveAdvantage}
              </div>
            ` : '<div style="color: #6b7280; font-style: italic;">Industry benchmarks not available</div>'}
          </div>
        </div>
        
        <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h3 style="color: #374151; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">Key Insights</h3>
          <p style="color: #4b5563; line-height: 1.7; margin: 0;">
            ${generateExecutiveInsight(analysis)}
          </p>
        </div>
      </div>

      <!-- Visual Metrics Dashboard -->
      <div style="padding: 40px; background: white; border-radius: 16px; margin-bottom: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <h2 style="color: #1e40af; font-size: 32px; margin: 0 0 32px 0; font-weight: 700;">
          📈 Visual Performance Dashboard
        </h2>
        
        <!-- Radar Chart Simulation -->
        <div style="background: #f8fafc; padding: 32px; border-radius: 12px; margin-bottom: 32px; text-align: center;">
          <h3 style="color: #374151; font-size: 20px; margin: 0 0 24px 0;">Performance Radar</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; max-width: 400px; margin: 0 auto;">
            ${generateRadarMetric('Clarity', analysis.clarity)}
            ${generateRadarMetric('Engagement', analysis.engagement)}
            ${generateRadarMetric('Readability', analysis.readability)}
            ${generateRadarMetric('Persuasiveness', analysis.persuasiveness)}
          </div>
        </div>

        <!-- Comparison Charts -->
        ${analysis.industryBenchmarks ? `
          <div style="background: #f8fafc; padding: 32px; border-radius: 12px;">
            <h3 style="color: #374151; font-size: 20px; margin: 0 0 24px 0; text-align: center;">Industry Benchmark Comparison</h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
              ${generateBenchmarkComparison('Clarity', analysis.clarity, analysis.industryBenchmarks.clarityIndustryAvg)}
              ${generateBenchmarkComparison('Engagement', analysis.engagement, analysis.industryBenchmarks.engagementIndustryAvg)}
              ${generateBenchmarkComparison('Readability', analysis.readability, analysis.industryBenchmarks.readabilityIndustryAvg)}
              ${generateBenchmarkComparison('Persuasiveness', analysis.persuasiveness, analysis.industryBenchmarks.persuasivenessIndustryAvg)}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Content Strengths -->
      <div style="padding: 40px; background: #ecfdf5; border-radius: 16px; margin-bottom: 40px; border-left: 8px solid #10b981;">
        <h2 style="color: #059669; font-size: 32px; margin: 0 0 32px 0; font-weight: 700;">
          ✨ Content Strengths
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
          ${analysis.strengths.map(strength => `
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 4px solid #10b981;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <h3 style="color: #374151; font-size: 18px; margin: 0; font-weight: 600;">${strength.area}</h3>
                <div style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                  ${strength.score}%
                </div>
              </div>
              <p style="color: #4b5563; margin: 0; line-height: 1.6;">${strength.description}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Improvement Recommendations -->
      <div style="padding: 40px; background: #fef3c7; border-radius: 16px; margin-bottom: 40px; border-left: 8px solid #f59e0b;">
        <h2 style="color: #d97706; font-size: 32px; margin: 0 0 32px 0; font-weight: 700;">
          🎯 Priority Recommendations
        </h2>
        <div style="space-y: 24px;">
          ${analysis.suggestions
            .sort((a, b) => (a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0))
            .map(suggestion => `
              <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-left: 6px solid ${getPriorityColor(suggestion.priority)};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;">
                  <h3 style="color: #374151; font-size: 18px; margin: 0; font-weight: 600;">${suggestion.category}</h3>
                  <div style="display: flex; gap: 8px;">
                    <span style="background: ${getPriorityColor(suggestion.priority)}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                      ${suggestion.priority}
                    </span>
                    ${suggestion.timeline ? `<span style="background: #e5e7eb; color: #374151; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;">${suggestion.timeline}</span>` : ''}
                  </div>
                </div>
                <p style="color: #1f2937; margin: 0 0 12px 0; font-weight: 500;">${suggestion.suggestion}</p>
                <p style="color: #4b5563; margin: 0 0 12px 0; line-height: 1.6;"><strong>Impact:</strong> ${suggestion.impact}</p>
                <p style="color: #4b5563; margin: 0; line-height: 1.6;"><strong>Implementation:</strong> ${suggestion.implementation}</p>
              </div>
            `).join('')}
        </div>
      </div>

      <!-- Action Plan -->
      ${analysis.actionPlan ? `
        <div style="padding: 40px; background: #eff6ff; border-radius: 16px; margin-bottom: 40px; border-left: 8px solid #3b82f6;">
          <h2 style="color: #1e40af; font-size: 32px; margin: 0 0 32px 0; font-weight: 700;">
            🚀 Strategic Action Plan
          </h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h3 style="color: #dc2626; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">🔥 Immediate Actions</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.7;">
                ${analysis.actionPlan.immediateActions.map(action => `<li style="margin-bottom: 8px;">${action}</li>`).join('')}
              </ul>
            </div>
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h3 style="color: #f59e0b; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">📈 Short-term Goals</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.7;">
                ${analysis.actionPlan.shortTermGoals.map(goal => `<li style="margin-bottom: 8px;">${goal}</li>`).join('')}
              </ul>
            </div>
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h3 style="color: #059669; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">🎯 Long-term Strategy</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; line-height: 1.7;">
                ${analysis.actionPlan.longTermStrategy.map(strategy => `<li style="margin-bottom: 8px;">${strategy}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 60px; padding: 40px; text-align: center; border-top: 2px solid #e5e7eb; color: #6b7280;">
        <div style="margin-bottom: 16px;">
          <h3 style="color: #374151; font-size: 20px; margin: 0 0 8px 0; font-weight: 600;">AI-Powered Content Analysis Platform</h3>
          <p style="margin: 0; font-size: 14px;">Empowering businesses with intelligent content insights</p>
        </div>
        <div style="font-size: 12px; opacity: 0.8;">
          <p style="margin: 0;">This comprehensive report was generated using advanced AI analysis</p>
          <p style="margin: 4px 0 0 0;">For more insights and tools, visit our platform</p>
        </div>
      </div>
    </div>
  `;
};

// Helper functions
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#059669';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
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

const generateExecutiveInsight = (analysis: EnhancedAnalysis): string => {
  const avgScore = Math.round((analysis.clarity + analysis.engagement + analysis.readability + analysis.persuasiveness) / 4);
  
  if (avgScore >= 80) {
    return `Your ${analysis.overallScore >= 85 ? 'exceptional' : 'strong'} content demonstrates excellent performance across all key metrics. This content is well-positioned to achieve its intended goals and outperforms industry standards. Focus on maintaining this quality while scaling your content efforts.`;
  } else if (avgScore >= 60) {
    return `Your content shows solid performance with notable strengths, particularly in areas where you scored above 70%. With targeted improvements in the identified weak areas, you can achieve significant performance gains and better audience engagement.`;
  } else {
    return `Your content has foundational elements in place but requires strategic improvements across multiple areas. The recommendations provided will help you systematically enhance your content's effectiveness and audience impact.`;
  }
};

const generateRadarMetric = (metric: string, score: number): string => {
  return `
    <div style="text-align: center;">
      <div style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid #e5e7eb; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; position: relative; background: ${score >= 80 ? '#dcfce7' : score >= 60 ? '#dbeafe' : score >= 40 ? '#fef3c7' : '#fee2e2'};">
        <div style="font-size: 18px; font-weight: 700; color: ${getScoreColor(score)};">${score}</div>
        <div style="position: absolute; inset: 4px; border-radius: 50%; border: 2px solid ${getScoreColor(score)}; opacity: 0.3;"></div>
      </div>
      <div style="font-size: 14px; color: #374151; font-weight: 500;">${metric}</div>
    </div>
  `;
};

const generateBenchmarkComparison = (metric: string, yourScore: number, industryAvg: number): string => {
  const difference = yourScore - industryAvg;
  const isAbove = difference > 0;
  
  return `
    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
      <h4 style="color: #374151; font-size: 16px; margin: 0 0 16px 0; font-weight: 600;">${metric}</h4>
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #6b7280; font-size: 14px;">Your Score</span>
        <span style="font-weight: 600; color: ${getScoreColor(yourScore)};">${yourScore}%</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
        <span style="color: #6b7280; font-size: 14px;">Industry Average</span>
        <span style="font-weight: 600; color: #6b7280;">${industryAvg}%</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #6b7280; font-size: 14px;">Difference</span>
        <span style="font-weight: 600; color: ${isAbove ? '#059669' : '#dc2626'};">
          ${isAbove ? '+' : ''}${difference}%
        </span>
      </div>
    </div>
  `;
};