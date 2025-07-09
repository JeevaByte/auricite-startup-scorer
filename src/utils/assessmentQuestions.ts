
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
        type: 'text',
      },
      {
        key: 'investors',
        question: 'What type of investors are you targeting?',
        type: 'select',
        options: [
          { value: 'none', label: 'Not targeting investors yet' },
          { value: 'angels', label: 'Angel investors' },
          { value: 'vc', label: 'Venture capital' },
          { value: 'lateStage', label: 'Late-stage investors' }
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
          { value: 'concept', label: 'Concept stage' },
          { value: 'launch', label: 'MVP launched' },
          { value: 'scale', label: 'Scaling business' },
          { value: 'exit', label: 'Exit preparation' }
        ]
      },
    ],
  },
];
