interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div className={`${className} m-auto max-w-4xl bg-slate-200`}>
      {children}
    </div>
  );
}
