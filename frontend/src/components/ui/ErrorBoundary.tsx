/**
 * Error Boundary Component
 * Catches React errors and displays a user-friendly error message
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-[#150016] via-[#29104A] to-[#522C5D] flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-[#FFE3D8] mb-4">
              Something went wrong
            </h1>
            <p className="text-[#845162] mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4 text-left">
                <p className="text-red-400 text-sm font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <Button onClick={this.resetError} className="mr-2">
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
export const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({
  error,
  resetError
}) => (
  <div className="min-h-screen bg-gradient-to-br from-[#150016] via-[#29104A] to-[#522C5D] flex items-center justify-center p-4">
    <Card className="max-w-md w-full text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-2xl font-bold text-[#FFE3D8] mb-4">
        Something went wrong
      </h1>
      <p className="text-[#845162] mb-6">
        An unexpected error occurred. Please try refreshing the page.
      </p>
      {process.env.NODE_ENV === 'development' && error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4 text-left">
          <p className="text-red-400 text-sm font-mono">
            {error.message}
          </p>
        </div>
      )}
      <Button onClick={resetError} className="mr-2">
        Try Again
      </Button>
      <Button
        variant="outline"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </Button>
    </Card>
  </div>
);