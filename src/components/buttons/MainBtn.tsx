type PropTypes = {
  name: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export default function MainBtn({
  name,
  className,
  onClick,
  type = "submit",
  disabled = false,
}: PropTypes) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${className ?? ""}
        text-white font-bold text-[18px] leading-[1.6]
        bg-[#4e635a] border-b-4 border-[#8da399]
        hover:bg-[#4e635a]/90 active:translate-y-[1px] active:border-b-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-150 cursor-pointer
        flex items-center justify-center gap-3
        shadow-[0_8px_20px_-6px_rgba(78,99,90,0.35)]
      `}
    >
      {name}
    </button>
  );
}
