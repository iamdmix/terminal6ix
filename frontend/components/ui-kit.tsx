"use client"

/* Shared panel + state primitives for the TerminalSix UI. */

import { cn } from "@/lib/utils"

export function Panel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn("panel", className)}>{children}</div>
}

export function PanelHeader({
  label,
  right,
}: {
  label: string
  right?: React.ReactNode
}) {
  return (
    <div className="panel-header">
      <span>{label}</span>
      {right}
    </div>
  )
}

export function Chip({
  children,
  tone = "dim",
  className,
}: {
  children: React.ReactNode
  tone?: "dim" | "amber" | "ok" | "danger" | "info"
  className?: string
}) {
  const tones: Record<string, string> = {
    dim: "border-line text-muted-foreground",
    amber: "border-primary/50 text-primary",
    ok: "border-ok/50 text-ok",
    danger: "border-danger/50 text-danger",
    info: "border-info/50 text-info",
  }
  return <span className={cn("chip", tones[tone], className)}>{children}</span>
}

export function PhaseDot({ phase }: { phase: "upcoming" | "live" | "ended" }) {
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full",
        phase === "live" && "bg-ok animate-pulse",
        phase === "upcoming" && "bg-info",
        phase === "ended" && "bg-faint",
      )}
    />
  )
}

export function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: React.ReactNode
  tone?: "default" | "amber" | "ok"
}) {
  return (
    <div className="border border-line bg-panel px-4 py-3">
      <div className="micro mb-1">{label}</div>
      <div
        className={cn(
          "font-display text-2xl font-semibold",
          tone === "amber" && "text-primary",
          tone === "ok" && "text-ok",
          tone === "default" && "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string
  hint?: string
  action?: React.ReactNode
}) {
  return (
    <div className="border border-dashed border-line bg-panel/50 px-8 py-14 text-center">
      <p className="text-[15px] text-foreground">{title}</p>
      {hint && <p className="mt-1.5 text-[13px] text-muted-foreground">{hint}</p>}
      {action && <div className="mt-6 flex justify-center gap-3">{action}</div>}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-3.5 w-3.5 animate-spin rounded-full border border-line border-t-primary",
        className,
      )}
    />
  )
}

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse bg-panel-2" />
      ))}
    </div>
  )
}
