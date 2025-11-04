import React from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";

// Helper for displaying success/error messages
const MessageDisplay = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className={`flex items-center p-4 rounded-lg text-sm mb-6 ${
        message.type === "success"
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-red-100 text-red-700 border border-red-300"
      }`}
    >
      {message.type === "success" ? (
        <CheckCircle className='w-5 h-5 mr-3' />
      ) : (
        <AlertTriangle className='w-5 h-5 mr-3' />
      )}
      <p>{message.text}</p>
    </div>
  );
};

export default MessageDisplay;
