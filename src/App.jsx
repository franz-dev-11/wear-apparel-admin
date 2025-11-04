import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient.jsx"; // Assuming supabaseClient is in the root src directory

// --- Components ---
import LoadingSpinner from "./components/LoadingSpinner.jsx";

// --- Pages ---
import LoginPage from "./pages/LoginPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import UpdatePasswordPage from "./pages/UpdatePasswordPage.jsx"; // New page for password reset
import DashboardPage from "./pages/DashboardPage.jsx";

// --- App Component (Revised Routes) ---
function App() {
  const [session, setSession] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    // Check if supabase and getSession are defined
    if (typeof supabase?.auth?.getSession === "function") {
      // 1. Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoadingInitial(false);
      });

      // 2. Set up real-time auth state change listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (loadingInitial) setLoadingInitial(false);
      });

      // 3. Cleanup subscription on unmount
      return () => subscription.unsubscribe();
    } else {
      // Handle case where supabase isn't properly initialized
      setLoadingInitial(false);
    }
  }, [loadingInitial]);

  if (loadingInitial) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <LoadingSpinner />
        <p className='ml-3 text-lg text-gray-700'>Loading session...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Accessible when NOT logged in */}
        <Route
          path='/login'
          element={
            session ? <Navigate to='/dashboard' replace /> : <LoginPage />
          }
        />
        <Route
          path='/forgot-password'
          element={
            session ? (
              <Navigate to='/dashboard' replace />
            ) : (
              <ForgotPasswordPage />
            )
          }
        />
        <Route
          path='/update-password'
          element={
            // Correct: This page handles the password reset token from the URL and MUST render unconditionally.
            <UpdatePasswordPage />
          }
        />

        {/* Protected Route - Requires session */}
        {/* The URL hash (#inventory, #users, etc.) is ignored by this route path, 
            allowing DashboardPage to handle all internal views. */}
        <Route
          path='/dashboard'
          element={
            session ? (
              <DashboardPage session={session} />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        {/* Base Route - Handles initial load and redirection */}
        <Route
          path='/'
          element={
            session ? (
              <Navigate to='/dashboard' replace />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />

        {/* Fallback route */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
