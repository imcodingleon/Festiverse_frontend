interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-card-light rounded-lg border border-card-border shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
