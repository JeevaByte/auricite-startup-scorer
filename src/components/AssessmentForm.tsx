
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AssessmentData } from '@/pages/Index';
import { ScoreResult } from '@/utils/scoreCalculator';
import { calculateScore } from '@/utils/scoreCalculator';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface AssessmentFormProps {
  onComplete: (data: AssessmentData, result: ScoreResult) => void;
  initialData: AssessmentData;
}

const questions = [
  {
    id: 'prototype',
    type: 'boolean',
    question: 'Do you have a working prototype?',
    description: 'A functional version of your product, even if basic'
  },
  {
    id: 'revenue',
    type: 'boolean',
    question: 'Do you currently generate revenue?',
    description: 'Any paying customers or revenue streams'
  },
  {
    id: 'mrr',
    type: 'select',
    question: 'What is your Monthly Recurring Revenue (MRR)?',
    options: [
      { value: 'none', label: 'No recurring revenue' },
      { value: 'low', label: '$1 - $5,000' },
      { value: 'medium', label: '$5,001 - $25,000' },
      { value: 'high', label: '$25,000+' }
    ]
  },
  {
    id: 'capTable',
    type: 'boolean',
    question: 'Do you have a documented cap table?',
    description: 'Clear ownership structure and equity distribution'
  },
  {
    id: 'fullTimeTeam',
    type: 'boolean',
    question: 'Is your core team working full-time on this startup?',
    description: 'Founders and key team members fully committed'
  },
  {
    id: 'employees',
    type: 'select',
    question: 'How many employees do you have?',
    options: [
      { value: '1-2', label: '1-2 people' },
      { value: '3-10', label: '3-10 people' },
      { value: '11-50', label: '11-50 people' },
      { value: '50+', label: '50+ people' }
    ]
  },
  {
    id: 'milestones',
    type: 'select',
    question: 'What stage best describes your startup?',
    options: [
      { value: 'concept', label: 'Concept/Idea stage' },
      { value: 'launch', label: 'MVP launched' },
      { value: 'scale', label: 'Proven model, scaling' },
      { value: 'exit', label: 'Preparing for exit' }
    ]
  },
  {
    id: 'fundingGoal',
    type: 'select',
    question: 'What is your primary funding goal?',
    options: [
      { value: 'mvp', label: 'Build/improve MVP' },
      { value: 'productMarketFit', label: 'Achieve product-market fit' },
      { value: 'scale', label: 'Scale operations' },
      { value: 'exit', label: 'Prepare for exit' }
    ]
  },
  {
    id: 'termSheets',
    type: 'boolean',
    question: 'Have you received any term sheets?',
    description: 'Formal investment offers from investors'
  },
  {
    id: 'investors',
    type: 'select',
    question: 'What type of investors have you engaged with?',
    options: [
      { value: 'none', label: 'No investors yet' },
      { value: 'angels', label: 'Angel investors' },
      { value: 'vc', label: 'Venture capital firms' },
      { value: 'lateStage', label: 'Late-stage investors' }
    ]
  },
  {
    id: 'externalCapital',
    type: 'boolean',
    question: 'Have you raised external capital?',
    description: 'Any investment from outside sources'
  }
];

export const AssessmentForm = ({ onComplete, initialData }: AssessmentFormProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AssessmentData>(initialData);

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate score and complete assessment
      const result = calculateScore(answers);
      onComplete(answers, result);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const question = questions[currentQuestion];
  const currentAnswer = answers[question.id as keyof AssessmentData];
  const canProceed = currentAnswer !== null && currentAnswer !== undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Startup Assessment</h2>
          <span className="text-sm text-gray-500">
            {currentQuestion + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-8">
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {question.question}
          </h3>
          {question.description && (
            <p className="text-gray-600 mb-6">{question.description}</p>
          )}
        </div>

        <div className="space-y-4 mb-8">
          {question.type === 'boolean' ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={currentAnswer === true ? "default" : "outline"}
                onClick={() => handleAnswer(question.id, true)}
                className="p-4 h-auto"
              >
                Yes
              </Button>
              <Button
                variant={currentAnswer === false ? "default" : "outline"}
                onClick={() => handleAnswer(question.id, false)}
                className="p-4 h-auto"
              >
                No
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {question.options?.map((option) => (
                <Button
                  key={option.value}
                  variant={currentAnswer === option.value ? "default" : "outline"}
                  onClick={() => handleAnswer(question.id, option.value)}
                  className="w-full p-4 h-auto justify-start text-left"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <span>{currentQuestion === questions.length - 1 ? 'Get Results' : 'Next'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};
