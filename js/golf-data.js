const golfPackages = [
  {
    id: "pkg1",
    courseId: 7, // Link to Bukit Pandawa
    title: "Bukit Pandawa Championship Experience",
    description: "Experience championship par-3 golf overlooking the Indian Ocean at Bali's newest world-class course.",
    features: [
      "3-night stay in a luxury partner resort",
      "2 rounds of golf (18 holes each) at Bukit Pandawa",
      "Required caddie service included",
      "Access to clubhouse facilities",
      "Private return airport transfers"
    ],
    price: "$110", // Updated: ceil(1800000 / 16450)
    unit: "per person (18 Holes)",
    buttonText: "View Course & Book",
    link: "golf-detail.html?id=7"
  },
  {
    id: "pkg2",
    courseId: 5, // Link to Bali National
    title: "Nusa Dua Golf & Relax Retreat",
    description: "Combine challenging golf at the renowned Bali National with relaxation in the prestigious Nusa Dua area.",
    features: [
      "4-night stay at a 5-star Nusa Dua resort",
      "2 rounds of golf (18 holes each) at Bali National",
      "One Balinese massage spa treatment",
      "Daily breakfast and resort credits",
      "Golf course transfers included"
    ],
    price: "$128", // Updated: ceil(2100000 / 16450)
    unit: "per person (Package Estimate)",
    buttonText: "View Course & Book",
    link: "golf-detail.html?id=5" // Assuming we'll add details for ID 5 later
  },
  {
    id: "pkg3",
    courseId: 6, // Link to New Kuta Golf
    title: "Cliffside Golf Getaway at New Kuta",
    description: "Play Bali's first links-style course perched on limestone cliffs with stunning ocean views.",
    features: [
      "3-night stay in a cliff-view villa",
      "2 rounds of golf (18 holes each) at New Kuta Golf",
      "Sunset cocktails at the clubhouse",
      "Complimentary range balls",
      "Dedicated concierge service"
    ],
    price: "$119", // Updated: ceil(1950000 / 16450)
    unit: "per person (Package Estimate)",
    buttonText: "View Course & Book",
    link: "golf-detail.html?id=6" // Assuming we'll add details for ID 6 later
  },
];

function renderGolfPackages() {
  const packageSection = document.querySelector('.golf-packages');
  if (!packageSection) return;

  const packageContainer = packageSection.querySelector('.row');
  if (!packageContainer) return;

  packageContainer.innerHTML = ''; // Clear existing content

  golfPackages.forEach(pkg => {
    const packageCard = `
      <div class="col-lg-4 col-md-6">
          <div class="golf-package-card">
              <h3>${pkg.title}</h3>
              <p>${pkg.description}</p>
              <ul class="golf-package-features">
                  ${pkg.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
              </ul>
              <div class="golf-package-price">
                  ${pkg.price} <span>${pkg.unit}</span>
              </div>
              <a href="${pkg.link}" class="btn-package">${pkg.buttonText}</a>
          </div>
      </div>
    `;
    packageContainer.innerHTML += packageCard;
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // … your existing logic …
  if (window.location.pathname.includes('golf.html')) {
    renderGolfCourses();
    renderGolfPackages();       // ← add this
  }
  // … 
});

// Golf course data
const golfCourses = [
  {
    "id": 5,
    "island": "ntb",
    "name": "Kosaido Country Club",
    "type": "golf",
    "hero": {
      "title": "Kosaido Country Club",
      "tagline": "Lombok's premier international championship course.",
      "location": "Lombok Island, West Nusa Tenggara, Indonesia",
      "backgroundImage": "img/golf/kosaido-country-club-hero.jpg"
    },
    "overview": {
      "designer": "Peter Thompson, Michael Wolveridge & Perret",
      "difficultyLevel": "Championship",
      "courseDetails": { "holes": 18, "par": 72 },
      "bestSeason": "",
      "copywriting": [
        "Formerly known as Kosaido Country Club, Sire Beach Golf is the only international 18-hole, par-72 championship course in Lombok Island. Designed by Peter Thompson, Michael Wolveridge & Perret, it offers a unique and world-class experience.",
        "Holes 1–9 face the sea with the signature hole #4 adjacent to the white sandy beach. Holes 10–18 feature captivating mountain views, including Hole 12 (540 m, Par 5, Handicap 1). Each tee provides breathtaking vistas."
      ]
    },
    "pricing": [
      { "package": "Weekdays Golf fee (inclusive of caddy fee, green fee & cart fee)", "price": "$76" }, // Updated: ceil(1250000 / 16450)
      { "package": "Weekends/Public Holiday Golf fee (inclusive of caddy fee, green fee & cart fee)", "price": "$92" }, // Updated: ceil(1500000 / 16450)
      { "package": "Rental Golf Clubs – Performance", "price": "$34" }, // Updated: ceil(550000 / 16450)
      { "package": "Rental Golf Clubs – Regular", "price": "$21" }, // Updated: ceil(330000 / 16450)
      { "package": "Rental Shoes", "price": "$14" } // Updated: ceil(220000 / 16450)
    ],
    "facilities": [
      "Golf Course",
      "Driving range",
      "Pro shop"
    ],
    "details": {
      "grassType": "",
      "golfInclusions": "Caddy fee, green fee & cart fee included",
      "rentalClubs": { "performance": "$34", "regular": "$21" }, // Updated prices
      "rentalShoes": "$14" // Updated price
    },
    "signatureHole": {
      "description": "The signature hole (#4) on the front nine plays adjacent to the white-sand beach, offering breathtaking sea views."
    },
    "media": {
      "folder": "https://drive.google.com/drive/folders/1CajfefZC7auDnatTKDkUSvc8NzAaAtBr",
      "hero": "img/golf/courses/kosaido-country-club/1.jpg",
      "gallery": [
        "img/golf/courses/kosaido-country-club/1.jpg",
        "img/golf/courses/kosaido-country-club/2.jpeg",
        "img/golf/courses/kosaido-country-club/3.jpg",
        "img/golf/courses/kosaido-country-club/4.jpeg",
        "img/golf/courses/kosaido-country-club/5.jpeg",
        "img/golf/courses/kosaido-country-club/6.jpeg",
        "img/golf/courses/kosaido-country-club/7.jpeg",
        "img/golf/courses/kosaido-country-club/8.jpeg",
        "img/golf/courses/kosaido-country-club/9.jpg",
        "img/golf/courses/kosaido-country-club/10.jpeg",
        "img/golf/courses/kosaido-country-club/11.jpg",
        "img/golf/courses/kosaido-country-club/12.jpeg"
      ]
    }
  },
  {
    "id": 6,
    "island": "bali",
    "name": "New Kuta Golf",
    "type": "golf",
    "hero": {
      "title": "New Kuta Golf",
      "tagline": "Indonesia's first links-style layout perched on a limestone cliff.",
      "location": "Pecatu Indah Resort, Bukit Peninsula, Bali, Indonesia",
      "backgroundImage": "img/golf/new-kuta-golf-hero.jpg"
    },
    "overview": {
      "designer": "Ronald Fream, David Dale & Kevin Ramsey (USA)",
      "difficultyLevel": "Championship",
      "courseDetails": { "holes": 18, "par": 72 },
      "bestSeason": "",
      "copywriting": [
        "New Kuta Golf is an 85 hectare championship standard course and the first links-style layout in Indonesia. It challenges both the low handicapper and rewards the novice with five sets of tees for a satisfying experience at all skill levels.",
        "Located on a limestone cliff overlooking Dreamland and Balangan Beach within Pecatu Indah Resort, the course features natural desert-like vegetation and Seashore Paspalum turf. Tee times require one day in advance reservation for guests and members."
      ]
    },
    "pricing": [
      { "package": "18 Holes – Domestic & KIM's Holder (Weekday)", "price": "$116" }, // Updated: ceil(1900000 / 16450)
      { "package": "18 Holes – Domestic & KIM's Holder (Weekend/Public Holiday)", "price": "$140" }, // Updated: ceil(2300000 / 16450)
      { "package": "18 Holes – Foreign Visitor (Non KIM's Holder)", "price": "$140" }, // Updated: ceil(2300000 / 16450)
      { "package": "9 Holes – Domestic & KITAS (Weekday)", "price": "$61" }, // Updated: ceil(1000000 / 16450)
      { "package": "9 Holes – Domestic & KITAS (Weekend/Public Holiday)", "price": "$73" }, // Updated: ceil(1200000 / 16450)
      { "package": "9 Holes (Sunset) – Domestic & KITAS", "price": "$73" }, // Updated: ceil(1200000 / 16450)
      { "package": "9 Holes (Sunset) – Non KITAS Guest", "price": "$92" }, // Updated: ceil(1500000 / 16450)
      { "package": "Club Hire Premium – Domestic & KIM's Holder (Weekday)", "price": "$31" }, // Updated: ceil(500000 / 16450)
      { "package": "Club Hire Premium – Foreign Visitor", "price": "$37" }, // Updated: ceil(600000 / 16450)
      { "package": "Shoes Hire – Domestic & KIM's Holder (Weekday)", "price": "$6" }, // Updated: ceil(90000 / 16450)
      { "package": "Shoes Hire – Foreign Visitor", "price": "$10" }, // Updated: ceil(155000 / 16450)
      { "package": "50 Driving Range Balls", "price": "$4" }, // Updated: ceil(65000 / 16450)
      { "package": "100 Driving Range Balls", "price": "$7" }, // Updated: ceil(105000 / 16450)
      { "package": "Rider Fee For Guest/Non Golfer", "price": "$40" } // Updated: ceil(650000 / 16450)
    ],
    "facilities": [
      "Restaurant",
      "Driving range",
      "Pro Shop",
      "Golf Academy",
      "Locker Room",
      "Meeting Rooms"
    ],
    "details": {
      "grassType": "Seashore Paspalum",
      "blackTeesMeters": 6713,
      "goldTeesMeters": 6268,
      "blueTeesMeters": 5852,
      "whiteTeesMeters": 5403,
      "redTeesMeters": 4917,
      "inclusions": "Green fee, cart fee, caddy service, player's insurance, TAX 11% VAT & Complimentary 2 Bottles of Mineral Water",
      "morningGolfHours": "6:30 AM – 11:00 AM",
      "sunsetGolfHours": "3:00 PM – 6:30 PM"
    },
    "signatureHole": {},
    "media": {
      "hero": "img/golf/courses/new-kuta-golf/1.jpg",
      "gallery": [
        "img/golf/courses/new-kuta-golf/1.jpg",
        "img/golf/courses/new-kuta-golf/2.jpg",
        "img/golf/courses/new-kuta-golf/3.jpg",
        "img/golf/courses/new-kuta-golf/4.jpg",
        "img/golf/courses/new-kuta-golf/5.jpg",
        "img/golf/courses/new-kuta-golf/6.jpg",
        "img/golf/courses/new-kuta-golf/7.jpg",
        "img/golf/courses/new-kuta-golf/8.jpg",
        "img/golf/courses/new-kuta-golf/9.jpg",
        "img/golf/courses/new-kuta-golf/10.jpeg",
        "img/golf/courses/new-kuta-golf/11.jpg",
        "img/golf/courses/new-kuta-golf/12.jpg",
        "img/golf/courses/new-kuta-golf/13.jpg",
        "img/golf/courses/new-kuta-golf/14.jpg",
        "img/golf/courses/new-kuta-golf/15.jpg",
        "img/golf/courses/new-kuta-golf/16.jpg"
      ]
    }
  },
  {
    "id": 7,
    "island": "bali",
    "name": "Bukit Pandawa Golf & Country Club",
    "type": "golf",
    "hero": {
      "title": "Bukit Pandawa Golf & Country Club",
      "tagline": "Golf in Bali, like you never played before.",
      "location": "Bukit Peninsula, Bali, Indonesia",
      "backgroundImage": "img/golf/bukit-pandawa-hero.jpg"
    },
    "overview": {
      "designer": "Bob Moore",
      "difficultyLevel": "Championship",
      "courseDetails": { "holes": 18, "par": 54 },
      "bestSeason": "",
      "copywriting": [
        "Opened in October 2016, Bukit Pandawa Golf & Country Club is the latest addition to the growing collection of world-class golf courses in Bali. Situated on a limestone cliff-top overlooking the world-famous surf breaks of Bukit Peninsula, the venue offers 18 championship-caliber par-3 holes, many back-dropped by rustic architectural relics and spectacular views of the Indian Ocean, with a clubhouse inspired by Bali's grand temples.",
        "While the par-54 layout lets you finish a round in roughly 120 minutes, it is not short on challenges. Dramatic rock outcroppings, terraced rice paddies, white-sand beaches, and strategic waterfalls give the course a unique harmony and balance."
      ]
    },
    "pricing": [
      { "package": "Foreign – 18 Holes", "price": "$110" }, // Updated: ceil(1800000 / 16450)
      { "package": "Foreign – 27 Holes", "price": "$149" }, // Updated: ceil(2450000 / 16450)
      { "package": "Foreign – 36 Holes", "price": "$155" } // Updated: ceil(2550000 / 16450)
    ],
    "facilities": [
      "Driving range",
      "Pro shop",
      "Practice range",
      "Golf academy",
      "Dining, spa, and entertainment lounge"
    ],
    "details": {
      "grassType": "Pure Dynasty, a flexible and durable seashore paspalum",
      "blackTeesMeters": 2767,
      "goldTeesMeters": 2425,
      "blueTeesMeters": 2060,
      "golfCarts": "Included in green fee – two golfers may share one cart",
      "caddieService": "Required – one caddie per golfer",
      "teeTimeIntervals": "Every 10 minutes",
      "teeTimePolicy": "Advanced bookings required",
      "dressCode": "Tailored shorts/trousers, collared polo shirts, soft spikes, etc."
    },
    "signatureHole": {
      "description": "The 148-yard 13th hole, which is framed by three bunkers and features curved stone walls in the foreground and an ornate tower and the Indian Ocean in the background."
    },
    "media": {
      "folder": "https://www.dropbox.com/scl/fo/wus1d5m3me2e0xpq0i34j/ALFoydhCOPZZ7SQJ-0V39Ws?rlkey=9mnzn64epzld2yvbq6fa8rzh7&e=3&dl=0",
      "hero": "img/golf/courses/bukit-pandawa-golf-&-country-club/1.jpg",
      "gallery": [
        "img/golf/courses/bukit-pandawa-golf-&-country-club/1.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/2.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/3.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/4.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/5.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/6.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/7.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/8.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/9.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/10.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/11.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/12.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/13.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/14.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/15.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/16.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/17.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/18.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/19.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/20.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/21.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/22.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/23.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/24.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/25.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/26.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/27.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/28.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/29.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/30.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/31.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/32.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/33.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/34.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/35.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/36.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/37.jpg",
        "img/golf/courses/bukit-pandawa-golf-&-country-club/38.jpg"
      ]
    }
  },

];

// Signature Courses Data (Different from packages)
const signatureCourses = [
  {
    id: 5,
    title: "Kosaido Country Club",
    description: "Lombok's premier international championship course.",
    features: [
      { icon: "fas fa-flag", text: "18 Holes" },
      { icon: "fas fa-users", text: "Championship" },
      { icon: "fas fa-water", text: "Ocean View" }
    ],
    image: "img/golf/courses/kosaido-country-club/1.jpg",
    link: "golf-detail.html?id=5"
  },
  {
    id: 6,
    title: "New Kuta Golf",
    description: "Indonesia's first links-style layout perched on a limestone cliff.",
    features: [
      { icon: "fas fa-flag", text: "18 Holes" },
      { icon: "fas fa-users", text: "Championship" },
      { icon: "fas fa-water", text: "Ocean View" }
    ],
    image: "img/golf/courses/new-kuta-golf/1.jpg",
    link: "golf-detail.html?id=6"
  }
];

const golfItemsPerPage = 6; // Number of golf courses per page
let currentGolfPage = 1;
let currentGlobalFilteredGolfCourses = [...golfCourses]; // Initialize with all courses

// Function to get URL parameters
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to get golf course by ID
function getGolfCourseById(id) {
  return golfCourses.find(course => course.id === parseInt(id));
}

// Function to filter courses by island
function filterGolfCourses(selectedIsland) {
  if (!selectedIsland || selectedIsland === "") {
    currentGlobalFilteredGolfCourses = [...golfCourses]; // Show all if no island selected
  } else {
    currentGlobalFilteredGolfCourses = golfCourses.filter(course =>
      course.island && course.island.toLowerCase() === selectedIsland.toLowerCase()
    );
  }
  // Render the first page of the filtered results
  renderGolfCourses(1);
}

// Function to render golf courses for a specific page
function renderGolfCourses(page = 1) {
  const bookingSection = document.getElementById('booking_section');
  if (!bookingSection) return;

  const golfResultsContainer = bookingSection.querySelector('.golf-results .row');
  if (!golfResultsContainer) return;

  golfResultsContainer.innerHTML = '';
  currentGolfPage = page;

  // Filter courses that have hero data to display from the CURRENTLY filtered list
  const displayableCourses = currentGlobalFilteredGolfCourses.filter(course => course.hero && course.hero.title);

  const startIndex = (page - 1) * golfItemsPerPage;
  const endIndex = startIndex + golfItemsPerPage;
  const paginatedCourses = displayableCourses.slice(startIndex, endIndex);

  if (paginatedCourses.length === 0) {
    golfResultsContainer.innerHTML = '<p class="col-12 text-center">No golf courses found matching your criteria.</p>';
    renderPaginationControls(0); // Render empty pagination if no results
    return;
  }

  paginatedCourses.forEach(course => {
    // Use media.hero if available, otherwise hero.backgroundImage, then default
    const imageUrl = (course.media && course.media.hero)
      || course.hero.backgroundImage
      || 'img/default-golf-placeholder.jpg';
    const priceDisplay = course.pricing && course.pricing[0] ?
      `<span class="price">${course.pricing[0].price}</span><span class="unit">per person</span>` :
      '<span class="price">Price N/A</span>'; // Handle missing price
    const courseFeatures = course.overview.courseDetails ?
      `<span><i class="fas fa-flag"></i> ${course.overview.courseDetails.holes} Holes</span>
         <span><i class="fas fa-mountain"></i> ${course.overview.difficultyLevel || 'N/A'}</span>` :
      ''; // Handle missing overview details

    const courseCard = `
      <div class="col-lg-4 col-md-6">
        <div class="golf-result-card">
          <div class="golf-result-image">
            <img src="${imageUrl}" alt="${course.hero.title || 'Golf Course'}" onerror="this.onerror=null;this.src='img/default-golf-placeholder.jpg';">
            ${course.hero.tag ? `<div class="golf-result-tag">${course.hero.tag}</div>` : ''} 
          </div>
          <div class="golf-result-content">
            <h3>${course.hero.title || 'Unnamed Course'}</h3>
            <p class="golf-result-location"><i class="fas fa-map-marker-alt"></i> ${course.hero.location || 'Location N/A'}</p>
            <div class="golf-result-features">
              ${courseFeatures}
            </div>
            <div class="golf-result-footer">
              <div class="golf-result-price">
                ${priceDisplay}
              </div>
              <a href="golf-detail.html?id=${course.id}" class="btn-view">View Details</a>
            </div>
          </div>
        </div>
      </div>
    `;
    golfResultsContainer.innerHTML += courseCard;
  });

  renderPaginationControls(displayableCourses.length);
}

// Function to render pagination controls
function renderPaginationControls(totalItems) {
  const paginationWrapper = document.querySelector('.pagination__wrapper');
  if (!paginationWrapper) return;

  const paginationUl = paginationWrapper.querySelector('ul.pagination');
  if (!paginationUl) return;

  paginationUl.innerHTML = '';
  const totalPages = Math.ceil(totalItems / golfItemsPerPage);

  if (totalPages <= 1) {
    paginationWrapper.style.display = 'none';
    return;
  }
  paginationWrapper.style.display = 'block';

  // Previous Button
  let prevLi = document.createElement('li');
  prevLi.innerHTML = `<a href="#booking_section" class="prev ${currentGolfPage === 1 ? 'disabled' : ''}"><i class="bi bi-arrow-left-short"></i></a>`;
  if (currentGolfPage > 1) {
    prevLi.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      renderGolfCourses(currentGolfPage - 1); // Will render the correct page of the filtered list
    });
  }
  paginationUl.appendChild(prevLi);

  // Page Number Buttons 
  for (let i = 1; i <= totalPages; i++) {
    let pageLi = document.createElement('li');
    pageLi.innerHTML = `<a href="#booking_section" class="${i === currentGolfPage ? 'active' : ''}">${i}</a>`;
    if (i !== currentGolfPage) {
      pageLi.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        renderGolfCourses(i); // Will render the correct page of the filtered list
      });
    }
    paginationUl.appendChild(pageLi);
  }

  // Next Button
  let nextLi = document.createElement('li');
  nextLi.innerHTML = `<a href="#booking_section" class="next ${currentGolfPage === totalPages ? 'disabled' : ''}"><i class="bi bi-arrow-right-short"></i></a>`;
  if (currentGolfPage < totalPages) {
    nextLi.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      renderGolfCourses(currentGolfPage + 1); // Will render the correct page of the filtered list
    });
  }
  paginationUl.appendChild(nextLi);
}

// Function to render Signature Courses/Destinations
function renderSignatureCourses() {
  const destinationsSection = document.getElementById('golf-destinations');
  if (!destinationsSection) return;

  const destinationsContainer = destinationsSection.querySelector('.row');
  if (!destinationsContainer) return;

  destinationsContainer.innerHTML = ''; // Clear existing hardcoded content

  signatureCourses.forEach(course => {
    // Find the corresponding full course data
    const fullCourseData = getGolfCourseById(course.id);

    // Determine the image URL: use media.hero, fallback to hero.backgroundImage, then signature image, then default
    const imageUrl = (fullCourseData && fullCourseData.media && fullCourseData.media.hero)
      || (fullCourseData && fullCourseData.hero && fullCourseData.hero.backgroundImage)
      || course.image // Fallback to the original placeholder if no hero found
      || 'img/default-golf-placeholder.jpg'; // Final fallback

    const featuresHtml = course.features.map(feature =>
      `<span><i class="${feature.icon}"></i> ${feature.text}</span>`
    ).join('');

    const courseCard = `
      <div class="col-lg-6 col-md-6">
        <div class="golf-course-card">
          <a href="${course.link}">
            <img src="${imageUrl}" alt="${course.title}" class="golf-course-image" onerror="this.onerror=null;this.src='img/default-golf-placeholder.jpg';">
            <div class="golf-course-overlay">
              <h3>${course.title}</h3>
              <p>${course.description}</p>
              <div class="golf-course-features">
                ${featuresHtml}
              </div>
            </div>
          </a>
        </div>
      </div>
    `;
    destinationsContainer.innerHTML += courseCard;
  });
}

// Function to render golf course details
function renderGolfCourseDetails() {
  const courseId = getUrlParameter('id');
  if (!courseId) return;

  const course = getGolfCourseById(courseId);
  if (!course || !course.hero.title) return;

  // Update hero section
  const heroSection = document.querySelector('.golf-hero');
  if (heroSection) {
    // Prioritize the new media.hero property, fallback to hero.backgroundImage
    const heroImageUrl = (course.media && course.media.hero) || course.hero.backgroundImage;
    if (heroImageUrl) {
      heroSection.style.backgroundImage = `url('${heroImageUrl}')`;
    } else {
      // Optional: Set a default background if neither is available
      heroSection.style.backgroundImage = `url('img/golf/default-golf-hero.jpg')`;
    }

    const heroContent = heroSection.querySelector('.golf-hero-content');
    if (heroContent) {
      heroContent.innerHTML = `
        <p class="tagline">${course.hero.tagline}</p>
        <h1>${course.hero.title}</h1>
        <p class="location">${course.hero.location}</p>
      `;
    }
  }

  // Update overview section
  const overviewSection = document.querySelector('.golf-overview');
  if (overviewSection) {
    const overviewContent = overviewSection.querySelector('.overview-content');
    if (overviewContent) {
      // Update overview text
      const overviewText = overviewContent.querySelector('.overview-text');
      if (overviewText) {
        overviewText.innerHTML = `
          <h2 style="color: var(--primary-color);">Overview</h2>
          ${course.overview.copywriting.map(text => `<p>${text}</p>`).join('')}
        `;
      }

      // Update course details and highlights
      const infoRow = overviewContent.querySelector('.info-row');
      if (infoRow) {
        // Update course details
        const courseDetails = infoRow.querySelector('.course-details');
        if (courseDetails) {
          courseDetails.innerHTML = `
            <h4>Details</h4>
            <ul class="details-list">
              <li><strong>Grass Type:</strong> ${course.details.grassType}</li>
              <li><strong>Tee Distances:</strong>
                <ul>
                  <li>Black Tees: ${course.details.blackTeesMeters} meters</li>
                  <li>Gold Tees: ${course.details.goldTeesMeters} meters</li>
                  <li>Blue Tees: ${course.details.blueTeesMeters} meters</li>
                </ul>
              </li>
              <li><strong>Golf Carts:</strong> ${course.details.golfCarts}</li>
              <li><strong>Caddie Service:</strong> ${course.details.caddieService}</li>
              <li><strong>Tee Time Intervals:</strong> ${course.details.teeTimeIntervals}</li>
              <li><strong>Tee Time Policy:</strong> ${course.details.teeTimePolicy}</li>
              <li><strong>Dress Code:</strong> ${course.details.dressCode}</li>
            </ul>
          `;
        }

        // Update highlights list
        const highlightsList = infoRow.querySelector('.highlights-list');
        if (highlightsList) {
          highlightsList.innerHTML = `
            <div class="highlight-card">
              <i class="bi bi-dot"></i>
              <div class="highlight-content">
                <h4>Course Designer</h4>
                <p>${course.overview.designer}</p>
              </div>
            </div>
            <div class="highlight-card">
              <i class="bi bi-dot"></i>
              <div class="highlight-content">
                <h4>Course Details</h4>
                <p>Par ${course.overview.courseDetails.par} | ${course.overview.courseDetails.holes} holes</p>
              </div>
            </div>
            <div class="highlight-card">
              <i class="bi bi-dot"></i>
              <div class="highlight-content">
                <h4>Difficulty Level</h4>
                <p>${course.overview.difficultyLevel}</p>
              </div>
            </div>
          `;
        }
      }
    }
  }

  // Update pricing section
  const pricingSection = document.querySelector('.golf-pricing');
  if (pricingSection) {
    const pricingContent = pricingSection.querySelector('.pricing-content');
    if (pricingContent) {
      pricingContent.innerHTML = course.pricing.map(item => `
        <div class="pricing-row">
          <div>${item.package}</div>
          <div>${item.price}</div>
          <div>per person</div>
        </div>
      `).join('');
    }
  }

  // Update facilities section
  const experienceSection = document.querySelector('.golf-experience');
  if (experienceSection) {
    const experienceGrid = experienceSection.querySelector('.experience-grid');
    if (experienceGrid) {
      experienceGrid.innerHTML = course.facilities.map(facility => `
        <div class="experience-card">
          <i class="fas fa-check"></i>
          <h4>${facility}</h4>
        </div>
      `).join('');
    }
  }

  // Update gallery section
  const gallerySection = document.querySelector('.golf-gallery');
  if (gallerySection) {
    const galleryGrid = gallerySection.querySelector('.gallery-grid');
    if (galleryGrid) {
      galleryGrid.innerHTML = ''; // Clear existing gallery items
      if (course.media && course.media.gallery && course.media.gallery.length > 0) {
        course.media.gallery.forEach((imagePath, index) => {
          galleryGrid.innerHTML += `
            <div class="gallery-item">
              <img src="${imagePath}" alt="${course.name || 'Golf Course'} - Image ${index + 1}">
            </div>
          `;
        });
      } else {
        // Optionally display a message if no gallery images are available
        galleryGrid.innerHTML = '<p>No gallery images available for this course.</p>';
        gallerySection.style.display = 'none'; // Or hide the section
      }
    }
  }
}

// Function to render golf courses on island pages
function renderIslandGolfCourses(coursesData) {
  console.log("renderIslandGolfCourses: Function CALLED");

  const currentPath = window.location.pathname;
  console.log("renderIslandGolfCourses: currentPath is", currentPath);
  const islandMatch = currentPath.match(/island-([^.]+)\.html/);

  if (!islandMatch || islandMatch.length < 2) {
    console.error("renderIslandGolfCourses: Not on an island page or regex failed. islandMatch:", islandMatch);
    return;
  }

  let islandName = islandMatch[1].toLowerCase();
  console.log("renderIslandGolfCourses: Extracted raw island name from URL:", islandName);
  islandName = islandName.replace('-', ' ');
  console.log("renderIslandGolfCourses: Processed islandName for filtering:", islandName);

  const maxItems = 4;
  const comingSoonGolfCard = {
    "id": "coming-soon",
    "name": "Coming Soon Golf Course",
    "hero": {
      "title": "Coming Soon",
      "tagline": "New exciting courses are on the way!",
      "location": "To be announced"
    },
    "media": {
      "hero": "img/mock/coming-soon.jpg"
    },
    "link": "#",
    "description": "Details for this upcoming golf course will be available soon.",
    "features_html": "<span><i class=\"fas fa-hourglass-half\"></i> Coming Soon</span>"
  };

  if (!coursesData || coursesData.length === 0) {
    console.error("renderIslandGolfCourses: coursesData parameter is not available or empty.");
    return;
  }

  const filteredGolfCourses = coursesData.filter(course => {
    const courseIslandLower = course.island ? course.island.toLowerCase() : null;
    return courseIslandLower === islandName;
  }).slice(0, maxItems);

  console.log("renderIslandGolfCourses: Filtered golf courses for island page (", islandName, "):", JSON.parse(JSON.stringify(filteredGolfCourses)));

  // If no golf courses found for this island, hide the entire section
  if (filteredGolfCourses.length === 0) {
    const golfSectionToHide = document.querySelector('.island-golf-section');
    const marqueeToHide = document.querySelector('.bg_white.marquee');

    if (golfSectionToHide) {
      golfSectionToHide.style.display = 'none';
    }

    if (marqueeToHide) {
      marqueeToHide.style.display = 'none';
    }

    return;
  }

  const itemsToRender = [...filteredGolfCourses];

  while (itemsToRender.length < maxItems) {
    itemsToRender.push(JSON.parse(JSON.stringify(comingSoonGolfCard)));
  }
  console.log("renderIslandGolfCourses: Final itemsToRender:", JSON.parse(JSON.stringify(itemsToRender)));

  const gridContainer = document.querySelector('.golf-courses-list');
  if (gridContainer) {
    console.log("renderIslandGolfCourses: Found grid container (.golf-courses-list):");
    gridContainer.innerHTML = itemsToRender.map(course => {
      const courseLink = course.id === "coming-soon" ? "#" : `golf-detail.html?id=${course.id}`;
      const courseImage = (course.media && course.media.hero) || (course.hero && course.hero.backgroundImage) || 'img/mock/coming-soon-golf.jpg';
      const courseTitle = (course.hero && course.hero.title) || course.name || "Coming Soon";
      const courseDescription = (course.overview && course.overview.copywriting && course.overview.copywriting[0])
        || course.description
        || (course.hero && course.hero.tagline)
        || "Exciting golf experience.";

      let featuresHtml = '';
      if (course.id === "coming-soon") {
        featuresHtml = course.features_html || "<span><i class=\"fas fa-info-circle\"></i> Details Soon</span>";
      } else if (course.overview && course.overview.courseDetails) {
        featuresHtml = `<span><i class="fas fa-flag"></i> ${course.overview.courseDetails.holes} Holes</span>`;
        if (course.overview.difficultyLevel) {
          featuresHtml += `<span><i class="fas fa-mountain"></i> ${course.overview.difficultyLevel}</span>`;
        }
      } else {
        featuresHtml = `<span><i class="fas fa-info-circle"></i> Details Soon</span>`;
      }

      return `
                <div class="col-lg-3 col-md-6">
                    <div class="golf-course-card">
                        <a href="${courseLink}" style="text-decoration: none; color: inherit;">
                            <div class="image-wrapper">
                                <img src="${courseImage}" alt="${courseTitle}" class="img-fluid" onerror="this.onerror=null;this.src='img/mock/coming-soon-golf.jpg';">
                                <div class="overlay"></div>
                            </div>
                            <div class="content">
                                <h3>${courseTitle}</h3>
                                <p>${courseDescription.substring(0, 70)}${courseDescription.length > 70 ? '...' : ''}</p>
                                <div class="features">
                                    ${featuresHtml}
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            `;
    }).join('');
    console.log("renderIslandGolfCourses: Grid HTML injected into .golf-courses-list.");
  } else {
    console.error("renderIslandGolfCourses: Golf grid container (.golf-courses-list) NOT FOUND.");
  }
}

// Initialize the page
$(window).on('load', function () {
  // Check which page we're on and call appropriate render function
  if (window.location.pathname.includes('golf-detail.html')) {
    renderGolfCourseDetails();
  } else if (window.location.pathname.includes('golf.html')) {
    renderSignatureCourses();
    renderGolfCourses(1);
    renderGolfPackages();

    const locationFilter = document.getElementById('location-filter');
    if (locationFilter) {
      locationFilter.addEventListener('change', function () {
        filterGolfCourses(this.value);
      });
    }
  } else if (window.location.pathname.includes('island-')) {
    console.log("golf-data.js: Detected island page, calling renderIslandGolfCourses inside window.load with golfCourses data.");
    if (typeof golfCourses !== 'undefined' && golfCourses.length > 0) {
      renderIslandGolfCourses(golfCourses); // Pass golfCourses directly
    } else {
      console.error("golf-data.js: golfCourses is still undefined or empty even within window.load when trying to call renderIslandGolfCourses.");
    }
  }
});

// --- Add Modal Logic for Golf Detail Page ---
// [Modal JavaScript removed]

// --- Update Reserve Now Link Logic ---
if (window.location.pathname.includes('golf-detail.html')) {
  document.addEventListener('DOMContentLoaded', function () {
    const observer = new MutationObserver((mutationsList, observer) => {
      // Look for the pricing section or reserve button to know details are loaded
      const reserveLink = document.getElementById('reserveNowLink');
      // Make sure the link exists AND the pricing table has content (as a proxy for details loaded)
      const pricingContent = document.querySelector('.golf-pricing .pricing-content');
      if (reserveLink && pricingContent && pricingContent.children.length > 0) {
        const courseId = getUrlParameter('id');
        if (courseId) {
          reserveLink.href = `golf-booking.html?id=${courseId}`;
          console.log("Reserve link updated:", reserveLink.href); // Debug log
        } else {
          console.error("Could not get course ID to update reserve link.");
          reserveLink.href = `golf-booking.html`; // Fallback link
        }
        observer.disconnect(); // Stop observing once done
      }
    });
    // Start observing the body for changes (or a more specific container)
    observer.observe(document.body, { childList: true, subtree: true });
  });
} 