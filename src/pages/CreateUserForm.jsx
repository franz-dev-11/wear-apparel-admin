import { useState, useCallback } from "react";
import { Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from "../supabaseClient.jsx";
import InputField from "../components/InputField.jsx";
import MessageDisplay from "../components/MessageDisplay.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";

const CreateUserForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleCreateUser = useCallback(
    async (e) => {
      e.preventDefault();
      setMessage(null);
      setLoading(true);

      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data?.user) {
          const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id, // Insert new profile row
            full_name: fullName,
            phone: phone,
          });

          if (profileError) {
            console.error("Profile creation failed:", profileError);
          }
        }

        setMessage({
          type: "success",
          text: `User ${email} created! An email confirmation has been sent.`,
        });
        setEmail("");
        setPassword("");
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
    [email, password, fullName, phone]
  );

  return (
    <div className='bg-white p-6 rounded-xl shadow-lg border border-gray-100'>
      <h1 className='text-[#121212] font-extrabold text-6xl mb-10 w-max'>
        Create New Users
      </h1>

      <MessageDisplay message={message} />

      <form onSubmit={handleCreateUser} className='space-y-4'>
        <InputField
          icon={User}
          label='Full Name'
          type='text'
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder='Full Name (e.g., Jane Doe)'
        />

        <InputField
          icon={Phone}
          label='Phone Number'
          type='tel'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder='(555) 555-1234'
          required={false}
        />

        <InputField
          icon={Mail}
          label='User Email'
          type='email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='new.user@example.com'
        />

        <InputField
          icon={Lock}
          label='User Password'
          type='password'
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
