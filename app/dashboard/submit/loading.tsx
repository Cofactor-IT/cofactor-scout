/**
 * Submit Form Loading State
 * 
 * Skeleton UI shown while submission form is loading.
 */
export default function SubmitLoading() {
    return (
        <div className="min-h-screen bg-[#FAFBFC]">
            {/* Navbar Skeleton */}
            <nav className="fixed top-0 left-0 right-0 h-[70px] bg-white border-b border-[#E5E7EB] px-[120px] flex items-center justify-between z-50">
                <div className="h-[30px] w-[150px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                <div className="flex items-center gap-[48px]">
                    <div className="h-[20px] w-[120px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                    <div className="h-[20px] w-[100px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                    <div className="h-[40px] w-[40px] bg-[#E5E7EB] rounded-full animate-pulse" />
                </div>
            </nav>
            
            <div className="px-[120px] pt-[118px]">
                {/* Page Header */}
                <div className="mb-[48px]">
                    <div className="h-[40px] w-[400px] bg-[#E5E7EB] rounded-sm animate-pulse mb-[12px]" />
                    <div className="h-[20px] w-[600px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                </div>

                {/* Progress Stepper */}
                <div className="flex items-center justify-center gap-[32px] mb-[48px]">
                    <div className="flex flex-col items-center gap-[8px]">
                        <div className="w-[48px] h-[48px] rounded-full bg-[#E5E7EB] animate-pulse" />
                        <div className="h-[16px] w-[80px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                    </div>
                    <div className="h-[2px] w-[120px] bg-[#E5E7EB] animate-pulse" />
                    <div className="flex flex-col items-center gap-[8px]">
                        <div className="w-[48px] h-[48px] rounded-full bg-[#E5E7EB] animate-pulse" />
                        <div className="h-[16px] w-[80px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                    </div>
                    <div className="h-[2px] w-[120px] bg-[#E5E7EB] animate-pulse" />
                    <div className="flex flex-col items-center gap-[8px]">
                        <div className="w-[48px] h-[48px] rounded-full bg-[#E5E7EB] animate-pulse" />
                        <div className="h-[16px] w-[80px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[4px] border border-[#E5E7EB] p-[48px] mb-[100px]">
                    <div className="space-y-[24px]">
                        <div className="h-[24px] w-[200px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[48px] w-full bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[48px] w-full bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[120px] w-full bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[48px] w-[60%] bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[48px] w-[80%] bg-[#E5E7EB] rounded-sm animate-pulse" />
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-[120px] py-[16px] flex justify-between">
                    <div className="h-[48px] w-[120px] bg-[#E5E7EB] rounded-full animate-pulse" />
                    <div className="h-[48px] w-[160px] bg-[#E5E7EB] rounded-full animate-pulse" />
                </div>
            </div>
        </div>
    )
}
