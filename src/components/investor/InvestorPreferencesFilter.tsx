import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

export interface PreferenceFilters {
  industries: string[];
  stages: string[];
  geographies: string[];
  minScore?: number;
  maxScore?: number;
}

interface InvestorPreferencesFilterProps {
  onFilterChange: (filters: PreferenceFilters) => void;
  initialFilters?: PreferenceFilters;
}

const INDUSTRIES = [
  'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'SaaS', 
  'AI/ML', 'CleanTech', 'Biotech', 'Gaming', 'AgriTech'
];

const STAGES = [
  'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+'
];

const GEOGRAPHIES = [
  'UK', 'Europe', 'North America', 'Asia', 'Global'
];

const SCORE_RANGES = [
  { label: '0-200', min: 0, max: 200 },
  { label: '200-400', min: 200, max: 400 },
  { label: '400-600', min: 400, max: 600 },
  { label: '600-800', min: 600, max: 800 },
  { label: '800+', min: 800, max: 999 },
];

export function InvestorPreferencesFilter({ onFilterChange, initialFilters }: InvestorPreferencesFilterProps) {
  const [industries, setIndustries] = useState<string[]>(initialFilters?.industries || []);
  const [stages, setStages] = useState<string[]>(initialFilters?.stages || []);
  const [geographies, setGeographies] = useState<string[]>(initialFilters?.geographies || []);
  const [scoreRange, setScoreRange] = useState<{ min?: number; max?: number }>({
    min: initialFilters?.minScore,
    max: initialFilters?.maxScore,
  });

  const addFilter = (category: 'industries' | 'stages' | 'geographies', value: string) => {
    const setters = { industries: setIndustries, stages: setStages, geographies: setGeographies };
    const currentValues = { industries, stages, geographies };
    
    if (!currentValues[category].includes(value)) {
      const newValues = [...currentValues[category], value];
      setters[category](newValues);
    }
  };

  const removeFilter = (category: 'industries' | 'stages' | 'geographies', value: string) => {
    const setters = { industries: setIndustries, stages: setStages, geographies: setGeographies };
    const currentValues = { industries, stages, geographies };
    
    const newValues = currentValues[category].filter(v => v !== value);
    setters[category](newValues);
  };

  const applyFilters = () => {
    onFilterChange({
      industries,
      stages,
      geographies,
      minScore: scoreRange.min,
      maxScore: scoreRange.max,
    });
  };

  const clearFilters = () => {
    setIndustries([]);
    setStages([]);
    setGeographies([]);
    setScoreRange({});
    onFilterChange({ industries: [], stages: [], geographies: [] });
  };

  const hasActiveFilters = industries.length > 0 || stages.length > 0 || geographies.length > 0 || scoreRange.min !== undefined;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Investment Preferences</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Industry Filter */}
        <div className="space-y-2">
          <Label>Industries</Label>
          <Select onValueChange={(value) => addFilter('industries', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select industries" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {industries.map((industry) => (
              <Badge key={industry} variant="secondary" className="gap-1">
                {industry}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('industries', industry)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Stage Filter */}
        <div className="space-y-2">
          <Label>Funding Stages</Label>
          <Select onValueChange={(value) => addFilter('stages', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select stages" />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((stage) => (
                <SelectItem key={stage} value={stage}>
                  {stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {stages.map((stage) => (
              <Badge key={stage} variant="secondary" className="gap-1">
                {stage}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('stages', stage)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Geography Filter */}
        <div className="space-y-2">
          <Label>Geography</Label>
          <Select onValueChange={(value) => addFilter('geographies', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select regions" />
            </SelectTrigger>
            <SelectContent>
              {GEOGRAPHIES.map((geo) => (
                <SelectItem key={geo} value={geo}>
                  {geo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-2 mt-2">
            {geographies.map((geo) => (
              <Badge key={geo} variant="secondary" className="gap-1">
                {geo}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('geographies', geo)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Score Range Filter */}
        <div className="space-y-2">
          <Label>Investment Score Range</Label>
          <Select 
            onValueChange={(value) => {
              const range = SCORE_RANGES.find(r => r.label === value);
              setScoreRange({ min: range?.min, max: range?.max });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select score range" />
            </SelectTrigger>
            <SelectContent>
              {SCORE_RANGES.map((range) => (
                <SelectItem key={range.label} value={range.label}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {scoreRange.min !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Score: {scoreRange.min}-{scoreRange.max}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setScoreRange({})}
              />
            </Badge>
          )}
        </div>

        <Button onClick={applyFilters} className="w-full">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}
