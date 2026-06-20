import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  noindex?: boolean;
  schemaMarkup?: object;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  ogType = 'website',
  noindex = false,
  schemaMarkup
}) => {
  useEffect(() => {
    // 1. Update title
    const fullTitle = `${title} | ShivStyle Official`;
    document.title = fullTitle;

    // Helper to update or create meta tags
    const updateMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to update link tag (canonical)
    const updateCanonicalLink = (url: string) => {
      let element = document.querySelector('link[rel="canonical"]');
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
      }
      element.setAttribute('href', url);
    };

    // 2. Standard Meta tags
    updateMetaTag('name', 'description', description);
    if (keywords) {
      updateMetaTag('name', 'keywords', keywords);
    } else {
      // Remove keywords if not provided to clean up head
      const keyElem = document.querySelector('meta[name="keywords"]');
      if (keyElem) keyElem.remove();
    }
    
    // 3. Open Graph / Facebook Meta Tags
    updateMetaTag('property', 'og:title', fullTitle);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:url', ogUrl || window.location.href);
    if (ogImage) {
      updateMetaTag('property', 'og:image', ogImage);
    } else {
      const imgElem = document.querySelector('property[name="og:image"]');
      if (imgElem) imgElem.remove();
    }

    // 4. Twitter Meta Tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', fullTitle);
    updateMetaTag('name', 'twitter:description', description);
    if (ogImage) {
      updateMetaTag('name', 'twitter:image', ogImage);
    } else {
      const twImg = document.querySelector('meta[name="twitter:image"]');
      if (twImg) twImg.remove();
    }

    // 5. Canonical link
    updateCanonicalLink(ogUrl || window.location.href);

    // 6. Robots index settings
    if (noindex) {
      updateMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      const robElem = document.querySelector('meta[name="robots"]');
      if (robElem) robElem.remove();
    }

    // 7. Schema markup (JSON-LD)
    let schemaScript = document.querySelector('script[id="json-ld-schema"]');
    if (schemaMarkup) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.setAttribute('type', 'application/ld+json');
        schemaScript.setAttribute('id', 'json-ld-schema');
        document.head.appendChild(schemaScript);
      }
      schemaScript.innerHTML = JSON.stringify(schemaMarkup);
    } else {
      if (schemaScript) schemaScript.remove();
    }

    return () => {
      const existingSchema = document.querySelector('script[id="json-ld-schema"]');
      if (existingSchema) existingSchema.remove();
    };

  }, [title, description, keywords, ogImage, ogUrl, ogType, noindex, schemaMarkup]);

  return null;
};

export default SEO;
