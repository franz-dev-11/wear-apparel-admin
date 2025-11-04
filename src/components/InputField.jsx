import React from "react";

// Input Field Component for consistent styling
const InputField = ({
  icon: Icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
}) => (
  <div className='relative mb-6'>
    <label htmlFor={label} className='sr-only'>
      {label}
    </label>
    <div className='flex items-center border border-gray-300 rounded-lg shadow-sm focus-within:border-indigo-500 transition duration-200'>
      <div className='p-3 text-gray-400'>
        <Icon className='w-5 h-5' />
      </div>
      <input
        id={label}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className='w-full p-3 bg-white text-gray-800 placeholder-gray-500 focus:outline-none rounded-r-lg'
      />
    </div>
  </div>
);

export default InputField;
