
import { Card } from '@/components/ui/card';

interface ScoreGaugeProps {
  score: number;
  maxScore: number;
  title: string;
  size?: 'small' | 'large';
}

export const ScoreGauge = ({ score, maxScore, title, size = 'large' }: ScoreGaugeProps) => {
  // Ensure score is a valid number
  const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  const validMaxScore = typeof maxScore === 'number' && !isNaN(maxScore) && maxScore > 0 ? maxScore : 100;
  
  const percentage = (validScore / validMaxScore) * 100;
  const strokeWidth = size === 'large' ? 8 : 6;
  const radius = size === 'large' ? 80 : 50;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const getColor = () => {
    if (percentage >= 80) return '#10B981'; // green
    if (percentage >= 60) return '#F59E0B'; // yellow
    if (percentage >= 40) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const getGrade = () => {
    if (validMaxScore === 999) {
      // Total score grading
      if (validScore >= 800) return 'A+';
      if (validScore >= 700) return 'A';
      if (validScore >= 600) return 'B+';
      if (validScore >= 500) return 'B';
      if (validScore >= 400) return 'C+';
      if (validScore >= 300) return 'C';
      return 'D';
    } else {
      // Individual category grading
      if (percentage >= 90) return 'A+';
      if (percentage >= 80) return 'A';
      if (percentage >= 70) return 'B+';
      if (percentage >= 60) return 'B';
      if (percentage >= 50) return 'C+';
      return 'C';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={getColor()}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold text-gray-900 ${size === 'large' ? 'text-2xl' : 'text-lg'}`}>
            {validScore}
            <span className={`text-gray-500 ${size === 'large' ? 'text-sm' : 'text-xs'}`}>
              /{validMaxScore}
            </span>
          </div>
          <div className={`font-semibold ${size === 'large' ? 'text-sm' : 'text-xs'}`} style={{ color: getColor() }}>
            {getGrade()}
          </div>
        </div>
      </div>
      
      {size === 'large' && (
        <div className="mt-4 text-center">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <div className="text-sm text-gray-500">{Math.round(percentage)}%</div>
        </div>
      )}
    </div>
  );
};
