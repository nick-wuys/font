import Link from "next/link";
import dayjs from "dayjs";

import { Article } from "@/types/articles";

interface ArticleCardProps {
    article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
    return (
        <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                    <time className="text-sm text-gray-500">
                        {dayjs(new Date(article.created_at)).format(
                            "YYYY年MM月DD"
                        )}
                    </time>
                    {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {article.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                >
                                    {tag}
                                </span>
                            ))}
                            {article.tags.length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                    +{article.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    <Link
                        href={`/articles/${article.id}`}
                        className="hover:text-blue-600 transition-colors"
                    >
                        {article.title}
                    </Link>
                </h2>

                {article.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                        {article.excerpt}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <Link
                        href={`/articles/${article.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                    >
                        阅读更多 →
                    </Link>

                    <div className="flex items-center text-sm text-gray-500">
                        <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        约 {Math.ceil((article.content?.length || 0) / 500)}{" "}
                        分钟阅读
                    </div>
                </div>
            </div>
        </article>
    );
}
