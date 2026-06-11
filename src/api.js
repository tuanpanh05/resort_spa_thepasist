/**
 * API utility for making authenticated requests to the backend.
 * Base URL: http://localhost:8080/api
 */

const BASE_URL = "http://localhost:8080/api";

/**
 * Returns Authorization header with JWT token from localStorage.
 */
export function getAuthHeaders() {
  const token = localStorage.getItem("token");
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

  createRetreatPackage: (dto) =>
    apiRequest("/admin/retreat-packages", { method: "POST", body: JSON.stringify(dto) }),

  updateRetreatPackage: (id, dto) =>
    apiRequest(`/admin/retreat-packages/${id}`, { method: "PUT", body: JSON.stringify(dto) }),

  deleteRetreatPackage: (id) =>
    apiRequest(`/admin/retreat-packages/${id}`, { method: "DELETE" }),

  // Room Types
  getRoomTypes: () => apiRequest("/room-types"),

  createRoomType: (dto) =>
    apiRequest("/admin/room-types", { method: "POST", body: JSON.stringify(dto) }),

  updateRoomType: (id, dto) =>
    apiRequest(`/admin/room-types/${id}`, { method: "PUT", body: JSON.stringify(dto) }),

  deleteRoomType: (id) =>
    apiRequest(`/admin/room-types/${id}`, { method: "DELETE" }),
};

// ============================================================
// MODULE 5 APIs (Consolidated Checkout & Analytics - UC21-25)
// ============================================================
export const paymentApi = {
  getInvoice: (id) => 
    apiRequest(`/invoices/${id}`),

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
};
