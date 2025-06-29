// 数据库类型定义
export interface Article {
    id?: string;
    title: string;
    slug?: string;
    content: string;
    excerpt?: string;
    author_id?: string;
    created_at?: string;
    updated_at?: string;
    published: boolean;
    tags?: string[];
}

export interface Comment {
    id: string;
    article_id: string;
    author_name: string;
    author_email: string;
    content: string;
    created_at: string;
}
