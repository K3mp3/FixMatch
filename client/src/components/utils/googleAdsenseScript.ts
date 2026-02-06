function loadAdSense() {
  // Check if script is already loaded
  if (document.querySelector('script[src*="adsbygoogle.js"]')) {
    return
  }

  const script = document.createElement('script')
  script.async = true
  script.src =
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6485247997045508'
  script.crossOrigin = 'anonymous'
  document.head.appendChild(script)
}
