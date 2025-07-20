import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import FeedbackForm from './components/FeedbackForm';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { User } from '@supabase/supabase-js';

function App() {
  const [currentView, setCurrentView] = useState<'form' | 'admin' | 'dashboard'>('form');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('form');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">FeedbackPro</h1>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setCurrentView('form')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'form'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Submit Feedback
              </button>
              {user ? (
                <>
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === 'dashboard'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await supabase.auth.signOut();
                      } catch (error) {
                        // Handle session_not_found error gracefully
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        if (errorMessage.includes('session_not_found') || errorMessage.includes('Session from session_id claim in JWT does not exist') || errorMessage.includes('User from sub claim in JWT does not exist')) {
                          console.log('Logout completed - session was already invalid on server');
                        } else {
                          console.log('Logout completed (server error ignored):', error);
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Admin Login
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main>
        {currentView === 'form' && <FeedbackForm />}
        {currentView === 'admin' && !user && <AdminLogin />}
        {currentView === 'dashboard' && user && <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;