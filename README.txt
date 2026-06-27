ToolHub — static site
=====================

Upload all files in this folder to Cloudflare Pages (or any static host).
Folder structure:
  index.html            Homepage with all tools
  about.html
  contact.html
  privacy.html
  terms.html
  styles.css
  script.js             All tool logic — one file, guarded by element presence
  robots.txt
  sitemap.xml
  _headers              Cloudflare Pages security headers
  tools/                10 tool pages
  articles/             SEO articles (index + 5 posts)

To test locally:
  Just open index.html in your browser. All paths are relative, so it works
  from file:// or any subdirectory.

AdSense readiness:
  - Privacy Policy, Terms, About, Contact present
  - Unique titles, descriptions, canonicals on every page
  - JSON-LD SoftwareApplication / Article schema
  - No redirect links
  - Original 400+ word content on each tool page and article
