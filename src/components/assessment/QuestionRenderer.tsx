
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AssessmentQuestion } from '@/utils/assessmentQuestions';
import { AssessmentData } from '@/utils/scoreCalculator';

interface QuestionRendererProps {
  question: AssessmentQuestion;
  value: any;
  onChange: (key: keyof AssessmentData, value: any) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
}) => {
  if (question.type === 'boolean') {
    return (
      <RadioGroup
        value={value === null ? '' : value === true ? 'true' : 'false'}
        onValueChange={(val: string) => onChange(question.key as keyof AssessmentData, val === 'true')}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="true" id={`${question.key}-yes`} />
          <Label htmlFor={`${question.key}-yes`}>Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="false" id={`${question.key}-no`} />
          <Label htmlFor={`${question.key}-no`}>No</Label>
        </div>
      </RadioGroup>
    );
  }

  if (question.type === 'select') {
    return (
      <RadioGroup
        value={value ? String(value) : ''}
        onValueChange={(val: string) => onChange(question.key as keyof AssessmentData, val)}
      >
        {question.options?.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${question.key}-${option.value}`} />
            <Label htmlFor={`${question.key}-${option.value}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    );
  }

  if (question.type === 'textarea') {
    return (
      <Textarea
        value={value ? String(value) : ''}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(question.key as keyof AssessmentData, e.target.value)}
        placeholder="Enter your response..."
        rows={4}
      />
    );
  }

  return (
    <Input
      type="text"
      value={value ? String(value) : ''}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(question.key as keyof AssessmentData, e.target.value)}
      placeholder="Enter your response..."
    />
  );
};
