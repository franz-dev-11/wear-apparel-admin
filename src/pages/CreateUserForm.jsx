import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

const PasswordInputField = ({
  label,
  value,
  onChange,
  placeholder,
  required = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className='relative'>
      <label
        htmlFor='password'
        className='block text-sm font-medium text-gray-700'
      >
        {label}
      </label>
      <div className='mt-1 relative rounded-md shadow-sm'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
          <Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
        </div>
        <input
          id='password'
          name='password'
          type={isVisible ? "text" : "password"} // Toggles type attribute
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className='block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 sm:text-sm'
        />
        <button
          type='button'
          onClick={toggleVisibility}
          className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700 focus:outline-none'
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <EyeOff className='h-5 w-5' aria-hidden='true' />
          ) : (
            <Eye className='h-5 w-5' aria-hidden='true' />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInputField;
