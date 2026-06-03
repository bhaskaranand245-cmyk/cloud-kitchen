import { MenuItem } from '../types';

// SEO helper to dynamically update browser head details
export function updatePageSEO(title: string, description: string, canonicalUrl?: string) {
  if (typeof window === 'undefined') return;

  // Title
  document.title = title;

  // Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // OpenGraph Title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', title);

  // OpenGraph Description
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', description);

  // OpenGraph Image
  let ogImg = document.querySelector('meta[property="og:image"]');
  if (!ogImg) {
    ogImg = document.createElement('meta');
    ogImg.setAttribute('property', 'og:image');
    document.head.appendChild(ogImg);
  }
  ogImg.setAttribute('content', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=1200&auto=format&fit=crop');

  // Canonical Link
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', canonicalUrl || window.location.href);
}

// Generate complete structured schema.org markup for Local Business & Restaurant
export function getStructuredSchema(config: { brandName: string; mobileNumber: string; address: string; email: string }, menuItems: MenuItem[]) {
  const brandName = config.brandName || "Bhagwati Cloud Kitchen";
  const mobileNumber = config.mobileNumber || "9960877739";
  const address = config.address || "Shop No. 4, Pune, Maharashtra";
  const email = config.email || "orders@bhagwaticloudkitchen.com";

  const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": brandName,
    "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop",
    "@id": "https://bhagwaticloudkitchen.com",
    "url": "https://bhagwaticloudkitchen.com",
    "telephone": "+91" + mobileNumber,
    "priceRange": "$$",
    "menu": "https://bhagwaticloudkitchen.com/menu",
    "servesCuisine": ["North Indian", "Gujarati Thali", "Maharashtrian", "Pure Vegetarian Home Style Food"],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address,
      "addressLocality": "Pune",
      "addressRegion": "Maharashtra",
      "postalCode": "411037",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 18.5204,
      "longitude": 73.8567
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "07:30",
      "closes": "22:30"
    },
    "acceptsReservations": "false"
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "name": brandName,
    "description": "Premium pure veg cloud kitchen and subscription-based Indian home-style tiffin service.",
    "telephone": "+91" + mobileNumber,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": address,
      "addressLocality": "Pune",
      "addressRegion": "Maharashtra",
      "postalCode": "411037",
      "addressCountry": "IN"
    },
    "hasMenu": {
      "@type": "Menu",
      "name": `${brandName} Delicious Pure-Veg Menu`,
      "hasMenuSection": [
        {
          "@type": "MenuSection",
          "name": "Maharaja Special Thalis",
          "description": "Authentic premium Indian royal lunch & dinner thali combos"
        },
        {
          "@type": "MenuSection",
          "name": "Daily Tiffin Subscriptions",
          "description": "Affordable and hygienic monthly plans with delivery"
        }
      ]
    }
  };

  return {
    restaurantSchema: JSON.stringify(restaurantSchema, null, 2),
    localBusinessSchema: JSON.stringify(localBusinessSchema, null, 2)
  };
}
