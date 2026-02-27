/**
 * Dashboard Loading State
 * 
 * Skeleton UI shown while dashboard page is loading.
 */
export default function DashboardLoading() {
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
                <div className="flex items-center gap-[16px] mb-[32px]">
                    <div className="h-[36px] w-[280px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                    <div className="h-[28px] w-[150px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-[32px] mb-[48px]">
                    <div className="bg-white border border-[#E5E7EB] rounded-[4px] h-[120px] p-[24px]">
                        <div className="h-[20px] w-[100px] bg-[#E5E7EB] rounded-sm animate-pulse mb-[16px]" />
                        <div className="h-[32px] w-[60px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded-[4px] h-[120px] p-[24px]">
                        <div className="h-[20px] w-[100px] bg-[#E5E7EB] rounded-sm animate-pulse mb-[16px]" />
                        <div className="h-[32px] w-[60px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                    </div>
                    <div className="bg-white border border-[#E5E7EB] rounded-[4px] h-[120px] p-[24px]">
                        <div className="h-[20px] w-[100px] bg-[#E5E7EB] rounded-sm animate-pulse mb-[16px]" />
                        <div className="h-[32px] w-[60px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mb-[48px]">
                    <div className="h-[56px] w-[280px] bg-[#E5E7EB] rounded-full animate-pulse" />
                </div>

                {/* Table */}
                <div className="bg-white rounded-[4px] border border-[#E5E7EB] p-[24px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-5 gap-[16px] mb-[16px] pb-[16px] border-b border-[#E5E7EB]">
                        <div className="h-[20px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[20px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[20px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[20px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                        <div className="h-[20px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                    </div>
                    
                    {/* Table Rows */}
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="grid grid-cols-5 gap-[16px] h-[72px] items-center border-b border-[#E5E7EB]">
                            <div className="h-[20px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                            <div className="h-[20px] bg-[#E5E7EB] rounded-sm animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
