/* Luxival shared interactions — included in all pages */
(function () {
  'use strict';

  /* ---- Custom cursor ---- */
  const dot = document.getElementById('cur-dot');
  const ring = document.getElementById('cur-ring');
  if (dot && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    (function loop() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a,button').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.style.width = '52px'; ring.style.height = '52px';
        ring.style.borderColor = 'var(--gold)';
        ring.style.transition = 'width .25s,height .25s,border-color .25s';
      });
      el.addEventListener('mouseleave', () => {
        ring.style.width = '36px'; ring.style.height = '36px';
        ring.style.borderColor = 'rgba(201,169,106,.5)';
      });
    });
  }

  /* ---- Scroll progress ---- */
  const prog = document.getElementById('prog');
  if (prog) {
    window.addEventListener('scroll', () => {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      prog.style.width = pct + '%';
    }, { passive: true });
  }

  /* ---- Nav darken on scroll ---- */
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.style.background = window.scrollY > 60
        ? 'rgba(10,11,15,.96)' : 'rgba(10,11,15,.7)';
    }, { passive: true });
  }

  /* ---- Scroll reveal ---- */
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('on'); ro.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

  /* ---- Video play/pause on viewport ---- */
  document.querySelectorAll('video').forEach(v => {
    new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
      });
    }, { threshold: 0.25 }).observe(v);
  });

  /* ---- 3D card tilt ---- */
  document.querySelectorAll('[data-tilt]').forEach(el => {
    const s = el.classList.contains('hover-card') ? 12 : 7;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-y * s}deg) rotateY(${x * s}deg) scale(1.02)`;
      el.style.boxShadow = `${-x * 18}px ${-y * 18}px 40px rgba(201,169,106,.07)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transition = 'transform .7s cubic-bezier(.16,1,.3,1),box-shadow .7s';
      el.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
      el.style.boxShadow = '';
      setTimeout(() => el.style.transition = '', 700);
    });
  });

  /* ---- Magnetic buttons ---- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.22;
      const y = (e.clientY - r.top - r.height / 2) * 0.22;
      btn.style.transform = `translate(${x}px,${y}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transition = 'transform .5s cubic-bezier(.16,1,.3,1)';
      btn.style.transform = '';
      setTimeout(() => btn.style.transition = '', 500);
    });
  });

})();
