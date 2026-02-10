'use client'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                    Dashboard Error
                </h2>
                <p className="text-gray-600 mb-4">
                    {error.message || 'Failed to load dashboard data. Please try again.'}
                </p>
                <button
                    onClick={reset}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        </div>
    )
}
