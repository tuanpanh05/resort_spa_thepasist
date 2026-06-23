import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  User,
  ArrowRight,
  Search,
  Tag,
} from "lucide-react";

import {
  blogPostsList as blogPosts,
  blogCategoriesList as categories,
} from "../mockData";

export default function Blog() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "Tất cả" || post.category === selectedCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Cẩm nang Ngũ Sơn
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 mb-4">
            Bản Tin Sức Khỏe & Chữa Lành
          </h1>
          <p className="text-sage-700 font-normal text-base">
            Khám phá các bài viết chia sẻ về lối sống lành mạnh, phương pháp
            thiền định, thực dưỡng và y học cổ truyền giúp nâng cao chất lượng
            cuộc sống mỗi ngày.
          </p>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-6 border-b border-primary-100">
          {/* Categories Tab list */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all duration-300 ${selectedCategory === cat ? "bg-primary-900 text-white shadow-sm" : "bg-primary-100/50 text-sage-800 hover:bg-primary-100"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sage-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-primary-200/50 rounded-full text-sm text-sage-800 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredPosts.map((post, index) => (
              <article
                key={index}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 border border-primary-100/50 flex flex-col h-full group"
              >
                {/* Image */}
                <div className="h-64 w-full overflow-hidden relative">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 bg-primary-900 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Meta info */}
                    <div className="flex items-center text-xs text-sage-500 space-x-4">
                      <span className="flex items-center">
                        <User className="h-3.5 w-3.5 mr-1" /> {post.author}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" /> {post.date}
                      </span>
                    </div>

                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-sage-900 leading-snug group-hover:text-primary-900 transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-sage-700 text-sm sm:text-base leading-relaxed font-light">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-primary-50 flex items-center">
                    <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-primary-900 hover:text-primary-800 group-hover:translate-x-1 transition-all duration-300">
                      Đọc chi tiết <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-primary-100/50">
            <BookOpen className="mx-auto h-12 w-12 text-sage-400 mb-4" />
            <p className="text-sage-600 font-medium">
              Không tìm thấy bài viết nào phù hợp.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
