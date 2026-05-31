import { cn } from "@/app/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-[var(--color-border)] pb-8">
      <div>
        {eyebrow && (
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-8 brand-gradient-bg" />
            <span className="mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-accent)]">
              {eyebrow}
            </span>
          </div>
        )}
        <h1 className="display-headline text-4xl md:text-5xl text-white">{title}</h1>
        {subtitle && (
          <p className="mt-3 text-sm text-[var(--color-muted)] max-w-2xl leading-relaxed">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary:
      "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] active:bg-[var(--color-accent-dark)] focus:ring-[var(--color-accent)]",
    secondary:
      "bg-[var(--color-surface-2)] text-white border border-[var(--color-border-strong)] hover:bg-[var(--color-border)]",
    ghost:
      "text-[var(--color-muted)] hover:text-white hover:bg-[var(--color-surface-2)]",
    danger:
      "bg-[var(--color-red)]/15 text-[var(--color-red)] border border-[var(--color-red)]/40 hover:bg-[var(--color-red)]/25",
  };
  return (
    <button
      className={cn(
        "mono inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white placeholder:text-[var(--color-muted-2)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white placeholder:text-[var(--color-muted-2)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({
  children,
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mono block text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] mb-1.5",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "green" | "yellow" | "red";
  className?: string;
}) {
  const tones = {
    neutral: "bg-[var(--color-surface-2)] text-[var(--color-muted)] border-[var(--color-border)]",
    accent: "bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/40",
    green: "bg-[var(--color-green)]/15 text-[var(--color-green)] border-[var(--color-green)]/40",
    yellow: "bg-[var(--color-yellow)]/15 text-[var(--color-yellow)] border-[var(--color-yellow)]/40",
    red: "bg-[var(--color-red)]/15 text-[var(--color-red)] border-[var(--color-red)]/40",
  };
  return (
    <span
      className={cn(
        "mono inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] p-10 text-center text-sm text-[var(--color-muted)]">
      {children}
    </div>
  );
}
