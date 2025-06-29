import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { get, isEmpty, map } from "lodash-es";
import dayjs from "dayjs";

import { Article } from "@/types/articles";

interface Props {
    article: Article;
}

export const Markdown = (props: { article: Article }) => {
    if (isEmpty(props.article)) return null;

    const Tags = get(props.article, "tags", []);
    const content = get(props.article, "content", "");
    return (
        <article className="overflow-hidden">
            {get(props.article, "title") && (
                <header className="p-8 border-b border-gray-200">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {get(props.article, "title")}
                    </h1>

                    {get(props.article, "created_at") && (
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                                <time>
                                    发布于{" "}
                                    {dayjs(
                                        get(props.article, "created_at")
                                    ).format("YYYY年MM月DD日")}
                                </time>
                                {dayjs(
                                    get(props.article, "updated_at")
                                ).isAfter(
                                    dayjs(get(props.article, "created_at"))
                                ) && (
                                    <time>
                                        更新于{" "}
                                        {dayjs(
                                            get(props.article, "updated_at")
                                        ).format("YYYY年MM月DD日")}
                                    </time>
                                )}
                            </div>

                            <div className="flex items-center">
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
                                约 {Math.ceil(content.length / 500)} 分钟阅读
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    {Tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {map(
                                Tags,
                                (tag, index) =>
                                    !isEmpty(tag) && (
                                        <span
                                            key={index}
                                            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    )
                            )}
                        </div>
                    )}
                </header>
            )}

            {/* Article Content */}
            <div className="p-8">
                <div className="prose prose-lg max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // 自定义渲染组件
                            h1: ({ children }) => (
                                <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                                    {children}
                                </h1>
                            ),
                            h2: ({ children }) => (
                                <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                                    {children}
                                </h2>
                            ),
                            h3: ({ children }) => (
                                <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2">
                                    {children}
                                </h3>
                            ),
                            p: ({ children }) => (
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {children}
                                </p>
                            ),
                            code: ({ children, className }) => {
                                const isInline = !className;
                                if (isInline) {
                                    return (
                                        <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm">
                                            {children}
                                        </code>
                                    );
                                }
                                return (
                                    <code
                                        className={`block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto ${className}`}
                                    >
                                        {children}
                                    </code>
                                );
                            },
                            pre: ({ children }) => (
                                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4">
                                    {children}
                                </pre>
                            ),
                            blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
                                    {children}
                                </blockquote>
                            ),
                            ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-4 space-y-1">
                                    {children}
                                </ul>
                            ),
                            ol: ({ children }) => (
                                <ol className="list-decimal list-inside mb-4 space-y-1">
                                    {children}
                                </ol>
                            ),
                            li: ({ children }) => (
                                <li className="text-gray-700">{children}</li>
                            ),
                            a: ({ href, children }) => (
                                <a
                                    href={href}
                                    className="text-blue-600 hover:text-blue-800 underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {children}
                                </a>
                            ),
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </article>
    );
};
