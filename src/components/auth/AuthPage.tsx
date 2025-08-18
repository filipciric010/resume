import React, { useState } from 'react';
import { LoginForm, SignupForm } from '@/components/auth/AuthForms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-gray-100"
        >
          ×
        </button>
        
        {isLogin ? (
          <div>
            <LoginForm onSuccess={handleSuccess} />
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsLogin(false)}
                >
                  Sign up
                </Button>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <SignupForm onSuccess={handleSuccess} />
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsLogin(true)}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <div>
            <LoginForm />
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsLogin(false)}
                >
                  Sign up
                </Button>
              </p>
            </div>
          </div>
        ) : (
          <div>
            <SignupForm />
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => setIsLogin(true)}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
