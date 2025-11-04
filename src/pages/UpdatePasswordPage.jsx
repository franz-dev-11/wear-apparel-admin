import { useState, useCallback, useEffect } from "react";
import { Lock } from "lucide-react";
import { supabase } from "../supabaseClient.jsx";
import InputField from "../components/InputField.jsx";
import MessageDisplay from "../components/MessageDisplay.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const UpdatePasswordPage = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSessionValid, setIsSessionValid] = useState(true);

  // Check if a valid session exists on load (handled by Supabase's PKCE flow)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setMessage({
          type: "error",
          text: "Invalid or expired reset link. Please try the 'Forgot Password' flow again.",
        });
        setIsSessionValid(false);
      }
    });
  }, []);

  const handlePasswordUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage(null);

      if (!isSessionValid) return;

      if (password !== passwordConfirm) {
        setMessage({
          type: "error",
          text: "Passwords do not match.",
        });
        return;
      }

      if (password.length < 6) {
        setMessage({
          type: "error",
          text: "Password must be at least 6 characters.",
        });
        return;
      }

      setLoading(true);

      try {
        // 1. Update Password (This automatically logs the user in)
        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        if (updateError) throw updateError;

        // 2. CRITICAL: Explicitly sign the user out. Await this call to ensure local storage is cleared.
        const { error: signOutError } = await supabase.auth.signOut();

        if (signOutError) {
          console.error(
            "Sign-out after password update failed:",
            signOutError.message
          );
        }

        setMessage({
          type: "success",
          text: "Password updated successfully! Redirecting to login...",
        });

        // 3. 🔑 FIX: Immediately replace the current location without a delay.
        // This forces the fastest possible page load/navigation to the /login route.
        // The App.jsx component will then perform its initial session check and find no active session.
        window.location.replace("/login");
      } catch (error) {
        console.error("Password Update Error:", error);
        const displayMessage =
          error.message || "Failed to update password. Please check the link.";

        setMessage({
          type: "error",
          text: displayMessage,
        });
      } finally {
        // We never reach setLoading(false) here because the page redirects before then.
        // However, we keep it for non-redirect paths.
        setLoading(false);
      }
    },
    [password, passwordConfirm, isSessionValid]
  );

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-inter'>
      <div className='w-full max-w-md bg-white p-8 sm:p-10 shadow-xl rounded-2xl border border-gray-200'>
        <h1 className='text-3xl font-extrabold text-gray-900 text-center mb-8'>
          Update Password
        </h1>
        <p className='text-gray-600 text-center mb-6'>
          Set a new password for your account.
        </p>

        <MessageDisplay message={message} />

        {isSessionValid && (
          <form onSubmit={handlePasswordUpdate} className='space-y-4'>
            <InputField
              icon={Lock}
              label='New Password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              required={true}
            />
            <InputField
              icon={Lock}
              label='Confirm Password'
              type='password'
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder='••••••••'
              required={true}
            />

            <button
              type='submit'
              disabled={loading || !password || !passwordConfirm}
              className='w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  Updating...
                </>
              ) : (
                "Set New Password"
              )}
            </button>
          </form>
        )}

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

export default UpdatePasswordPage;
