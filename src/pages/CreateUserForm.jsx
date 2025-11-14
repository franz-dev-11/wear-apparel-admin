import { useState, useCallback } from "react";
// Re-adding Lock, User, and Phone icons
import { Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from "../supabaseClient.jsx";
import InputField from "../components/InputField.jsx";
import MessageDisplay from "../components/MessageDisplay.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
// Keeping the new component for password
import PasswordInputField from "../components/PasswordInputField.jsx";

const CreateUserForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Re-introducing original state variables
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleCreateUser = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage(null);
      setLoading(true);

      // --- 1. NULL Conversion Logic (Reverted to original) ---
      const finalFullName = fullName.trim() === "" ? null : fullName.trim();
      const finalPhone = phone.trim() === "" ? null : phone.trim();

      try {
        // Step A: Create the user in Supabase auth.users
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // Step B: UPSERT the profile row.
        if (data?.user) {
          const { error: profileError } = await supabase
            .from("users")
            .upsert({
              id: data.user.id, // Mandatory for UPSERT
              full_name: finalFullName,
              phone: finalPhone,
            })
            .select("id");

          if (profileError) {
            console.error(
              "Profile upsert failed details (DB Error):",
              profileError
            );
            throw new Error(
              `Profile data upsert FAILED. Supabase Error: ${profileError.message}`
            );
          }
        }

        // Success: Only run if BOTH auth sign-up and profile upsert succeed
        setMessage({
          type: "success",
          text: `User ${email} created! An email confirmation has been sent.`,
        });
        setEmail("");
        setPassword("");
        // Re-setting all state variables
        setFullName("");
        setPhone("");
      } catch (error) {
        console.error("Create User Error:", error);
        const displayMessage =
          error.message || "An unknown error occurred during user creation.";

        setMessage({
          type: "error",
          text: displayMessage,
        });
      } finally {
        setLoading(false);
      }
    },
    [email, password, fullName, phone] // Dependency array restored
  );

  return (
    <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
      <h1 className='text-[#121212] font-extrabold text-6xl mb-10 w-max'>
        Create New Users
      </h1>

      <MessageDisplay message={message} />

      <form onSubmit={handleCreateUser} className='space-y-4'>
        {/* Re-introduced Full Name */}
        <InputField
          icon={User}
          label='Full Name'
          type='text'
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder='Full Name (e.g., Jane Doe)'
        />

        {/* Re-introduced Phone Number */}
        <InputField
          icon={Phone}
          label='Phone Number'
          type='tel'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder='(555) 555-1234'
          required={false}
        />

        {/* Email field remains */}
        <InputField
          icon={Mail}
          label='User Email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='new.user@example.com'
          required={true}
        />

        {/* *** UPDATED: Using PasswordInputField for view/hide functionality *** */}
        <PasswordInputField
          label='User Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='••••••••'
          required={true}
        />

        <button
          type='submit'
          disabled={loading}
          className='w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Creating User...
            </>
          ) : (
            "Create User"
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateUserForm;
