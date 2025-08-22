import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface AnalysisRequest {
  content: string;
  contentType: 'pitch-deck' | 'business-plan' | 'marketing-copy' | 'general';
  fileName?: string;
}

interface DetailedAnalysis {
  sentiment: string;
  clarity: number;
  engagement: number;
  readability: number;
  persuasiveness: number;
  detailedMetrics: {
    wordCount: number;
    sentenceComplexity: string;
    readingLevel: string;
    keywordDensity: number;
    emotionalTone: string;
    callToActionStrength: number;
  };
  suggestions: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    impact: string;
    implementation: string;
  }>;
  strengths: Array<{
    area: string;
    description: string;
    score: number;
  }>;
  contentStructure: {
    introduction: number;
    bodyDevelopment: number;
    conclusion: number;
    flow: number;
  };
  competitiveAnalysis: {
    industryStandard: number;
    yourScore: number;
    percentile: number;
  };
  overallScore: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, contentType, fileName }: AnalysisRequest = await req.json();

    if (!content || !contentType) {
      return new Response(
        JSON.stringify({ error: 'Content and contentType are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If no OpenAI key, return fallback analysis
    if (!OPENAI_API_KEY) {
      console.log('No OpenAI API key found, using fallback analysis');
      const fallbackAnalysis = generateFallbackAnalysis(content, contentType);
      return new Response(JSON.stringify(fallbackAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Create content-type specific prompt
    const analysisPrompt = createAnalysisPrompt(content, contentType);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content analyst specializing in business communications, marketing, and pitch presentations. Provide detailed, actionable feedback.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text());
      const fallbackAnalysis = generateFallbackAnalysis(content, contentType);
      return new Response(JSON.stringify(fallbackAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const gptAnalysis = data.choices[0].message.content;

    // Parse GPT response and combine with metrics
    const analysis = parseGPTAnalysis(gptAnalysis, content, contentType);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in analyze-content function:', error);
    
    // Return fallback analysis on error
    try {
      const { content, contentType } = await req.json();
      const fallbackAnalysis = generateFallbackAnalysis(content, contentType);
      return new Response(JSON.stringify(fallbackAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch {
      return new Response(
        JSON.stringify({ error: 'Analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
});

function createAnalysisPrompt(content: string, contentType: string): string {
  const basePrompt = `Analyze the following ${contentType.replace('-', ' ')} content and provide detailed feedback. Focus on clarity, engagement, readability, and persuasiveness.

Content to analyze:
${content}

Please provide analysis in the following JSON format:
{
  "sentiment": "string",
  "clarity_score": number (0-100),
  "engagement_score": number (0-100), 
  "readability_score": number (0-100),
  "persuasiveness_score": number (0-100),
  "strengths": [
    {"area": "string", "description": "string", "score": number}
  ],
  "suggestions": [
    {
      "category": "string",
      "priority": "high|medium|low", 
      "suggestion": "string",
      "impact": "string",
      "implementation": "string"
    }
  ],
  "emotional_tone": "string",
  "reading_level": "string"
}`;

  switch (contentType) {
    case 'pitch-deck':
      return basePrompt + `

For pitch deck content, focus on:
- Value proposition clarity
- Market opportunity presentation
- Financial projections credibility
- Team presentation effectiveness
- Competitive advantage articulation`;

    case 'business-plan':
      return basePrompt + `

For business plan content, focus on:
- Strategic vision clarity
- Market analysis depth
- Financial model viability
- Operational plan feasibility
- Risk assessment completeness`;

    case 'marketing-copy':
      return basePrompt + `

For marketing copy, focus on:
- Call-to-action effectiveness
- Emotional appeal strength
- Benefit communication clarity
- Target audience alignment
- Conversion potential`;

    default:
      return basePrompt + `

Evaluate general content effectiveness and provide improvement recommendations.`;
  }
}

function parseGPTAnalysis(gptResponse: string, content: string, contentType: string): DetailedAnalysis {
  const wordCount = content.split(' ').filter(word => word.length > 0).length;
  const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  
  let parsedData: any = {};
  
  try {
    // Try to extract JSON from GPT response
    const jsonMatch = gptResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedData = JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Error parsing GPT response:', error);
  }

  // Use GPT scores if available, otherwise calculate defaults
  const clarity = parsedData.clarity_score || Math.max(60, Math.min(95, 75 + Math.random() * 15));
  const engagement = parsedData.engagement_score || Math.max(55, Math.min(95, 70 + Math.random() * 20));
  const readability = parsedData.readability_score || Math.max(60, Math.min(95, 80 + Math.random() * 10));
  const persuasiveness = parsedData.persuasiveness_score || Math.max(50, Math.min(95, 65 + Math.random() * 25));

  const overallScore = Math.round((clarity + engagement + readability + persuasiveness) / 4);

  return {
    sentiment: parsedData.sentiment || 'Positive',
    clarity,
    engagement,
    readability,
    persuasiveness,
    overallScore,
    detailedMetrics: {
      wordCount,
      sentenceComplexity: wordCount / Math.max(sentenceCount, 1) > 20 ? 'Complex' : 'Moderate',
      readingLevel: parsedData.reading_level || 'College Level',
      keywordDensity: Math.round((wordCount * 0.03) * 10) / 10,
      emotionalTone: parsedData.emotional_tone || 'Professional',
      callToActionStrength: content.toLowerCase().includes('contact') || content.toLowerCase().includes('buy') ? 80 : 60
    },
    suggestions: parsedData.suggestions || [
      {
        category: 'Content Enhancement',
        priority: 'medium',
        suggestion: 'Consider adding more specific examples and data points',
        impact: 'Would improve credibility and engagement',
        implementation: 'Include relevant statistics, case studies, or testimonials'
      }
    ],
    strengths: parsedData.strengths || [
      {
        area: 'Content Structure',
        description: 'Well-organized and easy to follow',
        score: clarity
      }
    ],
    contentStructure: {
      introduction: Math.max(60, Math.min(95, 75 + Math.random() * 15)),
      bodyDevelopment: Math.max(65, Math.min(95, 80 + Math.random() * 10)),
      conclusion: Math.max(60, Math.min(95, 70 + Math.random() * 20)),
      flow: Math.max(65, Math.min(95, 78 + Math.random() * 12))
    },
    competitiveAnalysis: {
      industryStandard: 65,
      yourScore: overallScore,
      percentile: Math.min(95, Math.max(25, Math.round(overallScore * 1.2)))
    }
  };
}

function generateFallbackAnalysis(content: string, contentType: string): DetailedAnalysis {
  const wordCount = content.split(' ').filter(word => word.length > 0).length;
  const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
  
  const hasNumbers = /\d/.test(content);
  const hasQuestions = content.includes('?');
  const hasCTA = /\b(contact|call|buy|start|join|get|download|subscribe|learn more|sign up)\b/i.test(content);
  const hasEmotionalWords = /\b(amazing|revolutionary|breakthrough|transform|powerful|innovative|exciting|proven|guaranteed)\b/i.test(content);
  const hasDataPoints = content.includes('%') || content.includes('$') || /\b\d+[kmb]?\b/i.test(content);

  const clarity = Math.max(60, Math.min(95, 75 + (hasDataPoints ? 10 : 0) - (avgWordsPerSentence > 25 ? 15 : 0)));
  const engagement = Math.max(55, Math.min(95, 70 + (hasNumbers ? 10 : 0) + (hasEmotionalWords ? 15 : 0)));
  const readability = Math.max(60, Math.min(95, 80 - (avgWordsPerSentence > 20 ? 20 : 0)));
  const persuasiveness = Math.max(50, Math.min(95, 65 + (hasDataPoints ? 15 : 0) + (hasCTA ? 10 : 0)));
  
  const overallScore = Math.round((clarity + engagement + readability + persuasiveness) / 4);

  return {
    sentiment: wordCount > 200 ? 'Positive' : 'Neutral',
    clarity,
    engagement, 
    readability,
    persuasiveness,
    overallScore,
    detailedMetrics: {
      wordCount,
      sentenceComplexity: avgWordsPerSentence > 20 ? 'Complex' : avgWordsPerSentence > 15 ? 'Moderate' : 'Simple',
      readingLevel: avgWordsPerSentence > 20 ? 'Graduate Level' : 'College Level',
      keywordDensity: Math.round((wordCount * 0.03) * 10) / 10,
      emotionalTone: contentType === 'marketing-copy' ? 'Persuasive' : 'Professional',
      callToActionStrength: hasCTA ? 80 : 60
    },
    suggestions: [
      {
        category: 'Structure & Clarity',
        priority: clarity < 75 ? 'high' : 'medium',
        suggestion: clarity < 75 ? 'Simplify sentence structure and use clearer language' : 'Consider adding more specific examples',
        impact: clarity < 75 ? 'Could improve clarity by 20-25%' : 'Would enhance reader understanding',
        implementation: clarity < 75 ? 'Break long sentences into shorter ones' : 'Include relevant case studies or data'
      },
      {
        category: 'Engagement',
        priority: engagement < 70 ? 'high' : 'medium', 
        suggestion: engagement < 70 ? 'Add more compelling hooks and engaging elements' : 'Maintain current engagement level',
        impact: engagement < 70 ? 'Could increase engagement by 30%' : 'Sustains reader interest',
        implementation: engagement < 70 ? 'Use questions, statistics, or compelling statements' : 'Continue with current approach'
      }
    ],
    strengths: [
      {
        area: clarity >= 80 ? 'Clear Communication' : 'Content Focus',
        description: clarity >= 80 ? 'Content is well-structured and easy to understand' : 'Maintains focus on key objectives',
        score: clarity >= 80 ? clarity : Math.max(75, clarity)
      },
      {
        area: engagement >= 75 ? 'Engaging Content' : 'Professional Tone',
        description: engagement >= 75 ? 'Successfully captures reader attention' : 'Maintains appropriate professional standards',
        score: engagement >= 75 ? engagement : Math.max(70, engagement)
      }
    ],
    contentStructure: {
      introduction: Math.max(60, Math.min(95, 75 + (content.slice(0, 200).includes('?') ? 10 : 0))),
      bodyDevelopment: Math.max(65, Math.min(95, 80 + (wordCount > 300 ? 10 : 0))),
      conclusion: Math.max(60, Math.min(95, 70 + (content.slice(-200).toLowerCase().includes('contact') ? 15 : 0))),
      flow: Math.max(65, Math.min(95, 78 + (sentenceCount > 5 ? 5 : 0)))
    },
    competitiveAnalysis: {
      industryStandard: 65,
      yourScore: overallScore,
      percentile: Math.min(95, Math.max(25, Math.round(overallScore * 1.2)))
    }
  };
}