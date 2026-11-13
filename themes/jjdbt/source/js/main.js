(function () {
  "use strict";

  var COLORS = ["#ff7eb3", "#78c6ff", "#a78bfa", "#fff1a8", "#9ff3c8", "#ffd1e3"];

  /* =========================================================
     1. 加载进度条（不等大图，快速完成）
     ========================================================= */
  function initLoadingScreen() {
    var screen = document.getElementById("loading-screen");
    var bar = document.getElementById("loading-bar");
    var percentEl = document.getElementById("loading-percent");
    if (!screen || !bar || !percentEl) return;

    var progress = 0;
    var done = false;

    function updateBar(p) {
      progress = Math.max(progress, p);
      bar.style.width = progress + "%";
      percentEl.textContent = Math.round(progress) + "%";
    }

    function finish() {
      if (done) return;
      done = true;
      updateBar(100);
      setTimeout(function () {
        screen.classList.add("loaded");
        document.body.classList.add("loaded");
      }, 120);
    }

    var timer = setInterval(function () {
      if (progress < 85) updateBar(progress + Math.random() * 16 + 8);
    }, 90);

    function onReady() {
      clearInterval(timer);
      updateBar(94);
      setTimeout(finish, 90);
    }

    /* 关键：DOM 一就绪就收尾，绝不等 window.load
       （等 load 等于要等 7MB 的 hero 大图和全部装饰图） */
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onReady);
    } else {
      onReady();
    }

    /* 硬上限：1 秒内无论如何让出页面 */
    setTimeout(onReady, 1000);
  }

  initLoadingScreen();

  /* =========================================================
     2. 点击粒子特效
     ========================================================= */
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
    var color = COLORS[Math.floor(Math.random() * COLORS.length)];

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
      particle.style.transform =
        "translate(calc(-50% + " + offsetX + "px), calc(-50% + " + offsetY + "px)) scale(" + (1 - progress * 0.45) + ")";
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

  /* =========================================================
     3. 表格包裹：让宽表格可以横向滚动
     ========================================================= */
  function wrapTables() {
    var tables = document.querySelectorAll(".post-content > table");
    Array.prototype.forEach.call(tables, function (table) {
      if (table.parentElement && table.parentElement.classList.contains("table-wrap")) return;
      var wrap = document.createElement("div");
      wrap.className = "table-wrap";
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  /* =========================================================
     4. 看板娘：自托管 oh-my-live2d + 点击说话 + 立绘兜底
     ========================================================= */
  var MOE_LINES = [
    "要来一首歌吗？只唱给你一个人听哦～",
    "呐呐，你觉得我的双马尾好看吗？",
    "哼——我可是世界第一的公主殿下哦。",
    "唱歌的时候，要一直看着我哦！",
    "唔…被摸头了，头发会乱掉的啦。",
    "有点困了…可以靠一下吗？就一下下。",
    "别一直盯着我看啦，会害羞的…",
    "今天也要元气满满，一起加油吧！",
    "偷偷告诉你，我最近也在学写代码呢。",
    "累了就听首歌吧，我给你推荐～",
    "刚才那个页面，你觉得怎么样？",
    "要不要一起去「推荐作品」看看你喜欢的东西？",
    "葱…葱才不是我喜欢的呢，哼。",
    "你都在这里待这么久啦，休息一下嘛。",
    "我正在练新曲，要不要听第一句？",
    "谢谢你来看我，今天也很开心！",
    "这个博客的主人，是个还在努力的小朋友哦。",
    "早点睡啦，不然明天嗓子会哑掉的。"
  ];

  /* 看板娘。模型 4MB，所以只在页面空闲后才加载，绝不参与首屏 */
  var PETS = {
    /* 默认：初音未来（VTube Studio 版，贴图已降到 1024） */
    miku: {
      path: "/live2d/miku/miku.model3.json",
      scale: 0.062,
      position: [-32, 14],
      height: 360
    },
    /* 备用：DeepSeek 鲸鱼娘，访问 ?pet=whale 切换 */
    whale: {
      path: "/live2d/ds-whale-girl/c_0120.model3.json",
      scale: 0.048,
      position: [0, 8],
      height: 258
    }
  };

  function pickPet() {
    var key = "";
    try {
      var m = /[?&]pet=([a-z0-9_-]+)/i.exec(window.location.search);
      if (m) key = m[1].toLowerCase();
    } catch (e) { /* ignore */ }
    return PETS[key] ? key : "miku";
  }

  var companionStarted = false;
  var stageBound = false;

  function initCompanion() {
    if (companionStarted) return;
    companionStarted = true;

    var bubble = document.getElementById("moeBubble");
    var fallback = document.getElementById("moeFallback");
    if (!bubble) return;

    var hideTimer = null;
    var booted = false;
    var failed = false;

    function randomLine() {
      return MOE_LINES[Math.floor(Math.random() * MOE_LINES.length)];
    }

    /* 按时段打招呼（库自带气泡已隐藏，这里自己说） */
    function greetingByHour() {
      var h = new Date().getHours();
      if (h < 5) return "这个点还不睡？我要生气咯…";
      if (h < 9) return "早上好～今天也要元气满满地唱歌哦！";
      if (h < 12) return "上午好！一起认真做点事情吧。";
      if (h < 14) return "中午啦，先吃饭！饿肚子可唱不好歌。";
      if (h < 18) return "下午最容易犯困…要我给你唱首歌提提神吗？";
      if (h < 23) return "晚上好！今天有好好努力吗？";
      return "这么晚了还不睡，当心明天嗓子哑掉哦。";
    }

    function say(text) {
      bubble.textContent = text;
      bubble.classList.add("show");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        bubble.classList.remove("show");
      }, 4600);
    }

    /* 兜底：用立绘代替看板娘 */
    function useFallback() {
      if (failed) return;
      failed = true;
      if (!fallback) return;
      /* 立绘平时不下载，只有真用到时才赋 src */
      if (!fallback.getAttribute("src") && fallback.dataset.src) {
        fallback.src = fallback.dataset.src;
      }
      fallback.classList.add("on");
      fallback.addEventListener("click", function () {
        say(randomLine());
      });
      setTimeout(function () {
        say(greetingByHour());
      }, 900);
    }

    /* 找到看板娘的宿主元素。
       渲染库可能把内容塞进 Shadow DOM，所以不能只靠 querySelector */
    function findStage() {
      var el = document.getElementById("oml2d-stage") || document.querySelector(".oml2d-stage");
      if (el) return el;

      var kids = document.body.children;
      for (var i = kids.length - 1; i >= 0; i--) {
        var n = kids[i];
        if (n.shadowRoot) return n;

        var inner = n.querySelectorAll ? n.querySelectorAll("*") : [];
        for (var j = 0; j < inner.length; j++) {
          if (inner[j].shadowRoot) return inner[j];
        }
      }
      return null;
    }

    /* 点模型 → 说话。
       用「点击坐标是否落在模型区域内」判断，绕开 Shadow DOM 拿不到内部元素的问题 */
    function bindStage() {
      if (stageBound) return;
      stageBound = true;

      document.addEventListener(
        "click",
        function (event) {
          var host = findStage();
          if (!host) return;

          var r = host.getBoundingClientRect();
          if (r.width < 20 || r.height < 20) return;
          if (event.clientX < r.left || event.clientX > r.right) return;
          if (event.clientY < r.top || event.clientY > r.bottom) return;

          /* 点在菜单按钮上就不说话（菜单已关，防万一） */
          var t = event.target;
          if (t && t.closest && t.closest(".oml2d-menus")) return;

          say(randomLine());

          /* 顺手让模型做个动作，点起来更有反馈 */
          try {
            var rt = window.OML2D;
            if (rt && rt.getModel && rt.getModel()) {
              var m = rt.getModel();
              if (m && typeof m.motion === "function") m.motion();
            }
          } catch (e) {
            /* 动作失败不影响说话 */
          }
        },
        true
      );
    }

    /* 彻底干掉落库自带的气泡。
       它在 Shadow DOM 里会反复重建，所以不能只改 style，
       要往 Shadow DOM 里注入一条常驻样式，再顺手兜底隐藏 */
    function killLibraryTips() {
      function inject(root) {
        if (!root || root.__moeTipStyled) return;
        try {
          var st = document.createElement("style");
          st.textContent =
            "#oml2d-tips,#oml2d-tips-content,.oml2d-tips,.oml2d-tips-content{display:none!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;}";
          (root === document ? document.head : root).appendChild(st);
          root.__moeTipStyled = true;
        } catch (e) {}
      }

      function scan(root) {
        if (!root.querySelectorAll) return;
        inject(root);

        var hit = root.querySelectorAll('[id*="oml2d-tips"], [class*="oml2d-tips"]');
        for (var i = 0; i < hit.length; i++) {
          hit[i].style.setProperty("display", "none", "important");
          hit[i].style.setProperty("opacity", "0", "important");
          hit[i].style.setProperty("visibility", "hidden", "important");
        }

        var all = root.querySelectorAll("*");
        for (var k = 0; k < all.length; k++) {
          if (all[k].shadowRoot) scan(all[k].shadowRoot);
        }
      }
      try { scan(document); } catch (e) {}
    }

    var tipGuardStarted = false;
    function startTipGuard() {
      if (tipGuardStarted) return;
      tipGuardStarted = true;

      killLibraryTips();

      /* 关键：库一插入气泡元素就同步隐藏，赶在下一帧绘制之前，所以不会闪 */
      try {
        var mo = new MutationObserver(function () { killLibraryTips(); });
        mo.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });
      } catch (e) {}

      /* 兜底，防止某些情况下 observer 没覆盖到 */
      setInterval(killLibraryTips, 1500);
    }

    function boot(runtime) {
      if (booted || failed) return;
      if (!runtime || typeof runtime.loadOml2d !== "function") {
        useFallback();
        return;
      }
      /* 必须在 loadOml2d 之前启动，否则第一个气泡会先画出来再被藏 */
      startTipGuard();

      try {
        var petKey = pickPet();
        var pet = PETS[petKey];
        runtime.loadOml2d({
          models: [
            {
              path: pet.path,
              scale: pet.scale,
              position: pet.position,
              stageStyle: { height: pet.height, left: "auto", right: 0, bottom: 0 }
            }
          ],
          /* 关掉库自带气泡：它的位置会被模型头部压住，改用我们自己的 .moe-bubble */
          tips: {
            messageLine: 0,
            idleTips: { message: [], duration: 0, interval: 0 },
            welcomeTips: { message: {}, duration: 0 },
            copyTips: { message: [], duration: 0 }
          },
          /* 关掉右下角那排圆形按钮（换装 / 切换模型 / 关于 / 信息） */
          menus: { disable: true },
          statusBar: { disable: true },
          /* 鼠标跟随（默认开，这里显式写上，避免版本差异把它关掉） */
          autoInteract: true,
          primaryColor: "#ff7eb3",
          mobileDisplay: false
        });
        booted = true;
        setTimeout(bindStage, 1200);
        /* 库自带气泡已关闭，进站问候改用自己的气泡 */
        setTimeout(function () {
          say(greetingByHour());
        }, 1500);
      } catch (e) {
        useFallback();
      }
    }

    function loadScript(src, onload, onerror) {
      var s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = onload;
      s.onerror = onerror;
      document.head.appendChild(s);
    }

    function loadRuntime() {
      function loadModel() {
        loadScript("/libs/oh-my-live2d.min.js", function () {
          boot(window.OML2D);
        }, useFallback);
      }

      /* model3 模型必须先有 Cubism Core，再加载渲染库 */
      loadScript("/libs/live2dcubismcore.min.js", loadModel, function () {
        /* Core 加载失败也试一次，model2 模型不依赖它 */
        loadModel();
      });

      /* 15 秒内没起来就上兜底立绘 */
      setTimeout(function () {
        if (!booted) useFallback();
      }, 15000);
    }

    loadRuntime();
  }

  /* =========================================================
     5. 去掉正文里与文章标题重复的一级标题
     （markdown 里写了 "# 标题"，会和页面大标题重复显示）
     ========================================================= */
  function dedupeTitle() {
    var content = document.querySelector(".post-content");
    var titleEl = document.querySelector(".post-title");
    if (!content || !titleEl) return;

    var h1 = content.querySelector("h1");
    if (!h1) return;

    function norm(s) {
      return String(s || "")
        .replace(/[\s\u3000「」『』《》〈〉—\-－·…、，,。.!！?？:：;；"'“”‘’()（）\[\]【】]/g, "")
        .toLowerCase();
    }

    var a = norm(h1.textContent);
    var b = norm(titleEl.textContent);
    if (!a || !b) return;

    if (a === b || (a.length > 8 && b.length > 8 && (a.indexOf(b) > -1 || b.indexOf(a) > -1))) {
      h1.style.display = "none";
    }
  }

  /* =========================================================
     6. 文章列表页「快速筛选栏」（纯前端过滤，不刷新）
     ========================================================= */
  function initArchiveFilter() {
    var bar = document.getElementById("filterBar");
    var list = document.getElementById("archiveList");
    var empty = document.getElementById("filterEmpty");
    if (!bar || !list) return;

    var chips = Array.prototype.slice.call(bar.querySelectorAll(".filter-chip"));
    var items = Array.prototype.slice.call(list.querySelectorAll(".archive-item"));
    var years = Array.prototype.slice.call(list.querySelectorAll(".archive-year"));
    if (!chips.length || !items.length) return;

    function hasClass(el, name) {
      return (" " + el.className + " ").indexOf(" " + name + " ") > -1;
    }

    function apply(filter) {
      var shown = 0;

      items.forEach(function (item) {
        var tags = (item.getAttribute("data-tags") || "").split("|");
        var cats = (item.getAttribute("data-cats") || "").split("|");
        var ok = !filter || tags.indexOf(filter) > -1 || cats.indexOf(filter) > -1;
        item.classList.toggle("is-hidden", !ok);
        if (ok) shown++;
      });

      /* 年份标题：底下没有可见文章就一起藏掉 */
      years.forEach(function (h) {
        var node = h.nextElementSibling;
        var visible = false;
        while (node && !hasClass(node, "archive-year")) {
          if (hasClass(node, "archive-item") && !hasClass(node, "is-hidden")) {
            visible = true;
            break;
          }
          node = node.nextElementSibling;
        }
        h.classList.toggle("is-hidden", !visible);
      });

      if (empty) empty.hidden = shown !== 0;
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var filter = chip.getAttribute("data-filter") || "";
        var clickingActive = chip.classList.contains("is-active") && filter !== "";

        chips.forEach(function (c) {
          c.classList.remove("is-active");
        });

        if (clickingActive) {
          /* 再点一次当前标签 → 回到「全部」 */
          chips[0].classList.add("is-active");
          apply("");
        } else {
          chip.classList.add("is-active");
          apply(filter);
        }
      });
    });

    /* 支持 /archives/?tag=Hexo 直接进入筛选状态 */
    var m = /[?&]tag=([^&]+)/.exec(window.location.search);
    if (m) {
      var want = "";
      try {
        want = decodeURIComponent(m[1]);
      } catch (e) {
        want = m[1];
      }
      var target = null;
      chips.forEach(function (c) {
        if (c.getAttribute("data-filter") === want) target = c;
      });
      if (target) target.click();
    }
  }

  /* =========================================================
     7. 文章目录（TOC）滚动高亮
     ========================================================= */
  function initPostToc() {
    var floating = document.getElementById("postToc");
    var content = document.querySelector(".post-content");
    if (!content) return;

    var links = Array.prototype.slice.call(
      document.querySelectorAll(".post-toc .toc-link, .post-toc-inline .toc-link")
    );
    if (!links.length) return;

    /* 把链接和真实标题对应起来。
       注意：Hexo 的 toc() 输出的是 URL 编码后的 fragment（%E4%B8%80...），
       而标题 id 是原始中文，必须先解码才能 getElementById */
    var targets = [];
    links.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.charAt(0) !== "#") return;

      var raw = href.slice(1);
      var id = raw;
      try {
        id = decodeURIComponent(raw);
      } catch (e) {
        id = raw;
      }

      var el = document.getElementById(id) || document.getElementById(raw);
      if (!el) return;

      a.setAttribute("data-toc-id", id);
      targets.push({ id: id, el: el });
    });
    if (!targets.length) return;

    /* 同一标题可能出现两次（浮动 + 折叠），一起高亮 */
    function setActive(id) {
      links.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("data-toc-id") === id);
      });

      if (!floating) return;
      var active = floating.querySelector(".toc-link.is-active");
      var box = floating.querySelector(".post-toc-body");
      if (!active || !box) return;

      var ar = active.getBoundingClientRect();
      var br = box.getBoundingClientRect();
      if (ar.top < br.top + 6 || ar.bottom > br.bottom - 6) {
        box.scrollTop += ar.top - br.top - br.height / 2 + ar.height / 2;
      }
    }

    /* 视口上方留出多少像素算「已经在看这一节」 */
    var OFFSET = 140;
    var ticking = false;
    var currentId = targets[0].id;

    function update() {
      ticking = false;
      var current = targets[0];
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].el.getBoundingClientRect().top <= OFFSET) {
          current = targets[i];
        } else {
          break;
        }
      }
      /* 滚到底部时，强制选最后一项 */
      if (window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4) {
        current = targets[targets.length - 1];
      }
      if (current.id !== currentId) {
        currentId = current.id;
        setActive(currentId);
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(update);
      } else {
        setTimeout(update, 60);
      }
    }

    /* 点击目录后立刻高亮，不等滚动事件（锚点跳转是瞬间的） */
    links.forEach(function (a) {
      a.addEventListener("click", function () {
        var id = a.getAttribute("data-toc-id");
        if (!id) return;
        currentId = id;
        setActive(id);
        /* 浏览器平滑滚动结束后再校正一次 */
        setTimeout(update, 420);
      });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("hashchange", function () {
      setTimeout(update, 120);
    });
    update();
  }

  /* =========================================================
     启动
     ========================================================= */
  document.addEventListener("DOMContentLoaded", function () {
    /* 这几件事很轻，立即做 */
    initClickParticles();
    wrapTables();
    dedupeTitle();
    initArchiveFilter();
    initPostToc();

    /* 看板娘要下 5MB（运行时 + Core + 模型），放到浏览器空闲时再加载，
       首屏文章阅读不受影响 */
    function scheduleCompanion() {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(
          function () {
            initCompanion();
          },
          { timeout: 4000 }
        );
      } else {
        setTimeout(initCompanion, 2500);
      }
    }

    /* 用户在页面上一有真实操作，也立刻开始加载（说明他愿意等） */
    var eager = false;
    function onFirstIntent() {
      if (eager) return;
      eager = true;
      initCompanion();
    }
    ["pointerdown", "scroll", "keydown"].forEach(function (evt) {
      window.addEventListener(evt, onFirstIntent, { once: true, passive: true });
    });

    scheduleCompanion();
  });
})();
