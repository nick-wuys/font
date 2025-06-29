import { createClient } from "@supabase/supabase-js";
import { Article, Comment } from "@/types/articles";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 文章相关API函数
export async function getArticles(page = 1, limit = 10) {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, created_at, tags", {
            count: "exact",
        })
        .eq("published", true)
        .order("created_at", { ascending: false })
        .range(start, end);

    if (error) throw new Error("Failed to fetch articles");
    return { data, total: count };
}

export async function getArticleById(id: string) {
    const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", id)
        .eq("published", true)
        .single();

    if (error) throw new Error("Failed to fetch article");
    return data;
}

export async function createArticle(
    articleData: Omit<Article, "id" | "created_at" | "updated_at">
) {
    const { data, error } = await supabase
        .from("articles")
        .insert([
            {
                ...articleData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ])
        .select()
        .single();

    if (error) throw new Error("Failed to create article");
    return data;
}

// 评论相关
export async function getCommentsByArticleId(articleId: string) {
    const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("article_id", articleId)
        .order("created_at", { ascending: true });

    if (error) throw new Error("Failed to fetch comments");
    return data;
}

export async function createComment(
    commentData: Omit<Comment, "id" | "created_at">
) {
    const { data, error } = await supabase
        .from("comments")
        .insert([
            {
                ...commentData,
                created_at: new Date().toISOString(),
            },
        ])
        .select()
        .single();

    if (error) throw new Error("Failed to create comment");
    return data;
}
