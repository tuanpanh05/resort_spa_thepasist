import React, { useState, useEffect } from "react";
import { ChefHat, Heart, Leaf, Calendar, ShieldAlert, CheckCircle, Info, Unlock, Eye, EyeOff } from "lucide-react";
import serviceDining from "../assets/service_dining.png";
import { medicalApi } from "../api";
import { ALLERGY_OPTIONS } from "../constants/options";

const localMenus = [
  {
    category: "Món Khai Vị Thanh Lọc",
    items: [
      {
        name: "Súp Sen Bách Hợp Chùm Ngây",
        desc: "Hạt sen quê tươi ninh nhừ cùng bách hợp và lá chùm ngây bổ dưỡng giúp an thần, ngủ ngon.",
        price: "95.000đ",
        allergens: []
      },
      {
        name: "Gỏi Ngũ Sắc Rong Nho Organic",
        desc: "Rong nho biển tươi giòn phối trộn rau củ hữu cơ rưới sốt chanh leo chua ngọt dịu và lạc rang giòn.",
        price: "120.000đ",
        allergens: ["peanuts"]
      },
      {
        name: "Súp Hải Sản Rong Biển",
        desc: "Hải sản tươi ngon cùng nấm tuyết và rong biển tự nhiên.",
        price: "150.000đ",
        allergens: ["shellfish"]
      }
    ],
  },
  {
    category: "Món Chính Bồi Bổ",
    items: [
      {
        name: "Cơm Gạo Lứt Hoàng Bào Hạt Sen",
        desc: "Cơm gạo lứt đỏ Điện Biên dẻo bùi hấp trong lá sen tươi cùng hạt sen, nấm hương rừng và nước tương đậu nành.",
        price: "165.000đ",
        allergens: ["soy"]
      },
      {
        name: "Lẩu Nấm Nấm Quý Ngũ Sơn",
        desc: "Nước dùng rau củ ninh 12 giờ ngọt thanh cùng các loại nấm tươi hữu cơ quý hiếm kèm đậu hũ non.",
        price: "380.000đ",
        allergens: ["soy"]
      },
      {
        name: "Cá Hồi Nướng Sốt Cam Thảo",
        desc: "Phi lê cá hồi tươi nướng áp chảo dùng kèm sốt cam thảo thanh mát.",
        price: "420.000đ",
        allergens: ["fish"]
      },
      {
        name: "Đậu Hũ Phô Mai Đút Lò",
        desc: "Đậu hũ non kết hợp phô mai organic đút lò thơm béo.",
        price: "310.000đ",
        allergens: ["dairy", "soy"]
      }
    ],
  },
  {
    category: "Nước Uống & Trà Thiền",
    items: [
      {
        name: "Trà Sâm Sen Mật Ong Rừng",
        desc: "Trà sâm Ngũ Sơn hảo hạng hòa quyện mật ong rừng thiên nhiên giải độc, bồi bổ sinh khí.",
        price: "65.000đ",
        allergens: []
      },
      {
        name: "Nước Cỏ Ngọt Nha Đam Ép Lạnh",
        desc: "Nha đam tươi xay nhuyễn cùng lá cỏ ngọt thanh nhiệt cơ thể không chứa đường tinh luyện.",
        price: "50.000đ",
        allergens: []
      },
      {
        name: "Sữa Hạnh Nhân Đậu Nành Organic",
        desc: "Sữa hạnh nhân nguyên chất kết hợp đậu nành organic không đường.",
        price: "85.000đ",
        allergens: ["soy", "treenuts", "dairy"]
      }
    ],
  },
];

export default function Restaurant() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileAllergies, setProfileAllergies] = useState([]);
  const [manualAllergies, setManualAllergies] = useState([]);
  const [filterActive, setFilterActive] = useState(true);
  const [showAllWithWarnings, setShowAllWithWarnings] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      loadHealthProfile();
    }
  }, []);

  const loadHealthProfile = async () => {
    setLoading(true);
    try {
      const profile = await medicalApi.getMyProfile();
      if (profile && profile.explicitConsentSigned && profile.foodAllergies) {
        const parsed = JSON.parse(profile.foodAllergies);
        const selected = parsed.selected || [];
        setProfileAllergies(selected);
        if (selected.length > 0) {
          setFilterActive(true);
        }
      }
    } catch (err) {
      console.log("No health profile found or error fetching it.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualAllergyToggle = (key) => {
    setManualAllergies((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const activeAllergies = Array.from(new Set([...profileAllergies, ...manualAllergies]));

  // Helper to check if a dish contains any active allergens
  const getDishAllergensAlert = (dishAllergens) => {
    if (!dishAllergens) return [];
    return dishAllergens.filter((alg) => activeAllergies.includes(alg));
  };

  return (
    <div className="bg-[#fafbfa] min-h-screen pt-28 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Banner Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold tracking-widest text-primary-900 uppercase bg-primary-200/60 px-3 py-1.5 rounded-full">
            Nhà hàng Ngũ Sơn
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-sage-900 mt-4 mb-4">
            Ẩm Thực Thực Dưỡng - Dưỡng Chất Cho Thân Tâm
          </h1>
          <p className="text-sage-700 font-normal text-base leading-relaxed">
            Mỗi món ăn là một vị thuốc lành. Trải nghiệm ẩm thực thuần khiết chế
            biến từ nguồn rau củ quả sinh thái organic tự trồng trong khuôn viên
            resort, nói không với gia vị hóa học và đường tinh luyện.
          </p>
        </div>

        {/* Philosophy Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-3xl p-6 border border-primary-100/50 shadow-sm text-center space-y-4">
            <div className="inline-flex p-3 bg-primary-100 rounded-2xl text-primary-900">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-sage-900">
              100% Nguyên Liệu Sạch
            </h3>
            <p className="text-sage-700 text-sm font-light leading-relaxed">
              Rau củ hữu cơ được thu hoạch trực tiếp tại vườn sinh thái Ngũ Sơn
              mỗi buổi sáng, đảm bảo độ tươi ngon ngọt tự nhiên tối đa.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-primary-100/50 shadow-sm text-center space-y-4">
            <div className="inline-flex p-3 bg-primary-100 rounded-2xl text-primary-900">
              <ChefHat className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-sage-900">
              Thiết Kế Thực Đơn Riêng
            </h3>
            <p className="text-sage-700 text-sm font-light leading-relaxed">
              Hỗ trợ thiết kế chế độ ăn uống kiêng, ăn chay thực dưỡng hoặc thực
              đơn chuyên biệt theo thể trạng sức khỏe của từng vị khách.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-primary-100/50 shadow-sm text-center space-y-4">
            <div className="inline-flex p-3 bg-primary-100 rounded-2xl text-primary-900">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-sage-900">
              Nói Không Với Hóa Chất
            </h3>
            <p className="text-sage-700 text-sm font-light leading-relaxed">
              Cam kết không sử dụng bột ngọt hóa học, chất bảo quản hay phụ gia
              nhân tạo. Độ ngọt thanh mát 100% tự nhiên từ rau củ và cỏ ngọt.
            </p>
          </div>
        </div>

        {/* Dynamic Allergy Safety Filter Panel */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-primary-100 shadow-sm mb-12 text-left">
          <div className="flex items-center gap-3 border-b border-primary-50 pb-4 mb-4">
            <ShieldAlert className="h-6 w-6 text-primary-900" />
            <div>
              <h3 className="font-serif text-base font-bold text-sage-900">
                Bộ Lọc Thực Đơn An Toàn Dị Ứng (Allergy Safety Panel)
              </h3>
              <p className="text-xs text-sage-500">
                Bảo vệ sức khỏe chủ động theo Nghị định 356/2025/NĐ-CP và nguyên lý ẩm thực chữa lành.
              </p>
            </div>
          </div>

          {/* Load/Auth Status */}
          <div className="mb-6 p-4 rounded-xl bg-primary-50/50 border border-primary-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
            <div className="space-y-1">
              {isLoggedIn ? (
                loading ? (
                  <p className="text-sage-600 animate-pulse">Đang quét hồ sơ dị ứng cá nhân...</p>
                ) : profileAllergies.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4.5 w-4.5 text-green-600 flex-shrink-0" />
                    <span className="text-sage-800 font-semibold">
                      Đã đồng bộ hồ sơ dị ứng thực tế:{" "}
                      <span className="text-primary-900 font-bold bg-white px-2 py-0.5 border border-primary-200/50 rounded">
                        {profileAllergies.map(key => ALLERGY_OPTIONS.find(o => o.key === key)?.label.split(" (")[0]).join(", ")}
                      </span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Info className="h-4.5 w-4.5 text-amber-600 flex-shrink-0" />
                    <span className="text-sage-600">Bạn đã đăng nhập nhưng chưa khai báo dị ứng thực phẩm trong hồ sơ sức khỏe.</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-1.5">
                  <Info className="h-4.5 w-4.5 text-sage-500 flex-shrink-0" />
                  <span className="text-sage-600">
                    Đăng nhập hoặc{" "}
                    <a href="/dang-nhap" className="text-primary-800 underline font-semibold">
                      khai báo sức khỏe
                    </a>{" "}
                    để tự động đồng bộ thực đơn theo cơ địa của bạn.
                  </span>
                </div>
              )}
            </div>

            {/* Filter Toggle Controls */}
            {activeAllergies.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilterActive(!filterActive)}
                  className={`px-4 py-2 rounded-full font-bold flex items-center gap-1.5 transition ${
                    filterActive
                      ? "bg-primary-900 text-white shadow-xs"
                      : "bg-sage-100 text-sage-600 hover:bg-sage-200"
                  } cursor-pointer`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>Bộ lọc: {filterActive ? "Đang bật" : "Đang tắt"}</span>
                </button>

                <button
                  onClick={() => setShowAllWithWarnings(!showAllWithWarnings)}
                  className={`px-4 py-2 rounded-full font-bold flex items-center gap-1.5 transition ${
                    showAllWithWarnings
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-sage-100 text-sage-600 hover:bg-sage-200"
                  } cursor-pointer`}
                >
                  {showAllWithWarnings ? <Eye className="h-4.5 w-4.5" /> : <EyeOff className="h-4.5 w-4.5" />}
                  <span>Chế độ: {showAllWithWarnings ? "Hiện món lỗi + Cảnh báo" : "Ẩn hoàn toàn món lỗi"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Manual Allergy Selector */}
          <div>
            <span className="text-xs font-bold text-sage-700 block mb-2.5">
              Lọc thủ công tác nhân dị ứng (Dành cho khách vãng lai hoặc thử nghiệm):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ALLERGY_OPTIONS.map((opt) => {
                const isProfileAllergy = profileAllergies.includes(opt.key);
                const isSelected = activeAllergies.includes(opt.key);
                return (
                  <button
                    key={opt.key}
                    disabled={isProfileAllergy}
                    onClick={() => handleManualAllergyToggle(opt.key)}
                    className={`p-2.5 border text-xs font-semibold rounded-xl text-center transition flex justify-between items-center ${
                      isProfileAllergy
                        ? "border-green-200 bg-green-50 text-green-800 opacity-90 cursor-not-allowed"
                        : isSelected
                          ? "border-amber-400 bg-amber-50 text-amber-800"
                          : "border-primary-100 bg-white text-sage-650 hover:border-primary-300"
                    } cursor-pointer`}
                  >
                    <span>{opt.label.split(" (")[0]}</span>
                    {isProfileAllergy && <span className="text-[9px] bg-green-200 text-green-950 px-1 rounded-sm">Hồ sơ</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Menu Showcase Card layout */}
        <div className="bg-white rounded-[32px] p-6 sm:p-10 shadow-sm border border-primary-100/50 mb-16">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-sage-900 text-center mb-10">
            Thực Đơn Dinh Dưỡng Theo Mùa
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {localMenus.map((section, idx) => {
              // Filter or process items
              const filteredItems = section.items.map((item) => {
                const triggeredAllergens = getDishAllergensAlert(item.allergens);
                const isUnsafe = triggeredAllergens.length > 0;
                return { ...item, isUnsafe, triggeredAllergens };
              });

              // Decide what to display
              const displayedItems = filteredItems.filter((item) => {
                if (!filterActive) return true; // Show everything if filter is disabled
                if (item.isUnsafe && !showAllWithWarnings) return false; // Hide unsafe items if warnings mode is off
                return true;
              });

              return (
                <div key={idx} className="space-y-6 text-left">
                  <h3 className="font-serif text-xl font-bold text-primary-900 border-b border-primary-100 pb-3">
                    {section.category}
                  </h3>
                  <div className="space-y-6">
                    {displayedItems.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className={`space-y-1.5 p-3 rounded-2xl transition-all duration-300 border ${
                          item.isUnsafe && filterActive
                            ? "bg-red-50/50 border-red-200"
                            : "border-transparent hover:bg-primary-50/20"
                        } group`}
                      >
                        <div className="flex justify-between items-baseline">
                          <h4 className={`font-sans text-sm font-bold transition-colors ${
                            item.isUnsafe && filterActive ? "text-red-950" : "text-sage-900 group-hover:text-primary-800"
                          }`}>
                            {item.name}
                          </h4>
                          <span className="text-xs font-mono text-sage-500 font-bold">{item.price}</span>
                        </div>
                        <p className="text-sage-700 text-xs font-light leading-relaxed">
                          {item.desc}
                        </p>

                        {/* Allergen Warning Box */}
                        {item.isUnsafe && filterActive && (
                          <div className="flex items-center gap-1 text-[10px] text-red-700 bg-red-100/60 p-1.5 rounded-lg font-bold mt-1.5">
                            <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>
                              Cảnh báo dị ứng: Chứa{" "}
                              {item.triggeredAllergens
                                .map((alg) => ALLERGY_OPTIONS.find((o) => o.key === alg)?.label.split(" (")[0])
                                .join(", ")}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {displayedItems.length === 0 && (
                      <p className="text-xs text-sage-400 italic py-6">
                        Tất cả các món ăn trong mục này chứa tác nhân dị ứng của bạn và đã được ẩn đi.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-[#233827] rounded-[32px] p-8 text-center text-white relative overflow-hidden shadow-lg">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url(${serviceDining})` }}
          />
          <div className="relative z-10 max-w-xl mx-auto space-y-6">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              Đặt Bàn & Thiết Kế Thực Đơn
            </h3>
            <p className="text-primary-100/70 text-sm font-light">
              Quý khách có nhu cầu đặt bàn ngắm hoàng hôn ven suối hoặc yêu cầu
              tư vấn thực đơn thực dưỡng cá nhân hóa, vui lòng đăng ký trước 2
              tiếng.
            </p>
            <a
              href="/dat-lich"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-sm font-semibold bg-primary-200 text-sage-950 hover:bg-primary-300 transition-all duration-300 shadow-md hover:scale-105"
            >
              <Calendar className="mr-2 h-4.5 w-4.5 text-sage-950" /> Liên hệ
              đặt bàn ngay
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
