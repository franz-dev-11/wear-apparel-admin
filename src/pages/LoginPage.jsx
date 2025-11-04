import { useState, useCallback } from "react";
import { Mail, Lock } from "lucide-react";
import { supabase } from "../supabaseClient.jsx";
import InputField from "../components/InputField.jsx";
import MessageDisplay from "../components/MessageDisplay.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage(null);
      setLoading(true);

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage({
          type: "success",
          text: "Login successful! Redirecting...",
        });
      } catch (error) {
        console.error("Login Error:", error);
        const displayMessage = error.message || "Invalid login credentials.";

        setMessage({
          type: "error",
          text: displayMessage,
        });
      } finally {
        setLoading(false);
      }
    },
    [email, password]
  );

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-inter'>
      <div className='w-full max-w-md bg-white p-8 sm:p-10 shadow-xl rounded-2xl border border-gray-200'>
        <h1 className='text-3xl font-extrabold text-gray-900 text-center mb-8'>
          Log In
        </h1>

        <MessageDisplay message={message} />

        <form onSubmit={handleLogin} className='space-y-4'>
          <InputField
            icon={Mail}
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='you@example.com'
          />

          <InputField
            icon={Lock}
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='••••••••'
            required={true}
          />

          <button
            type='submit'
            disabled={loading}
            className='w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Logging In...
              </>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        <div className='mt-3 text-right text-sm'>
          <a
            href='/forgot-password'
            className='font-medium text-indigo-600 hover:text-indigo-500 transition duration-200'
          >
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
