
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface Question {
  id: string;
  question: string;
  type: 'boolean' | 'select' | 'text' | 'textarea' | 'radio';
  required: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  description?: string;
}

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (questionId: string, value: any) => void;
  error?: string;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  error
}) => {
  const handleChange = (newValue: any) => {
    onChange(question.id, newValue);
  };

  const renderInput = () => {
    switch (question.type) {
      case 'boolean':
        return (
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={value === true ? "default" : "outline"}
              onClick={() => handleChange(true)}
              className={cn(
                "h-12 transition-all",
                value === true && "ring-2 ring-primary"
              )}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={value === false ? "default" : "outline"}
              onClick={() => handleChange(false)}
              className={cn(
                "h-12 transition-all",
                value === false && "ring-2 ring-primary"
              )}
            >
              No
            </Button>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup value={value || ''} onValueChange={handleChange}>
            <div className="grid gap-3">
              {question.options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={handleChange}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder={question.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={question.placeholder}
            className="min-h-[120px]"
          />
        );

      case 'text':
      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={question.placeholder}
            className="h-12"
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base font-medium flex items-center gap-2">
          {question.question}
          {question.required && <span className="text-destructive">*</span>}
        </Label>
        {question.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {question.description}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        {renderInput()}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    </div>
  );
};
