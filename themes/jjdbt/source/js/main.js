(function () {
  const colors = ["#ff7eb3", "#78c6ff", "#a78bfa", "#fff1a8", "#9ff3c8", "#ffd1e3"];

  function createParticleLayer() {
    const layer = document.createElement("div");
    layer.className = "particle-layer";
    document.body.appendChild(layer);
    return layer;
  }

  function createClickParticle(layer, x, y) {
    const particle = document.createElement("span");
    const size = Math.random() * 9 + 5;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 90 + 42;
    const color = colors[Math.floor(Math.random() * colors.length)];

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

    const startedAt = performance.now();
    const duration = 900 + Math.random() * 600;

    function animate(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const offsetX = Math.cos(angle) * distance * ease;
      const offsetY = Math.sin(angle) * distance * ease + 70 * progress * progress;
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
    const layer = createParticleLayer();
    document.addEventListener("click", function (event) {
      for (let i = 0; i < 12; i += 1) {
        createClickParticle(layer, event.clientX, event.clientY);
      }
    });
  }

  function initLive2D() {
    const anchor = document.querySelector(".live2d-anchor");
    if (!anchor || typeof window.L2Dwidget === "undefined") {
      return;
    }

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
        mobile: {
          show: false
        },
        react: {
          opacityDefault: 0.88,
          opacityOnHover: 0.96
        }
      });
    } catch (error) {
      anchor.hidden = true;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initClickParticles();
    initLive2D();
  });
}());
