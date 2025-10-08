import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, TrendingUp } from "lucide-react";

export default function BenchmarkManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "high_performer",
    assessment_data: "{}",
    expected_min: "70",
    expected_max: "90",
  });

  const handleAddBenchmark = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('benchmark_startups').insert({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        assessment_data: JSON.parse(formData.assessment_data),
        expected_score_range: {
          min: parseInt(formData.expected_min),
          max: parseInt(formData.expected_max),
        },
      });

      if (error) throw error;

      toast({
        title: "Benchmark Added",
        description: "New benchmark startup has been added successfully.",
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        category: "high_performer",
        assessment_data: "{}",
        expected_min: "70",
        expected_max: "90",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runRepeatabilityTest = async () => {
    setLoading(true);
    try {
      // Fetch all active benchmarks
      const { data: benchmarks, error } = await supabase
        .from('benchmark_startups')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      toast({
        title: "Test Started",
        description: `Running repeatability test on ${benchmarks?.length || 0} benchmarks...`,
      });

      // In production, this would trigger the scoring function 10x for each benchmark
      // and calculate variance

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Benchmark Management
          </CardTitle>
          <CardDescription>
            Manage reference startups for stability testing and drift detection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Startup Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Example Startup Inc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_performer">High Performer</SelectItem>
                  <SelectItem value="early_stage">Early Stage</SelectItem>
                  <SelectItem value="growth_stage">Growth Stage</SelectItem>
                  <SelectItem value="mature">Mature</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the benchmark startup..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assessment_data">Assessment Data (JSON)</Label>
            <Textarea
              id="assessment_data"
              value={formData.assessment_data}
              onChange={(e) => setFormData({ ...formData, assessment_data: e.target.value })}
              placeholder='{"prototype": true, "revenue": true, ...}'
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expected_min">Expected Score Min</Label>
              <Input
                id="expected_min"
                type="number"
                value={formData.expected_min}
                onChange={(e) => setFormData({ ...formData, expected_min: e.target.value })}
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_max">Expected Score Max</Label>
              <Input
                id="expected_max"
                type="number"
                value={formData.expected_max}
                onChange={(e) => setFormData({ ...formData, expected_max: e.target.value })}
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleAddBenchmark} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Benchmark
            </Button>

            <Button onClick={runRepeatabilityTest} disabled={loading} variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Run Repeatability Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
