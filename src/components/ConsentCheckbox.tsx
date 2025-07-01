
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';

interface ConsentCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  required?: boolean;
}

export const ConsentCheckbox = ({ checked, onCheckedChange, required = true }: ConsentCheckboxProps) => {
  return (
    <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border">
      <Checkbox
        id="consent"
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-0.5"
        required={required}
      />
      <div className="flex-1">
        <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
          I agree to the{' '}
          <Link to="/terms" className="text-blue-600 hover:underline" target="_blank">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-blue-600 hover:underline" target="_blank">
            Privacy Policy
          </Link>
          . I understand that my assessment data will be processed to provide personalized recommendations and may be used for analytics purposes.
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <p className="text-xs text-gray-600 mt-2">
          Your data is encrypted and secure. You can request deletion at any time by contacting support.
        </p>
      </div>
    </div>
  );
};
