// 设置骨架屏
export const ArticleEmpty = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {[...Array(6)].map((_, i) => (
                <div
                    className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
                    key={i}
                >
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="flex gap-1">
                                <div className="h-5 bg-gray-200 rounded-full w-12"></div>
                                <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                            </div>
                        </div>

                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>

                        <div className="space-y-2 mb-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
