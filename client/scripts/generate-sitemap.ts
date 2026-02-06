import fs from 'fs'

const baseUrl = 'https://fixmatch.se'

const urls = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about-us', changefreq: 'monthly', priority: 0.8 },
  { url: '/contact', changefreq: 'monthly', priority: 0.8 },
  { url: '/privacy-policy', changefreq: 'yearly', priority: 0.6 },
  { url: '/repair-shop-garage-home', changefreq: 'weekly', priority: 0.9 },
  { url: '/admin', changefreq: 'weekly', priority: 0.7 }
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ url, changefreq, priority }) => `  <url>
    <loc>${baseUrl}${url}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`

fs.writeFileSync('./public/sitemap.xml', sitemap)
// console.log('Sitemap generated successfully!')
