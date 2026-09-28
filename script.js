// ---------- CONFIG ----------
const API_BASE = 'http://localhost:5000/api';

// ---------- STATE ----------
let properties = [];
let projects = [];
let agents = [];
let blogPosts = [];

// ---------- API HELPER ----------
async function api(path, options = {}) {
    const res = await fetch(API_BASE + path, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API error');
    return data;
}

// ---------- HELPERS ----------
function formatPrice(price) {
    if (price >= 10000000) return 'PKR ' + (price / 10000000).toFixed(2) + ' Crore';
    if (price >= 100000) return 'PKR ' + (price / 100000).toFixed(2) + ' Lakh';
    return 'PKR ' + Number(price).toLocaleString();
}

function createPropertyCard(p) {
    const badge = p.purpose === 'rent' ? '<span class="badge rent">For Rent</span>' : '<span class="badge">For Sale</span>';
    const img = (p.images && p.images[0]) || '/assets/default.jpg';
    return `
    <div class="property-card">
      <a href="#property/${p._id}">
        <img src="${img}" alt="${p.title}" onerror="this.src='/assets/default.jpg'">
        ${badge}
        <div class="property-info">
          <h3>${p.title}</h3>
          <div class="location"><i class="fas fa-map-marker-alt"></i> ${p.location}</div>
          <div class="price">${formatPrice(p.price)}</div>
          <div class="property-features">
            ${p.beds > 0 ? `<span><i class="fas fa-bed"></i> ${p.beds} Beds</span>` : ''}
            ${p.baths > 0 ? `<span><i class="fas fa-bath"></i> ${p.baths} Baths</span>` : ''}
            <span><i class="fas fa-vector-square"></i> ${p.area}</span>
          </div>
        </div>
      </a>
    </div>
  `;
}

function loading() {
    document.getElementById('app').innerHTML = `<section class="section"><div class="container" style="text-align:center;padding:80px 20px;"><i class="fas fa-spinner fa-spin" style="font-size:40px;color:var(--royal-purple);"></i><p style="margin-top:20px;">Loading...</p></div></section>`;
}

// ---------- HOME ----------
async function renderHome() {
    loading();
    try {
        const [pRes, prRes, agRes, bRes] = await Promise.all([
            api('/properties?featured=true&limit=4'),
            api('/projects'),
            api('/agents'),
            api('/blog?limit=3')
        ]);
        properties = pRes.data;
        projects = prRes.data;
        agents = agRes.data;
        blogPosts = bRes.data;

        const featured = properties.map(createPropertyCard).join('');

        const projectsHtml = projects.map(proj => `
      <div class="project-card">
        <img src="${proj.image || '/assets/default.jpg'}" alt="${proj.title}" onerror="this.src='/assets/default.jpg'">
        <div class="property-info">
          <h3>${proj.title}</h3>
          <div class="location"><i class="fas fa-map-marker-alt"></i> ${proj.location}</div>
          <div class="price">${proj.price}</div>
          <p style="font-size:14px;color:var(--gray);margin-top:5px;">${proj.status} • Completion: ${proj.completion}</p>
        </div>
      </div>
    `).join('');

        const agentsHtml = agents.slice(0, 3).map(agent => `
      <div class="agent-card">
        <img src="${agent.image || '/assets/default.jpg'}" alt="${agent.name}" onerror="this.src='/assets/default.jpg'">
        <div class="agent-info">
          <h3>${agent.name}</h3>
          <p>${agent.title}</p>
          <p><i class="fas fa-phone"></i> ${agent.phone}</p>
          <a href="#agents" class="btn btn-purple">View Profile</a>
        </div>
      </div>
    `).join('');

        const blogHtml = blogPosts.map(post => `
      <div class="blog-card">
        <img src="${post.image || '/assets/default.jpg'}" alt="${post.title}" onerror="this.src='/assets/default.jpg'">
        <div class="property-info">
          <span style="color:var(--champagne-gold);font-size:12px;font-weight:600;">${post.category}</span>
          <h3 style="margin-top:8px;">${post.title}</h3>
          <p style="color:var(--gray);font-size:14px;margin:10px 0;">${post.excerpt}</p>
          <small>${new Date(post.createdAt).toLocaleDateString()}</small>
        </div>
      </div>
    `).join('');

        document.getElementById('app').innerHTML = `
      <section class="hero" style="background: linear-gradient(rgba(42,8,69,0.7), rgba(74,20,140,0.8)), url('/assets/hero.jpg') center/cover no-repeat;">
        <div class="hero-content">
          <h1>Find Your Royal Home</h1>
          <p>Discover luxury properties, prime investments, and your dream home in Pakistan's most prestigious locations.</p>
          <div class="search-box">
            <select id="search-purpose">
              <option value="">Purpose</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
            <select id="search-type">
              <option value="">Property Type</option>
              <option value="house">House</option>
              <option value="flat">Flat</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>
            <input type="text" id="search-location" placeholder="Location (e.g. DHA Lahore)">
            <button class="btn btn-gold" onclick="searchProperties()">Search</button>
          </div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>Featured Properties</h2><div class="divider"></div>
            <p>Handpicked luxury properties for discerning buyers and investors.</p>
          </div>
          <div class="property-grid">${featured}</div>
          <div style="text-align:center;margin-top:40px;">
            <a href="#properties" class="btn btn-purple">View All Properties</a>
          </div>
        </div>
      </section>
      <section class="section" style="background:var(--white);">
        <div class="container">
          <div class="section-header"><h2>New Projects</h2><div class="divider"></div>
          <p>Explore upcoming and trending real estate developments.</p></div>
          <div class="property-grid">${projectsHtml}</div>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="section-header"><h2>Our Top Agents</h2><div class="divider"></div>
          <p>Meet our team of experienced real estate professionals.</p></div>
          <div class="property-grid">${agentsHtml}</div>
        </div>
      </section>
      <section class="section" style="background:var(--white);">
        <div class="container">
          <div class="section-header"><h2>From Our Journal</h2><div class="divider"></div>
          <p>Latest news, guides, and market insights.</p></div>
          <div class="property-grid">${blogHtml}</div>
        </div>
      </section>
    `;
    } catch (err) {
        document.getElementById('app').innerHTML = `<section class="section"><div class="container"><h2>Error</h2><p>${err.message}</p></div></section>`;
    }
}

// ---------- SEARCH ----------
function searchProperties() {
    const p = document.getElementById('search-purpose').value;
    const t = document.getElementById('search-type').value;
    const l = document.getElementById('search-location').value;
    const params = new URLSearchParams();
    if (p) params.set('purpose', p);
    if (t) params.set('type', t);
    if (l) params.set('location', l);
    window.location.hash = '#properties' + (params.toString() ? '?' + params.toString() : '');
}

// ---------- PROPERTIES ----------
async function renderProperties(queryString = '') {
    loading();
    const params = new URLSearchParams(queryString);
    const apiParams = new URLSearchParams();
    ['purpose', 'type', 'location', 'minPrice', 'maxPrice', 'sort'].forEach(k => {
        if (params.get(k)) apiParams.set(k, params.get(k));
    });
    apiParams.set('limit', '50');

    try {
        const res = await api('/properties?' + apiParams.toString());
        properties = res.data;
        const grid = properties.length
            ? properties.map(createPropertyCard).join('')
            : '<p style="grid-column:1/-1;text-align:center;padding:40px;">No properties match your filters.</p>';

        document.getElementById('app').innerHTML = `
      <section class="section">
        <div class="container">
          <div class="section-header"><h2>All Properties</h2><div class="divider"></div>
          <p>Browse our extensive collection (${res.total} available).</p></div>
          <div class="filters">
            <select id="filter-purpose">
              <option value="">All Purpose</option>
              <option value="buy">Buy</option>
              <option value="rent">Rent</option>
            </select>
            <select id="filter-type">
              <option value="">All Types</option>
              <option value="house">House</option>
              <option value="flat">Flat</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </select>
            <input type="text" id="filter-location" placeholder="Location">
            <select id="filter-price">
              <option value="">Any Price</option>
              <option value="0-5000000">Under 50 Lakh</option>
              <option value="5000000-20000000">50 Lakh - 2 Crore</option>
              <option value="20000000-50000000">2 Crore - 5 Crore</option>
              <option value="50000000-999999999">Above 5 Crore</option>
            </select>
            <button class="btn btn-purple" onclick="applyFilters()">Apply Filters</button>
          </div>
          <div id="properties-grid" class="property-grid">${grid}</div>
        </div>
      </section>
    `;

        if (params.get('purpose')) document.getElementById('filter-purpose').value = params.get('purpose');
        if (params.get('type')) document.getElementById('filter-type').value = params.get('type');
        if (params.get('location')) document.getElementById('filter-location').value = params.get('location');
    } catch (err) {
        document.getElementById('app').innerHTML = `<section class="section"><div class="container"><h2>Error</h2><p>${err.message}</p></div></section>`;
    }
}

function applyFilters() {
    const p = document.getElementById('filter-purpose').value;
    const t = document.getElementById('filter-type').value;
    const l = document.getElementById('filter-location').value;
    const pr = document.getElementById('filter-price').value;
    const params = new URLSearchParams();
    if (p) params.set('purpose', p);
    if (t) params.set('type', t);
    if (l) params.set('location', l);
    if (pr) {
        const [min, max] = pr.split('-');
        params.set('minPrice', min);
        params.set('maxPrice', max);
    }
    window.location.hash = '#properties' + (params.toString() ? '?' + params.toString() : '');
}

// ---------- PROPERTY DETAIL ----------
async function renderPropertyDetail(id) {
    loading();
    try {
        const res = await api('/properties/' + id);
        const p = res.data;
        const images = (p.images && p.images.length) ? p.images : ['/assets/default.jpg'];
        const amenities = (p.amenities && p.amenities.length) ? p.amenities : ['Central AC', '24/7 Security', 'Parking'];

        document.getElementById('app').innerHTML = `
      <section class="section">
        <div class="container">
          <div class="property-detail">
            <div>
              <div class="property-gallery">
                ${images.map(img => `<img src="${img}" alt="${p.title}" onerror="this.src='/assets/default.jpg'">`).join('')}
              </div>
              <h1>${p.title}</h1>
              <div class="location" style="color:var(--gray);margin-bottom:10px;">
                <i class="fas fa-map-marker-alt"></i> ${p.location}
              </div>
              <div class="price">${formatPrice(p.price)}</div>
              <div class="property-specs">
                ${p.beds > 0 ? `<div class="spec-item"><i class="fas fa-bed"></i><div><strong>${p.beds}</strong><br>Bedrooms</div></div>` : ''}
                ${p.baths > 0 ? `<div class="spec-item"><i class="fas fa-bath"></i><div><strong>${p.baths}</strong><br>Bathrooms</div></div>` : ''}
                <div class="spec-item"><i class="fas fa-vector-square"></i><div><strong>${p.area}</strong><br>Area</div></div>
                <div class="spec-item"><i class="fas fa-home"></i><div><strong>${p.type}</strong><br>Type</div></div>
              </div>
              <h3 style="margin-top:30px;">Description</h3>
              <p style="margin-top:10px;">${p.description || 'A beautiful property in a prime location.'}</p>
              <h3 style="margin-top:30px;">Amenities</h3>
              <ul style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px;list-style:none;">
                ${amenities.map(a => `<li><i class="fas fa-check" style="color:var(--champagne-gold);"></i> ${a}</li>`).join('')}
              </ul>
            </div>
            <div>
              <div class="contact-agent">
                <h3>Contact Agent</h3>
                <p style="font-size:14px;color:var(--gray);margin-bottom:15px;">Fill the form and our agent will contact you shortly.</p>
                <form id="contact-form">
                  <input type="text" name="name" placeholder="Your Name" required>
                  <input type="email" name="email" placeholder="Your Email" required>
                  <input type="tel" name="phone" placeholder="Your Phone" required>
                  <textarea name="message" rows="4" placeholder="Message" required>I am interested in ${p.title}</textarea>
                  <button type="submit" class="btn btn-gold" style="width:100%;">Send Message</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

        document.getElementById('contact-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = Object.fromEntries(new FormData(e.target).entries());
            payload.propertyId = p._id;
            payload.subject = 'Property Inquiry: ' + p.title;
            try {
                await api('/contact', { method: 'POST', body: JSON.stringify(payload) });
                alert('Thank you! Our agent will contact you soon.');
                e.target.reset();
            } catch (err) {
                alert('Error: ' + err.message);
            }
        });
    } catch (err) {
        document.getElementById('app').innerHTML = `<section class="section"><div class="container"><h2>Error</h2><p>${err.message}</p><a href="#properties" class="btn btn-purple">Back</a></div></section>`;
    }
}

// ---------- PROJECTS ----------
async function renderProjects() {
    loading();
    try {
        const res = await api('/projects');
        const html = res.data.map(proj => `
      <div class="project-card">
        <img src="${proj.image || '/assets/default.jpg'}" alt="${proj.title}" onerror="this.src='/assets/default.jpg'">
        <div class="property-info">
          <h3>${proj.title}</h3>
          <div class="location"><i class="fas fa-map-marker-alt"></i> ${proj.location}</div>
          <div class="price">${proj.price}</div>
          <p style="font-size:14px;color:var(--gray);margin-top:5px;">${proj.status} • Completion: ${proj.completion}</p>
          <a href="#contact" class="btn btn-purple" style="margin-top:15px;display:inline-block;">Enquire Now</a>
        </div>
      </div>
    `).join('');
        document.getElementById('app').innerHTML = `
      <section class="section">
        <div class="container">
          <div class="section-header"><h2>New Projects</h2><div class="divider"></div>
          <p>Explore upcoming and trending real estate developments.</p></div>
          <div class="property-grid">${html}</div>
        </div>
      </section>`;
    } catch (err) {
        document.getElementById('app').innerHTML = `<section class="section"><div class="container"><h2>Error</h2><p>${err.message}</p></div></section>`;
    }
}

// ---------- AGENTS ----------
async function renderAgents() {
    loading();
    try {
        const res = await api('/agents');
        const html = res.data.map(agent => `
      <div class="agent-card">
        <img src="${agent.image || '/assets/default.jpg'}" alt="${agent.name}" onerror="this.src='/assets/default.jpg'">
        <div class="agent-info">
          <h3>${agent.name}</h3>
          <p>${agent.title}</p>
          <p><i class="fas fa-phone"></i> ${agent.phone}</p>
          <p><i class="fas fa-envelope"></i> ${agent.email}</p>
          <p style="margin-top:10px;font-weight:600;color:var(--royal-purple);">${agent.listings || 0} Active Listings</p>
          <a href="#contact" class="btn btn-purple" style="margin-top:10px;">Contact</a>
        </div>
      </div>
    `).join('');
        document.getElementById('app').innerHTML = `
      <section class="section">
        <div class="container">
          <div class="section-header"><h2>Our Agents</h2><div class="divider"></div>
          <p>Meet our team of experienced real estate professionals.</p></div>
          <div class="property-grid">${html}</div>
        </div>
      </section>`;
    } catch (err) {
        document.getElementById('app').innerHTML = `<section class="section"><div class="container"><h2>Error</h2><p>${err.message}</p></div></section>`;
    }
}

// ---------- BLOG ----------
async function renderBlog() {
    loading();
    try {
        const res = await api('/blog');
        const html = res.data.map(post => `
      <div class="blog-card">
        <img src="${post.image || '/assets/default.jpg'}" alt="${post.title}" onerror="this.src='/assets/default.jpg'">
        <div class="property-info">
          <span style="color:var(--champagne-gold);font-size:12px;font-weight:600;">${post.category}</span>
          <h3 style="margin-top:8px;">${post.title}</h3>
          <p style="color:var(--gray);font-size:14px;margin:10px 0;">${post.excerpt}</p>
          <small>${new Date(post.createdAt).toLocaleDateString()}</small>
        </div>
      </div>
    `).join('');
        document.getElementById('app').innerHTML = `
      <section class="section">
        <div class="container">
          <div class="section-header"><h2>Our Journal</h2><div class="divider"></div>
          <p>Latest news, guides, and market insights.</p></div>
          <div class="property-grid">${html}</div>
        </div>
      </section>`;
    } catch (err) {
        document.getElementById('app').innerHTML = `<section class="section"><div class="container"><h2>Error</h2><p>${err.message}</p></div></section>`;
    }
}

// ---------- ABOUT ----------
function renderAbout() {
    document.getElementById('app').innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-header"><h2>About RoyalEstate</h2><div class="divider"></div></div>
        <div style="max-width:800px;margin:0 auto;text-align:center;">
          <p style="margin-bottom:20px;">RoyalEstate is Pakistan's premier luxury real estate portal, connecting discerning buyers, sellers, and investors with the finest properties in the country.</p>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:30px;margin-top:40px;">
            <div><h3 style="font-size:36px;color:var(--royal-purple);">10K+</h3><p>Properties Listed</p></div>
            <div><h3 style="font-size:36px;color:var(--royal-purple);">5K+</h3><p>Happy Clients</p></div>
            <div><h3 style="font-size:36px;color:var(--royal-purple);">100+</h3><p>Expert Agents</p></div>
          </div>
        </div>
      </div>
    </section>`;
}

// ---------- CONTACT ----------
function renderContact() {
    document.getElementById('app').innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-header"><h2>Contact Us</h2><div class="divider"></div>
        <p>Get in touch with our team for any queries.</p></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;max-width:1000px;margin:0 auto;">
          <div>
            <h3>Send a Message</h3>
            <form id="contact-page-form" style="margin-top:20px;">
              <input type="text" name="name" placeholder="Your Name" required style="width:100%;padding:12px;margin-bottom:15px;border:1px solid #ddd;border-radius:4px;">
              <input type="email" name="email" placeholder="Your Email" required style="width:100%;padding:12px;margin-bottom:15px;border:1px solid #ddd;border-radius:4px;">
              <input type="tel" name="phone" placeholder="Your Phone" style="width:100%;padding:12px;margin-bottom:15px;border:1px solid #ddd;border-radius:4px;">
              <textarea name="message" rows="5" placeholder="Your Message" required style="width:100%;padding:12px;margin-bottom:15px;border:1px solid #ddd;border-radius:4px;font-family:'Poppins',sans-serif;"></textarea>
              <button type="submit" class="btn btn-gold" style="width:100%;">Send Message</button>
            </form>
          </div>
          <div>
            <h3>Contact Information</h3>
            <div style="margin-top:20px;">
              <p style="margin-bottom:15px;"><i class="fas fa-map-marker-alt" style="color:var(--champagne-gold);width:25px;"></i> 123 Main Boulevard, Gulberg III, Lahore, Pakistan</p>
              <p style="margin-bottom:15px;"><i class="fas fa-phone" style="color:var(--champagne-gold);width:25px;"></i> +92 42 111 222 333</p>
              <p style="margin-bottom:15px;"><i class="fas fa-envelope" style="color:var(--champagne-gold);width:25px;"></i> info@royalestate.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>`;

    document.getElementById('contact-page-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = Object.fromEntries(new FormData(e.target).entries());
        try {
            await api('/contact', { method: 'POST', body: JSON.stringify(payload) });
            alert('Thank you! We will get back to you soon.');
            e.target.reset();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });
}

// ---------- ROUTER ----------
function updateActiveNav(route) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + route) link.classList.add('active');
    });
}

function router() {
    const hash = window.location.hash || '#home';
    const raw = hash.substring(1);
    const [pathPart, queryPart] = raw.split('?');
    const [route, param] = pathPart.split('/');

    switch (route) {
        case 'home': renderHome(); break;
        case 'properties': renderProperties(queryPart || ''); break;
        case 'property': renderPropertyDetail(param); break;
        case 'projects': renderProjects(); break;
        case 'agents': renderAgents(); break;
        case 'blog': renderBlog(); break;
        case 'about': renderAbout(); break;
        case 'contact': renderContact(); break;
        default: renderHome();
    }
    updateActiveNav(route);
    window.scrollTo(0, 0);
    document.getElementById('nav').classList.remove('active');
}

window.addEventListener('hashchange', router);

document.addEventListener('DOMContentLoaded', () => {
    router();
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('nav').classList.toggle('active');
        });
    }
});