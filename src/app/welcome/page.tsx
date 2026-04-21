
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChefHat, ShoppingCart, Users, ArrowRight, Check } from 'lucide-react';

type Role = 'find' | 'sell' | 'both';
const roles: { id: Role; title: string; description: string; icon: React.ReactNode }[] = [
  { id: 'find', title: 'Find Food', description: 'Discover delicious, authentic meals from local cooks.', icon: <ShoppingCart className="w-8 h-8" /> },
  { id: 'sell', title: 'Sell Food', description: 'Share your passion for cooking and earn money.', icon: <ChefHat className="w-8 h-8" /> },
  { id: 'both', title: 'Both!', description: 'Explore the marketplace and share your own creations.', icon: <Users className="w-8 h-8" /> },
];

const interests = [
    'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai', 
    'Vietnamese', 'Korean', 'Mediterranean', 'French', 'Spanish', 'Greek', 
    'Caribbean', 'African', 'Brazilian', 'Vegan', 'Vegetarian', 'Gluten-Free', 
    'Desserts', 'Spicy', 'Healthy', 'BBQ', 'Seafood', 'Comfort Food'
];

export default function WelcomePage() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const router = useRouter();

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleFinish = () => {
    if (selectedRole === 'sell' || selectedRole === 'both') {
      router.push('/onboarding');
    } else {
      router.push('/discover');
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-3.5rem)] py-12">
      <div className="w-full max-w-2xl">
        {step === 1 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">Welcome to Homecooked!</CardTitle>
              <p className="text-muted-foreground pt-2">To get started, what brings you here today?</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map(role => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={cn(
                      'p-6 text-center border-2 rounded-lg transition-all relative',
                      selectedRole === role.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                    )}
                  >
                    {selectedRole === role.id && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex justify-center mb-3 text-primary">{role.icon}</div>
                    <h3 className="font-semibold text-lg">{role.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{role.description}</p>
                  </button>
                ))}
              </div>
              <Button
                size="lg"
                className="w-full mt-8"
                disabled={!selectedRole}
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-headline">Personalize Your Experience</CardTitle>
              <p className="text-muted-foreground pt-2">Select a few of your favorite cuisines to get better recommendations.</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-3">
                {interests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={cn(
                      'px-4 py-2 border rounded-full font-medium transition-colors',
                      selectedInterests.includes(interest)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-transparent hover:bg-secondary'
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button size="lg" className="flex-1" onClick={handleFinish}>
                  Finish Setup
                </Button>
                <Button size="lg" variant="ghost" className="flex-1" onClick={handleFinish}>
                  Skip for now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
