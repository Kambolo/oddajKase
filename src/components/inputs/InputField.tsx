type InputFieldProps = {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  error?: string;
  hint?: string;
  className?: string;
};

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  hint,
  className,
}: InputFieldProps) {
  const hasError = Boolean(error);

  return (
    <div className={`flex flex-col gap-2 w-full ${className ?? ""}`}>
      <label className="text-[13px] font-bold tracking-[0.14px] text-[#424845]">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`
          w-full bg-white rounded-[48px]
          px-6 py-4 text-base text-[#1b1c1a]
          placeholder:text-[#727875]
          shadow-[0_1px_2px_rgba(0,0,0,0.06)]
          focus:outline-none transition-all
          ${
            hasError
              ? "border-2 border-[#d85a30] focus:ring-2 focus:ring-[#d85a30]/20"
              : "border border-[#e3e2df] focus:border-[#8da399] focus:ring-2 focus:ring-[#8da399]/20"
          }
        `}
      />

      {hasError && (
        <p className="text-xs font-semibold text-[#d85a30] pl-2 leading-snug">
          {error}
        </p>
      )}

      {!hasError && hint && (
        <p className="text-xs font-medium text-[#a8b5b0] pl-2">{hint}</p>
      )}
    </div>
  );
}
