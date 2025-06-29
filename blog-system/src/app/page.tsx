"use client";
import axios from "axios";
import useSWR from "swr";
import { isEmpty, map } from "lodash-es";
import { useSearchParams } from "next/navigation";

import {
    ArticleCard,
    Header,
    Pagination,
    ArticleEmpty,
    Footer,
} from "@/components";
import { Article } from "@/types/articles";
import { PAGE_LIMIT } from "@/utils/constant";

export default function Home() {
    const searchParams = useSearchParams() as any;
    const page = parseInt(searchParams.get("page")) || 1;
    const size = parseInt(searchParams.get("size")) || PAGE_LIMIT;

    const fetcher = (url: string) => axios.get(url).then((res) => res.data);
    const { data, error } = useSWR(
        `/api/articles?page=${page}&limit=${size}`,
        fetcher
    );

    // 文章页渲染
    const articleRender = () => {
        const { articles, pagination } = data || {};

        if (isEmpty(articles) || error) {
            return <ArticleEmpty />;
        }

        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                {map(articles, (article: Article) => (
                    <div key={article.id} className="mb-8 ">
                        <ArticleCard article={article} />
                    </div>
                ))}
                <Pagination totalPages={pagination.totalPages} basePath="/" />
            </div>
        );
    };

    return (
        <div>
            <Header />
            <div className="px-32">{articleRender()}</div>
            <Footer />
        </div>
    );
}
