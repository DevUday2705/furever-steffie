import React from "react";

const TextInput = ({
  label,
  placeholder = "Enter text...",
  value,
  onChange,
  type = "text",
  name,
  className = "",
}) => {
  return (
    <div className={`w-full max-w-sm  ${className}`}>
      {label && (
        <label className="block mb-2 text-sm text-slate-600">{label}</label>
      )}
      <input
        className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        type={type}
        name={name}
      />
    </div>
  );
};

export default TextInput;
