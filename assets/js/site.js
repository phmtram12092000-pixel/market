/* ChainMarket — progressive enhancement only. */
(function () {
  'use strict';

  /* Only links to the implemented page layouts are interactive. */
  var enabledLinkSelector = 'a.skip-link, a.brand, .site-nav a, .breadcrumb a, a[data-link-enabled]';
  Array.prototype.slice.call(document.querySelectorAll('a[href]')).forEach(function (link) {
    if (!link.hasAttribute('data-link-disabled') && link.matches(enabledLinkSelector)) {
      return;
    }
    link.classList.add('is-disabled-link');
    link.setAttribute('aria-disabled', 'true');
    link.setAttribute('tabindex', '-1');
    link.addEventListener('click', function (event) {
      event.preventDefault();
    });
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile navigation ------------------------------------------------------ */
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.getElementById('site-nav');

  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') !== 'true') {
        return;
      }
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        setOpen(false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 800) {
        setOpen(false);
      }
    });
  }

  /* Seamless price ticker -------------------------------------------------- */
  var track = document.querySelector('[data-ticker-track]');
  if (track && !reduceMotion) {
    Array.prototype.slice.call(track.children).forEach(function (item) {
      var clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a').forEach(function (link) {
        link.setAttribute('tabindex', '-1');
      });
      track.appendChild(clone);
    });
  }

  /* Gentle price movement -------------------------------------------------- */
  var prices = Array.prototype.slice.call(document.querySelectorAll('[data-live-price]'));

  if (prices.length && !reduceMotion) {
    window.setInterval(function () {
      prices.forEach(function (el) {
        var base = parseFloat(el.getAttribute('data-live-price'));
        var decimals = parseInt(el.getAttribute('data-decimals') || '2', 10);
        if (isNaN(base)) {
          return;
        }
        var drift = base * (Math.random() - 0.5) * 0.003;
        var next = base + drift;
        el.textContent = next.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
      });
    }, 7000);
  }

  /* Coin table category filter -------------------------------------------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[data-cat-tab]'));
  var rows = Array.prototype.slice.call(document.querySelectorAll('[data-coin-cat]'));

  if (tabs.length && rows.length) {
    var selectTab = function (tab) {
      var category = tab.getAttribute('data-cat-tab');
      tabs.forEach(function (item) {
        item.setAttribute('aria-selected', String(item === tab));
        item.setAttribute('tabindex', item === tab ? '0' : '-1');
      });
      rows.forEach(function (row) {
        row.hidden = category !== 'all' && row.getAttribute('data-coin-cat') !== category;
      });
    };

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () {
        selectTab(tab);
      });

      tab.addEventListener('keydown', function (event) {
        var nextIndex = null;
        if (event.key === 'ArrowRight') {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft') {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = tabs.length - 1;
        }
        if (nextIndex !== null) {
          event.preventDefault();
          tabs[nextIndex].focus();
          selectTab(tabs[nextIndex]);
        }
      });
    });
  }

  /* Coin chart range switch ------------------------------------------------ */
  var chartTabs = Array.prototype.slice.call(document.querySelectorAll('[data-chart-tab]'));
  var chartPanels = Array.prototype.slice.call(document.querySelectorAll('[data-chart-panel]'));
  var lowEl = document.querySelector('[data-chart-low]');
  var highEl = document.querySelector('[data-chart-high]');

  if (chartTabs.length && chartPanels.length) {
    chartTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var range = tab.getAttribute('data-chart-tab');
        chartTabs.forEach(function (item) {
          item.setAttribute('aria-selected', String(item === tab));
          item.setAttribute('tabindex', item === tab ? '0' : '-1');
        });
        chartPanels.forEach(function (panel) {
          var show = panel.getAttribute('data-chart-panel') === range;
          if (show) {
            panel.removeAttribute('hidden');
          } else {
            panel.setAttribute('hidden', '');
          }
        });
        if (lowEl) {
          lowEl.textContent = tab.getAttribute('data-low') || '';
        }
        if (highEl) {
          highEl.textContent = tab.getAttribute('data-high') || '';
        }
      });
    });
  }
})();
