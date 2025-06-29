import { NextRequest, NextResponse } from "next/server";
import { getArticles, createArticle } from "@/utils/supabase";

// GET /api/common 查询文章列表
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");

        const { data, total } = await getArticles(page, limit);
        return NextResponse.json(
            {
                success: true,
                articles: data,
                pagination: {
                    page,
                    limit,
                    total: total,
                    totalPages: Math.ceil((total || 0) / limit),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching articles:", error);
        return NextResponse.json(
            { success: false, error: "request failed" },
            { status: 500 }
        );
    }
}

// POST /api/articles - 创建新文章
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, content, excerpt, tags, published = false } = body;

        if (!title || !content) {
            return NextResponse.json(
                { success: false, error: "Title and content are required" },
                { status: 400 }
            );
        }

        // 生成slug
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .trim();

        const articleData = {
            title,
            slug,
            content,
            excerpt: excerpt || content.substring(0, 200) + "...",
            tags: tags || [],
            published,
        };

        const article = await createArticle(articleData);

        return NextResponse.json(
            {
                success: true,
                data: article,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating article:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create article" },
            { status: 500 }
        );
    }
}
