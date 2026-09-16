/* script.js
   Modules: Theme · Navigation · ScrollState · Reveal · Projects · Media · Resume · Progress
   Vanilla JS, no dependencies. Every module fails silently if its DOM is absent.
*/

(function () {
  "use strict";

  var docEl = document.documentElement;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ============================================
     THEME
     ============================================ */
  var Theme = {
    key: "theme",

    init: function () {
      this.toggle = document.getElementById("theme-toggle");
      this.sync();

      if (this.toggle) {
        this.toggle.addEventListener("click", this.switch.bind(this));
      }

      try {
        var mq = window.matchMedia("(prefers-color-scheme: light)");
        var handler = function (e) {
          if (localStorage.getItem(this.key)) return;
          this.apply(e.matches ? "light" : "dark");
        }.bind(this);

        if (typeof mq.addEventListener === "function") {
          mq.addEventListener("change", handler);
        } else if (typeof mq.addListener === "function") {
          mq.addListener(handler);
        }
      } catch (e) {
        /* matchMedia unavailable — current theme stands */
      }
    },

    current: function () {
      return docEl.getAttribute("data-theme") === "light" ? "light" : "dark";
    },

    apply: function (theme) {
      docEl.setAttribute("data-theme", theme);
      this.sync();

      var meta = document.querySelector('meta[name="theme-color"]:not([media])');
      if (meta) meta.setAttribute("content", theme === "light" ? "#FAFAF8" : "#0B0D0F");
    },

    sync: function () {
      if (!this.toggle) return;
      var isLight = this.current() === "light";
      this.toggle.setAttribute("aria-pressed", isLight ? "true" : "false");
      this.toggle.setAttribute(
        "aria-label",
        isLight ? "Switch to dark theme" : "Switch to light theme"
      );
    },

    switch: function () {
      var next = this.current() === "light" ? "dark" : "light";
      this.apply(next);
      try {
        localStorage.setItem(this.key, next);
      } catch (e) {
        /* storage blocked — theme applies for this session only */
      }
    }
  };

  /* ============================================
     NAVIGATION
     ============================================ */
  var Nav = {
    init: function () {
      this.toggle = document.getElementById("nav-toggle");
      this.panel = document.getElementById("nav-panel");
      this.open = false;

      if (!this.toggle || !this.panel) return;

      this.toggle.addEventListener("click", this.handleToggle.bind(this));
      document.addEventListener("keydown", this.handleKey.bind(this));

      var links = this.panel.querySelectorAll("a");
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", this.close.bind(this));
      }

      window.addEventListener("resize", this.handleResize.bind(this));
    },

    handleToggle: function () {
      this.open ? this.close() : this.openPanel();
    },

    openPanel: function () {
      this.open = true;
      this.panel.hidden = false;
      this.toggle.setAttribute("aria-expanded", "true");
      this.toggle.setAttribute("aria-label", "Close menu");
      document.body.classList.add("is-locked");

      var first = this.panel.querySelector("a");
      if (first) first.focus();
    },

    close: function () {
      if (!this.open) return;
      this.open = false;
      this.panel.hidden = true;
      this.toggle.setAttribute("aria-expanded", "false");
      this.toggle.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("is-locked");
    },

    handleKey: function (e) {
      if (!this.open) return;

      if (e.key === "Escape") {
        this.close();
        this.toggle.focus();
        return;
      }

      if (e.key !== "Tab") return;

      var focusable = this.panel.querySelectorAll("a[href], button:not([disabled])");
      if (!focusable.length) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        this.toggle.focus();
      }
    },

    handleResize: function () {
      if (window.innerWidth >= 768) this.close();
    }
  };

  /* ============================================
     SCROLL STATE — nav border + active section
     ============================================ */
  var ScrollState = {
    init: function () {
      this.nav = document.getElementById("nav");
      this.links = Array.prototype.slice.call(
        document.querySelectorAll(".nav__link[href^='#']")
      );
      this.ticking = false;

      if (!this.nav && !this.links.length) return;

      this.sections = this.links
        .map(function (link) {
          var id = link.getAttribute("href").slice(1);
          var el = document.getElementById(id);
          return el ? { link: link, el: el } : null;
        })
        .filter(Boolean);

      window.addEventListener("scroll", this.request.bind(this), { passive: true });
      this.update();
    },

    request: function () {
      if (this.ticking) return;
      this.ticking = true;
      window.requestAnimationFrame(
        function () {
          this.update();
          this.ticking = false;
        }.bind(this)
      );
    },

    update: function () {
      var y = window.pageYOffset || docEl.scrollTop;

      if (this.nav) {
        this.nav.classList.toggle("is-scrolled", y > 40);
      }

      if (!this.sections.length) return;

      var marker = y + window.innerHeight * 0.32;
      var active = null;

      for (var i = 0; i < this.sections.length; i++) {
        if (this.sections[i].el.offsetTop <= marker) active = this.sections[i];
      }

      for (var j = 0; j < this.sections.length; j++) {
        this.sections[j].link.classList.toggle(
          "is-active",
          active !== null && this.sections[j] === active
        );
      }
    }
  };

  /* ============================================
     REVEAL
     ============================================ */
  var Reveal = {
    init: function () {
      var items = document.querySelectorAll(".reveal");
      if (!items.length) return;

      if (reducedMotion.matches || !("IntersectionObserver" in window)) {
        for (var i = 0; i < items.length; i++) items[i].classList.add("is-visible");
        return;
      }

      var observer = new IntersectionObserver(
        function (entries) {
          var delay = 0;
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.style.setProperty("--reveal-delay", delay + "ms");
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
            delay += 60;
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );

      for (var k = 0; k < items.length; k++) observer.observe(items[k]);
    }
  };

  /* ============================================
     PROJECTS — renders the grid from projects.js
     ============================================ */
  var Projects = {
    filterThreshold: 4,

    init: function () {
      this.wrap = document.getElementById("projects");
      this.grid = document.getElementById("projects-grid");
      this.filters = document.getElementById("filters");

      if (!this.wrap || !this.grid) return;

      var all = Array.isArray(window.PORTFOLIO_PROJECTS)
        ? window.PORTFOLIO_PROJECTS
        : [];

      this.items = all.filter(function (p) {
        return p && p.featured !== true;
      });

      if (!this.items.length) return;

      this.wrap.hidden = false;
      this.render(this.items);

      if (this.items.length >= this.filterThreshold) this.buildFilters();
    },

    buildFilters: function () {
      if (!this.filters) return;

      var seen = {};
      var cats = ["All"];

      this.items.forEach(function (p) {
        (p.category || []).forEach(function (c) {
          if (!seen[c]) {
            seen[c] = true;
            cats.push(c);
          }
        });
      });

      var self = this;
      this.filters.hidden = false;

      cats.forEach(function (cat, index) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "filter";
        btn.textContent = cat;
        btn.setAttribute("aria-pressed", index === 0 ? "true" : "false");

        btn.addEventListener("click", function () {
          var all = self.filters.querySelectorAll(".filter");
          for (var i = 0; i < all.length; i++) {
            all[i].setAttribute("aria-pressed", all[i] === btn ? "true" : "false");
          }

          var list =
            cat === "All"
              ? self.items
              : self.items.filter(function (p) {
                  return (p.category || []).indexOf(cat) !== -1;
                });

          self.render(list);
        });

        self.filters.appendChild(btn);
      });
    },

    render: function (list) {
      this.grid.textContent = "";

      var frag = document.createDocumentFragment();
      var self = this;

      list.forEach(function (project) {
        frag.appendChild(self.card(project));
      });

      this.grid.appendChild(frag);
      Reveal.init();
    },

    card: function (p) {
      var card = document.createElement("article");
      card.className = "project-card";

      if (p.category && p.category.length) {
        var cat = document.createElement("p");
        cat.className = "project-card__category";
        cat.textContent = p.category.join(" · ");
        card.appendChild(cat);
      }

      var title = document.createElement("h3");
      title.className = "project-card__title";
      title.textContent = p.title || "Untitled project";
      card.appendChild(title);

      if (p.summary) {
        var summary = document.createElement("p");
        summary.className = "project-card__summary";
        summary.textContent = p.summary;
        card.appendChild(summary);
      }

      if (p.result) {
        var result = document.createElement("p");
        result.className = "project-card__result";
        result.textContent = p.result;
        card.appendChild(result);
      }

      if (p.tags && p.tags.length) {
        var tags = document.createElement("ul");
        tags.className = "tags";
        p.tags.forEach(function (t) {
          var li = document.createElement("li");
          li.className = "tag";
          li.textContent = t;
          tags.appendChild(li);
        });
        card.appendChild(tags);
      }

      var links = p.links || {};
      var defs = [
        { key: "caseStudy", label: "Case study", external: false },
        { key: "github", label: "GitHub", external: true },
        { key: "demo", label: "Live demo", external: true }
      ];

      var row = document.createElement("div");
      row.className = "project-card__links";
      var count = 0;

      defs.forEach(function (def) {
        var href = links[def.key];
        if (!href) return;

        var a = document.createElement("a");
        a.className = "project-card__link";
        a.href = href;
        a.textContent = def.label;

        if (def.external) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        } else {
          a.classList.add("project-card__cover");
        }

        row.appendChild(a);
        count++;
      });

      if (count) card.appendChild(row);

      return card;
    }
  };

  /* ============================================
     MEDIA — graceful placeholders for missing images
     ============================================ */
  var Media = {
    init: function () {
      var imgs = document.querySelectorAll("img[data-fallback]");

      for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        if (img.complete && img.naturalWidth === 0) {
          this.replace(img);
        } else {
          img.addEventListener("error", this.handle.bind(this), { once: true });
        }
      }
    },

    handle: function (e) {
      this.replace(e.target);
    },

    replace: function (img) {
      var label = img.getAttribute("data-fallback") || "Image";

      if (label === "profile") {
        var frame = img.closest(".profile-frame");
        if (frame) frame.classList.add("is-empty");
        return;
      }

      var holder = document.createElement("div");
      holder.className = "media-placeholder";

      var title = document.createElement("span");
      title.className = "media-placeholder__label";
      title.textContent = label;

      var hint = document.createElement("span");
      hint.className = "media-placeholder__hint";
      hint.textContent = "Screenshot to be added";

      holder.appendChild(title);
      holder.appendChild(hint);

      if (img.parentNode) img.parentNode.replaceChild(holder, img);
    }
  };

  /* ============================================
     RESUME — disable the CTA when no file exists
     ============================================ */
  var Resume = {
    init: function () {
      this.link = document.getElementById("cv-link");
      this.note = document.getElementById("cv-note");

      if (!this.link || !window.fetch) return;
      if (window.location.protocol === "file:") return;

      var self = this;

      fetch(this.link.getAttribute("href"), { method: "HEAD" })
        .then(function (res) {
          if (!res.ok) self.disable();
        })
        .catch(function () {
          self.disable();
        });
    },

    disable: function () {
      this.link.classList.add("is-disabled");
      this.link.setAttribute("aria-disabled", "true");
      this.link.removeAttribute("download");
      this.link.setAttribute("href", "mailto:abdelrhmanashrafahmed@gmail.com");
      if (this.note) this.note.hidden = false;
    }
  };

  /* ============================================
     PROGRESS — reading indicator on case studies
     ============================================ */
  var Progress = {
    init: function () {
      this.bar = document.querySelector(".progress__bar");
      if (!this.bar) return;

      this.ticking = false;
      window.addEventListener("scroll", this.request.bind(this), { passive: true });
      window.addEventListener("resize", this.request.bind(this), { passive: true });
      this.update();
    },

    request: function () {
      if (this.ticking) return;
      this.ticking = true;
      window.requestAnimationFrame(
        function () {
          this.update();
          this.ticking = false;
        }.bind(this)
      );
    },

    update: function () {
      var height = docEl.scrollHeight - window.innerHeight;
      var ratio = height > 0 ? (window.pageYOffset || docEl.scrollTop) / height : 0;
      this.bar.style.width = Math.min(Math.max(ratio, 0), 1) * 100 + "%";
    }
  };

  /* ============================================
     BOOT
     ============================================ */
  function boot() {
    Theme.init();
    Nav.init();
    ScrollState.init();
    Projects.init();
    Media.init();
    Resume.init();
    Progress.init();

    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    window.requestAnimationFrame(function () {
      docEl.classList.remove("is-preload");
      Reveal.init();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
