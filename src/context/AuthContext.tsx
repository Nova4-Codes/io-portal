"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Represents the active session state
interface UserState {
  isLoggedIn: boolean;
  userRole: string | null;
  firstName: string | null;
  lastName: string | null;
  agreedPolicies: string[]; 
  completedTools: string[]; 
  onboardingComplete: boolean; 
  userId?: number;
}

// Define types for login credentials
type EmployeeCredentials = { firstName: string; lastName: string; idNumber: string };
type AdminCredentials = { email: string; password: string };
type LoginCredentials = EmployeeCredentials | AdminCredentials;

interface AuthContextType extends UserState {
  login: (credentials: LoginCredentials) => Promise<boolean>; // Updated login signature
  logout: () => void;
  agreePolicy: (policyId: string) => void;
  checkTool: (toolId: string) => void;
  completeOnboardingAndRegister: (data: {
    firstName: string;
    lastName: string;
    idNumber: string;
    userRole: string;
    currentAgreedPolicies: string[];
    currentCompletedTools: string[];
  }) => Promise<{success: boolean; errorMessage?: string}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialSessionState: UserState = {
  isLoggedIn: false,
  userRole: null,
  firstName: null,
  lastName: null,
  agreedPolicies: [],
  completedTools: [],
  onboardingComplete: false,
};

// Helper to get initial session state from localStorage (for active session)
const getInitialSessionState = (): UserState => {
  if (typeof window !== 'undefined') {
    const storedState = localStorage.getItem('activeSession');
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState) as UserState;
        // Basic validation
        if (
          typeof parsedState.isLoggedIn === 'boolean' &&
          (typeof parsedState.userRole === 'string' || parsedState.userRole === null) &&
          (typeof parsedState.firstName === 'string' || parsedState.firstName === null) &&
          (typeof parsedState.lastName === 'string' || parsedState.lastName === null) &&
          Array.isArray(parsedState.agreedPolicies) &&
          Array.isArray(parsedState.completedTools) &&
          typeof parsedState.onboardingComplete === 'boolean'
        ) {
          return parsedState;
        }
      } catch (error) {
        console.error("Failed to parse active session state from localStorage", error);
        localStorage.removeItem('activeSession'); // Clear corrupted state
      }
    }
  }
  return initialSessionState;
};

const ACTIVE_SESSION_KEY = 'activeSession'; // Key for localStorage

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [sessionState, setSessionState] = useState<UserState>(getInitialSessionState);

  // Effect to sync active session state changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (sessionState.isLoggedIn) {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(sessionState));
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    }
  }, [sessionState]);

  // Updated login function to accept credentials object
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      // The backend now handles differentiating based on the object keys
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials), 
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.user;
        setSessionState({
          isLoggedIn: true,
          userId: user.id,
          // Use optional chaining as admins might not have first/last names
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          userRole: user.role, // Role comes from backend
          // Arrays are already parsed in the API response
          agreedPolicies: user.agreedPolicies || [],
          completedTools: user.completedTools || [],
          // Determine onboardingComplete based on role or fetched data if needed
          // For now, assume login success means onboarding was done or not applicable (admin)
          onboardingComplete: true,
        });
        return true;
      } else {
        // Login failed
        setSessionState(prev => ({ ...prev, isLoggedIn: false, userRole: null, firstName: null, lastName: null }));
        return false;
      }
    } catch (error) {
      console.error('Network or other error during login:', error);
      setSessionState(prev => ({ ...prev, isLoggedIn: false, userRole: null, firstName: null, lastName: null }));
      return false;
    }
  };

  const logout = () => {
    setSessionState(initialSessionState); 
  };

  const agreePolicy = (policyId: string) => {
    setSessionState(prevState => {
      if (prevState.agreedPolicies.includes(policyId)) {
        return prevState;
      }
      return {
        ...prevState,
        agreedPolicies: [...prevState.agreedPolicies, policyId],
      };
    });
  };

  const checkTool = (toolId: string) => {
    setSessionState(prevState => {
      if (prevState.completedTools.includes(toolId)) {
        return prevState;
      }
      return {
        ...prevState,
        completedTools: [...prevState.completedTools, toolId],
      };
    });
  };

  const completeOnboardingAndRegister = async (data: {
    firstName: string;
    lastName: string;
    idNumber: string; 
    userRole: string; // Should likely default to 'EMPLOYEE' here
    currentAgreedPolicies: string[];
    currentCompletedTools: string[];
  }): Promise<{success: boolean; errorMessage?: string}> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Ensure userRole sent is appropriate (e.g., 'EMPLOYEE')
        body: JSON.stringify({...data, userRole: 'EMPLOYEE'}),
      });

      const responseData = await response.json();

      if (response.ok) {
        const registeredUser = responseData.user;
        // Automatically log in the user after successful registration
        setSessionState({
          isLoggedIn: true,
          userId: registeredUser.id,
          firstName: registeredUser.firstName,
          lastName: registeredUser.lastName,
          userRole: registeredUser.role,
          // Arrays are already parsed in the API response
          agreedPolicies: registeredUser.agreedPolicies || [],
          completedTools: registeredUser.completedTools || [],
          onboardingComplete: true,
        });
        return { success: true };
      } else {
        // Registration failed with a specific error message
        let errorMessage = responseData.message || 'Registration failed. Please try again.';
        
        // Handle validation errors
        if (responseData.errors && typeof responseData.errors === 'object') {
          // Format validation errors
          const errorMessages = [];
          for (const field in responseData.errors) {
            if (Array.isArray(responseData.errors[field])) {
              errorMessages.push(...responseData.errors[field]);
            }
          }
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(', ');
          }
        }
        
        return {
          success: false,
          errorMessage
        };
      }
    } catch (error) {
      console.error('Network or other error during registration:', error);
      return {
        success: false,
        errorMessage: 'A network error occurred. Please check your connection and try again.'
      };
    }
  };
  
  return (
    <AuthContext.Provider value={{
      ...sessionState,
      login,
      logout,
      agreePolicy,
      checkTool,
      completeOnboardingAndRegister
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};