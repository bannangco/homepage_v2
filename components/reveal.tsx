type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export default function Reveal({
  children,
  className = "",
}: RevealProps) {
  return <div className={className}>{children}</div>;
}
