type CrossMarksProps = {
  tone?: 'light' | 'dark'
}

const corners = ['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'] as const

// "+" marks on a section's four corners. The parent must be `relative`.
export function CrossMarks({ tone = 'light' }: CrossMarksProps) {
  const colorClass = tone === 'dark' ? 'text-on-dark-secondary' : 'text-cross-mark'
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-3 md:inset-5 ${colorClass}`}
    >
      {corners.map((cornerClass) => (
        <svg
          aria-hidden="true"
          key={cornerClass}
          className={`absolute size-3.5 ${cornerClass}`}
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <path d="M7 0v14M0 7h14" />
        </svg>
      ))}
    </div>
  )
}
