import { showToast } from './ui.js';

export class Pagination {
  constructor(options) {
    this.container = options.container;
    this.total = options.total || 0;
    this.pageSize = options.pageSize || 10;
    this.currentPage = options.currentPage || 1;
    this.onChange = options.onChange || (() => {});
    this.maxPages = options.maxPages || 5;
  }

  get totalPages() {
    return Math.ceil(this.total / this.pageSize);
  }

  render() {
    if (this.totalPages <= 1) {
      this.container.innerHTML = '';
      return;
    }

    const pages = this.getVisiblePages();
    
    let html = '<div class="pagination">';
    
    html += `<button class="pagination-item ${this.currentPage === 1 ? 'disabled' : ''}" data-page="prev">上一页</button>`;
    
    if (pages[0] > 1) {
      html += `<button class="pagination-item" data-page="1">1</button>`;
      if (pages[0] > 2) {
        html += '<span class="pagination-item disabled">...</span>';
      }
    }
    
    pages.forEach(page => {
      html += `<button class="pagination-item ${page === this.currentPage ? 'active' : ''}" data-page="${page}">${page}</button>`;
    });
    
    if (pages[pages.length - 1] < this.totalPages) {
      if (pages[pages.length - 1] < this.totalPages - 1) {
        html += '<span class="pagination-item disabled">...</span>';
      }
      html += `<button class="pagination-item" data-page="${this.totalPages}">${this.totalPages}</button>`;
    }
    
    html += `<button class="pagination-item ${this.currentPage === this.totalPages ? 'disabled' : ''}" data-page="next">下一页</button>`;
    
    html += '</div>';
    
    this.container.innerHTML = html;
    this.bindEvents();
  }

  getVisiblePages() {
    const pages = [];
    let start = Math.max(1, this.currentPage - Math.floor(this.maxPages / 2));
    let end = Math.min(this.totalPages, start + this.maxPages - 1);
    
    if (end - start + 1 < this.maxPages) {
      start = Math.max(1, end - this.maxPages + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  bindEvents() {
    this.container.querySelectorAll('.pagination-item:not(.disabled)').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        
        if (page === 'prev') {
          this.goToPage(this.currentPage - 1);
        } else if (page === 'next') {
          this.goToPage(this.currentPage + 1);
        } else {
          this.goToPage(parseInt(page));
        }
      });
    });
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    
    this.currentPage = page;
    this.render();
    this.onChange(page);
  }

  setTotal(total) {
    this.total = total;
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
    this.render();
  }

  setPageSize(size) {
    this.pageSize = size;
    this.currentPage = 1;
    this.render();
  }
}

export function createInfiniteScroll(container, loadMore, options = {}) {
  const threshold = options.threshold || 200;
  let loading = false;
  let hasMore = true;

  const handleScroll = async () => {
    if (loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loading = true;
      
      try {
        const result = await loadMore();
        hasMore = result.hasMore;
      } catch (e) {
        showToast('加载失败', 'error');
      } finally {
        loading = false;
      }
    }
  };

  container.addEventListener('scroll', handleScroll);

  return {
    reset: () => {
      loading = false;
      hasMore = true;
    },
    setHasMore: (value) => {
      hasMore = value;
    }
  };
}

export function createLoadMoreButton(container, loadMore, options = {}) {
  const buttonText = options.buttonText || '加载更多';
  const loadingText = options.loadingText || '加载中...';
  let loading = false;
  let hasMore = true;

  const render = () => {
    if (!hasMore) {
      container.innerHTML = '<div class="empty-state" style="padding: 20px;"><p class="empty-state-text">没有更多了</p></div>';
      return;
    }

    container.innerHTML = `<button class="btn btn-outline" id="load-more-btn" style="width: 100%;">${loading ? loadingText : buttonText}</button>`;
    
    const btn = document.getElementById('load-more-btn');
    btn.addEventListener('click', handleClick);
  };

  const handleClick = async () => {
    if (loading) return;
    
    loading = true;
    render();

    try {
      const result = await loadMore();
      hasMore = result.hasMore;
    } catch (e) {
      showToast('加载失败', 'error');
    } finally {
      loading = false;
      render();
    }
  };

  render();

  return {
    reset: () => {
      loading = false;
      hasMore = true;
      render();
    },
    setHasMore: (value) => {
      hasMore = value;
      render();
    }
  };
}
