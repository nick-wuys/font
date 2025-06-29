"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { PAGE_LIMIT, SHOW_PAGES } from "@/utils/constant";

interface PaginationProps {
    totalPages: number;
    basePath?: string;
}

export function Pagination({ totalPages, basePath = "" }: PaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams() as any;
    const currentPage = parseInt(searchParams.get("page")) || 1;
    const size = parseInt(searchParams.get("size")) || PAGE_LIMIT;

    const handlePageChange = (page: number) => {
        router.replace(`${basePath}?page=${page}&size=${size}`);
    };

    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        let start = Math.max(1, currentPage - Math.floor(SHOW_PAGES / 2));
        const end = Math.min(totalPages, start + SHOW_PAGES - 1);

        // 调整起始位置
        if (end - start + 1 < SHOW_PAGES) {
            start = Math.max(1, end - SHOW_PAGES + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <nav className="flex items-center justify-center space-x-2 mt-8">
            {/* 上一页 */}
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                上一页
            </button>

            {/* 第一页 */}
            {pageNumbers[0] > 1 && (
                <>
                    <button
                        onClick={() => handlePageChange(1)}
                        className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        1
                    </button>
                    {pageNumbers[0] > 2 && (
                        <span className="px-3 py-2 text-sm font-medium text-gray-500">
                            ...
                        </span>
                    )}
                </>
            )}

            {/* 页码 */}
            {pageNumbers.map((page) => (
                <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`cursor-pointer px-3 py-2 text-sm font-medium rounded-md ${
                        page === currentPage
                            ? "text-white bg-blue-600 border border-blue-600"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                >
                    {page}
                </button>
            ))}

            {/* 最后一页 */}
            {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                        <span className="px-3 py-2 text-sm font-medium text-gray-500">
                            ...
                        </span>
                    )}
                    <button
                        onClick={() => handlePageChange(totalPages)}
                        className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            {/* 下一页 */}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="cursor-pointer px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                下一页
            </button>
        </nav>
    );
}
