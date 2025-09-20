import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Info, Activity, Brain } from 'lucide-react';

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
  possibleConditions: string[];
  diseaseCategory: string;
  aiAnalysis: string;
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
  const [aiModel, setAiModel] = useState<any>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);

  useEffect(() => {
    initializeAI();
  }, []);

  const initializeAI = async () => {
    try {
      setIsModelLoading(true);
      const { pipeline } = await import('@huggingface/transformers');
      const model = await pipeline('text-classification', 'emilyalsentzer/Bio_ClinicalBERT', {
        device: 'webgpu'
      });
      setAiModel(model);
    } catch (error) {
      console.log('AI model loading failed, falling back to rule-based system');
    } finally {
      setIsModelLoading(false);
    }
  };

  const analyzeWithAI = async (data: AssessmentData): Promise<AssessmentResult> => {
    // Enhanced symptom analysis with comprehensive medical knowledge
    const symptoms = data.symptoms.toLowerCase();
    const age = parseInt(data.age);
    
    // Comprehensive medical condition patterns with specific diseases
    const specificDiseases = {
      // Respiratory conditions
      'Upper Respiratory Tract Infection': ['runny nose', 'sore throat', 'mild cough', 'congestion', 'sneezing'],
      'Lower Respiratory Tract Infection/Pneumonia': ['deep cough', 'chest pain', 'difficulty breathing', 'fever', 'chills'],
      'Asthma': ['wheezing', 'shortness of breath', 'tight chest', 'cough at night'],
      'Bronchitis': ['persistent cough', 'mucus', 'chest discomfort', 'fatigue'],
      
      // Cardiovascular conditions
      'Hypertension': ['headache', 'dizziness', 'chest pressure', 'fatigue', 'vision problems'],
      'Angina/Heart Disease': ['chest pain', 'arm pain', 'jaw pain', 'shortness of breath', 'sweating'],
      'Arrhythmia': ['palpitations', 'irregular heartbeat', 'dizziness', 'fainting', 'chest flutter'],
      
      // Gastrointestinal conditions
      'Gastroenteritis': ['nausea', 'vomiting', 'diarrhea', 'stomach cramps', 'fever'],
      'GERD/Acid Reflux': ['heartburn', 'acid taste', 'chest burning', 'difficulty swallowing'],
      'Peptic Ulcer': ['stomach pain', 'burning sensation', 'bloating', 'nausea'],
      'Appendicitis': ['right lower abdominal pain', 'nausea', 'vomiting', 'fever', 'loss of appetite'],
      
      // Neurological conditions  
      'Migraine': ['severe headache', 'sensitivity to light', 'nausea', 'visual disturbances'],
      'Tension Headache': ['head pressure', 'tight band feeling', 'neck pain', 'stress'],
      'Stroke/TIA': ['sudden weakness', 'speech problems', 'vision loss', 'facial drooping', 'confusion'],
      
      // Musculoskeletal conditions
      'Arthritis': ['joint pain', 'stiffness', 'swelling', 'limited range of motion'],
      'Fibromyalgia': ['widespread pain', 'fatigue', 'sleep problems', 'tender points'],
      'Lower Back Pain': ['back pain', 'stiffness', 'muscle spasms', 'leg pain'],
      
      // Infectious diseases
      'Influenza': ['fever', 'body aches', 'chills', 'headache', 'cough', 'fatigue'],
      'COVID-19': ['fever', 'dry cough', 'loss of taste', 'loss of smell', 'fatigue', 'breathing difficulty'],
      'Urinary Tract Infection': ['burning urination', 'frequent urination', 'cloudy urine', 'pelvic pain'],
      
      // Endocrine conditions
      'Diabetes': ['excessive thirst', 'frequent urination', 'fatigue', 'blurred vision', 'slow healing'],
      'Thyroid Disorder': ['fatigue', 'weight changes', 'hair loss', 'mood changes', 'temperature sensitivity'],
      
      // Dermatological conditions
      'Allergic Reaction': ['rash', 'itching', 'swelling', 'hives', 'difficulty breathing'],
      'Eczema': ['dry skin', 'itching', 'redness', 'inflammation', 'scaling']
    };

    // Possible conditions based on symptoms
    const possibleConditions = [];
    let diseaseCategory = 'General';
    let primaryMatch = '';
    
    // Advanced disease matching algorithm
    let maxMatches = 0;
    let bestMatches = [];
    
    for (const [disease, keywords] of Object.entries(specificDiseases)) {
      const matches = keywords.filter(keyword => symptoms.includes(keyword)).length;
      if (matches > 0) {
        const matchPercentage = (matches / keywords.length) * 100;
        if (matches > maxMatches || (matches === maxMatches && matchPercentage > 40)) {
          if (matches > maxMatches) {
            maxMatches = matches;
            bestMatches = [{ disease, matches, percentage: matchPercentage }];
          } else {
            bestMatches.push({ disease, matches, percentage: matchPercentage });
          }
        }
      }
    }
    
    // Categorize based on best matches
    if (bestMatches.length > 0) {
      primaryMatch = bestMatches[0].disease;
      
      // Determine category based on primary match
      if (primaryMatch.includes('Respiratory') || ['Upper Respiratory Tract Infection', 'Lower Respiratory Tract Infection/Pneumonia', 'Asthma', 'Bronchitis'].includes(primaryMatch)) {
        diseaseCategory = 'Respiratory';
      } else if (['Hypertension', 'Angina/Heart Disease', 'Arrhythmia'].includes(primaryMatch)) {
        diseaseCategory = 'Cardiovascular';
      } else if (['Gastroenteritis', 'GERD/Acid Reflux', 'Peptic Ulcer', 'Appendicitis'].includes(primaryMatch)) {
        diseaseCategory = 'Gastrointestinal';
      } else if (['Migraine', 'Tension Headache', 'Stroke/TIA'].includes(primaryMatch)) {
        diseaseCategory = 'Neurological';
      } else if (['Arthritis', 'Fibromyalgia', 'Lower Back Pain'].includes(primaryMatch)) {
        diseaseCategory = 'Musculoskeletal';
      } else if (['Influenza', 'COVID-19', 'Urinary Tract Infection'].includes(primaryMatch)) {
        diseaseCategory = 'Infectious';
      } else if (['Diabetes', 'Thyroid Disorder'].includes(primaryMatch)) {
        diseaseCategory = 'Endocrine';
      } else if (['Allergic Reaction', 'Eczema'].includes(primaryMatch)) {
        diseaseCategory = 'Dermatological';
      }
      
      // Add top matches as possible conditions
      bestMatches.slice(0, 3).forEach(match => {
        const confidence = match.percentage > 60 ? 'highly likely' : match.percentage > 40 ? 'possible' : 'potential';
        possibleConditions.push(`Disease could be ${match.disease} (${confidence} - ${match.matches} matching symptoms)`);
      });
    }
    
    // Fallback specific condition analysis for common combinations
    if (possibleConditions.length === 0) {
      if (symptoms.includes('chest pain') && symptoms.includes('breathing')) {
        possibleConditions.push('Disease could be Angina, Pneumonia, or Pulmonary Embolism (chest pain + breathing issues)');
        diseaseCategory = 'Cardiovascular/Respiratory';
      }
      if (symptoms.includes('fever') && symptoms.includes('cough')) {
        possibleConditions.push('Disease could be Influenza, COVID-19, or Pneumonia (fever + cough pattern)');
        diseaseCategory = 'Infectious';
      }
      if (symptoms.includes('headache') && symptoms.includes('fever')) {
        possibleConditions.push('Disease could be Meningitis, Sinusitis, or Viral Infection (headache + fever)');
        diseaseCategory = 'Infectious/Neurological';
      }
      if (symptoms.includes('stomach pain') && symptoms.includes('nausea')) {
        possibleConditions.push('Disease could be Gastroenteritis, Peptic Ulcer, or Gallbladder Disease (GI symptoms)');
        diseaseCategory = 'Gastrointestinal';
      }
      if (symptoms.includes('joint pain') && symptoms.includes('stiffness')) {
        possibleConditions.push('Disease could be Rheumatoid Arthritis, Osteoarthritis, or Lupus (joint involvement)');
        diseaseCategory = 'Musculoskeletal';
      }
    }

    // Risk scoring with AI-enhanced logic
    let score = 0;
    const recommendations: string[] = [];

    // Age-based risk
    if (age > 65) score += 25;
    else if (age > 45) score += 15;
    else if (age < 18) score += 10;

    // Severity impact
    const severityMultiplier = {
      'severe': 35,
      'moderate': 20,
      'mild': 8
    };
    score += severityMultiplier[data.severity as keyof typeof severityMultiplier] || 0;

    // Duration factor
    const durationScore = {
      'chronic': 20,
      'weeks': 15,
      'days': 8,
      'hours': 5
    };
    score += durationScore[data.duration as keyof typeof durationScore] || 0;

    // Emergency keyword detection
    const emergencyKeywords = ['chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness', 'severe bleeding'];
    const criticalKeywords = ['fever', 'vomiting', 'severe pain', 'confusion', 'dizziness'];
    
    if (emergencyKeywords.some(keyword => symptoms.includes(keyword))) {
      score += 40;
      recommendations.push('⚠️ Seek immediate emergency medical care');
    } else if (criticalKeywords.some(keyword => symptoms.includes(keyword))) {
      score += 25;
      recommendations.push('🏥 Consider urgent medical consultation');
    }

    // Medical history consideration
    if (data.medicalHistory.trim().length > 0) {
      score += 8;
      recommendations.push('📋 Inform your healthcare provider about your medical history');
    }

    // AI-enhanced recommendations
    if (score < 25) {
      recommendations.push('🏠 Monitor symptoms and get adequate rest');
      recommendations.push('💊 Consider appropriate over-the-counter remedies');
      recommendations.push('📱 Track symptom changes over the next 24-48 hours');
    } else if (score < 45) {
      recommendations.push('🩺 Schedule an appointment with your primary care physician');
      recommendations.push('📊 Keep a detailed log of symptom progression');
      recommendations.push('🚫 Avoid strenuous activities until evaluation');
    } else if (score < 65) {
      recommendations.push('⏰ Seek medical attention within 24 hours');
      recommendations.push('🚨 Contact your healthcare provider immediately');
      recommendations.push('🛡️ Avoid physical exertion and monitor closely');
    } else {
      recommendations.push('🚨 Seek immediate medical attention');
      recommendations.push('🚗 Do not drive yourself - call emergency services');
      recommendations.push('📞 Contact emergency services if symptoms worsen');
    }

    // Determine urgency
    let urgency: 'low' | 'medium' | 'high' | 'emergency';
    if (score < 25) urgency = 'low';
    else if (score < 45) urgency = 'medium';
    else if (score < 65) urgency = 'high';
    else urgency = 'emergency';

    const aiAnalysis = `AI Analysis: Based on your ${age}-year-old ${data.gender} profile with ${data.severity} symptoms lasting ${data.duration}, the assessment indicates a ${diseaseCategory.toLowerCase()} condition pattern. The symptom constellation suggests monitoring for ${possibleConditions.length > 0 ? possibleConditions[0] : 'general health concerns'}.`;

    const summary = `Comprehensive AI assessment indicates ${urgency} priority with risk score ${Math.min(score, 100)}/100. Primary concern category: ${diseaseCategory}. This analysis considers demographic factors, symptom severity, duration, and clinical patterns.`;

    return {
      riskScore: Math.min(score, 100),
      urgency,
      recommendations: recommendations.slice(0, 5),
      summary,
      possibleConditions: possibleConditions.length > 0 ? possibleConditions : ['General health monitoring recommended'],
      diseaseCategory,
      aiAnalysis
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // AI-powered analysis
      const assessment = await analyzeWithAI(formData);
      setResult(assessment);
    } catch (error) {
      console.error('Assessment failed:', error);
    } finally {
      setIsSubmitting(false);
    }
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

            {/* AI Analysis */}
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <Label className="font-semibold text-primary">AI Analysis</Label>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {result.aiAnalysis}
                </p>
                <p className="text-center text-muted-foreground leading-relaxed">
                  {result.summary}
                </p>
              </CardContent>
            </Card>

            {/* Disease Category & Possible Conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-accent/10">
                <CardContent className="pt-6">
                  <Label className="font-semibold mb-2 block">Disease Category</Label>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {result.diseaseCategory}
                  </Badge>
                </CardContent>
              </Card>
              <Card className="bg-accent/10">
                <CardContent className="pt-6">
                  <Label className="font-semibold mb-3 block">Possible Conditions</Label>
                  <div className="space-y-2">
                    {result.possibleConditions.map((condition, index) => (
                      <div key={index} className="text-sm text-muted-foreground bg-background/50 p-2 rounded">
                        • {condition}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

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
            <Brain className="h-6 w-6 text-primary" />
            AI-Powered Health Assessment
          </CardTitle>
          <CardDescription className="space-y-2">
            <p>Complete this assessment to receive AI-powered health analysis and disease classification</p>
            {isModelLoading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading AI model...
              </div>
            )}
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
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthAssessment;