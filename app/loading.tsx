/**
 * Global Loading Page
 * 
 * Displays loading spinner while pages are being rendered.
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#E5E7EB] border-t-[#0D7377] rounded-full animate-spin" />
        <p className="font-sans text-sm text-[#6B7280]">Loading...</p>
      </div>
    </div>
  )
}
