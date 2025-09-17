import Header from '@/components/Header';
import HealthAssessment from '@/components/HealthAssessment';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Professional Health Assessment
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized health recommendations based on your symptoms and medical history. 
            Our AI-powered assessment provides risk analysis and actionable guidance.
          </p>
        </div>
        <HealthAssessment />
      </main>
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          <p className="text-sm">
            © 2024 HealthAssess. This tool is for informational purposes only. 
            Always consult healthcare professionals for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
