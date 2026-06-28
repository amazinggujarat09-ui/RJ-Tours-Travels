import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
});

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);
}

function formatDate(value) {
  if (!value) return 'Flexible';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function starLabel(rating) {
  if (!rating) return 'New';
  return `${Number(rating).toFixed(1)} / 5`;
}

function getErrorMessage(error, defaultMsg) {
  const detail = error?.response?.data?.detail;
  if (!detail) return defaultMsg;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(err => {
      const locStr = err.loc ? err.loc.filter(l => l !== 'body').join('.') : '';
      return `${locStr ? locStr + ': ' : ''}${err.msg}`;
    }).join(', ');
  }
  return JSON.stringify(detail);
}

const flightsData = [
  { id: 'F1', airline: 'IndiGo', logo: '✈️', number: '6E-2045', from: 'Delhi (DEL)', to: 'Goa (GOI)', dep: '06:00 AM', arr: '08:30 AM', duration: '2h 30m', price: 6715, type: 'Non-stop' },
  { id: 'F2', airline: 'Air India', logo: '✈️', number: 'AI-803', from: 'Delhi (DEL)', to: 'Kochi (COK)', dep: '09:15 AM', arr: '12:20 PM', duration: '3h 05m', price: 9775, type: 'Non-stop' },
  { id: 'F3', airline: 'Vistara', logo: '✈️', number: 'UK-981', from: 'Mumbai (BOM)', to: 'Goa (GOI)', dep: '11:30 AM', arr: '12:40 PM', duration: '1h 10m', price: 7225, type: 'Non-stop' },
  { id: 'F4', airline: 'Akasa Air', logo: '✈️', number: 'QP-1102', from: 'Delhi (DEL)', to: 'Agra (AGR)', dep: '02:00 PM', arr: '02:50 PM', duration: '0h 50m', price: 3825, type: 'Non-stop' },
  { id: 'F5', airline: 'IndiGo', logo: '✈️', number: '6E-512', from: 'Mumbai (BOM)', to: 'Delhi (DEL)', dep: '04:15 PM', arr: '06:30 PM', duration: '2h 15m', price: 5525, type: 'Non-stop' }
];

const hotelsData = [
  { id: 'H1', name: 'Taj Palace Agra', location: 'Agra, Uttar Pradesh', rating: 4.9, reviews: 1420, price: 15300, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80', amenity: 'Taj View Pool & Spa' },
  { id: 'H2', name: 'Munnar Tea Valley Resort', location: 'Munnar, Kerala', rating: 4.8, reviews: 850, price: 10200, image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', amenity: 'Infinity Mountain Pool' },
  { id: 'H3', name: 'Calangute Beach Retreat', location: 'Calangute, Goa', rating: 4.7, reviews: 1120, price: 8075, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80', amenity: 'Private Beach Access' },
  { id: 'H4', name: 'The Pink City Palace', location: 'Jaipur, Rajasthan', rating: 4.9, reviews: 620, price: 17850, image: 'https://images.unsplash.com/photo-1585983224974-084a8e065e76?auto=format&fit=crop&w=600&q=80', amenity: 'Royal Dining Experience' },
  { id: 'H5', name: 'Manali Snow View Lodge', location: 'Manali, Himachal Pradesh', rating: 4.6, reviews: 430, price: 6800, image: 'https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=600&q=80', amenity: 'Heated Rooms & Fireplace' }
];

const localToursData = [
  { id: 'T1', name: 'Taj Mahal Sunrise Guided Walk', location: 'Agra, Uttar Pradesh', rating: 4.9, price: 2125, duration: '4 Hours', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80', category: 'Culture' },
  { id: 'T2', name: 'Alleppey Backwaters Canoe Tour', location: 'Alleppey, Kerala', rating: 4.8, price: 2975, duration: '6 Hours', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80', category: 'Family' },
  { id: 'T3', name: 'Goa Scuba Diving & Watersports', location: 'Calangute, Goa', rating: 4.7, price: 4675, duration: '1 Day', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80', category: 'Adventure' },
  { id: 'T4', name: 'Jaipur Forts Tuk-Tuk Safari', location: 'Jaipur, Rajasthan', rating: 4.9, price: 1700, duration: '5 Hours', image: 'https://images.unsplash.com/photo-1477584322813-ac804b4c730e?auto=format&fit=crop&w=600&q=80', category: 'Culture' },
  { id: 'T5', name: 'Solang Valley Paragliding Experience', location: 'Manali, Himachal Pradesh', rating: 4.8, price: 3400, duration: '2 Hours', image: 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=600&q=80', category: 'Adventure' }
];

function App() {
  const [packages, setPackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packagesError, setPackagesError] = useState('');
  const [search, setSearch] = useState('');
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('All');
  const [activePackageId, setActivePackageId] = useState(null);
  const [activePackageDetail, setActivePackageDetail] = useState(null);
  const [activeReviews, setActiveReviews] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('travelease_token') || '');
  const [me, setMe] = useState(null);
  const [message, setMessage] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [exploreAsGuest, setExploreAsGuest] = useState(false);
  const [loginEmail, setLoginEmail] = useState('demo@rjtravels.com');
  const [loginPassword, setLoginPassword] = useState('Demo@12345');

  const [activeTab, setActiveTab] = useState('Packages');
  const [flightFrom, setFlightFrom] = useState('Delhi (DEL)');
  const [flightTo, setFlightTo] = useState('Goa (GOI)');
  const [flightDate, setFlightDate] = useState('2026-06-25');
  const [flightClass, setFlightClass] = useState('Economy');
  
  const [hotelDest, setHotelDest] = useState('Goa');
  const [hotelCheckIn, setHotelCheckIn] = useState('2026-06-25');
  const [hotelCheckOut, setHotelCheckOut] = useState('2026-06-28');
  const [hotelGuests, setHotelGuests] = useState('2 Guests');

  const [tourDest, setTourDest] = useState('Manali');
  const [tourSearch, setTourSearch] = useState('');
  const [tourCategory, setTourCategory] = useState('All');

  const [dynamicBookingSuccess, setDynamicBookingSuccess] = useState('');

  // DB Inspector States
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTable, setInspectorTable] = useState('users');
  const [inspectorData, setInspectorData] = useState([]);
  const [inspectorLoading, setInspectorLoading] = useState(false);
  const [inspectorError, setInspectorError] = useState('');

  // Load packages initially
  useEffect(() => {
    let active = true;

    async function loadPackages() {
      try {
        setLoadingPackages(true);
        const response = await api.get('/packages');
        if (!active) return;
        setPackages(response.data);
        setPackagesError('');
      } catch (error) {
        if (active) {
          setPackagesError('Could not load tour packages from the backend.');
        }
      } finally {
        if (active) {
          setLoadingPackages(false);
        }
      }
    }

    loadPackages();
    return () => {
      active = false;
    };
  }, []);

  // Default active package
  useEffect(() => {
    if (!activePackageId && packages.length > 0) {
      setActivePackageId(packages[0].package_id);
    }
  }, [activePackageId, packages]);

  // Handle Token and Current User loading
  useEffect(() => {
    if (!token) {
      setMe(null);
      delete api.defaults.headers.common.Authorization;
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    api
      .get('/auth/me')
      .then((response) => setMe(response.data))
      .catch(() => {
        setMe(null);
        localStorage.removeItem('travelease_token');
        setToken('');
      });
  }, [token]);

  // Load active package details and reviews
  useEffect(() => {
    if (!activePackageId) return;

    let active = true;

    async function loadPackageDetail() {
      try {
        setDetailLoading(true);
        setDetailError('');
        const reviewsResponse = await api.get(`/reviews/package/${activePackageId}`);
        if (!active) return;
        setActiveReviews(reviewsResponse.data);

        if (token) {
          const detailResponse = await api.get(`/packages/${activePackageId}`);
          if (!active) return;
          setActivePackageDetail(detailResponse.data);
        } else {
          setActivePackageDetail(null);
        }
      } catch (error) {
        if (active) {
          setDetailError('Sign in to view availability, wishlist actions, and make bookings.');
          setActivePackageDetail(null);
        }
      } finally {
        if (active) {
          setDetailLoading(false);
        }
      }
    }

    loadPackageDetail();
    return () => {
      active = false;
    };
  }, [activePackageId, token]);

  // Load Inspector Data
  const loadInspectorData = async (tableName) => {
    if (!me || me.role !== 'admin') {
      setInspectorData([]);
      setInspectorError('Please log in as an administrator to query this table.');
      return;
    }
    try {
      setInspectorLoading(true);
      setInspectorError('');
      const response = await api.get(`/admin/tables/${tableName}`);
      setInspectorData(response.data);
    } catch (err) {
      setInspectorError('Failed to fetch table records.');
    } finally {
      setInspectorLoading(false);
    }
  };

  useEffect(() => {
    if (inspectorOpen && me?.role === 'admin') {
      loadInspectorData(inspectorTable);
    }
  }, [inspectorOpen, inspectorTable, me]);

  const featuredPackages = useMemo(() => packages.filter((item) => item.featured), [packages]);

  const filteredFlights = useMemo(() => {
    const fromQuery = flightFrom.trim().toLowerCase();
    const toQuery = flightTo.trim().toLowerCase();
    return flightsData.filter((item) => {
      const matchesFrom = !fromQuery || item.from.toLowerCase().includes(fromQuery);
      const matchesTo = !toQuery || item.to.toLowerCase().includes(toQuery);
      return matchesFrom && matchesTo;
    });
  }, [flightFrom, flightTo]);

  const filteredHotels = useMemo(() => {
    const destQuery = hotelDest.trim().toLowerCase();
    return hotelsData.filter((item) => {
      const matchesDest = !destQuery || item.location.toLowerCase().includes(destQuery) || item.name.toLowerCase().includes(destQuery);
      return matchesDest;
    });
  }, [hotelDest]);

  const filteredTours = useMemo(() => {
    const destQuery = tourDest.trim().toLowerCase();
    const searchVal = tourSearch.trim().toLowerCase();
    return localToursData.filter((item) => {
      const matchesDest = !destQuery || item.location.toLowerCase().includes(destQuery);
      const matchesSearch = !searchVal || item.name.toLowerCase().includes(searchVal);
      const matchesCategory = tourCategory === 'All' || item.category === tourCategory;
      return matchesDest && matchesSearch && matchesCategory;
    });
  }, [tourDest, tourSearch, tourCategory]);
  
  const visiblePackages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedDestination = destination.trim().toLowerCase();

    return packages.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        [item.title, item.destination, item.description, item.category]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesDestination = !normalizedDestination || item.destination.toLowerCase().includes(normalizedDestination);
      const matchesCategory = category === 'All' || item.category === category;
      return matchesSearch && matchesDestination && matchesCategory;
    });
  }, [packages, search, destination, category]);

  const selectedPackage = useMemo(() => {
    return packages.find((item) => item.package_id === activePackageId) || null;
  }, [packages, activePackageId]);

  const heroImage = selectedPackage?.image_url || featuredPackages[0]?.image_url || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=80';

  async function handleLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await api.post('/auth/login', payload);
      localStorage.setItem('travelease_token', response.data.access_token);
      setToken(response.data.access_token);
      setAuthMessage('Signed in successfully.');
      setExploreAsGuest(false);
      form.reset();
    } catch (error) {
      setAuthMessage(getErrorMessage(error, 'Login failed.'));
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    if (!payload.phone) {
      delete payload.phone;
    }

    try {
      await api.post('/auth/register', payload);
      setAuthMessage('Registration successful! Please sign in with your email.');
      setAuthMode('login');
      setLoginEmail(payload.email);
      setLoginPassword('');
      form.reset();
    } catch (error) {
      setAuthMessage(getErrorMessage(error, 'Registration failed.'));
    }
  }

  async function handleAutoAdminLogin() {
    try {
      setLoginEmail('admin089@gmail.com');
      setLoginPassword('admin089');
      const response = await api.post('/auth/login', {
        email: 'admin089@gmail.com',
        password: 'admin089'
      });
      localStorage.setItem('travelease_token', response.data.access_token);
      setToken(response.data.access_token);
      setAuthMessage('Signed in as RJ Travels Admin.');
      setExploreAsGuest(false);
    } catch (error) {
      setAuthMessage('Auto-login failed.');
    }
  }

  function handleLogout() {
    localStorage.removeItem('travelease_token');
    setToken('');
    setMe(null);
    setActivePackageDetail(null);
    setExploreAsGuest(false);
    setAuthMessage('');
    setLoginEmail('demo@rjtravels.com');
    setLoginPassword('Demo@12345');
  }

  async function toggleWishlist() {
    if (!selectedPackage) return;

    try {
      if (activePackageDetail?.wishlist) {
        await api.delete(`/wishlist/${selectedPackage.package_id}`);
        setMessage('Removed from wishlist.');
      } else {
        await api.post('/wishlist', { package_id: selectedPackage.package_id });
        setMessage('Saved to wishlist.');
      }

      const refreshed = await api.get(`/packages/${selectedPackage.package_id}`);
      setActivePackageDetail(refreshed.data);
      if (inspectorOpen && inspectorTable === 'wishlist') {
        loadInspectorData('wishlist');
      }
    } catch (error) {
      setMessage(error?.response?.data?.detail || 'Wishlist action failed.');
    }
  }

  async function handleBooking(event) {
    event.preventDefault();
    if (!selectedPackage) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      await api.post('/bookings', {
        package_id: selectedPackage.package_id,
        number_of_people: Number(payload.number_of_people),
      });
      setBookingMessage('Trip successfully booked! Seat count has been updated.');
      form.reset();

      // Refresh packages to update available seats
      const refreshedPackages = await api.get('/packages');
      setPackages(refreshedPackages.data);
      const refreshedDetail = await api.get(`/packages/${selectedPackage.package_id}`);
      setActivePackageDetail(refreshedDetail.data);

      if (inspectorOpen) {
        loadInspectorData('bookings');
        loadInspectorData('tour_packages');
      }
    } catch (error) {
      setBookingMessage(getErrorMessage(error, 'Booking could not be created.'));
    }
  }

  async function handleReview(event) {
    event.preventDefault();
    if (!selectedPackage) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      await api.post('/reviews', {
        package_id: selectedPackage.package_id,
        rating: Number(payload.rating),
        review_text: payload.review_text,
      });
      const reviewsResponse = await api.get(`/reviews/package/${selectedPackage.package_id}`);
      setActiveReviews(reviewsResponse.data);
      setReviewMessage('Review posted successfully!');
      form.reset();

      // Refresh packages to update rating averages
      const refreshedPackages = await api.get('/packages');
      setPackages(refreshedPackages.data);

      if (inspectorOpen) {
        loadInspectorData('reviews');
        loadInspectorData('tour_packages');
      }
    } catch (error) {
      setReviewMessage(getErrorMessage(error, 'Review could not be posted.'));
    }
  }

  async function handleContact(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      await api.post('/contacts', payload);
      setContactMessage('Message sent successfully. We will be in touch!');
      form.reset();
      if (inspectorOpen && inspectorTable === 'contacts') {
        loadInspectorData('contacts');
      }
    } catch (error) {
      setContactMessage(getErrorMessage(error, 'Could not send your message.'));
    }
  }

  const benefits = [
    {
      title: 'Best Price Guarantee',
      description: 'We ensure you get the best deals always, backed by values in our tour_packages table.',
      icon: '💎'
    },
    {
      title: '24/7 Customer Support',
      description: 'Submit message queries directly to the contacts table for responsive traveler support.',
      icon: '📞'
    },
    {
      title: 'Secure Bookings',
      description: 'Real-time bookings linked to users and packages, with available seats auto-decremented.',
      icon: '🛡️'
    },
    {
      title: 'Handpicked Experiences',
      description: 'Sought-after destinations and escapes reviewed and wishlist-saved by real travelers.',
      icon: '🌟'
    },
  ];

  // STARTUP LOGIN/GATEWAY RENDERING
  if (!token && !exploreAsGuest) {
    return (
      <div className="gateway-overlay">
        <div 
          className="gateway-left-panel" 
          style={{ 
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.45)), url('https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80')` 
          }}
        >
          <div className="gateway-brand">
            <div className="brand-logo-circle">
              <span className="brand-plane-icon">RJ</span>
            </div>
            <div>
              <p className="brand-name">RJ Travels</p>
              <p className="brand-tag">TOURS & TRAVEL</p>
            </div>
          </div>
          <div className="gateway-promo-text">
            <h2>Experience the Wonders of India</h2>
            <p>
              Discover majestic palaces, tranquil backwaters, golden sand beaches, and snow-capped valleys. Sign in or register to book your next heritage tour.
            </p>
          </div>
          <div className="gateway-visual-footer">
            <p>📍 Taj Mahal, Agra, India</p>
          </div>
        </div>

        <div className="gateway-right-panel">
          <div className="gateway-form-container glass-panel">
            <div className="auth-tabs">
              <button 
                type="button" 
                className={authMode === 'login' ? 'auth-tab active' : 'auth-tab'} 
                onClick={() => setAuthMode('login')}
              >
                Sign In
              </button>
              <button 
                type="button" 
                className={authMode === 'register' ? 'auth-tab active' : 'auth-tab'} 
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="stack-form">
                <h3>Welcome back</h3>
                <p className="auth-subtitle-desc">Enter your credentials to access bookings and wishlists.</p>
                <label>
                  <span>Email Address:</span>
                  <input name="email" type="email" placeholder="demo@rjtravels.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                </label>
                <label>
                  <span>Password:</span>
                  <input name="password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                </label>
                <button type="submit" className="primary-button auth-submit-btn">
                  Sign In to Account
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="stack-form">
                <h3>Create an account</h3>
                <p className="auth-subtitle-desc">Start your Indian travel journey today. Accounts are stored directly in the database.</p>
                <label>
                  <span>Full Name:</span>
                  <input name="full_name" placeholder="John Doe" required />
                </label>
                <label>
                  <span>Email Address:</span>
                  <input name="email" type="email" placeholder="john.doe@example.com" required />
                </label>
                <label>
                  <span>Phone Number:</span>
                  <input name="phone" placeholder="+91 98765 43210" />
                </label>
                <label>
                  <span>Password:</span>
                  <input name="password" type="password" placeholder="Min. 8 characters" required />
                </label>
                <button type="submit" className="primary-button auth-submit-btn">
                  Register Traveler
                </button>
              </form>
            )}

            {authMessage && <p className="auth-feedback-msg">{authMessage}</p>}

            <div className="gateway-actions-row">
              <button type="button" className="gateway-bypass-btn" onClick={() => setExploreAsGuest(true)}>
                Explore as Guest ➔
              </button>
              <button type="button" className="gateway-admin-auto-btn" onClick={handleAutoAdminLogin}>
                🔑 Login as Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MAIN RJ TRAVELS APPLICATION DASHBOARD
  return (
    <div className="app-shell">
      {/* HEADER NAVBAR */}
      <header className="topbar glass-panel">
        <div className="brand-lockup">
          <div className="brand-logo-circle">
            <span className="brand-plane-icon">RJ</span>
          </div>
          <div>
            <p className="brand-name">RJ Travels</p>
            <p className="brand-tag">TOURS & TRAVEL</p>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#hero">Home</a>
          <a href="#destinations">Destinations</a>
          <a href="#packages">Tours</a>
          <a href="#inspector-section" onClick={() => setInspectorOpen(true)}>Database Inspector</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="topbar-actions">
          <div className="support-pill">
            <span>Need Help?</span>
            <strong>+1 234 567 8900</strong>
          </div>
          
          {me ? (
            <div className="auth-profile-wrap">
              <div className="profile-badge">
                <span className="profile-avatar-char">{me.full_name.charAt(0).toUpperCase()}</span>
                <span className="profile-name-text">{me.full_name.split(' ')[0]}</span>
              </div>
              <button type="button" className="signout-mini-btn" onClick={handleLogout}>Sign Out</button>
            </div>
          ) : (
            <button type="button" className="login-pill-btn" onClick={() => { setExploreAsGuest(false); setAuthMode('login'); }}>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      <main className="page-grid">
        {/* HERO SECTION */}
        <section id="hero" className="hero-section glass-panel">
          <div className="hero-copy-wrap">
            <div className="hero-tagline-wrap">
              <span className="hero-tagline-icon">✦</span>
              <span className="hero-tagline-text">Explore. Dream. Discover.</span>
            </div>
            <h1>
              Discover Amazing
              <span className="script-accent">Places with Us</span>
            </h1>
            <p className="hero-text">
              Find the best tours, hotels, and flights: everything you need for the perfect trip, built directly on top of your relational database tables.
            </p>

            <div className="hero-actions">
              <a href="#packages" className="primary-button">
                Explore Now <span className="arrow-icon">→</span>
              </a>
            </div>
          </div>

          <div className="hero-visual-container">
            <div className="hero-visual" style={{ backgroundImage: `linear-gradient(to bottom, rgba(8, 16, 31, 0.05), rgba(8, 16, 31, 0.4)), url(${heroImage})` }}>
              <div className="hero-floating-card glass-card">
                <span className="mini-label">★ Popular Escape</span>
                <strong>{selectedPackage?.title || 'Featured Escapes'}</strong>
                <p className="floating-dest">{selectedPackage?.destination || 'Browse package details below'}</p>
                <div className="floating-meta">
                  <span className="floating-price">{selectedPackage ? formatCurrency(selectedPackage.price) : `From ${formatCurrency(599)}`}</span>
                  <span className="floating-duration">{selectedPackage ? `${selectedPackage.duration_days} Days` : '7 Days'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH WIDGET PANEL */}
        <section className="search-panel glass-panel">
          <div className="search-tabs">
            {['Flights', 'Hotels', 'Tours', 'Packages'].map((item) => (
              <button 
                key={item} 
                type="button" 
                className={activeTab === item ? 'tab active' : 'tab'}
                onClick={() => {
                  setActiveTab(item);
                  setDynamicBookingSuccess('');
                }}
              >
                {item === 'Flights' && '✈ '}
                {item === 'Hotels' && '🏨 '}
                {item === 'Tours' && '🎒 '}
                {item === 'Packages' && '📦 '}
                {item}
              </button>
            ))}
          </div>

          <div className="search-grid">
            {activeTab === 'Flights' && (
              <>
                <label className="search-field">
                  <span className="field-title">From</span>
                  <div className="input-with-icon">
                    <span className="field-icon">🛫</span>
                    <input value={flightFrom} onChange={(event) => setFlightFrom(event.target.value)} placeholder="Origin (e.g. Delhi DEL)" />
                  </div>
                </label>
                <label className="search-field">
                  <span className="field-title">To</span>
                  <div className="input-with-icon">
                    <span className="field-icon">🛬</span>
                    <input value={flightTo} onChange={(event) => setFlightTo(event.target.value)} placeholder="Destination (e.g. Goa GOI)" />
                  </div>
                </label>
                <label className="search-field">
                  <span className="field-title">Departure Date</span>
                  <div className="input-with-icon">
                    <span className="field-icon">📅</span>
                    <input type="date" value={flightDate} onChange={(event) => setFlightDate(event.target.value)} />
                  </div>
                </label>
                <label className="search-field">
                  <span className="field-title">Travel Class</span>
                  <div className="input-with-icon">
                    <span className="field-icon">💺</span>
                    <select value={flightClass} onChange={(event) => setFlightClass(event.target.value)}>
                      <option value="Economy">Economy</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>
                </label>
              </>
            )}

            {activeTab === 'Hotels' && (
              <>
                <label className="search-field">
                  <span className="field-title">Destination</span>
                  <div className="input-with-icon">
                    <span className="field-icon">📍</span>
                    <input value={hotelDest} onChange={(event) => setHotelDest(event.target.value)} placeholder="City, region, hotel..." />
                  </div>
                </label>
                <label className="search-field">
                  <span className="field-title">Check-in</span>
                  <div className="input-with-icon">
                    <span className="field-icon">📅</span>
                    <input type="date" value={hotelCheckIn} onChange={(event) => setHotelCheckIn(event.target.value)} />
                  </div>
                </label>
                <label className="search-field">
                  <span className="field-title">Check-out</span>
                  <div className="input-with-icon">
                    <span className="field-icon">📅</span>
                    <input type="date" value={hotelCheckOut} onChange={(event) => setHotelCheckOut(event.target.value)} />
                  </div>
                </label>
                <label className="search-field">
                  <span className="field-title">Guests</span>
                  <div className="input-with-icon">
                    <span className="field-icon">👥</span>
                    <select value={hotelGuests} onChange={(event) => setHotelGuests(event.target.value)}>
                      <option value="1 Guest">1 Guest</option>
                      <option value="2 Guests">2 Guests</option>
                      <option value="3 Guests">3 Guests</option>
                      <option value="4+ Guests">4+ Guests</option>
                    </select>
                  </div>
                </label>
              </>
            )}

            {activeTab === 'Tours' && (
              <>
                <label className="search-field">
                  <span className="field-title">Destination</span>
                  <div className="input-with-icon">
                    <span className="field-icon">📍</span>
                    <input value={tourDest} onChange={(event) => setTourDest(event.target.value)} placeholder="Where to? (e.g. Agra, Munnar)" />
                  </div>
                </label>
                <label className="search-field">
                  <span className="field-title">Keywords</span>
                  <div className="input-with-icon">
                    <span className="field-icon">🔍</span>
                    <input value={tourSearch} onChange={(event) => setTourSearch(event.target.value)} placeholder="Trekking, scuba, safari..." />
                  </div>
                </label>
                <label className="search-field">
                  <span className="field-title">Category</span>
                  <div className="input-with-icon">
                    <span className="field-icon">🏷️</span>
                    <select value={tourCategory} onChange={(event) => setTourCategory(event.target.value)}>
                      <option value="All">All Categories</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Culture">Culture</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>
                </label>
              </>
            )}

            {activeTab === 'Packages' && (
              <>
                <label className="search-field">
                  <span className="field-title">Destination</span>
                  <div className="input-with-icon">
                    <span className="field-icon">📍</span>
                    <input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Where to? (e.g. Agra, Kerala, Goa)" />
                  </div>
                </label>
                <label className="search-field">
                  <span className="field-title">Keywords</span>
                  <div className="input-with-icon">
                    <span className="field-icon">🔍</span>
                    <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Beach, temple, backwaters..." />
                  </div>
                </label>
                <label className="search-field">
                  <span className="field-title">Category</span>
                  <div className="input-with-icon">
                    <span className="field-icon">🏷️</span>
                    <select value={category} onChange={(event) => setCategory(event.target.value)}>
                      {['All', 'Beach', 'Adventure', 'City', 'Culture', 'Family'].map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
              </>
            )}

            <button 
              type="button" 
              className="primary-button search-button" 
              onClick={() => {
                if (activeTab === 'Packages') {
                  document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  document.getElementById('dynamic-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              Search
            </button>
          </div>
        </section>

        {/* DYNAMIC RESULTS SECTION FOR FLIGHTS, HOTELS, TOURS */}
        {activeTab !== 'Packages' && (
          <section id="dynamic-results-section" className="section-block dynamic-results-block glass-panel">
            <div className="section-header">
              <div>
                <span className="section-kicker">RJ Travels Live Search Results</span>
                <h2>Available {activeTab} in India</h2>
              </div>
              <p className="header-helper-text">
                Showing {activeTab === 'Flights' ? filteredFlights.length : activeTab === 'Hotels' ? filteredHotels.length : filteredTours.length} matches.
              </p>
            </div>

            {dynamicBookingSuccess && (
              <div className="booked-success-banner" style={{ marginBottom: '20px' }}>
                <span className="booked-check-icon">✓</span>
                <span>{dynamicBookingSuccess}</span>
              </div>
            )}

            {activeTab === 'Flights' && (
              <div className="flights-results-grid">
                {filteredFlights.length > 0 ? (
                  filteredFlights.map((flight) => (
                    <article key={flight.id} className="flight-card glass-panel">
                      <div className="flight-brand-row">
                        <span className="flight-logo-emoji">{flight.logo}</span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{flight.airline}</h3>
                          <span className="flight-num">{flight.number}</span>
                        </div>
                        <span className="flight-price-badge">{formatCurrency(flight.price)}</span>
                      </div>
                      
                      <div className="flight-route-row">
                        <div className="flight-stop-point">
                          <strong>{flight.from.split(' ')[0]}</strong>
                          <span className="flight-time-lbl">{flight.dep}</span>
                        </div>
                        <div className="flight-route-line">
                          <span className="flight-duration-lbl">{flight.duration}</span>
                          <div className="route-dot-line"></div>
                          <span className="flight-type-lbl">{flight.type}</span>
                        </div>
                        <div className="flight-stop-point" style={{ alignItems: 'flex-end' }}>
                          <strong>{flight.to.split(' ')[0]}</strong>
                          <span className="flight-time-lbl">{flight.arr}</span>
                        </div>
                      </div>

                      <button 
                        type="button" 
                        className="primary-button full-width"
                        onClick={() => setDynamicBookingSuccess(`Successfully reserved seat on flight ${flight.airline} ${flight.number} from ${flight.from.split(' ')[0]} to ${flight.to.split(' ')[0]}!`)}
                      >
                        Book Ticket
                      </button>
                    </article>
                  ))
                ) : (
                  <p className="no-results-msg">No matching flights found for this route.</p>
                )}
              </div>
            )}

            {activeTab === 'Hotels' && (
              <div className="hotels-results-grid">
                {filteredHotels.length > 0 ? (
                  filteredHotels.map((hotel) => (
                    <article key={hotel.id} className="hotel-card glass-panel">
                      <img src={hotel.image} alt={hotel.name} className="hotel-card-image" />
                      <div className="hotel-card-copy">
                        <span className="hotel-amenity-tag">{hotel.amenity}</span>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{hotel.name}</h3>
                        <p className="hotel-loc">📍 {hotel.location}</p>
                        
                        <div className="hotel-bottom-row">
                          <div className="hotel-rating">
                            <span className="star-icon">★</span>
                            <strong>{hotel.rating}</strong>
                            <span>({hotel.reviews} reviews)</span>
                          </div>
                          <div className="hotel-price">
                            <strong>{formatCurrency(hotel.price)}</strong>
                            <span>/ Night</span>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          className="primary-button full-width"
                          onClick={() => setDynamicBookingSuccess(`Successfully booked stay at ${hotel.name} in ${hotel.location}!`)}
                        >
                          Book Stay
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="no-results-msg">No hotels found matching your search destination.</p>
                )}
              </div>
            )}

            {activeTab === 'Tours' && (
              <div className="tours-results-grid">
                {filteredTours.length > 0 ? (
                  filteredTours.map((tour) => (
                    <article key={tour.id} className="tour-card glass-panel">
                      <img src={tour.image} alt={tour.name} className="tour-card-image" />
                      <div className="tour-card-copy">
                        <span className="tour-duration-tag">⏱ {tour.duration}</span>
                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{tour.name}</h3>
                        <p className="tour-loc">📍 {tour.location}</p>
                        
                        <div className="tour-bottom-row">
                          <span className="tour-cat-badge">{tour.category}</span>
                          <div className="tour-price">
                            <strong>{formatCurrency(tour.price)}</strong>
                            <span>/ person</span>
                          </div>
                        </div>

                        <button 
                          type="button" 
                          className="primary-button full-width"
                          onClick={() => setDynamicBookingSuccess(`Successfully reserved spot on ${tour.name}!`)}
                        >
                          Book Activity
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="no-results-msg">No matching sightseeing tours found.</p>
                )}
              </div>
            )}
          </section>
        )}

        {/* BENEFITS SECTION */}
        <section id="benefits" className="benefit-row">
          {benefits.map((item) => (
            <article key={item.title} className="benefit-card glass-panel">
              <div className="benefit-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </section>

        {/* POPULAR DESTINATIONS */}
        <section id="destinations" className="section-block">
          <div className="section-header">
            <div>
              <span className="section-kicker">Popular Destinations</span>
              <h2>Featured packages from your database</h2>
            </div>
            <a href="#packages" className="view-all-link">View All Destinations <span className="arrow-icon">→</span></a>
          </div>

          {packagesError ? <p className="inline-message error">{packagesError}</p> : null}
          {loadingPackages ? <p className="inline-message">Loading packages from database...</p> : null}

          <div className="destination-grid">
            {packages.slice(0, 4).map((item, index) => (
              <button 
                key={item.package_id} 
                type="button" 
                className={`destination-card glass-panel ${activePackageId === item.package_id ? 'active' : ''}`} 
                onClick={() => {
                  setActivePackageId(item.package_id);
                  document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <div className="destination-img-wrap">
                  <img src={item.image_url} alt={item.title} />
                  <div className="destination-badge">
                    {index === 0 ? 'Bestseller' : index === 1 ? 'Popular' : index === 2 ? 'Trending' : 'Bestseller'}
                  </div>
                </div>
                <div className="destination-copy">
                  <p className="destination-loc">📍 {item.destination}</p>
                  <h3>{item.title}</h3>
                  <div className="destination-price-row">
                    <span className="duration-tag">{item.duration_days} Days</span>
                    <strong className="price-tag">{formatCurrency(item.price)}</strong>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* WHY CHOOSE RJ TRAVELS & BANNER SPLIT */}
        <section className="split-layout">
          <article className="why-panel glass-panel">
            <span className="section-kicker">Why Choose RJ Travels?</span>
            <h2>Designed around real database integrations</h2>
            <div className="why-grid">
              <div className="why-item">
                <div className="why-item-icon">✓</div>
                <div>
                  <strong>Users Table Integration</strong>
                  <p>Stores full_name, email, password hashes, and phone numbers securely.</p>
                </div>
              </div>
              <div className="why-item">
                <div className="why-item-icon">✓</div>
                <div>
                  <strong>Bookings Relation</strong>
                  <p>Keeps track of traveler counts, calculates total amounts, and updates package seats.</p>
                </div>
              </div>
              <div className="why-item">
                <div className="why-item-icon">✓</div>
                <div>
                  <strong>Real-time Wishlists</strong>
                  <p>Saves package references for active users so they can monitor price changes.</p>
                </div>
              </div>
              <div className="why-item">
                <div className="why-item-icon">✓</div>
                <div>
                  <strong>Linked Reviews Table</strong>
                  <p>Compiles ratings and review texts to calculate package rating averages dynamically.</p>
                </div>
              </div>
            </div>
          </article>

          <article className="promo-panel glass-panel">
            <div className="promo-overlay">
              <span className="section-kicker white-text">Let’s Go</span>
              <h2>Your Next Adventure Awaits!</h2>
              <p>
                Select a destination, log in to save wishlists, submit reservations, and post feedback to watch columns update live.
              </p>
              <a href="#packages" className="secondary-button promo-btn">
                Plan Your Trip <span className="arrow-icon">→</span>
              </a>
            </div>
          </article>
        </section>

        {/* PACKAGES AND DETAIL SIDEBAR */}
        <section id="packages" className="section-block">
          <div className="section-header">
            <div>
              <span className="section-kicker">Explore Packages</span>
              <h2>Find your perfect escape</h2>
            </div>
            <p className="header-helper-text">
              Showing {visiblePackages.length} packages matching your criteria.
            </p>
          </div>

          <div className="package-layout">
            <div className="package-grid">
              {visiblePackages.map((item) => (
                <article key={item.package_id} className={`package-card glass-panel ${activePackageId === item.package_id ? 'active' : ''}`}>
                  <button type="button" className="package-image-button" onClick={() => setActivePackageId(item.package_id)}>
                    <img src={item.image_url} alt={item.title} />
                    <span className="package-label">{item.category}</span>
                  </button>
                  <div className="package-copy">
                    <div className="package-headline">
                      <div>
                        <p className="package-location">📍 {item.destination}</p>
                        <h3>{item.title}</h3>
                      </div>
                      <strong className="package-price">{formatCurrency(item.price)}</strong>
                    </div>

                    <p className="package-description">{item.description}</p>

                    <div className="package-meta">
                      <span>⏱ {item.duration_days} Days</span>
                      <span>👥 {item.available_seats} Seats Left</span>
                      <span>★ {starLabel(item.rating_average)} ({item.review_count || 0})</span>
                    </div>

                    <button type="button" className="secondary-button full-width" onClick={() => setActivePackageId(item.package_id)}>
                      View Details & Book
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* DETAIL & BOOKING SIDEBAR */}
            <aside className="sidebar-panel glass-panel">
              {selectedPackage ? (
                <>
                  <div className="sidebar-head">
                    <span className="sidebar-badge">★ Details</span>
                    <h2>{selectedPackage.title}</h2>
                    <p className="sidebar-dest">📍 {selectedPackage.destination}</p>
                  </div>

                  <div className="detail-summary">
                    <img src={selectedPackage.image_url} alt={selectedPackage.title} />
                    <div className="detail-meta-list">
                      <div className="detail-meta-item">
                        <span>Price per Person:</span>
                        <strong>{formatCurrency(selectedPackage.price)}</strong>
                      </div>
                      <div className="detail-meta-item">
                        <span>Duration:</span>
                        <strong>{selectedPackage.duration_days} Days</strong>
                      </div>
                      <div className="detail-meta-item">
                        <span>Available Seats:</span>
                        <strong>{selectedPackage.available_seats}</strong>
                      </div>
                      <div className="detail-meta-item">
                        <span>Category:</span>
                        <strong className="category-pill">{selectedPackage.category}</strong>
                      </div>
                    </div>
                  </div>

                  {detailLoading ? <p className="inline-message">Loading details...</p> : null}
                  {detailError ? <p className="inline-message error">{detailError}</p> : null}

                  {token ? (
                    <div className="sidebar-actions-area">
                      <div className="wishlist-action-box">
                        <button type="button" className={`wishlist-toggle-btn ${activePackageDetail?.wishlist ? 'saved' : ''}`} onClick={toggleWishlist}>
                          {activePackageDetail?.wishlist ? '❤️ Saved to Wishlist' : '🤍 Save to Wishlist'}
                        </button>
                        {message && <p className="action-feedback-msg">{message}</p>}
                      </div>

                      {activePackageDetail?.booked ? (
                        <div className="booked-success-banner">
                          <span className="booked-check-icon">✓</span>
                          <span>You have booked this package!</span>
                        </div>
                      ) : (
                        <div className="booking-form-area">
                          <h3>Reserve This Tour</h3>
                          <form onSubmit={handleBooking} className="stack-form">
                            <div className="booking-people-input-row">
                              <label>
                                <span>Number of People:</span>
                                <input name="number_of_people" type="number" min="1" max={selectedPackage.available_seats} defaultValue="1" required />
                              </label>
                            </div>
                            <button type="submit" className="primary-button booking-submit-btn" disabled={selectedPackage.available_seats <= 0}>
                              {selectedPackage.available_seats <= 0 ? 'Sold Out' : 'Confirm Reservation'}
                            </button>
                            {bookingMessage && <p className="action-feedback-msg">{bookingMessage}</p>}
                          </form>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="sidebar-auth-prompt">
                      <p>🔐 Please <button type="button" style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'inherit', fontWeight: 'bold' }} onClick={() => { setExploreAsGuest(false); setAuthMode('login'); }}>sign in</button> to book this package or save it to your wishlist.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-selected-package">
                  <span className="no-select-icon">📍</span>
                  <p>Choose a package to open booking, wishlists, and reviews.</p>
                </div>
              )}
            </aside>
          </div>
        </section>

        {/* INTERACTIVE SQL DATABASE EXPLORER */}
        <section id="inspector-section" className="section-block database-inspector-section">
          <div className="section-header">
            <div>
              <span className="section-kicker">Relational Database Tables</span>
              <h2>Interactive SQL Database Inspector</h2>
            </div>
            <button 
              type="button" 
              className={`inspector-toggle-btn ${inspectorOpen ? 'open' : ''}`}
              onClick={() => setInspectorOpen(!inspectorOpen)}
            >
              {inspectorOpen ? '🔌 Close Inspector' : '🔌 Open Inspector'}
            </button>
          </div>

          {inspectorOpen && (
            <div className="inspector-panel glass-panel">
              <div className="inspector-instructions">
                <p>
                  Explore the live tables stored in the SQL backend. When you login, create bookings, leave contacts, or submit reviews, records will appear here in real-time.
                </p>
                {(!me || me.role !== 'admin') && (
                  <div className="inspector-auth-notice">
                    <span>⚠️ SQL Inspector is in Sandbox Mode. Log in as admin to view live records.</span>
                    <button type="button" className="auto-login-btn" onClick={handleAutoAdminLogin}>🔑 Auto-login as Admin</button>
                  </div>
                )}
              </div>

              {me?.role === 'admin' ? (
                <div className="inspector-workspace">
                  <div className="inspector-tabs">
                    {['users', 'tour_packages', 'bookings', 'wishlist', 'reviews', 'contacts'].map((tbl) => (
                      <button
                        key={tbl}
                        type="button"
                        className={inspectorTable === tbl ? 'table-tab active' : 'table-tab'}
                        onClick={() => setInspectorTable(tbl)}
                      >
                        📂 {tbl.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="table-viewer-scroll">
                    {inspectorLoading ? (
                      <p className="inspector-message">Querying database table...</p>
                    ) : inspectorError ? (
                      <p className="inspector-message error">{inspectorError}</p>
                    ) : inspectorData.length > 0 ? (
                      <table className="inspector-sql-table">
                        <thead>
                          <tr>
                            {Object.keys(inspectorData[0]).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {inspectorData.map((row, idx) => (
                            <tr key={idx}>
                              {Object.values(row).map((val, i) => (
                                <td key={i}>{val === null ? 'NULL' : String(val)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="inspector-message">Table is currently empty (0 rows).</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="inspector-locked-screen">
                  <span className="lock-icon">🔒</span>
                  <h3>Table Inspector Locked</h3>
                  <p>Database table metadata is secured. Sign in as <strong>admin089@gmail.com</strong> to view SQL entries.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* FORMS SECTION: AUTHENTICATION, REVIEWS */}
        <section id="auth" className="section-block form-grid">
          {/* USER ACCOUNT CARD */}
          <article className="form-card glass-panel auth-form-card">
            <span className="section-kicker">Traveler Account</span>
            {me ? (
              <div className="session-box">
                <div className="session-avatar-wrap">
                  <span className="session-avatar-char">{me.full_name.charAt(0).toUpperCase()}</span>
                </div>
                <h3>Welcome back, {me.full_name}!</h3>
                <p className="session-email">📧 {me.email}</p>
                {me.phone && <p className="session-phone">📞 {me.phone}</p>}
                <p className="session-role">👤 Account Privilege: <strong className="role-badge">{me.role.toUpperCase()}</strong></p>
                <button type="button" className="primary-button full-width logout-btn" onClick={handleLogout}>
                  Sign Out Account
                </button>
              </div>
            ) : (
              <div className="auth-form-wrap">
                <div className="auth-tabs">
                  <button 
                    type="button" 
                    className={authMode === 'login' ? 'auth-tab active' : 'auth-tab'} 
                    onClick={() => setAuthMode('login')}
                  >
                    Sign In
                  </button>
                  <button 
                    type="button" 
                    className={authMode === 'register' ? 'auth-tab active' : 'auth-tab'} 
                    onClick={() => setAuthMode('register')}
                  >
                    Register
                  </button>
                </div>

                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} className="stack-form">
                    <label>
                      <span>Email Address:</span>
                      <input name="email" type="email" placeholder="email@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                    </label>
                    <label>
                      <span>Password:</span>
                      <input name="password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                    </label>
                    <button type="submit" className="primary-button auth-submit-btn">
                      Sign In to Account
                    </button>
                    {authMessage && <p className="inline-message auth-feedback">{authMessage}</p>}
                    <p className="demo-credentials-helper">
                      💡 Tip: Click "Database Inspector" auto-login or use <strong>demo@rjtravels.com</strong> / <strong>Demo@12345</strong>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="stack-form">
                    <label>
                      <span>Full Name:</span>
                      <input name="full_name" placeholder="John Doe" required />
                    </label>
                    <label>
                      <span>Email Address:</span>
                      <input name="email" type="email" placeholder="john.doe@example.com" required />
                    </label>
                    <label>
                      <span>Phone Number:</span>
                      <input name="phone" placeholder="+91 98765 43210" />
                    </label>
                    <label>
                      <span>Password:</span>
                      <input name="password" type="password" placeholder="Min. 8 characters" required />
                    </label>
                    <button type="submit" className="primary-button auth-submit-btn">
                      Register New Traveler
                    </button>
                    {authMessage && <p className="inline-message auth-feedback">{authMessage}</p>}
                  </form>
                )}
              </div>
            )}
          </article>

          {/* REVIEWS CARD */}
          <article className="form-card glass-panel review-form-card">
            <span className="section-kicker">Traveler Reviews</span>
            <h2>Leave a Review</h2>
            <p className="form-desc">
              Rate your experience for the active package. Requires a booked reservation in the bookings table.
            </p>
            {token ? (
              <form onSubmit={handleReview} className="stack-form">
                <div className="two-col review-inputs">
                  <label>
                    <span>Rating (1-5 Stars):</span>
                    <input name="rating" type="number" min="1" max="5" defaultValue="5" required />
                  </label>
                  <label>
                    <span>Package Reference ID:</span>
                    <input value={selectedPackage ? selectedPackage.package_id : ''} readOnly placeholder="No package selected" className="readonly-input" />
                  </label>
                </div>
                <label>
                  <span>Review Comments:</span>
                  <textarea name="review_text" rows="4" placeholder="How was your trip? Detail your experience..." required />
                </label>
                <button type="submit" className="secondary-button" disabled={!selectedPackage}>
                  Post Review Text
                </button>
                {reviewMessage && <p className="inline-message">{reviewMessage}</p>}
              </form>
            ) : (
              <div className="form-auth-lock">
                <p>🔐 Please <button type="button" style={{ background: 'none', border: 'none', textDecoration: 'underline', color: 'inherit', fontWeight: 'bold' }} onClick={() => { setExploreAsGuest(false); setAuthMode('login'); }}>sign in</button> to leave reviews for packages.</p>
              </div>
            )}
          </article>

          {/* PUBLIC REVIEW DISPLAY LIST */}
          <article className="form-card glass-panel review-display-card">
            <span className="section-kicker">Latest package reviews</span>
            <h2>Traveler Feedback</h2>
            
            <div className="review-list-sidebar">
              {activeReviews.length > 0 ? (
                activeReviews.map((review) => (
                  <div key={review.review_id} className="sidebar-review-item glass-panel">
                    <div className="review-item-header">
                      <strong>👤 {review.user_name || 'Anonymous Traveler'}</strong>
                      <span className="review-stars-badge">★ {review.rating}</span>
                    </div>
                    <p className="review-text-content">"{review.review_text}"</p>
                    <span className="review-date-stamp">📅 {formatDate(review.created_at)}</span>
                  </div>
                ))
              ) : (
                <div className="no-reviews-box">
                  <p className="no-reviews-msg">No reviews submitted yet for this destination.</p>
                </div>
              )}
            </div>
          </article>
        </section>

        {/* PUBLIC CONTACT SUPPORT FORM */}
        <section id="contact" className="section-block contact-panel glass-panel">
          <div className="contact-copy-area">
            <span className="section-kicker">Get in Touch</span>
            <h2>Send a message to our support desk</h2>
            <p>
              Have questions about booking availability? Fill out this contact form. Messages are saved directly to the contacts table in the database.
            </p>
          </div>

          <form onSubmit={handleContact} className="stack-form contact-form">
            <div className="two-col">
              <label>
                <span>Full Name:</span>
                <input name="name" placeholder="Your name" required />
              </label>
              <label>
                <span>Email Address:</span>
                <input name="email" type="email" placeholder="your.email@example.com" required />
              </label>
            </div>
            <label>
              <span>Message Content:</span>
              <textarea name="message" rows="4" placeholder="How can we assist you with your travels?" required />
            </label>
            <button type="submit" className="primary-button contact-submit-btn">
              Send Support Message
            </button>
            {contactMessage && <p className="inline-message contact-feedback">{contactMessage}</p>}
          </form>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer-bar glass-panel">
        <div className="footer-top-grid">
          <div className="footer-brand">
            <div className="brand-lockup white-logo">
              <div className="brand-logo-circle">
                <span className="brand-plane-icon">RJ</span>
              </div>
              <div>
                <p className="brand-name">RJ Travels</p>
                <p className="brand-tag">TOURS & TRAVEL</p>
              </div>
            </div>
            <p className="footer-brand-desc">
              A premium, relational travel catalog. View packages, reserve seats, save favorites, and write review columns in real-time.
            </p>
          </div>

          <div className="footer-links-grid">
            <div className="footer-links-column">
              <h4>Explore</h4>
              <a href="#hero">Home</a>
              <a href="#destinations">Destinations</a>
              <a href="#packages">Tour Escapes</a>
            </div>
            <div className="footer-links-column">
              <h4>relational db</h4>
              <a href="#inspector-section">SQL Inspector</a>
              <a href="#auth">Travelers Accounts</a>
              <a href="#contact">Support Contacts</a>
            </div>
          </div>

          <div className="footer-newsletter">
            <h4>Subscribe to Newsletter</h4>
            <p>Get latest travel insights and deals.</p>
            <div className="newsletter-input-row">
              <input type="email" placeholder="your.email@example.com" />
              <button type="button" className="newsletter-btn">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom-row">
          <p>© 2026 RJ Travels. Powered by RJ Travels DB API. All rights reserved.</p>
          <div className="footer-socials">
            <span>🌐 Facebook</span>
            <span>📸 Instagram</span>
            <span>🐦 Twitter</span>
            <span>🎥 YouTube</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
