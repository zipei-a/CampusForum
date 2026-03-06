const CACHE_PREFIX = 'campusForum_cache_';
const DEFAULT_TTL = 5 * 60 * 1000;

class DataCache {
  constructor() {
    this.memoryCache = new Map();
  }

  set(key, data, ttl = DEFAULT_TTL) {
    const cacheKey = CACHE_PREFIX + key;
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    this.memoryCache.set(cacheKey, cacheData);
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('localStorage缓存写入失败:', e);
    }
  }

  get(key) {
    const cacheKey = CACHE_PREFIX + key;
    
    let cacheData = this.memoryCache.get(cacheKey);
    
    if (!cacheData) {
      try {
        const stored = localStorage.getItem(cacheKey);
        if (stored) {
          cacheData = JSON.parse(stored);
          this.memoryCache.set(cacheKey, cacheData);
        }
      } catch (e) {
        console.warn('localStorage缓存读取失败:', e);
      }
    }
    
    if (!cacheData) return null;
    
    if (Date.now() - cacheData.timestamp > cacheData.ttl) {
      this.delete(key);
      return null;
    }
    
    return cacheData.data;
  }

  delete(key) {
    const cacheKey = CACHE_PREFIX + key;
    this.memoryCache.delete(cacheKey);
    try {
      localStorage.removeItem(cacheKey);
    } catch (e) {
      console.warn('localStorage缓存删除失败:', e);
    }
  }

  clear() {
    this.memoryCache.clear();
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_PREFIX))
        .forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('localStorage缓存清空失败:', e);
    }
  }

  has(key) {
    return this.get(key) !== null;
  }
}

export const cache = new DataCache();

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function lazyLoad(images) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

export function virtualScroll(container, items, renderItem, itemHeight = 100) {
  const visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
  let startIndex = 0;
  
  const render = () => {
    const scrollTop = container.scrollTop;
    startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, items.length);
    
    const fragment = document.createDocumentFragment();
    for (let i = startIndex; i < endIndex; i++) {
      const item = renderItem(items[i], i);
      item.style.position = 'absolute';
      item.style.top = `${i * itemHeight}px`;
      item.style.height = `${itemHeight}px`;
      fragment.appendChild(item);
    }
    
    container.innerHTML = '';
    container.style.height = `${items.length * itemHeight}px`;
    container.style.position = 'relative';
    container.appendChild(fragment);
  };
  
  container.addEventListener('scroll', throttle(render, 16));
  render();
  
  return { render };
}
