import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validatePassword, PasswordValidationResult } from '@/utils/passwordValidation';
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecurePasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  showStrength?: boolean;
  className?: string;
}

export const SecurePasswordInput: React.FC<SecurePasswordInputProps> = ({
  value,
  onChange,
  label = "Password",
  placeholder = "Enter your password",
  showStrength = true,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<PasswordValidationResult | null>(null);

  useEffect(() => {
    if (value) {
      setValidation(validatePassword(value));
    } else {
      setValidation(null);
    }
  }, [value]);

  const getStrengthColor = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'strong': return 'text-success';
    }
  };

  const getStrengthIcon = (strength: 'weak' | 'medium' | 'strong') => {
    switch (strength) {
      case 'weak': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Shield className="w-4 h-4" />;
      case 'strong': return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="password">{label}</Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {showStrength && validation && (
        <div className="space-y-2">
          <div className={`flex items-center gap-2 text-sm ${getStrengthColor(validation.strength)}`}>
            {getStrengthIcon(validation.strength)}
            <span>Password strength: {validation.strength}</span>
          </div>
          
          {validation.errors.length > 0 && (
            <ul className="text-sm text-destructive space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-destructive rounded-full" />
                  {error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};