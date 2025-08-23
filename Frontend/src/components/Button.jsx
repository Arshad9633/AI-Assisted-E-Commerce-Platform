export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={
        'inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 ' +
        'bg-black text-white font-medium tracking-wide hover:bg-gray-900 ' +
        'focus:outline-none focus:ring-2 focus:ring-black/40 disabled:opacity-60 ' +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}
