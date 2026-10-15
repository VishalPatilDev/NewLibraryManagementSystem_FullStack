const Input = ({ className = "", ...props }) => {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${className}`}
    />
  );
};

export default Input;
