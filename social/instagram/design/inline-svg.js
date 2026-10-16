// Swaps every <div data-svg="path"> for that SVG file's own markup, so the page's fonts reach the
// art (an <img> SVG can't load IBM Plex Mono). Needs Chrome's --allow-file-access-from-files,
// which render.sh passes. `data-view-box` crops the art to a part of it (a pass card's shoe);
// nothing inside the art is changed.
for (const element of document.querySelectorAll('[data-svg]')) {
  const request = new XMLHttpRequest()
  request.open('GET', element.dataset.svg, false)
  request.send()
  element.innerHTML = request.responseText
  if (element.dataset.viewBox) {
    element.querySelector('svg').setAttribute('viewBox', element.dataset.viewBox)
  }
}
