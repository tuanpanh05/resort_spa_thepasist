import React, { useState, useEffect, useRef } from "react";
import { ChefHat, Heart, Leaf, Calendar, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { ErrorBoundary } from "../components/ErrorBoundary";
import axiosClient from "../api/axiosClient";

export default function Restaurant() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  
  // Touch state
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setCurrentPage((prev) => (prev % 2 !== 0 && window.innerWidth >= 1024 ? prev - 1 : prev));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axiosClient.get("/guest/menu?userId=0");
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

  const breakfast = menus.filter(m => m.periods?.includes("Breakfast"));
  const main = menus.filter(m => m.periods?.includes("Lunch") || m.periods?.includes("Dinner"));

  const chunkArray = (arr, size) => {
    const chunked = [];
    for (let i = 0; i < arr.length; i += size) {
      chunked.push(arr.slice(i, i + size));
    }
    return chunked;
  };

  const ITEMS_PER_PAGE = 4;
  const menuPages = [];
  
  chunkArray(breakfast, ITEMS_PER_PAGE).forEach((chunk, i) => {
    menuPages.push({ title: i === 0 ? "Điểm Tâm Sáng" : "Điểm Tâm Sáng (Tiếp)", items: chunk });
  });

  chunkArray(main, ITEMS_PER_PAGE).forEach((chunk, i) => {
    menuPages.push({ title: i === 0 ? "Trưa & Tối" : "Trưa & Tối (Tiếp)", items: chunk });
  });

  // Construct the realistic book layout
  // Pair 0 (Slide 0): [Empty, Front Cover]
  // Pair 1 (Slide 1): [Inside Cover, Menu Page 1]
  // Pair 2 (Slide 2): [Menu Page 2, Menu Page 3]
  const bookItems = [];
  
  if (isDesktop) {
    bookItems.push({ type: "empty" });
    bookItems.push({ type: "front-cover" });
    bookItems.push({ type: "inside-cover" });
    menuPages.forEach(p => bookItems.push({ type: "page", ...p }));
    if (bookItems.length % 2 !== 0) {
      bookItems.push({ type: "page", title: "Món Ăn Khác", items: [] });
    }
  } else {
    // Mobile just shows Cover then pages
    bookItems.push({ type: "front-cover" });
    menuPages.forEach(p => bookItems.push({ type: "page", ...p }));
  }

  const maxSlide = isDesktop ? Math.floor(bookItems.length / 2) - 1 : bookItems.length - 1;

  const nextPage = () => {
    if (currentPage < maxSlide) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextPage();
    if (diff < -50) prevPage();
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <ErrorBoundary>
      <div className="bg-[#fcfaf5] min-h-screen font-sans">
      
      {/* HERO BANNER - Editorial Style */}
      <div className="relative w-full h-[75vh] flex overflow-hidden">
        <div className="w-1/3 h-full bg-cover bg-center transition-transform duration-1000 hover:scale-105" style={{ backgroundImage: `url('/images/dishes/dish_pho_bo.png')` }}></div>
        <div className="w-1/3 h-full bg-cover bg-center transition-transform duration-1000 hover:scale-105" style={{ backgroundImage: `url('/images/dishes/dish_steak_wagyu.png')` }}></div>
        <div className="w-1/3 h-full bg-cover bg-center transition-transform duration-1000 hover:scale-105" style={{ backgroundImage: `url('/images/dishes/dish_ca_hoi.png')` }}></div>
        
        {/* Seamless Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a140f]/80 via-[#1f382a]/50 to-[#fcfaf5] flex flex-col items-center justify-center text-center px-4">
          
          <div className="border border-white/20 p-8 sm:p-16 backdrop-blur-sm bg-black/10 rounded-sm shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <p className="text-[#e6c17a] text-sm sm:text-base tracking-[0.5em] uppercase font-semibold mb-6 drop-shadow-md">
              A Culinary Journey
            </p>
            <h1 className="font-serif tracking-[0.25em] text-5xl sm:text-7xl md:text-8xl text-white font-bold mb-6 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              NGŨ SƠN
            </h1>
            <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-[#e6c17a] to-transparent mx-auto mb-6"></div>
            <p className="text-white/90 text-lg sm:text-2xl tracking-[0.2em] font-light drop-shadow-md">
              Nâng tầm ẩm thực thực dưỡng
            </p>
          </div>
          
        </div>
      </div>

      {/* Philosophy Section - Magazine Layout */}
      <div className="py-32 px-6 max-w-4xl mx-auto text-center relative">
        <ChefHat className="w-16 h-16 mx-auto text-[#1f382a] opacity-10 mb-10" />
        
        <h2 className="font-serif text-4xl sm:text-5xl tracking-[0.2em] text-[#1f382a] uppercase mb-10 font-bold drop-shadow-sm">
          Ẩm Thực Ngũ Sơn
        </h2>
        <p className="text-[#5b5046] leading-[2.2] text-lg sm:text-xl font-light italic mb-8 px-4 sm:px-12">
          "Sự tinh tế và đa dạng của ẩm thực thực dưỡng đã tạo nên một bức tranh ẩm thực độc đáo, đầy màu sắc. Ngũ Sơn mang đến sự kết hợp hài hòa giữa các món ăn truyền thống, rau củ hữu cơ tự trồng và kỹ thuật chế biến hiện đại."
        </p>
        
        <p className="text-[#7a6b5e] leading-relaxed text-sm sm:text-base font-light px-8 sm:px-20 mb-16">
          Với thực đơn bao gồm các món ăn kinh điển lấy cảm hứng từ thiên nhiên, chúng tôi mong muốn giới thiệu hương vị thuần khiết đến bạn bè quốc tế, để họ có thể cảm nhận trọn vẹn sự tinh túy của nền ẩm thực này.
        </p>

        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#cda250] to-transparent mx-auto mb-20 opacity-70"></div>

        <h2 className="font-serif text-3xl sm:text-4xl tracking-[0.2em] text-[#1f382a] uppercase mb-8 font-semibold">
          Nguyên Liệu Tự Nhiên
        </h2>
        <p className="text-[#5b5046] leading-[2] text-base sm:text-lg font-light px-4 sm:px-16 text-justify" style={{ textAlignLast: 'center' }}>
          Tại Ngũ Sơn, mọi nguyên liệu đều được đảm bảo nguồn gốc và chất lượng tốt nhất, giúp thực khách có thể cảm nhận được hương vị nguyên bản. Từ các loại rau thơm, gia vị đến các loại hạt, mỗi nguyên liệu đều được tuyển chọn kỹ lưỡng, tạo nên những món ăn không chỉ ngon miệng mà còn đáng nhớ.
        </p>
      </div>

      {/* A-LA-CARTE MENU SECTION (MENU BOOK) */}
      <div className="bg-[#fcfaf5] py-24 px-0 sm:px-8 overflow-hidden relative" id="menu">
        {/* Subtle background pattern/texture */}
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#d1cbbd 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="text-center mb-20 px-4">
            <h2 className="font-serif text-4xl sm:text-5xl tracking-[0.15em] uppercase mb-4 text-[#1f382a] drop-shadow-sm font-bold">
              Thực Đơn Ngũ Sơn
            </h2>
            <p className="tracking-[0.3em] text-[#938173] text-sm uppercase font-semibold">
              Tinh Hoa Ẩm Thực Thực Dưỡng
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-[#cda250]">Đang mở sổ thực đơn...</div>
          ) : (
            <div className="relative mx-4 sm:mx-12 lg:mx-16">
              
              {/* Navigation Arrows */}
              <button 
                onClick={prevPage}
                disabled={currentPage === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-8 lg:-translate-x-16 w-10 h-10 sm:w-12 sm:h-12 bg-[#2c2822] border border-[#cda250]/30 rounded-full shadow-lg flex items-center justify-center text-[#cda250] disabled:opacity-0 hover:bg-[#cda250] hover:text-white z-20 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <button 
                onClick={nextPage}
                disabled={currentPage >= maxSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-8 lg:translate-x-16 w-10 h-10 sm:w-12 sm:h-12 bg-[#2c2822] border border-[#cda250]/30 rounded-full shadow-lg flex items-center justify-center text-[#cda250] disabled:opacity-0 hover:bg-[#cda250] hover:text-white z-20 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Book Container */}
              <div 
                className="rounded-2xl overflow-hidden relative shadow-[0_30px_60px_rgba(0,0,0,0.7),0_0_100px_rgba(205,162,80,0.05)] bg-transparent"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Spiral Binding (Gáy Lò Xo - Desktop only) */}
                <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-10 z-30 hidden lg:flex flex-col justify-evenly py-12 pointer-events-none drop-shadow-xl transition-opacity duration-500 ${currentPage === 0 ? 'opacity-0' : 'opacity-100'}`}>
                  {[...Array(14)].map((_, i) => (
                    <div key={i} className="relative w-full h-3">
                      {/* Left Hole */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#111] rounded-full shadow-[inset_1px_1px_3px_rgba(0,0,0,0.8)] z-0"></div>
                      {/* Right Hole */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#111] rounded-full shadow-[inset_1px_1px_3px_rgba(0,0,0,0.8)] z-0"></div>
                      {/* Metal Ring */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-2.5 rounded-full bg-gradient-to-b from-[#e0e0e0] via-[#ffffff] to-[#999999] shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-[#ffffff]/50 z-10"></div>
                    </div>
                  ))}
                </div>

                <div 
                  className="flex transition-transform duration-[1500ms] ease-in-out"
                  style={{ transform: `translateX(calc(-100% * ${currentPage}))` }}
                >
                  {/* Render Slides. On desktop, 1 slide = 2 items. On mobile, 1 slide = 1 item */}
                  {isDesktop ? (
                    // DESKTOP RENDERING (Pairs)
                    Array.from({ length: maxSlide + 1 }).map((_, slideIdx) => {
                      const leftItem = bookItems[slideIdx * 2];
                      const rightItem = bookItems[slideIdx * 2 + 1];
                      
                      return (
                        <div key={slideIdx} className="w-full flex-none flex min-h-[650px]">
                          
                          {rightItem?.type === 'front-cover' ? (
                            /* FULL WIDTH COVER */
                            <div className="w-full relative transition-all duration-300 bg-gradient-to-br from-[#223d2f] via-[#1a3024] to-[#112419] rounded-2xl border-2 border-[#152a1e] shadow-[0_20px_60px_rgba(30,50,40,0.3),inset_0_0_100px_rgba(0,0,0,0.5)]">
                              <div className="w-full h-full p-12 flex flex-col items-center justify-center relative">
                                <div className="absolute inset-8 border-[1px] border-[#e6c17a]/30 rounded-2xl"></div>
                                <div className="absolute inset-10 border-[2px] border-double border-[#e6c17a]/40 rounded-xl"></div>
                                
                                <div className="z-10 flex flex-col items-center">
                                  <ChefHat className="w-20 h-20 text-[#e6c17a] mb-10 opacity-90 drop-shadow-[0_0_15px_rgba(230,193,122,0.4)]" />
                                  <h2 className="font-serif text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#e6c17a] via-[#fff8df] to-[#c59b47] tracking-[0.2em] uppercase mb-8 leading-tight text-center drop-shadow-lg font-bold">
                                    Thực Đơn Ngũ Sơn
                                  </h2>
                                  <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-[#e6c17a] to-transparent my-8"></div>
                                  <p className="tracking-[0.6em] text-[#cbb8a0] text-sm uppercase font-light mt-4">
                                    M E N U &nbsp;&nbsp;&nbsp;&nbsp; B O O K
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* LEFT PAGE */}
                              <div className={`w-1/2 relative transition-all duration-300 ${leftItem?.type === 'empty' ? 'bg-transparent' : leftItem?.type?.includes('cover') ? 'bg-gradient-to-br from-[#223d2f] to-[#112419] rounded-l-2xl border-l border-t border-b border-[#152a1e] shadow-[-10px_0_20px_rgba(0,0,0,0.3)]' : 'bg-[#fdfbf7] shadow-[inset_-20px_0_30px_rgba(0,0,0,0.04)]'}`}>
                                
                                {leftItem?.type === 'inside-cover' && (
                                  <div className="w-full h-full p-12 flex flex-col items-center justify-center opacity-10 border-[12px] border-double border-[#112419] rounded-l-xl">
                                    <ChefHat className="w-40 h-40 text-[#e6c17a]" />
                                  </div>
                                )}
                                
                                {leftItem?.type === 'page' && (
                                  <div className="w-full h-full px-12 py-16 flex flex-col relative">
                                    {/* Page Texture overlay */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
                                    
                                    <h3 className="font-serif text-3xl text-[#3a312a] border-b border-[#e4dfd5] pb-5 mb-10 tracking-[0.2em] text-center uppercase font-bold relative">
                                      {leftItem?.title}
                                      <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-16 h-[3px] bg-[#cda250]"></div>
                                    </h3>
                                    <div className="flex-1 relative z-10">
                                      <div className="grid grid-cols-2 gap-8">
                                        {leftItem?.items?.map((item, itemIdx) => (
                                          <div key={itemIdx} className="group flex flex-col items-center text-center">
                                            <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-[#f0ebe1] mb-4 shadow-[0_8px_15px_rgba(0,0,0,0.1)] border-4 border-white transition-all duration-500 group-hover:shadow-[0_15px_25px_rgba(205,162,80,0.2)] group-hover:-translate-y-2 relative">
                                              <img src={item.image || "/images/dishes/dish_chao_yen_mach.png"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { e.target.src = "/images/dishes/dish_chao_yen_mach.png" }} />
                                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                                            </div>
                                            <h4 className="font-serif text-[15px] text-[#2c2824] font-bold group-hover:text-[#cda250] transition-colors leading-tight line-clamp-1 mb-1">{item.name || item.dishName}</h4>
                                            <div className="font-mono text-[#cda250] text-sm font-semibold tracking-wider">{item.price ? item.price.toLocaleString("vi-VN") : "150.000"} ₫</div>
                                            <p className="text-[#888] text-[11px] font-light leading-relaxed line-clamp-2 mt-2 italic px-2">{item.description}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div className="absolute bottom-8 left-10 text-[#a99985] text-xs font-serif italic">- {slideIdx * 2} -</div>
                                  </div>
                                )}
                              </div>
                              
                              {/* RIGHT PAGE */}
                              <div className={`w-1/2 relative transition-all duration-300 ${rightItem?.type?.includes('cover') ? 'bg-gradient-to-bl from-[#223d2f] to-[#112419] rounded-r-2xl border-r border-t border-b border-[#152a1e] shadow-[10px_0_20px_rgba(0,0,0,0.3)]' : 'bg-[#fdfbf7] shadow-[inset_20px_0_30px_rgba(0,0,0,0.04)]'}`}>
                                
                                {rightItem?.type === 'page' && (
                              <div className="w-full h-full px-12 py-16 flex flex-col relative">
                                {/* Page Texture overlay */}
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
                                
                                <h3 className="font-serif text-3xl text-[#3a312a] border-b border-[#e4dfd5] pb-5 mb-10 tracking-[0.2em] text-center uppercase font-bold relative">
                                  {rightItem?.title}
                                  <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-16 h-[3px] bg-[#cda250]"></div>
                                </h3>
                                <div className="flex-1 relative z-10">
                                  <div className="grid grid-cols-2 gap-8">
                                    {rightItem?.items?.map((item, itemIdx) => (
                                      <div key={itemIdx} className="group flex flex-col items-center text-center">
                                        <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-[#f0ebe1] mb-4 shadow-[0_8px_15px_rgba(0,0,0,0.1)] border-4 border-white transition-all duration-500 group-hover:shadow-[0_15px_25px_rgba(205,162,80,0.2)] group-hover:-translate-y-2 relative">
                                          <img src={item.image || "/images/dishes/dish_chao_yen_mach.png"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={(e) => { e.target.src = "/images/dishes/dish_chao_yen_mach.png" }} />
                                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                                        </div>
                                        <h4 className="font-serif text-[15px] text-[#2c2824] font-bold group-hover:text-[#cda250] transition-colors leading-tight line-clamp-1 mb-1">{item.name || item.dishName}</h4>
                                        <div className="font-mono text-[#cda250] text-sm font-semibold tracking-wider">{item.price ? item.price.toLocaleString("vi-VN") : "150.000"} ₫</div>
                                        <p className="text-[#888] text-[11px] font-light leading-relaxed line-clamp-2 mt-2 italic px-2">{item.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="absolute bottom-8 right-10 text-[#a99985] text-xs font-serif italic">- {slideIdx * 2 + 1} -</div>
                              </div>
                            )}
                          </div>
                          </>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    // MOBILE RENDERING (Single items)
                    bookItems.map((item, idx) => (
                      <div key={idx} className={`w-full flex-none flex flex-col min-h-[600px] relative ${item?.type?.includes('cover') ? 'bg-gradient-to-b from-[#223d2f] to-[#112419] p-8 rounded-xl border border-[#152a1e]' : 'bg-[#fdfbf7] p-6 rounded-xl shadow-lg'}`}>
                        {item?.type === 'front-cover' && (
                          <div className="w-full h-full flex flex-col items-center justify-center relative">
                            <div className="absolute inset-2 border-[1px] border-[#e6c17a]/30 rounded-lg"></div>
                            <div className="z-10 flex flex-col items-center py-20 text-center">
                              <ChefHat className="w-12 h-12 text-[#e6c17a] mb-6 opacity-90 drop-shadow-md" />
                              <h2 className="font-serif text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#e6c17a] via-[#fff8df] to-[#c59b47] tracking-[0.1em] uppercase mb-4 leading-relaxed drop-shadow-md font-bold">
                                Thực Đơn<br/>Ngũ Sơn
                              </h2>
                              <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#e6c17a] to-transparent my-6"></div>
                              <p className="tracking-[0.4em] text-[#cbb8a0] text-xs uppercase font-light">M E N U</p>
                            </div>
                          </div>
                        )}
                        {item?.type === 'page' && (
                          <div className="w-full h-full flex flex-col">
                            <h3 className="font-serif text-2xl text-[#5b4d45] border-b-2 border-dashed border-[#d1cbbd] pb-4 mb-8 tracking-[0.2em] text-center uppercase font-bold">
                              {item?.title}
                            </h3>
                            <div className="flex-1 space-y-6">
                              {item?.items?.map((dish, dishIdx) => (
                                <div key={dishIdx} className="bg-white p-3 shadow-md rounded-sm border border-stone-200">
                                  <div className="aspect-[4/3] w-full overflow-hidden rounded-sm bg-[#f8f8f8] mb-3"><img src={dish.image || "/images/dishes/dish_chao_yen_mach.png"} className="w-full h-full object-cover" onError={(e) => { e.target.src = "/images/dishes/dish_chao_yen_mach.png" }}/></div>
                                  <div className="text-center"><h4 className="font-serif text-[15px] font-bold mb-1">{dish.name || dish.dishName}</h4><div className="font-mono text-[#cda250] text-sm font-semibold">{dish.price ? dish.price.toLocaleString("vi-VN") : "150.000"} ₫</div></div>
                                </div>
                              ))}
                            </div>
                            <div className="absolute bottom-4 right-6 text-[#a99985] text-xs font-serif">- {idx} -</div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Pagination Dots (Mobile Only) */}
              <div className="flex justify-center space-x-2 mt-8 lg:hidden">
                {bookItems.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${currentPage === idx ? 'bg-[#cda250] w-6' : 'bg-[#cda250]/30'}`}
                  />
                ))}
              </div>

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
    </ErrorBoundary>
  );
}
