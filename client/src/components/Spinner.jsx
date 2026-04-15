/**
 * Reusable loading spinner component.
 * @param {{ className?: string }} props
 */
export default function Spinner({ className = 'min-h-[50vh]' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-primary" />
    </div>
  );
}
