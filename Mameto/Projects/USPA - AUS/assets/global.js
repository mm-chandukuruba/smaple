// /* ----------- megamenu start --------- */
//display megamenu on hover
document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer, menu-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const megaMenuContainers = document.querySelectorAll(".mega-menu");

megaMenuContainers.forEach(container => {
    let isHovered = false;

    container.addEventListener("mouseenter", function() {
        isHovered = true;
        this.setAttribute("open", "true");
    });

    container.addEventListener("mouseleave", function() {
        isHovered = false;
        // Wait for a short delay before removing the 'open' attribute
        setTimeout(() => {
            if (!isHovered) {
                this.removeAttribute("open");
            }
        }, 200); // Adjust the delay as needed
    });

    // Ensure the 'open' attribute remains when clicking inside the mega-menu
    container.addEventListener("click", function() {
        isHovered = true;
        this.setAttribute("open", "true");
    });
});
/* ----------- megamenu end --------- */

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer, menu-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (event.target !== container && event.target !== last && event.target !== first) return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if ((event.target === container || event.target === first) && event.shiftKey) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (
    elementToFocus.tagName === 'INPUT' &&
    ['search', 'text', 'email', 'url'].includes(elementToFocus.type) &&
    elementToFocus.value
  ) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(':focus-visible');
} catch (e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = [
    'ARROWUP',
    'ARROWDOWN',
    'ARROWLEFT',
    'ARROWRIGHT',
    'TAB',
    'ENTER',
    'SPACE',
    'ESCAPE',
    'HOME',
    'END',
    'PAGEUP',
    'PAGEDOWN',
  ];
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener(
    'focus',
    () => {
      if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

      if (mouseClick) return;

      currentFocusedElement = document.activeElement;
      currentFocusedElement.classList.add('focused');
    },
    true
  );
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true });
    this.input.addEventListener('change', this.onInputChange.bind(this));
    this.querySelectorAll('button').forEach((button) =>
      button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.quantityUpdate, this.validateQtyRules.bind(this));
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange(event) {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const min = parseInt(this.input.min);
      const buttonMinus = this.querySelector(".quantity__button[name='minus']");
      buttonMinus.classList.toggle('disabled', value <= min);
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity__button[name='plus']");
      buttonPlus.classList.toggle('disabled', value >= max);
    }
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: `application/${type}` },
  };
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent('on' + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement('form');
  form.setAttribute('method', method);
  form.setAttribute('action', path);

  for (var key in params) {
    var hiddenField = document.createElement('input');
    hiddenField.setAttribute('type', 'hidden');
    hiddenField.setAttribute('name', key);
    hiddenField.setAttribute('value', params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (country_domid, province_domid, options) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler, this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function (e) {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = '';
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach((summary) =>
      summary.addEventListener('click', this.onSummaryClick.bind(this))
    );
    this.querySelectorAll('button:not(.localization-selector)').forEach((button) =>
      button.addEventListener('click', this.onCloseButtonClick.bind(this))
    );
  }

  onKeyUp(event) {
    if (event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if (!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle
      ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary'))
      : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if (isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);

      if (window.matchMedia('(max-width: 990px)')) {
        document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
      }
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches
          ? addTrapFocus()
          : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach((details) => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach((submenu) => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);

    if (event instanceof KeyboardEvent) elementToFocus?.setAttribute('aria-expanded', false);
  }

  onFocusOut() {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement))
        this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.querySelector('.section-header');
    this.borderOffset =
      this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty(
      '--header-bottom-position',
      `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
    );
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    window.addEventListener('resize', this.onResize);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    if (!elementToFocus) return;
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.header &&
      document.documentElement.style.setProperty(
        '--header-bottom-position',
        `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`
      );
    document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
  };
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener('click', this.hide.bind(this, false));
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
      if (deferredElement.nodeName == 'VIDEO' && deferredElement.getAttribute('autoplay')) {
        // force autoplay for safari
        deferredElement.play();
      }
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('[id^="Slider-"]');
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver((entries) => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter((element) => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    this.slidesPerPage = Math.floor(
      (this.slider.clientWidth - this.sliderItemsToShow[0].offsetLeft) / this.sliderItemOffset
    );
    this.totalPages = this.sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  resetPages() {
    this.sliderItems = this.querySelectorAll('[id^="Slide-"]');
    this.initPages();
  }

  update() {
    // Temporarily prevents unneeded updates resulting from variant changes
    // This should be refactored as part of https://github.com/Shopify/dawn/issues/2057
    if (!this.slider || !this.nextButton) return;

    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(
        new CustomEvent('slideChanged', {
          detail: {
            currentPage: this.currentPage,
            currentElement: this.sliderItemsToShow[this.currentPage - 1],
          },
        })
      );
    }

    if (this.enableSliderLooping) return;

    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return element.offsetLeft + element.clientWidth <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition =
      event.currentTarget.name === 'next'
        ? this.slider.scrollLeft + step * this.sliderItemOffset
        : this.slider.scrollLeft - step * this.sliderItemOffset;
    this.setSlidePosition(this.slideScrollPosition);
  }

  setSlidePosition(position) {
    this.slider.scrollTo({
      left: position,
    });
  }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;

    if (!this.sliderControlWrapper) return;

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

    this.announcementBarSlider = this.querySelector('.announcement-bar-slider');
    // Value below should match --duration-announcement-bar CSS value
    this.announcerBarAnimationDelay = this.announcementBarSlider ? 250 : 0;

    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach((link) => link.addEventListener('click', this.linkToSlide.bind(this)));
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();

    if (this.announcementBarSlider) {
      this.announcementBarArrowButtonWasClicked = false;

      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.reducedMotion.addEventListener('change', () => {
        if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
      });

      [this.prevButton, this.nextButton].forEach((button) => {
        button.addEventListener(
          'click',
          () => {
            this.announcementBarArrowButtonWasClicked = true;
          },
          { once: true }
        );
      });
    }

    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
  }

  setAutoPlay() {
    this.autoplaySpeed = this.slider.dataset.speed * 1000;
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));

    if (this.querySelector('.slideshow__autoplay')) {
      this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
      this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
      this.autoplayButtonIsSetToPlay = true;
      this.play();
    } else {
      this.reducedMotion.matches || this.announcementBarArrowButtonWasClicked
        ? this.pause()
        : this.play();
    }
  }

  onButtonClick(event) {
    super.onButtonClick(event);
    this.wasClicked = true;

    const isFirstSlide = this.currentPage === 1;
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

    if (!isFirstSlide && !isLastSlide) {
      this.applyAnimationToAnnouncementBar(event.currentTarget.name);
      return;
    }

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition =
        this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }

    this.setSlidePosition(this.slideScrollPosition);

    this.applyAnimationToAnnouncementBar(event.currentTarget.name);
  }

  setSlidePosition(position) {
    if (this.setPositionTimeout) clearTimeout(this.setPositionTimeout);
    this.setPositionTimeout = setTimeout(() => {
      this.slider.scrollTo({
        left: position,
      });
    }, this.announcerBarAnimationDelay);
  }

  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach((link) => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }

  focusOutHandling(event) {
    if (this.sliderAutoplayButton) {
      const focusedOnAutoplayButton =
        event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
      if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
      this.play();
    } else if (
      !this.reducedMotion.matches &&
      !this.announcementBarArrowButtonWasClicked
    ) {
      this.play();
    }
  }

  focusInHandling(event) {
    if (this.sliderAutoplayButton) {
      const focusedOnAutoplayButton =
        event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
      if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
        this.play();
      } else if (this.autoplayButtonIsSetToPlay) {
        this.pause();
      }
    } else if (this.announcementBarSlider.contains(event.target)) {
      this.pause();
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
    }
  }

  autoRotateSlides() {
    const slideScrollPosition =
      this.currentPage === this.sliderItems.length
        ? 0
        : this.slider.scrollLeft + this.sliderItemOffset;

    this.setSlidePosition(slideScrollPosition);
    this.applyAnimationToAnnouncementBar();
  }

  setSlideVisibility(event) {
    this.sliderItemsToShow.forEach((item, index) => {
      const linkElements = item.querySelectorAll('a');
      if (index === this.currentPage - 1) {
        if (linkElements.length)
          linkElements.forEach((button) => {
            button.removeAttribute('tabindex');
          });
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (linkElements.length)
          linkElements.forEach((button) => {
            button.setAttribute('tabindex', '-1');
          });
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
    this.wasClicked = false;
  }

  applyAnimationToAnnouncementBar(button = 'next') {
    if (!this.announcementBarSlider) return;

    const itemsCount = this.sliderItems.length;
    const increment = button === 'next' ? 1 : -1;

    const currentIndex = this.currentPage - 1;
    let nextIndex = (currentIndex + increment) % itemsCount;
    nextIndex = nextIndex === -1 ? itemsCount - 1 : nextIndex;

    const nextSlide = this.sliderItems[nextIndex];
    const currentSlide = this.sliderItems[currentIndex];

    const animationClassIn = 'announcement-bar-slider--fade-in';
    const animationClassOut = 'announcement-bar-slider--fade-out';

    const isFirstSlide = currentIndex === 0;
    const isLastSlide = currentIndex === itemsCount - 1;

    const shouldMoveNext = (button === 'next' && !isLastSlide) || (button === 'previous' && isFirstSlide);
    const direction = shouldMoveNext ? 'next' : 'previous';

    currentSlide.classList.add(`${animationClassOut}-${direction}`);
    nextSlide.classList.add(`${animationClassIn}-${direction}`);

    setTimeout(() => {
      currentSlide.classList.remove(`${animationClassOut}-${direction}`);
      nextSlide.classList.remove(`${animationClassIn}-${direction}`);
    }, this.announcerBarAnimationDelay * 2);
  }

  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition =
      this.slider.scrollLeft +
      this.sliderFirstItemNode.clientWidth *
      (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition,
    });
  }
}

customElements.define('slideshow-component', SlideshowComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();
    this.updateVariantStatuses();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options
        .map((option, index) => {
          return this.options[index] === option;
        })
        .includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGalleries = document.querySelectorAll(`[id^="MediaGallery-${this.dataset.section}"]`);
    mediaGalleries.forEach((mediaGallery) =>
      mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true)
    );

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(
      `#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
    );
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(
      (variant) => this.querySelector(':checked').value === variant.option1
    );
    const inputWrappers = [...this.querySelectorAll('.product-form__input')];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [...option.querySelectorAll('input[type="radio"], option')];
      const previousOptionSelected = inputWrappers[index - 1].querySelector(':checked').value;
      const availableOptionInputsValue = selectedOptionOneVariants
        .filter((variant) => variant.available && variant[`option${index}`] === previousOptionSelected)
        .map((variantOption) => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue);
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.innerText = input.getAttribute('value');
      } else {
        input.innerText = window.variantStrings.unavailable_with_option.replace('[value]', input.getAttribute('value'));
      }
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    const requestedVariantId = this.currentVariant.id;
    const sectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;

    fetch(
      `${this.dataset.url}?variant=${requestedVariantId}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section
      }`
    )
      .then((response) => response.text())
      .then((responseText) => {
        // prevent unnecessary ui changes from abandoned selections
        if (this.currentVariant.id !== requestedVariantId) return;

        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const destination = document.getElementById(`price-${this.dataset.section}`);
        const source = html.getElementById(
          `price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
        );
        const skuSource = html.getElementById(
          `Sku-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
        );
        const skuDestination = document.getElementById(`Sku-${this.dataset.section}`);
        const inventorySource = html.getElementById(
          `Inventory-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
        );
        const inventoryDestination = document.getElementById(`Inventory-${this.dataset.section}`);

        const volumePricingSource = html.getElementById(
          `Volume-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`
        );

        const pricePerItemDestination = document.getElementById(`Price-Per-Item-${this.dataset.section}`);
        const pricePerItemSource = html.getElementById(`Price-Per-Item-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);

        const volumePricingDestination = document.getElementById(`Volume-${this.dataset.section}`);

        if (source && destination) destination.innerHTML = source.innerHTML;
        if (inventorySource && inventoryDestination) inventoryDestination.innerHTML = inventorySource.innerHTML;
        if (skuSource && skuDestination) {
          skuDestination.innerHTML = skuSource.innerHTML;
          skuDestination.classList.toggle('visibility-hidden', skuSource.classList.contains('visibility-hidden'));
        }

        if (volumePricingSource && volumePricingDestination) {
          volumePricingDestination.innerHTML = volumePricingSource.innerHTML;
        }

        if (pricePerItemSource && pricePerItemDestination) {
          pricePerItemDestination.innerHTML = pricePerItemSource.innerHTML;
          pricePerItemDestination.classList.toggle('visibility-hidden', pricePerItemSource.classList.contains('visibility-hidden'));
        }

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');

        if (inventoryDestination)
          inventoryDestination.classList.toggle('visibility-hidden', inventorySource.innerText === '');

        const addButtonUpdated = html.getElementById(`ProductSubmitButton-${sectionId}`);
        this.toggleAddButton(
          addButtonUpdated ? addButtonUpdated.hasAttribute('disabled') : true,
          window.variantStrings.soldOut
        );

        publish(PUB_SUB_EVENTS.variantChange, {
          data: {
            sectionId,
            html,
            variant: this.currentVariant,
          },
        });
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    const inventory = document.getElementById(`Inventory-${this.dataset.section}`);
    const sku = document.getElementById(`Sku-${this.dataset.section}`);
    const pricePerItem = document.getElementById(`Price-Per-Item-${this.dataset.section}`);

    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
    if (inventory) inventory.classList.add('visibility-hidden');
    if (sku) sku.classList.add('visibility-hidden');
    if (pricePerItem) pricePerItem.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
    this.options = this.updateOptions();
    this.addRadioEventListeners();
    const initiallySelectedRadios = this.querySelectorAll('input[type="radio"]:checked');
    if (initiallySelectedRadios.length > 0) {
      initiallySelectedRadios.forEach(radio => {
        this.handleRadioChange({ target: radio });
      });
    }
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach((input) => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.classList.remove('disabled');
      } else {
        input.classList.add('disabled');
      }
    });
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }

  addRadioEventListeners() {
    const radioInputs = this.querySelectorAll('input[type="radio"]');
    radioInputs.forEach(input => {
      input.addEventListener('change', this.handleRadioChange.bind(this));
    });
  }

  handleRadioChange(event) {
    const selectedElement = event.target;
    const selectedValue = selectedElement.value;
    selectedElement.closest('.product-form__input').querySelector('.selected-option').innerText = selectedValue;
  }
}

customElements.define('variant-radios', VariantRadios);

//code to handle variant as a product for PDP and quick-shop
class ColorVariantImages extends HTMLElement{
  constructor(){
    super();
    this.querySelectorAll('button')?.forEach(element=>{
      element.addEventListener('click', this.onVariantClick.bind(this))
    })
  }
  onVariantClick(event){
    event.stopPropagation()
    const buttonElement = event.target.closest("button")
    this.productUrl = buttonElement.dataset.url
    this.sectionId = buttonElement.dataset.sectionId
    this.pageUrl = window.location.href.includes("products")
    this.renderSection(this.productUrl, this.sectionId, this.pageUrl)
  }
  renderSection(productUrl, sectionId, pageUrl){
    if(pageUrl){
      fetch(`${productUrl}?section_id=${sectionId}`)
      .then(res=>res.text())
      .then(responseText=>{
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const destination = document.querySelector(`#MainProduct-${sectionId}`)
        destination.innerHTML = html.querySelector(`#MainProduct-${sectionId}`).innerHTML
        this.updateUrl()
        document.querySelector("product-modal").innerHTML = html.querySelector("product-modal").innerHTML
        this.updateUrl()
        //Initialising the Dynamic Checkout button
        Shopify.PaymentButton.init()
        this.initialiseWishlist(destination)
      })
    }else{
      fetch(`${productUrl}`)
      .then(res=>res.text())
      .then(responseText=>{
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        this.modalContent = this.closest('[id^="QuickAddInfo-"]');
        this.productElement = html.querySelector('section[id^="MainProduct-"]');
        
        this.preventDuplicatedIDs();
        this.removeDOMElements();
        this.setQuickAddInnerHTML(this.modalContent, this.productElement.innerHTML);
        this.removeGalleryListSemantic();
        this.showAllImages();
        this.preventVariantURLSwitching();
        //Initialising the Dynamic Checkout button
        Shopify.PaymentButton.init()
        sizeGuide()
      })
    }
  }
  updateUrl(){
    window.history.replaceState({}, '', `${this.productUrl}`);
  }
  setQuickAddInnerHTML(element, html) {
    element.innerHTML = html;

    // Reinjects the script tags to allow execution. By default, scripts are disabled when using element.innerHTML.
    element.querySelectorAll('script').forEach((oldScriptTag) => {
      const newScriptTag = document.createElement('script');
      Array.from(oldScriptTag.attributes).forEach((attribute) => {
        newScriptTag.setAttribute(attribute.name, attribute.value);
      });
      newScriptTag.appendChild(document.createTextNode(oldScriptTag.innerHTML));
      oldScriptTag.parentNode.replaceChild(newScriptTag, oldScriptTag);
    });
  }
  initialiseWishlist(container){
      // Dynamically adds classes to the wishlist container to ensure proper initialization of the wishlist app
      const wishlistBtn = container.querySelector(".icon-wishlist-heart-empty");
        if (wishlistBtn) {
          wishlistBtn.removeAttribute('style');
          wishlistBtn.style.setProperty('display', 'inline-block', 'important');
        }
        const heartIcon = element.querySelector(".heart-hulk-animation");
        if (heartIcon) {
            heartIcon.classList.add("collection-icon");
        }
  }
  preventDuplicatedIDs() {
    const sectionId = this.productElement.dataset.section;
    this.productElement.innerHTML = this.productElement.innerHTML.replaceAll(sectionId, `quickadd-${sectionId}`);
    this.productElement.querySelectorAll('variant-selects, variant-radios, product-info').forEach((element) => {
      element.dataset.originalSection = sectionId;
    });
  }
  removeDOMElements() {
    const pickupAvailability = this.productElement.querySelector('pickup-availability');
    if (pickupAvailability) pickupAvailability.remove();

    const productModal = this.productElement.querySelector('product-modal');
    if (productModal) productModal.remove();
  }
  removeGalleryListSemantic() {
    const galleryList = this.modalContent.querySelector('[id^="Slider-Gallery"]');
    if (!galleryList) return;

    galleryList.setAttribute('role', 'presentation');
    galleryList.querySelectorAll('[id^="Slide-"]').forEach((li) => li.setAttribute('role', 'presentation'));
  }
  preventVariantURLSwitching() {
    const variantPicker = this.modalContent.querySelector('variant-radios,variant-selects');
    if (!variantPicker) return;

    variantPicker.setAttribute('data-update-url', 'false');
  }
  showAllImages() {
    const imagesArray = this.productElement.querySelector(".thumbnail-list").querySelectorAll("img");
    const imagesMainContainer = this.modalContent.querySelector(".product__media");
    imagesMainContainer.classList.remove("media")
    imagesMainContainer.classList.add("quick-shop-img-slider");
    
    // Clear existing content in imagesMainContainer
    imagesMainContainer.innerHTML = "";
    
    
    // Append each image from imagesArray to imagesMainContainer
    imagesArray.forEach((img) => {
      const imgClone = img.cloneNode(true); // Clone the image node
      imgClone.classList.add("quick-shop-slider-item"); // Add class to cloned image
      imagesMainContainer.appendChild(imgClone); // Append cloned image to container
    });
    const carouselButtons = `<div class="carousel-buttons-container">
                                <button>&lt;</button>
                                <button>&gt;</button>
                            </div>`;
    imagesMainContainer.innerHTML += carouselButtons;
    this.scrollEvents(imagesMainContainer)

    const product = this.modalContent.querySelector('.product');
    const mediaImages = product.querySelectorAll('.product__media img');
    if (!mediaImages.length) return;

    let mediaImageSizes =
      '(min-width: 1000px) 715px, (min-width: 750px) calc((100vw - 11.5rem) / 2), calc(100vw - 4rem)';

    if (product.classList.contains('product--medium')) {
      mediaImageSizes = mediaImageSizes.replace('715px', '605px');
    } else if (product.classList.contains('product--small')) {
      mediaImageSizes = mediaImageSizes.replace('715px', '495px');
    }

    mediaImages.forEach((img) => img.setAttribute('sizes', mediaImageSizes));
  }
  scrollEvents(scrollContainer){
    const buttonsContainer = this.modalContent.querySelector(".carousel-buttons-container");
    const leftButton = buttonsContainer.querySelector("button:nth-child(1)");
    const rightButton = buttonsContainer.querySelector("button:nth-child(2)");
    const childWidth = scrollContainer.querySelector("img").offsetWidth;

    rightButton.addEventListener("click", function(event){
        scrollContainer.scrollTo({
            left: scrollContainer.scrollLeft + childWidth,
            behavior: "smooth"
        });
    });

    leftButton.addEventListener("click", (event) => {
        scrollContainer.scrollTo({
            left: scrollContainer.scrollLeft - childWidth,
            behavior: "smooth"
        });
    });
  }  
}
customElements.define("color-variant-images", ColorVariantImages)

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);

      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement('div');
          html.innerHTML = text;
          const recommendations = html.querySelector('product-recommendations');

          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
            relatedProductSlider();
          }

          if (!this.querySelector('slideshow-component') && this.classList.contains('complementary-products')) {
            this.remove();
          }

          if (html.querySelector('.grid__item')) {
            this.classList.add('product-recommendations--loaded');
          }
          // Dynamically adds classes to the wishlist container to ensure proper initialization of the wishlist app
          const wishlistIconArray = document.querySelector("product-recommendations").querySelectorAll(".product-wishlist__icon")
          wishlistIconArray.forEach(element=>{
            const wishlistBtn = element.querySelector(".wishlist-btn[data-gridhulklist]");
            if (wishlistBtn) {
              wishlistBtn.removeAttribute('style');
              wishlistBtn.style.setProperty('display', 'inline-block', 'important');
            }
            const heartIcon = element.querySelector(".heart-hulk-animation");
            if (heartIcon) {
                heartIcon.classList.add("collection-icon");
            }
          })
        })
        .catch((e) => {
          console.error(e);
        });
    };

    new IntersectionObserver(handleIntersection.bind(this), { rootMargin: '0px 0px 400px 0px' }).observe(this);
  }
}

customElements.define('product-recommendations', ProductRecommendations);

//MM Product Card
class MMvariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
    this.card = this.closest('.product-card-wrapper');
    if (this.card && this.card.classList.contains('lookbook')) {
      this.lookbook = true;
      this.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateQuickAdd();
      this.updateMedia();
      this.updateVariantInput();
      this.updateATC();
    }
    if (this.lookbook) {
      this.updateVariantPills();
      this.updatePrice();
    };
  }

  updatePrice() {
    const priceEl = this.card.querySelector('.price');
    if (priceEl) {
      const price = window.moneyFormat.replace('money', this.currentVariant.price / 100);
      const comparePrice = window.moneyFormat.replace('money', this.currentVariant.compare_at_price / 100);
      let priceHTML = '';
      if (this.currentVariant.compare_at_price > this.currentVariant.price) {
        priceHTML = this.currentVariant.compare_at_price > this.currentVariant.price ? `<span><s class="price-item price-item--regular">${comparePrice}</s></span>` : '';
        priceEl.classList.add('price--on-sale');
      } else {
        priceEl.classList.remove('price--on-sale');
      }
      priceHTML += `<span class="price-item price-item--sale price-item--last">${price}</span>`;
      priceEl.innerHTML = priceHTML;
    }
  }

  updateVariantPills() {
    let variantRadios;
    if (event.target.tagName == 'MM-VARIANT-RADIOS') {
      variantRadios = event.target
    } else {
      variantRadios = event.target.closest('mm-variant-radios')
    }
    const hiddenOptionIndex = 'option' + variantRadios.querySelector('fieldset.hidden').dataset.option;
    const visibleOption = 'option' + variantRadios.querySelector('fieldset:not(.hidden)').dataset.option;
    const hiddenOptionLabel = this.currentVariant[hiddenOptionIndex];
    const similarVariants = this.getVariantData().filter(variant => {
      if (variant[hiddenOptionIndex] == this.currentVariant[hiddenOptionIndex]) return variant
    })
    similarVariants.forEach(variant => {
      const input = variantRadios.querySelector(`input[value="${variant[visibleOption]}"]`);
      if (variant.available) {
        input.classList.remove('disabled')
      } else {
        input.classList.add('disabled')
      }
    })
  }

  updateATC() {
    if (!this.currentVariant.available) {
      this.toggleAddButton(true, window.variantStrings.soldOut);
    } else {
      this.toggleAddButton(false, '');
    }
  }

  updateQuickAdd() {
    const modalEl = this.card.querySelector('modal-opener button');
    if (modalEl) {
      const url = modalEl.getAttribute('data-product-url').split('?')[0] + '?variant=' + this.currentVariant.id
      modalEl.setAttribute('data-product-url', url);
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#mm-product-form--${this.dataset.pid}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updateVariantStatuses() {
    const selectedOptionOneVariants = this.variantData.filter(variant => this.querySelector(':checked').value === variant.option1);
    const inputWrappers = [...this.querySelectorAll('.product-form__input')];
    inputWrappers.forEach((option, index) => {
      if (index === 0) return;
      const optionInputs = [...option.querySelectorAll('input[type="radio"], option')]
      const previousOptionSelected = inputWrappers[index - 1].querySelector(':checked').value;
      const availableOptionInputsValue = selectedOptionOneVariants.filter(variant => variant.available && variant[`option${index}`] === previousOptionSelected).map(variantOption => variantOption[`option${index + 1}`]);
      this.setInputAvailability(optionInputs, availableOptionInputsValue)
    });
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach(input => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.innerText = input.getAttribute('value');
      } else {
        input.innerText = window.variantStrings.unavailable_with_option.replace('[value]', input.getAttribute('value'));
      }
    });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = this.card.querySelector('product-form');
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', 'disabled');
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = this.card.querySelector('product-form');
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.pid}`);

    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }

  updateMedia() {
    if (this.currentVariant.featured_image) {
      const imgTag = this.card.querySelector('[alt="' + this.currentVariant.featured_image.alt + '"]')?.getAttribute('splide-index');
      const splide = this.card.querySelector('splide-carousel');
      splide.splide?.go(parseInt(imgTag))

    }
  }
}

customElements.define('mm-variant-selects', MMvariantSelects);

class MMvariantRadios extends MMvariantSelects {
  constructor() {
    super();
  }

  setInputAvailability(listOfOptions, listOfAvailableOptions) {
    listOfOptions.forEach(input => {
      if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
        input.classList.remove('disabled');
      } else {
        input.classList.add('disabled');
      }
    });
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('mm-variant-radios', MMvariantRadios);
document.addEventListener('DOMContentLoaded', () => {
  class SplideCarousel extends HTMLElement {
    constructor() {
      super();
      this.splide = new Splide(this, {
        speed: 500,
        perPage: 1,
        focus: 'center',
        updateOnMove: true,
        trimSpace: false,
        omitEnd: true,
        mediaQuery: 'min',
        pagination: false,
        direction: 'ltr',
        height: '100%'
      })
      const _this = this;
      this.bar = this.splide.root.querySelector('.my-carousel-progress-bar');

      // Updates the bar width whenever the carousel moves:
      this.splide.on('mounted move', function () {
        const end = _this.splide.Components.Controller.getEnd() + 1;
        const rate = Math.min((_this.splide.index + 1) / end, 1);
        _this.bar.style.width = String(100 * rate) + '%';
      });


      this.splide.mount();
    }
  }
  customElements.define('splide-carousel', SplideCarousel);
})

class LookBook extends HTMLElement {
  constructor() {
    super();
    this.image = this.querySelector('.lookbook__image');
    this.section = this.closest('.lookbook')
    this.productWrapper = this.querySelector('.lookbook__products');
    this.image.addEventListener('click', this.toggleProductWrapper.bind(this));
    this.closeBtn = this.querySelector('.lookbook__products-close');
    this.closeBtn.addEventListener('click', this.handleCloseBtn.bind(this))
  }

  handleCloseBtn() {
    this.toggleProductWrapper()
    this.scrollIntoView();
  }
  toggleProductWrapper() {
    if (!this.productWrapper.classList.contains('hidden')) {
      this.productWrapper.classList.add('hidden')
      if (window.innerWidth < 750) {
        this.section.classList.remove('products-open');
      }
    } else {
      document.querySelectorAll('look-book').forEach(lookBook => lookBook.closeProductWrapper());
      this.productWrapper.classList.remove('hidden')
      if (window.innerWidth < 750) {
        this.section.classList.add('products-open');
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      } else {
        this.productWrapper.scrollIntoView();
      }
    }
  }
  closeProductWrapper() {
    this.productWrapper.classList.add('hidden');
  }
}
customElements.define('look-book', LookBook);

//show the mega menu on hover
// let detailsElements = document.querySelectorAll('.mega-menu');
// detailsElements.forEach(function (detailsElement) {
//   let contentElement = detailsElement.querySelector('.content');
  
//   detailsElement.addEventListener('mouseenter', function () {
//     this.setAttribute('open', '');
//   });
//   detailsElement.addEventListener('mouseleave', function () {
//     this.removeAttribute('open');
//   });
// });

// announcement bar Flickity for dektop and mobile
const announcementElement = document.querySelector('#announcement-bar__wrapper');
if (announcementElement) {
  if (window.innerWidth > 990) {
    let flkty = new Flickity('.announcement-bar__wrapper', {
      loop: true,
      contain: true,
      wrapAround: true,
      prevNextButtons: false,
      pageDots: false,
      groupCells: 4,
      cellAlign: 'left',
      autoPlay: 2000
    });
  }
  else {
    let flkty = new Flickity('.announcement-bar__wrapper', {
      contain: true,
      wrapAround: true,
      prevNextButtons: false,
      pageDots: false,
      groupCells: 1,
      autoPlay: 2000
    });
  }
}

//shopy by category
let shopCategoryElement = document.querySelector('.shop-category-main__flex-container');
if (shopCategoryElement) {
  if (window.innerWidth > 990) {
    let flkty = new Flickity('.shop-category-main__flex-container', {
      contain: true,
      wrapAround: false,
      prevNextButtons: true,
      pageDots: false,
      groupCells: 4,
      cellAlign: 'left'
    });
  }
  else {
    let flkty = new Flickity('.shop-category-main__flex-container', {
      contain: true,
      wrapAround: false,
      prevNextButtons: true,
      pageDots: false,
      groupCells: 2
    });
  }
}


//testimonial section slider
let testimonialElement = document.querySelector('.testimonial-main__flex');
if (testimonialElement) {
  let testimonialFlkty = new Flickity('.testimonial-main__flex', {
    contain: true,
    wrapAround: true,
    prevNextButtons: true,
    pageDots: false
  });
}

//featured collection slider
let collectonSlider = document.querySelectorAll('.featured-collection-card__wrapper');
if (collectonSlider) {
  collectonSlider.forEach(element=>{
      if (window.innerWidth > 750) {
    let flkty = new Flickity(element, {
      contain: true,
      wrapAround: true,
      prevNextButtons: true,
      pageDots: false,
      groupCells: 4,
      cellAlign: 'left'
    });
  }
  else {
    let flkty = new Flickity(element, {
      contain: true,
      wrapAround: true,
      prevNextButtons: true,
      pageDots: false,
      groupCells: 2,
      cellAlign: 'left'
    });
  }
  })

}

//blogslider
let blogSlider = document.querySelector('.custom-featured__blog-main__flex');
if (blogSlider) {
  if (window.innerWidth > 990) {
    let flkty = new Flickity('.custom-featured__blog-main__flex', {
      contain: true,
      wrapAround: true,
      prevNextButtons: true,
      pageDots: false,
      groupCells: 2,
      cellAlign: 'left'
    });
  }
  else {
    let flkty = new Flickity('.custom-featured__blog-main__flex', {
      contain: true,
      wrapAround: true,
      prevNextButtons: true,
      pageDots: false,
      groupCells: 1,
      cellAlign: 'left'
    });
  }
}

//header drawer close open functionality
const closeIconContainer = document.querySelector('.close_icon__container');
const menuDrawerContainer = document.querySelector('.menu-drawer-container');
closeIconContainer.addEventListener('click', function () {
  if (menuDrawerContainer.hasAttribute('open')) {
    document.querySelector('.header__icon[aria-expanded="true"]').click();
  } else {
    menuDrawerContainer.setAttribute('open', '');
  }
});

//related-products-slider
function relatedProductSlider() {
  let relatedProductsWrap = document.querySelector('.related-Produdts__card-wrapper');
  if (relatedProductsWrap) {
    if (window.innerWidth > 990) {
      let flkty = new Flickity('.related-Produdts__card-wrapper', {
        contain: true,
        wrapAround: true,
        prevNextButtons: true,
        pageDots: false,
        groupCells: 4,
        cellAlign: 'left'
      });
    }
    else {
      let flkty = new Flickity('.related-Produdts__card-wrapper', {
        contain: true,
        wrapAround: true,
        prevNextButtons: true,
        pageDots: false,
        groupCells: 2,
        cellAlign: 'left'
      });
    }
  }
}

//featured collection products grid
// document.addEventListener('DOMContentLoaded', function() {
//     const collectionContainer = document.querySelectorAll(".featured-collection-grid");
//     collectionContainer.forEach(element=>{
//        if (collectionContainer) {
            
//         }
//     })
// });
// function moveItems(arrow) {
//     const container = document.querySelector(".featured-collection-grid");
//     const scrollAmount = arrow.id === "left" ?
//         container.scrollLeft - (container.offsetWidth) :
//         container.scrollLeft + container.offsetWidth;
//     container.scrollTo({
//         left: scrollAmount,
//         behaviour: "smooth"
//     });
// }


//product-bundle functionality
const bundleAtc = document.querySelector('.bundle-atc');
if (bundleAtc) {
  bundleAtc.addEventListener('click', function () {
    const bundleParentElement = bundleAtc.closest('.product-bundle__content');
    const bundleFormElements = bundleParentElement.querySelectorAll('product-form');
    const variantIds = [];
    bundleFormElements.forEach((form) => {
      variantIds.push(form.querySelector('.product-variant-id').getAttribute('value'));
    });

    let formData = {
      'items': []
    };
    variantIds.forEach((variantId) => {
      formData.items.push({
        'id': parseInt(variantId),
        'quantity': 1
      });
    });
    const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');

    if (cart) {
      formData.sections = cart.getSectionsToRender().map((section) => section.id);

      formData.sections_url = window.location.pathname;

    }
    fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then(response => {
        return response.json();

      })
      .then(data => {
        if (!cart) {
          window.location = window.routes.cart_url;
        }
        cart.renderContents(data);
      })
      .catch((error) => {
        console.error('Error:', error);
      })
      .finally(() => {
        if (cart && cart.classList.contains('is-empty')) cart.classList.remove('is-empty');
      });
  });
}

let collectionDetailsElements = document.querySelectorAll('.horizontal-filter-element');
collectionDetailsElements.forEach(function (detailsElement) {
  detailsElement.addEventListener('click', function (details) {
    collectionDetailsElements.forEach((element) => {
      if (element != this) {
        element.removeAttribute('open')
      }
    })
  })
})



//grid swatch in collection page desktop
let gridSwatch = document.querySelectorAll('.common-grid-swatch');
gridSwatch.forEach(function (gridElement) {
  gridElement.addEventListener('click', function () {

    gridElement.closest('.grid-swatch__container').querySelector('.common-grid-swatch.active').classList.remove('active');
    gridElement.classList.toggle('active');
    gridElementContainer = document.querySelector('#product-grid');
    if (gridElement.classList.contains('grid-swatch__four')) {
      gridElementContainer.classList.remove('grid--2-col-desktop');
      gridElementContainer.classList.add('grid--4-col-desktop');
    }
    else if (gridElement.classList.contains('grid-swatch__two')) {
      gridElementContainer.classList.remove('grid--4-col-desktop');
      gridElementContainer.classList.add('grid--2-col-desktop');
    }
  });
});

//grid swatch in collection page mobile
let gridSwatchMobile = document.querySelectorAll('.mobile-common-grid-swatch');
gridSwatchMobile.forEach(function (gridElement) {
  gridElement.addEventListener('click', function () {

    gridElement.closest('.mobile-grid__swatch-container').querySelector('.mobile-common-grid-swatch.active').classList.remove('active');
    gridElement.classList.toggle('active');
    gridElementContainer = document.querySelector('#product-grid');
    if (gridElement.classList.contains('two-grid__cards')) {
      gridElementContainer.classList.remove('grid--1-col-tablet-down');
      gridElementContainer.classList.add('grid--2-col-tablet-down');
    }
    else if (gridElement.classList.contains('one-grid__cards')) {
      gridElementContainer.classList.remove('grid--2-col-tablet-down');
      gridElementContainer.classList.add('grid--1-col-tablet-down');
    }
  });
});

//cart drawer gift wrap functionality
const giftWrapInput = document.querySelector('#gift-wrap');
giftWrapInput?.addEventListener('click', function () {
  if (giftWrapInput.checked) {
    document.querySelector('#Details-CartDrawer').setAttribute('open', '');
  }
});


document.querySelector('#toggle-switch-checkbox')?.addEventListener('change', function () {
  const cmImage = document.querySelector('.size-cm-image');
  const inImage = document.querySelector('.size-in-image');
  if (this.checked) {
    cmImage.style.display = 'block';
    inImage.style.display = 'none';
  } else {
    cmImage.style.display = 'none';
    inImage.style.display = 'block';
  }
});

function sizeGuide(){
  //size and measure guide swatch function
  const sizeHeading = document.querySelector('.size-heading');
  const measureHeading = document.querySelector('.measure-heading');
  const sizeContent = document.querySelector('.size-content');
  const measureContent = document.querySelector('.measure-content');

  sizeHeading?.addEventListener('click', function () {
    sizeHeading.classList.add('active');
    measureHeading.classList.remove('active');
    sizeContent.classList.add('active');
    measureContent.classList.remove('active');
  });

  measureHeading?.addEventListener('click', function () {
    sizeHeading.classList.remove('active');
    measureHeading.classList.add('active');
    sizeContent.classList.remove('active');
    measureContent.classList.add('active');
  });

  //size and measure close open popup
  const showSizeGuidePopup = document.querySelector('.size-guide');
  const showMeasureGuidePopup = document.querySelector('.measure-guide');
  const closeGuidePopup = document.querySelector('.popup-close-btn');
  const popupGuide = document.querySelector('.popup-wrapper');

  showSizeGuidePopup?.addEventListener('click', function () {
    popupGuide.style.display = 'block';
    sizeHeading.click();
  });
  showMeasureGuidePopup?.addEventListener('click', function () {
    popupGuide.style.display = 'block';
    measureHeading.click();
  });

  closeGuidePopup?.addEventListener('click', function () {
    popupGuide.style.display = 'none';
  });
}
sizeGuide()


//banner redirection
const slideslide = document.querySelectorAll('.slideshow__text-wrapper');
slideslide.forEach(slide => {
  slide.addEventListener('click', function (e) {
    const this_ = e.target;
    const parent = this_.closest('.slideshow__slide');
    const dataHref = parent.getAttribute('data-href');
    if (dataHref) {
      window.location.href = dataHref;
    }
  });
});

// share buttton js
customElements.define('share-button-element', class extends HTMLElement {
  init() {
    navigator.share ? this.shareButton.addEventListener("click", () => {
      navigator.share({
        url: this.urlToShare,
        title: document.title
      });
    }) : this.shareButton.addEventListener("click", this.copyToClipboard.bind(this));
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.urlToShare).then(() => {
      this.shareMessage.classList.add('some-animation-class');
      const this_ = this;
      console.log(this);
      setTimeout(function () {
        this_.shareMessage.classList.remove('some-animation-class');
      }, 3000);
    });
  }

  constructor() {
    super();
    this.container = this.closest('[data-variant]');
    this.shareButton = this.querySelector('.share-button');
    this.shareMessage = this.querySelector('.share-message');
    this.urlToShare = this.shareButton.dataset.shareUrl ? this.shareButton.dataset.shareUrl : window.location.href;
    this.init();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const splideElements = document.querySelectorAll(".collection-products-splide")
  splideElements.forEach(element=>{
    new Splide(element, {
        drag: 'free',
        perPage: 2,
        gap: '1rem',
        arrows: true,
        pagination: false,
    })
  })
})

document.addEventListener("DOMContentLoaded", function(){
  const gridElements = document.querySelectorAll(".splide__list-container")
  gridElements.forEach(element=>{
      new Flickity(".splide__list-container", {
          loop: true,
          contain: true,
          prevNextButtons: true,
          pageDots: false,
          groupCells: 1,
          cellAlign: 'left',
          watchCSS: true
      })
  })
})

// Account registeration
class CreateAccount extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const button = this.querySelector("button");
    if (button) {
      button.addEventListener("click", this.checkEmptyInputs.bind(this));
    }
  }

  checkEmptyInputs(event) {
    const inputElements = this.querySelectorAll("input");
    let isEmpty = false;

    inputElements.forEach(input => {
      if (!input.value.trim()) {
        isEmpty = true;
        input.classList.add("error");
      } else {
        input.classList.remove("error");
      }
    });

    if (isEmpty) {
      event.preventDefault(); // Prevent the default action if any input is empty
      const errorMessageContainer = this.querySelector(".error-message-container");
      if (errorMessageContainer) {
        errorMessageContainer.textContent = "Fill all the input fields";
      }
    }
  }
}

customElements.define("create-account", CreateAccount);