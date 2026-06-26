/**
 * API utility for making authenticated requests to the backend.
 * Base URL: http://localhost:8080/api
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

/**
 * Returns Authorization header with JWT token from localStorage.
 */
export function getAuthHeaders() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Generic API request wrapper with auth + error handling.
 */
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Lỗi ${response.status}: ${response.statusText}`);
  }

  return data;
}

// ============================================================
// AUTH APIs (UC01)
// ============================================================
export const authApi = {
  login: (email, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (fullName, email, phone, password) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ fullName, email, phone, password, idPassport: "" }),
    }),

  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email, otpCode) =>
    apiRequest("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otpCode }),
    }),

  resetPassword: (email, otpCode, newPassword) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, otpCode, newPassword }),
    }),

  verifyRegistration: (email, otpCode) =>
    apiRequest("/auth/verify-registration", {
      method: "POST",
      body: JSON.stringify({ email, otpCode }),
    }),

  resendVerification: (email) =>
    apiRequest(`/auth/resend-verification?email=${encodeURIComponent(email)}`, {
      method: "POST",
    }),
};

// ============================================================
// MEDICAL PROFILE APIs (UC02 & UC05)
// ============================================================
export const medicalApi = {
  getMyProfile: () => apiRequest("/medical-profiles/me"),

  saveMyProfile: (physicalCondition, foodAllergies, explicitConsentSigned) =>
    apiRequest("/medical-profiles/me", {
      method: "POST",
      body: JSON.stringify({ physicalCondition, foodAllergies, explicitConsentSigned }),
    }),

  deleteMyProfile: () =>
    apiRequest("/medical-profiles/me", { method: "DELETE" }),
};

// ============================================================
// USER PROFILE APIs (Customer Profile Dashboard)
// ============================================================
export const userApi = {
  /** GET /users/me — Lấy thông tin tài khoản */
  getProfile: () => apiRequest("/users/me"),

  /** PUT /users/me — Cập nhật tên, SĐT, CCCD */
  updateProfile: (dto) =>
    apiRequest("/users/me", {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  /** POST /users/me/change-password — Đổi mật khẩu */
  changePassword: (currentPassword, newPassword) =>
    apiRequest("/users/me/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  /** GET /users/me/bookings — Lịch sử đặt phòng */
  getMyBookings: () => apiRequest("/users/me/bookings"),

  /** GET /users/me/spa-bookings — Lịch hẹn Spa */
  getMySpaBookings: () => apiRequest("/users/me/spa-bookings"),

  /** POST /users/me/sync-calendar — Kích hoạt đồng bộ hóa lịch thủ công */
  syncCalendar: () =>
    apiRequest("/users/me/sync-calendar", {
      method: "POST",
    }),
};


// ============================================================
// ADMIN APIs (UC03)
// ============================================================
export const adminApi = {
  getAllUsers: () => apiRequest("/admin/users"),

  createUser: (userData, role) =>
    apiRequest(`/admin/users?role=${role}`, {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  updateUser: (userId, role, status) =>
    apiRequest(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ role, status }),
    }),

  deleteUser: (userId) =>
    apiRequest(`/admin/users/${userId}`, { method: "DELETE" }),
};

// ============================================================
// MASTER DATA APIs (UC04)
// ============================================================
export const masterDataApi = {
  // Spa Services
  getSpaServices: (adminMode = false) =>
    apiRequest(adminMode ? "/admin/spa-services" : "/spa-services"),

  createSpaService: (dto) =>
    apiRequest("/admin/spa-services", { method: "POST", body: JSON.stringify(dto) }),

  updateSpaService: (id, dto) =>
    apiRequest(`/admin/spa-services/${id}`, { method: "PUT", body: JSON.stringify(dto) }),

  deleteSpaService: (id) =>
    apiRequest(`/admin/spa-services/${id}`, { method: "DELETE" }),

  // Retreat Packages
  getRetreatPackages: (adminMode = false) =>
    apiRequest(adminMode ? "/admin/retreat-packages" : "/retreat-packages"),

  filterRetreatPackages: (params) => {
    const query = Object.keys(params || {})
      .filter(k => params[k] !== undefined && params[k] !== null && params[k] !== "")
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join("&");
    return apiRequest(`/retreat-packages/filter?${query}`);
  },

  createRetreatPackage: (dto) =>
    apiRequest("/admin/retreat-packages", { method: "POST", body: JSON.stringify(dto) }),

  updateRetreatPackage: (id, dto) =>
    apiRequest(`/admin/retreat-packages/${id}`, { method: "PUT", body: JSON.stringify(dto) }),

  deleteRetreatPackage: (id) =>
    apiRequest(`/admin/retreat-packages/${id}`, { method: "DELETE" }),

  // Room Types
  getRoomTypes: (checkIn, checkOut) => {
    let url = "/room-types";
    if (checkIn && checkOut) {
      url += `?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`;
    }
    return apiRequest(url);
  },

  createRoomType: (dto) =>
    apiRequest("/admin/room-types", { method: "POST", body: JSON.stringify(dto) }),

  updateRoomType: (id, dto) =>
    apiRequest(`/admin/room-types/${id}`, { method: "PUT", body: JSON.stringify(dto) }),

  deleteRoomType: (id) =>
    apiRequest(`/admin/room-types/${id}`, { method: "DELETE" }),
};

// ============================================================
// BOOKING APIs (UC07/UC-13)
// ============================================================
export const bookingApi = {
  createBooking: (dto) =>
    apiRequest("/v1/bookings", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};

// ============================================================
// GUEST BOOKING LOOKUP APIs (Public — no auth)
// ============================================================
export const bookingLookupApi = {
  /** POST /bookings/lookup — Tra cứu đặt phòng bằng Email + SĐT */
  lookup: (email, phone) =>
    apiRequest("/bookings/lookup", {
      method: "POST",
      body: JSON.stringify({ email, phone }),
    }),

  /** PUT /bookings/:id/update — Cập nhật thông tin đặt phòng */
  update: (bookingId, dto) =>
    apiRequest(`/bookings/${bookingId}/update`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  /** GET /guest/profile — Lấy thông tin hồ sơ của khách (public) */
  getGuestProfile: (email) =>
    apiRequest(`/guest/profile?email=${encodeURIComponent(email)}`),

  /** GET /bookings/:id/itinerary — Lịch trình khách hàng */
  getItinerary: (bookingId) =>
    apiRequest(`/bookings/${bookingId}/itinerary`),
};


// ============================================================
// STAFF / RECEPTIONIST APIs (UC08, UC09, UC10 — Module 2)
// ============================================================
export const staffApi = {
  /** UC08: GET /v1/check-in/arrivals — Danh sách khách sắp đến */
  getArrivals: () => apiRequest("/v1/check-in/arrivals"),

  /** UC08: POST /v1/check-in — Thực hiện check-in */
  performCheckIn: (dto) =>
    apiRequest("/v1/check-in", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** UC09: GET /v1/villas — Lấy danh sách phòng/villa */
  getVillas: () => apiRequest("/v1/villas"),

  /** POST /v1/villas — Tạo phòng mới */
  createVilla: (dto) =>
    apiRequest("/v1/villas", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** PUT /v1/villas/:id — Cập nhật thông tin phòng */
  updateVilla: (id, dto) =>
    apiRequest(`/v1/villas/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  /** DELETE /v1/villas/:id — Xóa phòng */
  deleteVilla: (id) =>
    apiRequest(`/v1/villas/${id}`, {
      method: "DELETE",
    }),

  /** UC09: PATCH /v1/villas/:id/status — Cập nhật trạng thái phòng */
  updateVillaStatus: (id, status) =>
    apiRequest(`/v1/villas/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  /** UC10: GET /v1/itineraries/:bookingId — Xem lịch trình khách */
  getItinerary: (bookingId) => apiRequest(`/v1/itineraries/${bookingId}`),

  getItineraryByEmail: (email) => apiRequest(`/v1/itineraries/by-email?email=${encodeURIComponent(email)}`),
};

// ============================================================
// MODULE 5 APIs (Consolidated Checkout & Analytics - UC21-25)
// ============================================================
export const paymentApi = {
  getInvoice: (id) => 
    apiRequest(`/invoices/${id}`),

  getAllInvoices: () => 
    apiRequest("/invoices"),

  getInvoicesByUserId: (userId) => 
    apiRequest(`/invoices/user/${userId}`),

  createInvoice: (bookingId) => 
    apiRequest(`/invoices/create?bookingId=${bookingId}`, { method: "POST" }),

  getPaymentUrl: (invoiceId) => 
    apiRequest(`/invoices/${invoiceId}/payment-url`, { method: "POST" }),

  markCashPayment: (invoiceId) => 
    apiRequest(`/invoices/${invoiceId}/cash-payment`, { method: "POST" }),

  verifyVNPayCallback: (params) => {
    const query = Object.keys(params)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join("&");
    return apiRequest(`/invoices/vnpay-callback?${query}`);
  },

  validateCheckout: (bookingId) => 
    apiRequest(`/invoices/booking/${bookingId}/validate-checkout`),

  performCheckout: (invoiceId) => 
    apiRequest(`/invoices/${invoiceId}/perform-checkout`, { method: "POST" }),

  /**
   * UC22-EarlyCheckout: Force-cancels all PENDING/PREPARING F&B orders for the booking,
   * then performs checkout. Use this when guest checks out before scheduled checkout time.
   */
  earlyCheckout: (invoiceId) =>
    apiRequest(`/invoices/${invoiceId}/early-checkout`, { method: "POST" }),

  // Feedback Submission (UC23)
  submitFeedback: (bookingId, userId, rating, comment) => 
    apiRequest("/feedback/submit", {
      method: "POST",
      body: JSON.stringify({ bookingId, userId, rating, comment }),
    }),

  getFeedbackByBooking: (bookingId) => 
    apiRequest(`/feedback/booking/${bookingId}`),

  // Analytics & Dashboard (UC24, UC25)
  getRevenueDashboard: (year, month = null) => {
    let url = `/revenue/dashboard?year=${year}`;
    if (month) url += `&month=${month}`;
    return apiRequest(url);
  },

  getOccupancyReport: (year) => 
    apiRequest(`/revenue/occupancy-report?year=${year}`),

  // Manager Feedback Moderation
  getAllFeedbacks: (includeToxic = false) =>
    apiRequest(`/feedback/all?includeToxic=${includeToxic}`),

  markFeedbackToxic: (feedbackId, isToxic) =>
    apiRequest(`/feedback/${feedbackId}/toxicity?isToxic=${isToxic}`, {
      method: "PATCH",
    }),
};

// ============================================================
// SPA BOOKING & SCHEDULING APIs (Module 3)
// ============================================================
export const spaApi = {
  autoMatch: (spaServiceId, startDatetime) =>
    apiRequest("/v1/spa-bookings/auto-match", {
      method: "POST",
      body: JSON.stringify({ spaServiceId, startDatetime }),
    }),

  schedule: (dto, guestUserId = null) => {
    let url = "/v1/spa-bookings/schedule";
    if (guestUserId) {
      url += `?guestUserId=${guestUserId}`;
    }
    return apiRequest(url, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },
};

export const specialistApi = {
  getTherapistSchedule: (date) =>
    apiRequest(`/v1/spa-bookings/therapist-schedule?date=${date}`),

  getTherapistScheduleRange: (start, end) =>
    apiRequest(`/v1/spa-bookings/therapist-schedule/range?start=${start}&end=${end}`),

  updateStatus: (bookingId, status) =>
    apiRequest(`/v1/spa-bookings/${bookingId}/status?status=${status}`, {
      method: "PATCH",
    }),
};



// ============================================================
// COMPLAINTS / SUPPORT REQUESTS APIs
// ============================================================
export const complaintsApi = {
  submitComplaint: (guestName, roomNumber, content, userId = null) =>
    apiRequest("/complaints/submit", {
      method: "POST",
      body: JSON.stringify({ guestName, roomNumber, content, userId }),
    }),

  getMyComplaints: (userId) =>
    apiRequest(`/complaints/user/${userId}`),

  getAllComplaints: () =>
    apiRequest("/complaints/all"),

  resolveComplaint: (id, feedback) =>
    apiRequest(`/complaints/${id}/resolve`, {
      method: "PUT",
      body: JSON.stringify({ feedback }),
    }),
};

// ============================================================
// SHIFTS & SWAP REQUESTS APIs
// ============================================================
export const shiftApi = {
  getAllShifts: () => apiRequest("/shifts"),
  getAllSwapRequests: () => apiRequest("/shifts/swap-requests"),
  approveSwapRequest: (id) =>
    apiRequest(`/shifts/swap-requests/${id}/approve`, { method: "POST" }),
  rejectSwapRequest: (id) =>
    apiRequest(`/shifts/swap-requests/${id}/reject`, { method: "POST" }),
  updateShiftStatus: (id, status) =>
    apiRequest(`/shifts/${id}/status?status=${status}`, { method: "PATCH" }),
};

// ============================================================
// INVENTORY APIs
// ============================================================
export const inventoryApi = {
  getAllInventory: () => apiRequest("/inventory"),
  createInventoryItem: (dto) =>
    apiRequest("/inventory", {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  updateStock: (id, delta) =>
    apiRequest(`/inventory/${id}/stock?delta=${delta}`, {
      method: "PATCH",
    }),
};

