
export interface QuestionOption {
  value: string;
  label: string;
}

export interface AssessmentQuestion {
  key: string;
  question: string;
  type: 'boolean' | 'select' | 'text' | 'textarea';
  options?: QuestionOption[];
}

export interface AssessmentStep {
  title: string;
  questions: AssessmentQuestion[];
}

export const assessmentSteps: AssessmentStep[] = [
  {
    title: 'Product Development',
    questions: [
      {
        key: 'prototype',
        question: 'Do you have a working prototype or MVP?',
        type: 'boolean',
      },
      {
        key: 'productStage',
        question: 'What stage is your product in?',
        type: 'select',
        options: [
          { value: 'idea', label: 'Idea stage' },
          { value: 'mockup', label: 'Mockup/Wireframe' },
          { value: 'mvp', label: 'MVP' },
          { value: 'beta', label: 'Beta version' },
          { value: 'launched', label: 'Launched product' }
        ]
      },
    ],
  },
  {
    title: 'Financial Status',
    questions: [
      {
        key: 'externalCapital',
        question: 'Have you raised external capital?',
        type: 'boolean',
      },
      {
        key: 'revenue',
        question: 'Are you generating revenue?',
        type: 'boolean',
      },
      {
        key: 'mrr',
        question: 'What is your Monthly Recurring Revenue (MRR)?',
        type: 'select',
        options: [
          { value: 'none', label: 'No recurring revenue' },
          { value: 'low', label: 'Low MRR ($1K-$10K)' },
          { value: 'medium', label: 'Medium MRR ($10K-$100K)' },
          { value: 'high', label: 'High MRR ($100K+)' }
        ]
      },
      {
        key: 'burnRate',
        question: 'What is your monthly burn rate?',
        type: 'select',
        options: [
          { value: 'none', label: 'No burn (profitable)' },
          { value: 'low', label: 'Under $10K/month' },
          { value: 'medium', label: '$10K-$50K/month' },
          { value: 'high', label: 'Over $50K/month' }
        ]
      },
    ],
  },
  {
    title: 'Team & Operations',
    questions: [
      {
        key: 'fullTimeTeam',
        question: 'Do you have a full-time team?',
        type: 'boolean',
      },
      {
        key: 'employees',
        question: 'How many employees do you have?',
        type: 'select',
        options: [
          { value: '1-2', label: '1-2 employees' },
          { value: '3-10', label: '3-10 employees' },
          { value: '11-50', label: '11-50 employees' },
          { value: '50+', label: '50+ employees' }
        ]
      },
      {
        key: 'keyHires',
        question: 'Have you made key hires in technical/business roles?',
        type: 'boolean',
      },
    ],
  },
  {
    title: 'Market & Competition',
    questions: [
      {
        key: 'marketSize',
        question: 'What is your estimated addressable market size?',
        type: 'select',
        options: [
          { value: 'small', label: 'Under $100M' },
          { value: 'medium', label: '$100M - $1B' },
          { value: 'large', label: '$1B - $10B' },
          { value: 'huge', label: 'Over $10B' }
        ]
      },
      {
        key: 'competitiveAdvantage',
        question: 'Do you have a clear competitive advantage?',
        type: 'boolean',
      },
    ],
  },
  {
    title: 'Investment Readiness',
    questions: [
      {
        key: 'termSheets',
        question: 'Have you received any term sheets?',
        type: 'boolean',
      },
      {
        key: 'capTable',
        question: 'Do you have a cap table?',
        type: 'boolean',
      },
      {
        key: 'fundingGoal',
        question: 'What is your funding goal?',
        type: 'select',
        options: [
          { value: 'under-100k', label: 'Under $100K' },
          { value: '100k-500k', label: '$100K - $500K' },
          { value: '500k-2m', label: '$500K - $2M' },
          { value: 'over-2m', label: 'Over $2M' }
        ]
      },
      {
        key: 'investors',
        question: 'What type of investors are you targeting?',
        type: 'select',
        options: [
          { value: 'none', label: 'Not targeting investors yet' },
          { value: 'friends-family', label: 'Friends & family' },
          { value: 'angel', label: 'Angel investors' },
          { value: 'vc', label: 'Venture capital' },
          { value: 'institutional', label: 'Institutional investors' }
        ]
      },
    ],
  },
  {
    title: 'Growth & Milestones',
    questions: [
      {
        key: 'milestones',
        question: 'What best describes your current stage?',
        type: 'select',
        options: [
          { value: 'concept', label: 'Concept validation' },
          { value: 'prototype', label: 'Prototype complete' },
          { value: 'first-customers', label: 'First customers acquired' },
          { value: 'revenue', label: 'Revenue generation' },
          { value: 'growth', label: 'Sustainable growth' }
        ]
      },
      {
        key: 'customerTraction',
        question: 'How many paying customers do you have?',
        type: 'select',
        options: [
          { value: 'none', label: 'No paying customers yet' },
          { value: 'few', label: '1-10 customers' },
          { value: 'some', label: '11-100 customers' },
          { value: 'many', label: '100+ customers' }
        ]
      },
    ],
  },
];
