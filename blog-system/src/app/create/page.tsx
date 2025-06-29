"use client";
import React, { useState } from "react";
import axios from "axios";

import { Header, Markdown, Footer } from "@/components";
import { Article } from "@/types/articles";

const ArticleCreate = () => {
    const [formData, setFormData] = useState<Article>({
        title: "",
        content: "",
        tags: [],
        published: false,
    });

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;
        let _value: any = value;
        if (name === "tags") {
            _value = value.split(",");
        }
        if (name === "published") {
            _value = !formData.published; // Toggle published state
        }
        setFormData({
            ...formData,
            [name]: _value,
        });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await axios.post("/api/articles", formData);

            // 文章创建成功 重定向回首页
            window.location.href = "/";
        } catch (error) {
            console.error("Error creating article:", error);
        }
    };

    return (
        <div>
            <Header />

            <div className="max-w-[1440px] mx-auto px-4 py-8 flex">
                <div className="w-1/2">
                    <h1 className=" text-2xl font-bold mb-4">创建文章</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div className="mb-6">
                            <label
                                htmlFor="title"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                文章标题 *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="请输入文章标题"
                            />
                        </div>

                        {/* Tags */}
                        <div className="mb-6">
                            <label
                                htmlFor="tags"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                标签
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={formData.tags?.join(",")}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="请输入标签，多个标签用逗号分隔"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                例如：技术, React, Next.js
                            </p>
                        </div>

                        {/* Content */}
                        <div className="mb-6">
                            <label
                                htmlFor="content"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                文章内容 * (支持 Markdown)
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                required
                                rows={20}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                placeholder="请输入文章内容，支持 Markdown 语法..."
                            />
                        </div>

                        <div className="mb-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="published"
                                    checked={formData.published}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                    立即发布（取消勾选将保存为草稿）
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            发布
                        </button>
                    </form>
                </div>
                <div className="w-1/2 ml-4 border-1 border-gray-200 min-h-full bg-gray-100 rounded-lg">
                    <Markdown article={formData} />
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ArticleCreate;
