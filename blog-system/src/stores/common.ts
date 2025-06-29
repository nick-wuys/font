"use client";
import { Article } from "@/types/articles";
import { create } from "zustand";

type CommonStore = {
    heroBanner: string[];
    hotArticles: Article[];
};

export const useCommonStore = create<CommonStore>((set) => ({
    heroBanner: [], // 轮播图
    hotArticles: [], // 热门文章
    setHeroBanner: (heroBanner: string[]) => set({ heroBanner }, false),
    setHotArticles: (hotArticles: Article[]) => set({ hotArticles }, false),
}));
