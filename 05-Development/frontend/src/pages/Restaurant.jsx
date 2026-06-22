import React, { useState, useEffect } from "react";
import { ChefHat, Heart, Leaf, Calendar, ExternalLink } from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function Restaurant() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axiosClient.get("/guest/menu?userId=0");
        // Filter out disabled items
        const activeItems = res.data.filter(item => item.enabled !== false && item.isTodayMenu !== false);
        setMenus(activeItems);
      } catch (err) {
        console.error("Failed to fetch menu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Group menus by category/period
  const groupedMenus = {
    "ĐIỂM TÂM SÁNG": menus.filter(m => m.periods?.includes("Breakfast")),
    "TRƯA & TỐI": menus.filter(m => m.periods?.includes("Lunch") || m.periods?.includes("Dinner")),
  };

  return (
    <div className="bg-[#fcfbf9] min-h-screen font-sans">
      
      {/* HERO BANNER - Split Collage Style */}
      <div className="relative w-full h-[60vh] sm:h-[80vh] flex">
        <div className="w-1/3 h-full bg-cover bg-center" style={{ backgroundImage: `url('/images/dishes/dish_pho_bo.png')` }}></div>
        <div className="w-1/3 h-full bg-cover bg-center" style={{ backgroundImage: `url('/images/dishes/dish_steak_wagyu.png')` }}></div>
        <div className="w-1/3 h-full bg-cover bg-center" style={{ backgroundImage: `url('/images/dishes/dish_ca_hoi.png')` }}></div>
        
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center">
          <h1 className="font-serif tracking-[0.2em] text-5xl sm:text-7xl md:text-8xl text-white font-bold mb-4 animate-fade-in drop-shadow-lg">
            NGŨ SƠN
          </h1>
          <p className="text-white text-lg sm:text-2xl tracking-[0.3em] uppercase font-light drop-shadow-md animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Nâng tầm ẩm thực thực dưỡng
          </p>
          <div className="mt-8 border border-white/40 px-8 py-3 text-white/90 text-sm tracking-widest uppercase bg-black/20 backdrop-blur-sm">
            Ngũ Sơn - A Culinary Journey
          </div>
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="py-24 px-6 max-w-5xl mx-auto text-center space-y-12">
        <h2 className="font-serif text-3xl sm:text-4xl tracking-[0.3em] text-[#333] uppercase">
          Ẩm Thực Ngũ Sơn
        </h2>
        <p className="text-[#555] leading-relaxed max-w-3xl mx-auto text-sm sm:text-base font-light">
          Sự tinh tế và đa dạng của ẩm thực thực dưỡng đã tạo nên một bức tranh ẩm thực độc đáo, đầy màu sắc. Ngũ Sơn mang đến sự kết hợp hài hòa giữa các món ăn truyền thống, rau củ hữu cơ tự trồng và kỹ thuật chế biến hiện đại.
          <br /><br />
          Với thực đơn bao gồm các món ăn kinh điển lấy cảm hứng từ thiên nhiên, chúng tôi mong muốn giới thiệu hương vị thuần khiết đến bạn bè quốc tế, để họ có thể cảm nhận trọn vẹn sự tinh túy của nền ẩm thực này.
        </p>

        <div className="pt-12">
          <h2 className="font-serif text-2xl sm:text-3xl tracking-[0.3em] text-[#333] uppercase mb-8">
            Nguyên Liệu Tự Nhiên
          </h2>
          <p className="text-[#555] leading-relaxed max-w-3xl mx-auto text-sm sm:text-base font-light">
            Tại Ngũ Sơn, mọi nguyên liệu đều được đảm bảo nguồn gốc và chất lượng tốt nhất, giúp thực khách có thể cảm nhận được hương vị nguyên bản. Từ các loại rau thơm, gia vị đến các loại hạt, mỗi nguyên liệu đều được tuyển chọn kỹ lưỡng, tạo nên những món ăn không chỉ ngon miệng mà còn đáng nhớ.
          </p>
        </div>
      </div>

      {/* A-LA-CARTE MENU SECTION */}
      <div className="bg-[#f0ece6] py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl sm:text-5xl text-[#5b4d45] tracking-[0.1em] uppercase mb-4">
              Thực Đơn Ngũ Sơn
            </h2>
            <p className="tracking-[0.2em] text-[#7a6b63] text-sm uppercase font-semibold">
              A-La-Carte
            </p>
            <p className="mt-4 text-[#7a6b63] text-sm tracking-widest uppercase">Món ăn đặc trưng</p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-[#5b4d45]">Đang tải thực đơn...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
              
              {Object.entries(groupedMenus).map(([category, items]) => (
                <div key={category} className="bg-white p-8 sm:p-12 shadow-sm border border-[#e6e2db]">
                  <h3 className="font-serif text-2xl text-[#5b4d45] border-b border-[#e6e2db] pb-4 mb-8 tracking-widest">
                    {category}
                  </h3>
                  
                  <div className="space-y-10">
                    {items.map(item => (
                      <div key={item.foodId} className="flex flex-col sm:flex-row gap-6 group">
                        <div className="w-full sm:w-1/3 aspect-[4/3] overflow-hidden bg-[#f8f8f8]">
                          <img 
                            src={item.image} 
                            alt={item.dishName}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => { e.target.src = "/images/dishes/dish_chao_yen_mach.png" }}
                          />
                        </div>
                        <div className="w-full sm:w-2/3 flex flex-col justify-center">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-serif text-lg text-[#333] font-semibold pr-4">
                              {item.dishName}
                            </h4>
                            <span className="font-serif text-[#7a6b63] text-sm italic whitespace-nowrap">
                              {item.price.toLocaleString("vi-VN")} vnd
                            </span>
                          </div>
                          <p className="text-[#888] text-sm font-light leading-relaxed mb-3">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            </div>
          )}
        </div>
      </div>

      {/* Call to action */}
      <div className="py-24 bg-[#ebe6e0] text-center px-6">
        <h3 className="font-serif text-3xl text-[#5b4d45] tracking-widest uppercase mb-10">
          Trải Nghiệm Ngay
        </h3>
        <a
          href="/dat-lich"
          className="inline-block px-12 py-4 bg-[#938173] text-white tracking-[0.2em] uppercase text-sm hover:bg-[#7a6b63] transition-colors duration-300"
        >
          Đặt Bàn Ngay
        </a>
      </div>

    </div>
  );
}
