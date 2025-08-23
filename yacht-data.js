// yacht-data.js
const yachts = [

    {
        id: 1,
        name: "Alexa",
        tagline: "An Intimate Indonesian Sailing Adventure for Couples",
        heroImage: "", // No specific hero image URL provided
        description: [
            "ALEXA is a luxurious sailing yacht from Indonesia, designed to provide couples with an intimate and exclusive maritime adventure. This exquisite vessel epitomizes understated elegance and luxury, ensuring a private escape amidst the serene beauty of the Indonesian archipelago. ALEXA offers an unparalleled experience where the enchanting allure of the sea is complemented by exceptional amenities and personalized service. The yacht's sophisticated design and serene ambiance create a perfect haven for romance, making it an ideal choice for couples seeking a secluded getaway.",
            "The true magic of ALEXA lies in the unforgettable moments it facilitates. Couples can revel in the awe-inspiring beauty of sunsets and the breathtaking spectacle of stargazing from the deck. Days are spent savoring fine wine on deserted beaches, diving into crystal-clear waters to swim with graceful manta rays, and relishing each other's company without the interruptions of daily life. Every detail on ALEXA is crafted to ensure guests can immerse themselves in these extraordinary experiences, creating cherished memories of love, adventure, and connection in one of the world's most captivating settings.",
            "A modern look with traditional lines. Teak wood, stainless steel, and tinted glass are combined. Antique art and contemporary classics fill the living spaces. Details like silk rugs, primitive sculptures, and crystal glasses are chosen with care.",
            "Exterior: Stunning ocean views from wraparound windows. Designer furnishings inside. Relax on the top deck's shaded daybed, or sun loungers, or dine at an intimate table.",
            "Interior: Thoughtful design, fabrics and furnishings all work together to create a calming and welcoming atmosphere for relaxation and contemplation.",
            "Cabins: The cabin's grand wrap-around windows offer an unobstructed view of the vast ocean, providing a sense of serenity and calmness. The interior is bathed in natural light, creating a welcoming ambiance that invites you to relax and feel at one with nature."
        ],
        keyDetails: {
            type: "Luxury Sailing Yacht",
            size: "31.00 m (102 ft)",
            capacity: "2 guests",
            cabins: "1 cabin",
            crew: "7 crew members",
            cruisingSpeed: "5 knots",
            maxSpeed: "8 knots",
            features: [
                "Licensed PADI dive center",
                "PADI development courses & equipment",
                "Wakeboarding",
                "SUP (Stand Up Paddleboarding)",
                "Canoeing",
                "Hiking",
                "Visiting local islands",
                "Pearl farm visits",
                "Complimentary signature Alexa massage",
                "Onboard spa therapist",
                "Library",
                "Lounge",
                "Open Kitchen",
                "Indoor Dining Area (seats up to 4)",
                "Under The Stars Sleeping Area",
                "Outdoor deck with oversized daybeds"
            ]
        },
        gallery: [], // No specific gallery images provided
        destinations: ["Indonesian Archipelago"],
        scheduleInfo: {
            upcoming: [
                {
                    dateRange: "December 1-5, 2023 Test",
                    status: "Available Test",
                    route: "Komodo Archipelago Exploration Test"
                },
                {
                    dateRange: "December 10-15, 2023 Test",
                    status: "Reserved Test",
                    route: "Raja Ampat Discovery Test"
                }
            ],
            specialVoyages: [
                {
                    name: "Holiday Getaway Test",
                    image: "img/yachts/mock-special-voyage-1.jpg", // Placeholder image
                    tag: "Limited Availability Test",
                    date: "December 22-28, 2023 Test",
                    location: "Secret Islands Test",
                    availability: "2 spots left Test",
                    description: "A festive holiday cruise through uncharted waters. Test description."
                }
            ],
            privateEvents: [
                {
                    name: "Exclusive Celebration Test",
                    iconClass: "bi bi-gift", // Mock icon
                    description: "Host your unique private event aboard Alexa. Test description.",
                    features: ["Custom catering Test", "Personalized itinerary Test", "Event coordination Test"]
                }
            ]
        },
        pricing: [], // No specific pricing packages provided
        specifications: {
            length: "31.00 m (102 ft)",
            beam: "6.50 m (21 ft)",
            draft: "2.50 m (8 ft)",
            tonnage: "116",
            engines: "2 x 350HP",
            navalArchitect: "Dream Boat Builders",
            interiorDesigner: "Veronika Blomgren"
        },
        facilitiesList: [
            "A Library",
            "Lounge",
            "Open Kitchen",
            "Indoor Dining Area Seating Up To 4 People",
            "Under The Stars Sleeping Area And Plenty Of Space Outside To Unwind And Enjoy The Views",
            "Guests Will Be Able To Dine At Leisure In The Air-Conditioned Dining Room Or On The Outdoor Deck.",
            "The Main Outdoor Deck Has Large Oversized Daybeds Shaded By Tarpaulin – Perfect For Relaxing Day Or Night And Enjoying The Fresh Sea Breezes."
        ],
        activitiesList: [
            "Licensed PADI dive center onboard, offering development courses and equipment for qualified divers.",
            "Wakeboarding",
            "SUP",
            "Canoeing",
            "Hiking",
            "Visiting local islands",
            "Pearl farms.",
            "Guests can also enjoy a complimentary signature Alexa massage from the onboard spa therapist."
        ],
        inclusions: [
            "Exclusive use of the crewed yacht",
            "All gourmet meals, refreshments & non-alcoholic drinks",
            "Unlimited dives per day, with equipment & divemaster",
            "Daily spa treatments",
            "National Park entrance fees",
            "Shore excursions",
            "Island expeditions, hiking & snorkeling",
            "Return transfers from/to Airport or hotel"
        ],
        exclusions: [
            "International & domestic airfare",
            "Passport, visas, airport & excess baggage fees",
            "Diving courses and certification",
            "Alcoholic beverages",
            "Travel & Medical Insurance",
            "Crew gratuity & personal expenses"
        ]
    }
];

// If this file is intended to be used as a module, you might want to export the data.
// For example, using ES modules:
// export default yachts;
// Or for CommonJS environments:
// module.exports = yachts; 

let yachtGridEl;
let paginationWrapperEl;
const itemsPerPage = 6;
let currentPage = 1;

function getSizeCategory(sizeString) {
    if (!sizeString) return 'medium';
    const match = sizeString.match(/(\d+(\.\d+)?)\s*m/);
    if (match && match[1]) {
        const sizeInMeters = parseFloat(match[1]);
        if (sizeInMeters < 20) return 'small';
        if (sizeInMeters <= 35) return 'medium';
        return 'large';
    }
    return 'medium';
}

function getExperienceTags(yacht) {
    const experiences = new Set();
    const textToSearch = ((yacht.tagline || '') + ' ' + (yacht.description ? yacht.description.join(' ') : '')).toLowerCase();
    if (textToSearch.includes('couple') || textToSearch.includes('romance') || textToSearch.includes('intimate')) experiences.add('romance');
    if (textToSearch.includes('adventure') || textToSearch.includes('explore') || textToSearch.includes('dive')) experiences.add('adventure');
    if (textToSearch.includes('family') || textToSearch.includes('children')) experiences.add('family');
    if (textToSearch.includes('leisure') || textToSearch.includes('relax') || experiences.size === 0) experiences.add('leisure');
    return Array.from(experiences).join(' ');
}

function getDestinationTags(destinationsArray) {
    if (!destinationsArray || destinationsArray.length === 0) return 'all';
    const knownFilterValues = ['bali', 'komodo', 'raja-ampat'];
    const tags = new Set();
    destinationsArray.forEach(destStr => {
        const lowerDestStr = destStr.toLowerCase();
        knownFilterValues.forEach(filterVal => {
            if (lowerDestStr.includes(filterVal)) {
                tags.add(filterVal);
            }
        });
    });
    if (tags.size === 0) {
        const genericMatch = destinationsArray.some(d => d.toLowerCase().includes("indonesia") || d.toLowerCase().includes("archipelago"));
        if (genericMatch && (knownFilterValues.includes('komodo') || knownFilterValues.includes('raja-ampat') || knownFilterValues.includes('bali'))) {
        } else if (destinationsArray.length > 0) {
             return ""; 
        }
    }
    return Array.from(tags).join(' ');
}

function renderYachtCard(yacht) {
    const col = document.createElement('div');
    col.className = 'col yacht-item';
    col.dataset.destination = getDestinationTags(yacht.destinations);
    col.dataset.size = getSizeCategory(yacht.keyDetails ? yacht.keyDetails.size : (yacht.specifications ? yacht.specifications.length : ''));
    col.dataset.experience = getExperienceTags(yacht);
    const card = document.createElement('div');
    card.className = 'yacht-card';
    const imageDiv = document.createElement('div');
    imageDiv.className = 'yacht-image';
    const img = document.createElement('img');
    img.src = yacht.heroImage || 'img/hero_home_2.jpg';
    img.alt = yacht.name || 'Luxury Yacht';
    img.className = 'img-fluid';
    const tagDiv = document.createElement('div');
    tagDiv.className = 'yacht-tag';
    tagDiv.textContent = yacht.cardTag || (yacht.keyDetails ? yacht.keyDetails.type : 'Luxury'); 
    imageDiv.appendChild(img);
    imageDiv.appendChild(tagDiv);
    const detailDiv = document.createElement('div');
    detailDiv.className = 'yacht-detail';
    const title = document.createElement('h4');
    title.textContent = yacht.name || 'Unnamed Yacht';
    const specsDiv = document.createElement('div');
    specsDiv.className = 'yacht-specs';
    const sizeSpec = (yacht.keyDetails ? yacht.keyDetails.size : null) || (yacht.specifications ? yacht.specifications.length : 'N/A');
    const capacitySpec = yacht.keyDetails ? yacht.keyDetails.capacity : 'N/A';
    const crewSpec = yacht.keyDetails ? yacht.keyDetails.crew : 'N/A';
    specsDiv.innerHTML = `
        <span><i class="bi bi-rulers"></i> ${sizeSpec}</span>
        <span><i class="bi bi-people-fill"></i> ${capacitySpec}</span>
        <span><i class="bi bi-person-check-fill"></i> ${crewSpec}</span>
    `;
    const descriptionP = document.createElement('p');
    descriptionP.textContent = (yacht.description && yacht.description.length > 0) ? yacht.description[0] : 'Experience unparalleled luxury on the seas.';
    const link = document.createElement('a');
    link.href = `yacht-detail.html?id=${yacht.id || 'default'}`;
    link.className = 'btn_1 outline';
    link.textContent = 'View Details';
    detailDiv.appendChild(title);
    detailDiv.appendChild(specsDiv);
    detailDiv.appendChild(descriptionP);
    detailDiv.appendChild(link);
    card.appendChild(imageDiv);
    card.appendChild(detailDiv);
    col.appendChild(card);
    return col;
}

function displayPage(page) {
    if (!yachtGridEl) {
        console.error('[yacht-data.js] Yacht grid container not found in displayPage.');
        return;
    }
    yachtGridEl.innerHTML = ''; 
    currentPage = page;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedYachts = yachts.slice(start, end); // Use the global 'yachts' array
    if (paginatedYachts.length === 0 && page === 1) {
         yachtGridEl.innerHTML = '<p class="col-12 text-center" style="width: 100%;">No yachts available at the moment.</p>';
    } else {
        paginatedYachts.forEach(yacht => {
            yachtGridEl.appendChild(renderYachtCard(yacht));
        });
    }
    setupPagination(); 
}

function setupPagination() {
    if (!paginationWrapperEl) {
         console.error('[yacht-data.js] Pagination wrapper not found in setupPagination.');
        return;
    }
    const existingUl = paginationWrapperEl.querySelector('ul.pagination');
    if (existingUl) existingUl.remove();
    const pageCount = Math.ceil(yachts.length / itemsPerPage); // Use the global 'yachts' array
    if (pageCount <= 1 && yachts.length > 0) { 
        return;
    }
    if (yachts.length === 0) return; 
    const ul = document.createElement('ul');
    ul.className = 'pagination';
    const prevLi = document.createElement('li');
    const prevA = document.createElement('a');
    prevA.href = '#0'; 
    prevA.classList.add('prev');
    prevA.innerHTML = '<i class="bi bi-arrow-left-short"></i>';
    if (currentPage === 1) {
        prevLi.classList.add('disabled'); 
    } else {
        prevA.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) displayPage(currentPage - 1);
        });
    }
    prevLi.appendChild(prevA);
    ul.appendChild(prevLi);
    for (let i = 1; i <= pageCount; i++) {
        const pageLi = document.createElement('li');
        const pageA = document.createElement('a');
        pageA.href = '#0';
        pageA.textContent = i;
        if (i === currentPage) {
            pageA.classList.add('active');
        }
        pageA.addEventListener('click', (e) => {
            e.preventDefault();
            displayPage(i);
        });
        pageLi.appendChild(pageA);
        ul.appendChild(pageLi);
    }
    const nextLi = document.createElement('li');
    const nextA = document.createElement('a');
    nextA.href = '#0';
    nextA.classList.add('next');
    nextA.innerHTML = '<i class="bi bi-arrow-right-short"></i>';
    if (currentPage === pageCount) {
        nextLi.classList.add('disabled');
    } else {
        nextA.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < pageCount) displayPage(currentPage + 1);
        });
    }
    nextLi.appendChild(nextA);
    ul.appendChild(nextLi);
    paginationWrapperEl.prepend(ul);
}

function initializeYachtDisplay() {
    console.log("[yacht-data.js] Initializing yacht display (temp no availability message).");
    yachtGridEl = document.querySelector('.yacht-grid');
    paginationWrapperEl = document.querySelector('.pagination__wrapper');

    if (!yachtGridEl) {
        console.error("[yacht-data.js] CRITICAL: .yacht-grid element not found in the DOM.");
        return;
    }

    // Display "No yachts available" message
    yachtGridEl.innerHTML = '<div class="col-12 text-center"><p style="font-size: 1.2rem; color: #555; padding: 40px 0;">No yachts available at this time. Please check back later or contact us for bespoke arrangements.</p></div>';

    // Ensure no pagination is shown
    if (paginationWrapperEl) {
        const existingUl = paginationWrapperEl.querySelector('ul.pagination');
        if (existingUl) existingUl.remove();
        // Remove the <br> if it's consistently there and only for pagination
        const brElement = paginationWrapperEl.querySelector('br');
        if (brElement) brElement.remove(); 
    }
    console.log("[yacht-data.js] 'No yachts available' message displayed.");
}

// Self-initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeYachtDisplay); 