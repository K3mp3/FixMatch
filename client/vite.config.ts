import vue from '@vitejs/plugin-vue'
import fs from 'fs-extra'
import { fileURLToPath, URL } from 'node:url'
import path from 'path'
import Puppeteer from 'puppeteer'
import { defineConfig, loadEnv } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    build: {
      sourcemap: false,
      minify: true
    },
    plugins: [
      vue(),
      vueDevTools(),
      {
        name: 'prerender-spa',
        apply: 'build',
        closeBundle: async () => {
          if (mode !== 'production') return

          const distPath = path.resolve(__dirname, 'dist')
          const routesToPrerender = [
            '/', // landing page (note: this is just '/', not 'landing page')
            '/about-us',
            '/contact',
            '/user-agreements',
            '/privacy-policy',
            '/news'
          ]

          const browser = await Puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
          })

          for (const route of routesToPrerender) {
            const page = await browser.newPage()

            // Set a custom user agent to indicate prerendering
            await page.setUserAgent(
              'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36 puppeteer'
            )

            // Create the output directory for the route
            const outputDir = path.join(distPath, route === '/' ? '' : route.substring(1))
            await fs.ensureDir(outputDir)

            // Serve the built files locally
            const server = await import('serve-handler')
            const http = await import('http')
            const serverInstance = http.createServer((req, res) => {
              // @ts-ignore - Ignore type issues with serve-handler
              return server.default(req, res, { public: distPath })
            })

            const port = 5173
            await new Promise<void>((resolve) => {
              serverInstance.listen(port, () => resolve())
            })

            let url
            if (route === '/') {
              url = `http://localhost:${port}/`
            } else if (route.startsWith('/')) {
              url = `http://localhost:${port}/#${route}`
            } else {
              url = `http://localhost:${port}/#/`
            }

            await page.goto(url, {
              waitUntil: 'networkidle0',
              timeout: 30000
            })

            // Give time for Vue to hydrate and render
            await new Promise((r) => setTimeout(r, 2000))

            // Get the rendered HTML
            const html = await page.content()

            // Write the HTML to the output file
            const outputFile = path.join(outputDir, 'index.html')
            await fs.writeFile(outputFile, html)

            // Close the page and server
            await page.close()
            serverInstance.close()
          }

          await browser.close()
        }
      }
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      // For SPA routing support
      host: true,
      strictPort: false
    },
    // For SPA history mode
    base: '/'
  }
})
