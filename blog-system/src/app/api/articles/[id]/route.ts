import { NextRequest, NextResponse } from "next/server";

import { getArticleById } from "@/utils/supabase";
import { RouteParams } from "@/types/common";

// GET /api/articles/[id] - 获取单个文章
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const article = await getArticleById(params.id);

        return NextResponse.json({
            success: true,
            data: article,
        });
    } catch (error) {
        console.error("Error fetching article:", error);
        return NextResponse.json(
            { success: false, error: "Article not found" },
            { status: 404 }
        );
    }
}
