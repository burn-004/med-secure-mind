import { Activity, Shield, Stethoscope } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-medical shadow-medical">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">HealthAssess</h1>
              <p className="text-white/80 text-sm">AI-Powered Health Assessment</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <span className="text-sm">Risk Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Secure & Private</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;