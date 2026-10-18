/* Phones: music store links open in the same tab, so the app launches without leaving a blank tab behind.
   Computers keep opening them in a new window. Runs on its own, before the menu code, and also catches
   links the menu adds later (checked again at tap time). */
(function () {
  var stores = ["open.spotify.com", "music.apple.com", "music.youtube.com"];
  var redirects = ["/spotify/", "/apple/", "/youtube-music/"];

  function isPhone() {
    var ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod|Android/i.test(ua)) return true;
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return true; /* iPadOS */
    return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }

  function isMusicLink(a) {
    var raw = a.getAttribute("href");
    if (!raw) return false;
    var url;
    try { url = new URL(raw, location.href); } catch (err) { return false; }
    var host = url.hostname.toLowerCase();
    if (stores.indexOf(host) !== -1) return true;
    if (url.origin !== location.origin) return false;
    var path = url.pathname.replace(/index\.html$/, "");
    if (path.charAt(path.length - 1) !== "/") path += "/";
    return redirects.indexOf(path) !== -1;
  }

  function sameTab(a) {
    if (a.getAttribute("target") === "_blank" && isMusicLink(a)) a.removeAttribute("target");
  }

  function sweep() {
    if (!isPhone()) return;
    var links = document.querySelectorAll("a[target=_blank]");
    for (var i = 0; i < links.length; i++) sameTab(links[i]);
  }

  /* Tap time, capture phase: runs before the browser follows the link and leaves other click handlers alone. */
  document.addEventListener("click", function (event) {
    if (!isPhone()) return;
    var a = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (a) sameTab(a);
  }, true);

  /* After the menu code below has built its links (and on sites where it re-adds new-window targets). */
  setTimeout(sweep, 0);
  window.addEventListener("load", sweep);
})();

/* Site menu. Add a destination by appending one entry.
   The open menu lists every other destination.
   Subscribe confirmation and thank-you pages are not destinations.
   Scores is the shared library on Lackadaisical Perfection.
   Albums lists every album, newest first. This album is "You're here". */
(function () {
  var pages = [
    { href: "/", label: "Album" },
    { href: "https://lackadaisicalperfection.com/scores/", label: "Scores", blank: true }
  ];

  function normalize(path) {
    var p = path || "/";
    var base = location.origin && location.origin !== "null"
      ? location.origin
      : "https://cleancalmpiano.com";
    try {
      p = new URL(p, base).pathname;
    } catch (err) {
      p = "/";
    }
    if (p === "/index.html" || p.slice(-11) === "/index.html") {
      p = p.slice(0, -10);
    }
    if (p.charAt(p.length - 1) !== "/") p += "/";
    return p;
  }

  function excluded(path) {
    return /\/subscribe\/confirmed\/|\/thank-you\/|\/thanks\/|\/confirmation\//.test(path);
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  var here = normalize(location.pathname);
  var links = pages.filter(function (page) {
    var path = normalize(page.href);
    return path !== here && !excluded(path);
  });

  var button = document.createElement("button");
  button.type = "button";
  button.className = "nav-toggle";
  button.setAttribute("aria-label", "Open menu");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "site-menu");

  var img = document.createElement("img");
  img.src = "/assets/david-with-lp.jpg";
  img.srcset = "/assets/david-with-lp.jpg 1x, /assets/david-with-lp@2x.jpg 2x";
  img.width = 160;
  img.height = 160;
  img.alt = "";
  img.decoding = "async";
  button.appendChild(img);

  var list = document.createElement("ul");
  list.setAttribute("role", "list");
  links.forEach(function (page) {
    var item = document.createElement("li");
    var link = document.createElement("a");
    link.href = page.href;
    link.textContent = page.label;
    if (page.blank) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    item.appendChild(link);
    list.appendChild(item);
  });

  var menu = document.createElement("nav");
  menu.id = "site-menu";
  menu.className = "site-menu";
  menu.setAttribute("aria-label", "Pages");
  menu.hidden = true;
  menu.appendChild(list);

  var albums = [
    { title: "Lackadaisical Perfection", year: 2027, host: "lackadaisicalperfection.com", slug: "lackadaisical-perfection" },
    { title: "Piano Reveries and Phantasies", year: 2015, host: "pianoreveries.com", slug: "piano-reveries" },
    { title: "Smitten with the Muses", year: 2014, host: "smittenwiththemuses.com", slug: "smitten-with-the-muses" },
    { title: "Where In The World Is Diane", year: 2012, host: "whereintheworldisdiane.com", slug: "where-in-the-world-is-diane" },
    { title: "Clean Calm Piano", year: 2010, host: "cleancalmpiano.com", slug: "clean-calm-piano" },
    { title: "Tantalizing Proof", year: 2009, host: "tantalizingproof.com", slug: "tantalizing-proof" },
    { title: "Piano In Colors", year: 2007, host: "pianoincolors.com", slug: "piano-in-colors" },
    { title: "Melodic Subtlety \u2013 Solo Piano", year: 2006, host: "melodicsubtlety.com", slug: "melodic-subtlety" }
  ];
  albums.sort(function (a, b) { return b.year - a.year; });

  function currentHost() {
    var host = (location.hostname || "").replace(/^www\./, "").toLowerCase();
    if (!host || host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
      return "cleancalmpiano.com";
    }
    return host;
  }

  var hereHost = currentHost();

  function coverImg(album) {
    var image = document.createElement("img");
    var one = "/assets/albums/" + album.slug + ".jpg";
    var two = "/assets/albums/" + album.slug + "@2x.jpg";
    image.src = one;
    image.srcset = one + " 1x, " + two + " 2x";
    image.width = 48;
    image.height = 48;
    image.alt = "";
    image.decoding = "async";
    return image;
  }

  var albumsHeading = document.createElement("h2");
  albumsHeading.id = "menu-albums-label";
  albumsHeading.textContent = "Albums";

  var albumsList = document.createElement("ul");
  albumsList.setAttribute("role", "list");

  albums.forEach(function (album) {
    var item = document.createElement("li");
    var here = album.host === hereHost;
    var row = document.createElement(here ? "div" : "a");
    if (here) {
      row.className = "is-here";
      row.setAttribute("aria-current", "page");
    } else {
      row.href = "https://" + album.host + "/";
      row.target = "_blank";
      row.rel = "noopener";
    }
    row.appendChild(coverImg(album));
    var copy = document.createElement("span");
    copy.className = "album-copy";
    var title = document.createElement("span");
    title.className = "album-title";
    title.textContent = album.title;
    copy.appendChild(title);
    if (here) {
      var note = document.createElement("span");
      note.className = "album-here";
      note.textContent = "You're here";
      copy.appendChild(note);
    }
    row.appendChild(copy);
    item.appendChild(row);
    albumsList.appendChild(item);
  });

  var albumsSection = document.createElement("section");
  albumsSection.className = "menu-albums";
  albumsSection.setAttribute("aria-labelledby", "menu-albums-label");
  albumsSection.appendChild(albumsHeading);
  albumsSection.appendChild(albumsList);
  menu.appendChild(albumsSection);

  document.body.appendChild(button);
  document.body.appendChild(menu);

  var generation = 0;
  var open = false;

  function setOpenState(next) {
    open = next;
    button.setAttribute("aria-expanded", next ? "true" : "false");
    button.setAttribute("aria-label", next ? "Close menu" : "Open menu");
  }

  function finishClose(gen) {
    if (gen !== generation || open) return;
    menu.hidden = true;
    if ("inert" in menu) menu.inert = true;
  }

  function openMenu() {
    generation += 1;
    menu.hidden = false;
    if ("inert" in menu) menu.inert = false;
    if (reducedMotion()) {
      menu.classList.add("is-open");
    } else {
      menu.classList.remove("is-open");
      void menu.offsetWidth;
      menu.classList.add("is-open");
    }
    setOpenState(true);
  }

  function closeMenu(restoreFocus) {
    var gen = generation += 1;
    setOpenState(false);
    menu.classList.remove("is-open");
    if ("inert" in menu) menu.inert = true;
    if (reducedMotion()) {
      finishClose(gen);
    } else {
      var timer = setTimeout(function () { finishClose(gen); }, 400);
      menu.addEventListener("transitionend", function onEnd(event) {
        if (event.target !== menu || event.propertyName !== "opacity") return;
        menu.removeEventListener("transitionend", onEnd);
        clearTimeout(timer);
        finishClose(gen);
      });
    }
    if (restoreFocus) button.focus();
  }

  button.addEventListener("click", function (event) {
    event.stopPropagation();
    if (open) closeMenu(false);
    else openMenu();
  });

  document.addEventListener("click", function (event) {
    if (!open) return;
    if (menu.contains(event.target)) return;
    closeMenu(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || !open) return;
    event.preventDefault();
    closeMenu(true);
  });
})();
