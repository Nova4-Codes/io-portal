"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface WelcomeAnimationProps {
  onProceedToLogin: () => void;
}

const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onProceedToLogin }) => {
  const welcomeLine1 = "Welcome".split("");
  const welcomeLine2 = "To".split("");
  const fullCompanyName = "INUA AI SOLUTIONS LTD.".split("").map(char => char === " " ? "\u00A0" : char);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-red-950 backdrop-blur-md transition-opacity duration-700 ease-in-out opacity-100 p-4 text-center">
      <div className="relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-red-500/20 blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-pink-500/20 blur-2xl animate-pulse-slow" style={{ animationDelay: "0.5s" }}></div>
          <div className="absolute bottom-1/3 right-1/3 translate-x-1/2 translate-y-1/2 w-48 h-48 rounded-full bg-red-600/20 blur-2xl animate-pulse-slow" style={{ animationDelay: "1s" }}></div>
        </div>

        <h2 className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-pink-500 animate-fade-in-slow">
          {welcomeLine1.map((char, index) => (
            <span key={`w1-${index}`} className="inline-block animate-letter-bounce" style={{ animationDelay: `${index * 0.1}s` }}>{char}</span>
          ))}
        </h2>
        <h2 className="mt-1 text-3xl sm:text-5xl font-bold text-slate-200 animate-fade-in-slower" style={{ animationDelay: `${(welcomeLine1.length) * 0.1}s` }}>
          {welcomeLine2.map((char, index) => (
            <span key={`w2-${index}`} className="inline-block" style={{ animationDelay: `${(welcomeLine1.length + index) * 0.1}s` }}>{char}</span>
          ))}
        </h2>
        <h1 className="mt-2 sm:mt-3 text-5xl sm:text-7xl font-black text-red-500 animate-fade-in-slower">
          {fullCompanyName.map((char, index) => (
            <span key={`cn-${index}`} className="inline-block animate-letter-slide-up" style={{ animationDelay: `${(welcomeLine1.length + welcomeLine2.length) * 0.1 + index * 0.05}s` }}>{char}</span>
          ))}
        </h1>
      </div>

      <div className="mt-16 animate-fade-in-slowest flex flex-col items-center" style={{ animationDelay: "2.5s" }}>
        <Button
          variant="default"
          size="lg"
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-none hover:text-white transition-all"
          onClick={onProceedToLogin}
        >
          <LogIn className="mr-2 h-5 w-5" />
          Proceed to Login
        </Button>
        <p className="mt-4 text-slate-300 text-sm max-w-md text-center">
          Your registration is complete! You can now log in using the same First Name, Last Name, and numeric Password you created during registration.
        </p>
      </div>
    </div>
  );
};

export default WelcomeAnimation;