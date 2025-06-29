"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isEmpty } from "lodash-es";
import dayjs from "dayjs";
import axios from "axios";

import { Comment } from "@/types/articles";

interface Props {
    comments: Comment[];
    loading: boolean;
}

export const Comments = (props: Props) => {
    const { id } = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [comments, setComments] = useState(props.comments || null);
    const [formData, setFormData] = useState({
        author_name: "",
        author_email: "",
        content: "",
    });

    useEffect(() => {
        setComments(props.comments || []);
    }, [props.comments]);

    // 提交评论
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await axios.post("/api/comments", {
                article_id: id,
                ...formData,
            });

            setComments([...comments, data.data]);
            setFormData({
                author_name: "",
                author_email: "",
                content: "",
            });
        } catch (error) {
            console.error("Error submitting comment:", error);
        }

        setSubmitting(false);
    };

    // 更新表单数据
    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        // 更新表单数据
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                评论 ({props.comments.length})
            </h3>

            {/* 评论表单 */}
            <form
                onSubmit={handleSubmit}
                className="mb-8 p-6 bg-gray-50 rounded-lg"
            >
                <h4 className="text-lg font-semibold mb-4">发表评论</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label
                            htmlFor="author_name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            姓名 *
                        </label>
                        <input
                            type="text"
                            id="author_name"
                            name="author_name"
                            value={formData.author_name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="author_email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            邮箱 *
                        </label>
                        <input
                            type="email"
                            id="author_email"
                            name="author_email"
                            value={formData.author_email}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="content"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        评论内容 *
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="请输入您的评论..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    {submitting ? "提交中..." : "发表评论"}
                </button>
            </form>
            <CommentRender comments={comments} loading={props.loading} />
        </div>
    );
};

const CommentRender = (props: Props) => {
    if (props.loading) {
        // 评论加载占位
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="animate-pulse p-4 border border-gray-200 rounded-lg"
                    >
                        <div className="flex items-center mb-2">
                            <div className="h-4 bg-gray-200 rounded w-24 mr-4"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (props.comments.length === 0) {
        return (
            <p className="text-gray-500 text-center py-8">
                暂无评论，快来发表第一条评论吧！
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {props.comments.map((comment) => (
                <div
                    key={comment.id}
                    className="p-4 border border-gray-200 rounded-lg"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <span className="font-medium text-gray-900">
                                {comment.author_name}
                            </span>
                            <span className="mx-2 text-gray-300">•</span>
                            <time className="text-sm text-gray-500">
                                {dayjs(new Date(comment.created_at)).format(
                                    "YYYY年MM月DD日 HH:mm"
                                )}
                            </time>
                        </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                    </p>
                </div>
            ))}
        </div>
    );
};

CommentRender.defaultProps = {
    loading: false,
    comments: [],
};
