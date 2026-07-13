/**
 * Object-Oriented Frontend Models.
 * Demonstrates OOP Abstraction & Encapsulation of property listings data.
 */
export class PropertyListing {
  constructor(raw = {}) {
    this.id = raw._id || raw.id;
    this.title = raw.title || '';
    this.description = raw.description || '';
    this.image = raw.image || null;
    this.price = raw.price || '';
    this.location = raw.location || '';
    this.toemail = raw.toemail || '';
    this.name = raw.name || 'Owner';
    this.phone = raw.phone || '';
    this.impressions = raw.impressions || 0;
    this.sellerId = raw.sellerId || null;
    this.metadata = raw.metadata || {};
  }

  get propertyType() {
    return this.metadata.propertyType || 'PG';
  }

  get occupancyType() {
    return this.metadata.occupancyType || 'single';
  }

  get deposit() {
    return this.metadata.deposit || 'N/A';
  }

  get maintenance() {
    return this.metadata.maintenance || '0';
  }

  get contractDuration() {
    return this.metadata.contractDuration || 'Flexible';
  }

  get electricityIncluded() {
    return Boolean(this.metadata.electricityIncluded);
  }

  get amenities() {
    return Array.isArray(this.metadata.amenities) ? this.metadata.amenities : [];
  }

  get gallery() {
    if (Array.isArray(this.metadata.gallery) && this.metadata.gallery.length > 0) {
      return this.metadata.gallery;
    }
    return this.image ? [this.image] : [];
  }

  get coverIndex() {
    return Number.isInteger(this.metadata.coverIndex) ? this.metadata.coverIndex : 0;
  }
}

/**
 * UserProfile class represents standard and landlord account models.
 * Showcase OOP concept: Encapsulation of account logic.
 */
export class UserProfile {
  constructor(authData = {}) {
    this.token = authData.token || null;
    this.role = authData.role || null; // 'user' (student) or 'seller' (landlord)
    this.name = authData.name || '';
    
    // Check if OTP verified student profile exists
    this.studentProfile = authData.studentProfile || null;
  }

  get isLandlord() {
    return !!this.token && this.role === 'seller';
  }

  get isStudent() {
    return (!!this.studentProfile?.phone && !this.token) || (!!this.token && this.role === 'user');
  }

  get displayName() {
    if (this.isStudent && this.studentProfile) {
      return this.studentProfile.name;
    }
    return this.name || 'Guest User';
  }

  get contactIdentifier() {
    if (this.isStudent && this.studentProfile) {
      return this.studentProfile.phone;
    }
    return this.isLandlord ? 'Landlord account' : 'Guest';
  }

  get hasDetailAccess() {
    return !!this.token || !!this.studentProfile?.phone;
  }
}
