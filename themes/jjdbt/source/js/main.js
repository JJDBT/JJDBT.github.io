(function () {
  var colors = ["#ff7eb3", "#78c6ff", "#a78bfa", "#fff1a8", "#9ff3c8", "#ffd1e3"];

  /* ===== 加载进度条（不等大图，快速完成） ===== */
  function initLoadingScreen() {
    var screen = document.getElementById("loading-screen");
    var bar = document.getElementById("loading-bar");
    var percentEl = document.getElementById("loading-percent");
    if (!screen || !bar || !percentEl) return;

    var progress = 0;

    function updateBar(p) {
      progress = Math.max(progress, p);
      bar.style.width = progress + "%";
      percentEl.textContent = Math.round(progress) + "%";
    }

    function finish() {
      updateBar(100);
      setTimeout(function () {
        screen.classList.add("loaded");
        document.body.classList.add("loaded");
      }, 200);
    }

    var timer = setInterval(function () {
      if (progress < 60) {
        updateBar(progress + Math.random() * 12 + 5);
      } else if (progress < 85) {
        updateBar(progress + Math.random() * 6 + 2);
      }
    }, 200);

    function onReady() {
      clearInterval(timer);
      updateBar(92);
      setTimeout(function () {
        updateBar(97);
        setTimeout(finish, 150);
      }, 100);
    }

    if (document.readyState === "complete") {
      onReady();
    } else {
      document.addEventListener("DOMContentLoaded", onReady);
      setTimeout(onReady, 2500);
    }
  }

  initLoadingScreen();

  /* ===== 点击粒子特效 ===== */
  function createParticleLayer() {
    var layer = document.createElement("div");
    layer.className = "particle-layer";
    document.body.appendChild(layer);
    return layer;
  }

  function createClickParticle(layer, x, y) {
    var particle = document.createElement("span");
    var size = Math.random() * 9 + 5;
    var angle = Math.random() * Math.PI * 2;
    var distance = Math.random() * 90 + 42;
    var color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.position = "absolute";
    particle.style.left = x + "px";
    particle.style.top = y + "px";
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.borderRadius = "999px";
    particle.style.background = color;
    particle.style.boxShadow = "0 0 14px " + color;
    particle.style.transform = "translate(-50%, -50%)";
    particle.style.opacity = "0.9";

    layer.appendChild(particle);

    var startedAt = performance.now();
    var duration = 900 + Math.random() * 600;

    function animate(now) {
      var progress = Math.min((now - startedAt) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var offsetX = Math.cos(angle) * distance * ease;
      var offsetY = Math.sin(angle) * distance * ease + 70 * progress * progress;
      particle.style.transform = "translate(calc(-50% + " + offsetX + "px), calc(-50% + " + offsetY + "px)) scale(" + (1 - progress * 0.45) + ")";
      particle.style.opacity = String(0.9 * (1 - progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    }

    requestAnimationFrame(animate);
  }

  function initClickParticles() {
    var layer = createParticleLayer();
    document.addEventListener("click", function (event) {
      for (var i = 0; i < 12; i++) {
        createClickParticle(layer, event.clientX, event.clientY);
      }
    });
  }

  /* ===== Live2D 延迟加载（页面就绪后动态注入脚本） ===== */
  function initLive2D() {
    var anchor = document.querySelector(".live2d-anchor");
    if (!anchor) return;

    function tryInit() {
      if (typeof window.L2Dwidget === "undefined") return false;
      try {
        window.L2Dwidget.init({
          model: {
            jsonPath: "https://cdn.jsdelivr.net/npm/live2d-widget-model-miku@1.0.5/assets/miku.model.json"
          },
          display: {
            width: 170,
            height: 330,
            position: "right",
            hOffset: 0,
            vOffset: 0
          },
          mobile: { show: false },
          react: {
            opacityDefault: 0.88,
            opacityOnHover: 0.96
          }
        });
        return true;
      } catch (e) {
        anchor.hidden = true;
        return true;
      }
    }

    if (tryInit()) return;

    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/live2d-widget@3.1.4/lib/L2Dwidget.min.js";
    script.onload = function () {
      setTimeout(tryInit, 100);
    };
    script.onerror = function () {
      anchor.hidden = true;
    };
    document.head.appendChild(script);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initClickParticles();
    setTimeout(initLive2D, 800);
  });
}());
