import { API_BASE } from './config.js';

/**
 * APIClient abstracts and encapsulates client network protocols.
 * Showcase OOP concept: Abstraction & Encapsulation of REST API fetch actions.
 */
export class APIClient {
  constructor() {
    this.baseUrl = API_BASE;
  }

  /**
   * Retrieves active authentication token from localStorage.
   */
  get token() {
    return sessionStorage.getItem('token') || null;
  }

  /**
   * Generates headers dynamically, injecting Bearer tokens when available.
   */
  getHeaders(custom = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...custom,
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(options.headers || {});
    const config = {
      ...options,
      headers,
    };

    const res = await fetch(url, config);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }
    if (res.status === 204) return null;
    return await res.json();
  }

  // Auth Operations
  async login(email, password) {
    return await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async googleLogin(email, name) {
    return await this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  }

  async register(name, email, password, role) {
    return await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  }

  async getMe() {
    return await this.request('/api/seller/me');
  }

  // Student OTP Operations
  async sendOtp(phone) {
    return await this.request('/api/student/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  }

  async verifyOtp(phone, otp, name) {
    return await this.request('/api/student/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, name }),
    });
  }

  async getStudentProfile(phone) {
    return await this.request(`/api/student/profile/${encodeURIComponent(phone)}`);
  }

  // Listings Operations
  async getListings() {
    return await this.request('/api/listings');
  }

  async getListing(id) {
    return await this.request(`/api/listings/${id}`);
  }

  async createListing(payload) {
    return await this.request('/api/listings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateListing(id, payload) {
    return await this.request(`/api/seller/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteListing(id, reason, note = '') {
    return await this.request(`/api/seller/listings/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason, note }),
    });
  }

  async getSellerListings() {
    return await this.request('/api/seller/listings');
  }

  async getSellerPerformance() {
    return await this.request('/api/seller/performance');
  }

  async clearAllListings() {
    return await this.request('/api/listings', {
      method: 'DELETE',
    });
  }

  // Bookmarking Operations
  async getBookmarks() {
    return await this.request('/api/bookmarks');
  }

  async addBookmark(listingId) {
    return await this.request('/api/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ listingId }),
    });
  }

  async deleteBookmark(listingId) {
    return await this.request(`/api/bookmarks/${listingId}`, {
      method: 'DELETE',
    });
  }

  async addStudentBookmark(phone, listingId) {
    return await this.request('/api/student/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ phone, listingId }),
    });
  }

  async deleteStudentBookmark(phone, listingId) {
    return await this.request(`/api/student/bookmarks/${encodeURIComponent(phone)}/${listingId}`, {
      method: 'DELETE',
    });
  }
}

// Single instance export (Singleton pattern - System Design)
const api = new APIClient();
export default api;
