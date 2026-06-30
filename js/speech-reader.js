(function () {
  if (!("speechSynthesis" in window)) return;

  var synth = window.speechSynthesis;
  var activeBtn = null;
  var utterance = null;

  var SVG_PLAY =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
  var SVG_PAUSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
  var SVG_STOP =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12"/></svg>';

  function getReadableText(section) {
    var clone = section.cloneNode(true);
    var skip = clone.querySelectorAll(
      "script,style,svg,nav,.speech-btn-wrap,button[type='button'],.hero-search-panel,.hero-form,input,select,textarea,form,.nav-links,.assistant-panel"
    );
    for (var i = 0; i < skip.length; i++) skip[i].remove();
    var text = clone.textContent || "";
    return text.replace(/\s+/g, " ").trim();
  }

  function stopAll() {
    synth.cancel();
    if (activeBtn) {
      activeBtn.querySelector(".speech-icon").innerHTML = SVG_PLAY;
      activeBtn.querySelector(".speech-label").textContent = "Listen";
      activeBtn.classList.remove("playing", "paused");
      activeBtn = null;
    }
    utterance = null;
  }

  function handleClick(btn, section) {
    if (activeBtn && activeBtn !== btn) {
      stopAll();
    }

    if (btn.classList.contains("playing")) {
      synth.pause();
      btn.classList.remove("playing");
      btn.classList.add("paused");
      btn.querySelector(".speech-icon").innerHTML = SVG_PLAY;
      btn.querySelector(".speech-label").textContent = "Resume";
      return;
    }

    if (btn.classList.contains("paused")) {
      synth.resume();
      btn.classList.remove("paused");
      btn.classList.add("playing");
      btn.querySelector(".speech-icon").innerHTML = SVG_PAUSE;
      btn.querySelector(".speech-label").textContent = "Pause";
      return;
    }

    var text = getReadableText(section);
    if (!text) return;

    utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.lang = document.documentElement.lang || "en";

    var voices = synth.getVoices();
    var preferred = voices.find(function (v) {
      return v.lang.startsWith("en") && v.name.indexOf("Google") !== -1;
    });
    if (!preferred) {
      preferred = voices.find(function (v) {
        return v.lang.startsWith("en");
      });
    }
    if (preferred) utterance.voice = preferred;

    utterance.onend = function () {
      stopAll();
    };
    utterance.onerror = function () {
      stopAll();
    };

    activeBtn = btn;
    btn.classList.add("playing");
    btn.querySelector(".speech-icon").innerHTML = SVG_PAUSE;
    btn.querySelector(".speech-label").textContent = "Pause";

    synth.speak(utterance);
  }

  function createButton() {
    var wrap = document.createElement("div");
    wrap.className = "speech-btn-wrap";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "speech-btn";
    btn.setAttribute("aria-label", "Listen to this section");
    btn.innerHTML =
      '<span class="speech-icon">' +
      SVG_PLAY +
      '</span><span class="speech-label">Listen</span>';

    var stop = document.createElement("button");
    stop.type = "button";
    stop.className = "speech-stop";
    stop.setAttribute("aria-label", "Stop reading");
    stop.innerHTML = SVG_STOP;

    wrap.appendChild(btn);
    wrap.appendChild(stop);
    return { wrap: wrap, play: btn, stop: stop };
  }

  function init() {
    var sections = document.querySelectorAll("section");
    sections.forEach(function (section) {
      var text = getReadableText(section);
      if (!text || text.length < 80) return;

      var heading =
        section.querySelector("h1, h2") ||
        section.querySelector(".eyebrow") ||
        section.querySelector("h3");
      var anchor = heading || section.querySelector(".container") || section;

      var controls = createButton();
      if (heading && heading.parentElement) {
        heading.parentElement.insertBefore(controls.wrap, heading.nextSibling);
      } else {
        section.insertBefore(controls.wrap, section.firstChild);
      }

      controls.play.addEventListener("click", function () {
        handleClick(controls.play, section);
      });
      controls.stop.addEventListener("click", function () {
        if (activeBtn === controls.play) stopAll();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Chrome requires voices to load async
  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = function () {};
  }
})();
