import smoothscroll from 'smoothscroll-polyfill'
smoothscroll.polyfill()

const navbarSmoothScroll = () => {
  window.addEventListener('click', (event) => {
    const link = event.target.closest('A')
    if (link && link.href.includes('#')) {
      event.preventDefault()
      const hash = new URL(link.href).hash
      const destination = document.querySelector(hash)
      destination.scrollIntoView({
        behavior: 'smooth'
      })
    }
  })
}

const animationObserver = () => {
  const elements = document.querySelectorAll('.fx')
  const options = { rootMargin: '0% 0% -5% 0%' }

  const callback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target
        const delay = entry.target.getAttribute('data-delay')
        const duration = entry.target.getAttribute('data-duration')
        const fx = entry.target.getAttribute('data-fx')
        element.style.visibility = 'visible'
        if (delay) { element.style.animationDelay = delay }
        if (duration) { element.style.animationDuration = duration }
        if (fx) { element.classList.add(fx) }

        observer.unobserve(entry.target)
      }
    })
  }

  const observer = new IntersectionObserver(callback, options)
  elements.forEach(elem => observer.observe(elem))
}

export default function ui() {
  animationObserver()
  navbarSmoothScroll()
}