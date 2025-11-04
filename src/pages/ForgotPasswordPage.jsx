import { useState, useCallback } from "react";
import { Mail } from "lucide-react";
import { supabase } from "../supabaseClient.jsx";
import InputField from "../components/InputField.jsx";
import MessageDisplay from "../components/MessageDisplay.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handlePasswordReset = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage(null);
      setLoading(true);

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          // IMPORTANT: Replace this URL with the actual URL where your user lands
          redirectTo: window.location.origin + "/update-password",
        });

        if (error) throw error;

        setMessage({
          type: "success",
          text: "Success! Check your email for the password reset link.",
        });
        setEmail("");
      } catch (error) {
        console.error("Password Reset Error:", error);
        const displayMessage =
          error.message || "Failed to send reset email. Check email address.";

        setMessage({
          type: "error",
          text: displayMessage,
        });
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-inter'>
      <div className='w-full max-w-md bg-white p-8 sm:p-10 shadow-xl rounded-2xl border border-gray-200'>
        <h1 className='text-3xl font-extrabold text-gray-900 text-center mb-8'>
          Forgot Password
        </h1>
        <p className='text-gray-600 text-center mb-6'>
          Enter your email address to receive a password reset link.
        </p>

        <MessageDisplay message={message} />

        <form onSubmit={handlePasswordReset} className='space-y-4'>
          <InputField
            icon={Mail}
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder='you@example.com'
          />

          <button
            type='submit'
            disabled={loading}
            className='w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <LoadingSpinner />
                Sending Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className='mt-6 text-center text-sm'>
          <p className='text-gray-600'>
            <a
              href='/login'
              className='font-medium text-indigo-600 hover:text-indigo-500 transition duration-200'
            >
              Back to Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
