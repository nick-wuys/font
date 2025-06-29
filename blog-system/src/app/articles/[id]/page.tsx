"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

import { Header, Markdown, Comments, Footer } from "@/components";
import { Article } from "@/types/articles";
import { isEmpty } from "lodash-es";

const ArticleDetail = () => {
    const { id } = useParams();
    const [article, setArticle] = useState<Article | null>(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 查询文章详情页
        axios.get(`/api/articles/${id}`).then(({ data }) => {
            setArticle(data.data);
        });

        // 查询文章评论
        setLoading(true);
        axios
            .get(`/api/comments?articleId=${id}`)
            .then(({ data }) => setComments(data.data))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* 文章内容渲染 */}
                {isEmpty(article) ? (
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                        <Markdown article={article} />
                    </div>
                )}

                {/* 文章评论区渲染 */}
                <Comments comments={comments} loading={loading} />
            </div>
            <Footer />
        </div>
    );
};

export default ArticleDetail;
