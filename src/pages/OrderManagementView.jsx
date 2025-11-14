import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

/**
 * A specialized input field for passwords that includes a toggle
 * to show or hide the password text.
 */
const PasswordInputField = ({
  label,
  value,
  onChange,
  placeholder,
  required = true,
}) => {
  // State to manage the visibility of the password (true = show/text, false = hide/password)
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className='relative'>
      {/* Label for the input field */}
      <label
        htmlFor='password-input'
        className='block text-sm font-medium text-gray-700'
      >
        {label}
      </label>

      <div className='mt-1 relative rounded-md shadow-sm'>
        {/* Static Icon on the left (Lock) */}
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
        </div>

        {/* The main input element */}
        <input
          id='password-input'
          name='password'
          // Toggles the input type between 'password' and 'text'
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          // Styling assumes Tailwind/similar to your existing InputField
          className='block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm'
        />

        {/* Visibility Toggle Button on the right */}
        <button
          type='button'
          onClick={toggleVisibility}
          className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out'
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            // Show EyeOff icon when password is visible (type='text')
            <EyeOff className='h-5 w-5' aria-hidden='true' />
          ) : (
            // Show Eye icon when password is hidden (type='password')
            <Eye className='h-5 w-5' aria-hidden='true' />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInputField;
