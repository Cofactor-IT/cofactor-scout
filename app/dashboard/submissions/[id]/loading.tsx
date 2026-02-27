export default function SubmissionDetailLoading() {
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
            
            <div className="px-[120px] pt-[110px]">
                {/* Page Header */}
                <div className="mb-[32px]">
                    <div className="h-[16px] w-[80px] bg-[#E5E7EB] rounded-sm animate-pulse mb-[16px]" />
                    <div className="flex items-center gap-[16px]">
                        <div className="h-[32px] w-[400px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[28px] w-[120px] bg-[#E5E7EB] rounded-full animate-pulse" />
                    </div>
                </div>

                {/* Two Cards Side by Side */}
                <div className="grid grid-cols-2 gap-[32px] mb-[32px]">
                    <div className="bg-white rounded-[4px] border border-[#E5E7EB] p-[32px]">
                        <div className="space-y-[16px]">
                            <div className="h-[24px] w-[150px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] w-full bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] w-[90%] bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] w-[80%] bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] w-full bg-[#E5E7EB] rounded-sm animate-pulse" />
                        </div>
                    </div>
                    <div className="bg-white rounded-[4px] border border-[#E5E7EB] p-[32px]">
                        <div className="space-y-[16px]">
                            <div className="h-[24px] w-[150px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] w-full bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] w-[85%] bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] w-[75%] bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] w-full bg-[#E5E7EB] rounded-sm animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Comments Card */}
                <div className="bg-white rounded-[4px] border border-[#E5E7EB] p-[32px]">
                    <div className="h-[24px] w-[120px] bg-[#E5E7EB] rounded-sm animate-pulse mb-[24px]" />
                    <div className="h-[120px] w-full bg-[#E5E7EB] rounded-sm animate-pulse mb-[16px]" />
                    <div className="space-y-[16px]">
                        <div className="h-[80px] w-full bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[80px] w-full bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[80px] w-full bg-[#E5E7EB] rounded-sm animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    )
}
