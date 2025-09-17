import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Info, Activity } from 'lucide-react';

interface AssessmentData {
  name: string;
  age: string;
  gender: string;
  symptoms: string;
  duration: string;
  severity: string;
  medicalHistory: string;
}

interface AssessmentResult {
  riskScore: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  recommendations: string[];
  summary: string;
}

const HealthAssessment = () => {
  const [formData, setFormData] = useState<AssessmentData>({
    name: '',
    age: '',
    gender: '',
    symptoms: '',
    duration: '',
    severity: '',
    medicalHistory: ''
  });

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateRiskScore = (data: AssessmentData): AssessmentResult => {
    let score = 0;
    const recommendations: string[] = [];

    // Age factor
    const age = parseInt(data.age);
    if (age > 65) score += 20;
    else if (age > 45) score += 10;
    else if (age < 18) score += 15;

    // Severity factor
    if (data.severity === 'severe') score += 30;
    else if (data.severity === 'moderate') score += 20;
    else if (data.severity === 'mild') score += 10;

    // Duration factor
    if (data.duration === 'chronic') score += 15;
    else if (data.duration === 'weeks') score += 10;
    else if (data.duration === 'days') score += 5;

    // Symptom analysis (simplified)
    const symptoms = data.symptoms.toLowerCase();
    const emergencyKeywords = ['chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness'];
    const highRiskKeywords = ['fever', 'vomiting', 'severe pain', 'bleeding'];
    
    if (emergencyKeywords.some(keyword => symptoms.includes(keyword))) {
      score += 40;
      recommendations.push('Seek immediate emergency care');
    } else if (highRiskKeywords.some(keyword => symptoms.includes(keyword))) {
      score += 25;
      recommendations.push('Consider urgent medical consultation');
    }

    // Medical history factor
    if (data.medicalHistory.trim().length > 0) {
      score += 5;
      recommendations.push('Inform healthcare provider of your medical history');
    }

    // Generate recommendations based on score
    if (score < 20) {
      recommendations.push('Monitor symptoms and rest');
      recommendations.push('Consider over-the-counter remedies if appropriate');
    } else if (score < 40) {
      recommendations.push('Schedule appointment with primary care physician');
      recommendations.push('Keep track of symptom progression');
    } else if (score < 60) {
      recommendations.push('Seek medical attention within 24 hours');
      recommendations.push('Avoid strenuous activity');
    } else {
      recommendations.push('Seek immediate medical attention');
      recommendations.push('Do not drive yourself to medical facility');
    }

    // Determine urgency level
    let urgency: 'low' | 'medium' | 'high' | 'emergency';
    if (score < 20) urgency = 'low';
    else if (score < 40) urgency = 'medium';
    else if (score < 60) urgency = 'high';
    else urgency = 'emergency';

    const summary = `Based on your assessment, you have a ${urgency} priority health concern with a risk score of ${Math.min(score, 100)}. This analysis considers your age, symptom severity, duration, and reported symptoms.`;

    return {
      riskScore: Math.min(score, 100),
      urgency,
      recommendations: recommendations.slice(0, 4), // Limit to 4 recommendations
      summary
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const assessment = calculateRiskScore(formData);
    setResult(assessment);
    setIsSubmitting(false);
  };

  const resetAssessment = () => {
    setResult(null);
    setFormData({
      name: '',
      age: '',
      gender: '',
      symptoms: '',
      duration: '',
      severity: '',
      medicalHistory: ''
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-accent text-accent-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'emergency': return 'bg-destructive text-destructive-foreground animate-pulse';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'low': return <CheckCircle className="h-5 w-5" />;
      case 'medium': return <Info className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      case 'emergency': return <AlertTriangle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="border-primary/20 shadow-medical">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Health Assessment Results
            </CardTitle>
            <CardDescription>
              Assessment completed for {formData.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Risk Score */}
            <div className="text-center space-y-4">
              <div>
                <Label className="text-lg font-semibold">Risk Score</Label>
                <div className="text-4xl font-bold text-primary mt-2">
                  {result.riskScore}/100
                </div>
              </div>
              <Progress value={result.riskScore} className="h-3" />
            </div>

            {/* Urgency Level */}
            <div className="flex justify-center">
              <Badge className={`${getUrgencyColor(result.urgency)} px-4 py-2 text-sm font-semibold`}>
                <span className="flex items-center gap-2">
                  {getUrgencyIcon(result.urgency)}
                  {result.urgency.toUpperCase()} PRIORITY
                </span>
              </Badge>
            </div>

            {/* Summary */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground leading-relaxed">
                  {result.summary}
                </p>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <div>
              <Label className="text-lg font-semibold mb-4 block">Recommendations</Label>
              <div className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-accent-light rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-sm font-bold">
                      {index + 1}
                    </div>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <Card className="bg-warning/10 border-warning/20">
              <CardContent className="pt-6">
                <p className="text-sm text-center text-muted-foreground">
                  <strong>Medical Disclaimer:</strong> This assessment is for informational purposes only and should not replace professional medical advice. Always consult with a healthcare provider for medical concerns.
                </p>
              </CardContent>
            </Card>

            <Button 
              onClick={resetAssessment} 
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              Take New Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-primary/20 shadow-medical">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Health Assessment
          </CardTitle>
          <CardDescription>
            Complete this assessment to receive personalized health recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Symptoms */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Current Symptoms</h3>
              <div>
                <Label htmlFor="symptoms">Describe your symptoms</Label>
                <Textarea
                  id="symptoms"
                  value={formData.symptoms}
                  onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                  placeholder="Please describe your symptoms in detail..."
                  required
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Symptom Duration</Label>
                  <Select value={formData.duration} onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Few hours</SelectItem>
                      <SelectItem value="days">Few days</SelectItem>
                      <SelectItem value="weeks">Few weeks</SelectItem>
                      <SelectItem value="chronic">Chronic (months/years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="severity">Symptom Severity</Label>
                  <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Medical History</h3>
              <div>
                <Label htmlFor="medicalHistory">Previous medical conditions or relevant history</Label>
                <Textarea
                  id="medicalHistory"
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: e.target.value }))}
                  placeholder="Any relevant medical history, current medications, allergies..."
                  className="mt-1"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                'Complete Assessment'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthAssessment;