// Константы
const SPACE_BETWEEN_SLIDER = 100;
const SPACE_SLIDER_DURATION = 1000;
const MAX_SPEED = 20;
const SLOWDOWN_RANGE = 200;
const MAX_CHANGE_SPEED = 1.2;
const FRAME_DURATION = 1000 / 60;
const SLIDE_GAP = 1;
const ANIMATION_GAP = 5;
const CATEGORY_ANIMATION_DURATION = 1000;
const CATEGORY_THUMB_OFFSET = 600;
const WHEEL_SCROLL_SENSITIVITY = 0.35;

const GRID_LINES_COUNT = 7;
const GRID_TOP_GAP_BASE = 110;
const GRID_BOTTOM_GAP_BASE = 450;
const GRID_BASE_WIDTH = 1920;
const GRID_FADE_START = 0;
const GRID_FADE_END = 0.35;

const CARD_SCALE_END = 1.2;
const CARD_SCALE_START =
  (CARD_SCALE_END * GRID_TOP_GAP_BASE) / GRID_BOTTOM_GAP_BASE;

// Вспомогательные функции
function clamp(val, min, max) {
  return val < min ? min : val > max ? max : val;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function buildProgressMap(markers) {
  if (markers.length < 2) throw new Error("Need at least two year markers");

  const sorted = [...markers].sort((a, b) => a.position - b.position);
  const lastPos = sorted[sorted.length - 1].position;
  const segments = sorted.length - 1;

  return sorted.map((m, idx) => ({
    real: m.position / lastPos,
    visual: idx / segments,
  }));
}

function realToVisual(real, map) {
  if (real <= 0) return 0;
  if (real >= 1) return 1;

  for (let i = 0; i < map.length - 1; i += 1) {
    const next = map[i + 1];
    if (real < next.real) {
      const a = map[i];
      const b = next;
      const tt = (real - a.real) / (b.real - a.real);
      return lerp(a.visual, b.visual, tt);
    }
  }

  return 1;
}

function visualToReal(visual, map) {
  if (visual <= 0) return 0;
  if (visual >= 1) return 1;

  for (let i = 0; i < map.length - 1; i += 1) {
    const next = map[i + 1];
    if (visual < next.visual) {
      const a = map[i];
      const b = next;
      const tt = (visual - a.visual) / (b.visual - a.visual);
      return lerp(a.real, b.real, tt);
    }
  }

  return 1;
}

const renderCategory = (data) =>
  data
    .map(
      (item, index) => `
                <div class="timeline3d__category-item ${
                  index === 0 ? "timeline3d__category-item_active" : ""
                }">${item.title}</div>`
    )
    .join("");

const renderTimeline = (data) =>
  data
    .map((timeline, blockIndex) => {
      const isLastBlock = blockIndex === data.length - 1;
      const linesCount = isLastBlock ? 1 : 10;

      const linesMarkup = Array.from({ length: linesCount }, (_, lineIndex) => {
        if (lineIndex === 0) {
          return `
                        <div class="scrollbar__line scrollbar__line_with-title">
                            <div class="scrollbar__title">${timeline.title}</div>
                        </div>
                    `;
        }
        return '<div class="scrollbar__line"></div>';
      }).join("");

      return `
                <div class="scrollbar__block">
                    ${linesMarkup}
                </div>
            `;
    })
    .join("");

const runScript = () => {
  const container = document.getElementById("3dTimeline");
  if (!container) return;

  const raw = container.dataset.slider3d;
  const data = raw ? JSON.parse(raw) : null;
  if (!data || !data.length) return;

  container.innerHTML = `
        <div class="timeline3d">
            <div class="timeline3d__category">
                ${renderCategory(data)}
            </div>
            <div class="timeline3d__slider">
                <div class="timeline3d__grid"></div>
                <div class="timeline3d__slides"></div>
            </div>
            <div class="timeline3d__scroll-wrapper">
                <div class="scrollbar" id="timeline3d-scrollbar">
                    <div class="scrollbar__thumb" id="timeline3d-scrollbar-thumb"></div>
                    <div class="scrollbar__inner" id="scrollbar-inner"></div>
                </div>
            </div>
            <div class="timeline3d__metrics">
                <div class="timeline3d__metric" id="timeline3d-fps">FPS: 0</div>
                <div class="timeline3d__metric" id="timeline3d-frame">Frame: 0.00ms</div>
                <div class="timeline3d__metric" id="timeline3d-frame-max">Max frame: 0.00ms</div>
            </div>
        </div>
    `;

  const root = container.querySelector(".timeline3d");
  const sliderEl = root.querySelector(".timeline3d__slider");
  const gridRoot = root.querySelector(".timeline3d__grid");
  const slidesRoot = root.querySelector(".timeline3d__slides");
  const track = root.querySelector("#timeline3d-scrollbar");
  const thumb = root.querySelector("#timeline3d-scrollbar-thumb");
  const inner = root.querySelector("#scrollbar-inner");
  const categoryElements = root.querySelectorAll(".timeline3d__category-item");
  const fpsEl = root.querySelector("#timeline3d-fps");
  const frameEl = root.querySelector("#timeline3d-frame");
  const frameMaxEl = root.querySelector("#timeline3d-frame-max");

  let activeSliderData = data[0];
  let sliderTimeline = activeSliderData.value.timeline;
  let progressMap = buildProgressMap(sliderTimeline);

  inner.innerHTML = renderTimeline(sliderTimeline);

  const slidesPerView = Math.round(
    SPACE_SLIDER_DURATION / SPACE_BETWEEN_SLIDER
  );

  let slides = new Map();
  let sliderWidth = 0;
  let gridLines = [];
  let lineXTop = [];
  let lineXBottom = [];
  let thumbMaxOffset = 0;

  const buildGridLines = () => {
    gridRoot.innerHTML = "";
    gridLines = [];

    for (let i = 0; i < GRID_LINES_COUNT; i += 1) {
      const line = document.createElement("div");
      line.className = "timeline3d__grid-line";
      gridRoot.appendChild(line);
      gridLines.push(line);
    }
  };

  const buildSlides = (cards) => {
    slides.clear();

    if (!cards.length) {
      slidesRoot.innerHTML = "";
      sliderWidth = 0;
      return;
    }

    let minPos = cards[0].position;
    let maxCardPos = cards[0].position;

    for (let i = 0; i < cards.length; i += 1) {
      const p = cards[i].position;
      if (p < minPos) minPos = p;
      if (p > maxCardPos) maxCardPos = p;
    }

    const maxPosWithTail = maxCardPos + slidesPerView;
    const index = new Map();

    for (let i = 0; i < cards.length; i += 1) {
      const c = cards[i];
      index.set(c.position, { ...c, element: undefined });
    }

    const html = [];
    for (let pos = minPos; pos <= maxPosWithTail; pos += 1) {
      const slide = index.get(pos) ?? { position: pos };
      index.set(pos, slide);

      const anySlide = slide;
      const hasCard = !!anySlide.card;
      const hasTitle = !!anySlide.title;

      html.push(
        `<div class="slide" data-position="${pos}">
                    ${
                      hasCard
                        ? '<div class="slide__card"><div class="slide__card-inner">' +
                          anySlide.card.title +
                          "</div></div>"
                        : ""
                    }
                    ${
                      hasTitle
                        ? `<div class="slide__card slide__card-title"><div class="slide__card-inner">${anySlide.title}</div></div>`
                        : ""
                    }
                </div>`
      );
    }

    slidesRoot.innerHTML = html.join("");

    // cache DOM refs for performance
    let el = slidesRoot.firstElementChild;
    while (el) {
      const posAttr = el.dataset.position;
      if (posAttr != null) {
        const pos = Number(posAttr);
        const slide = index.get(pos);
        if (slide) {
          slide.element = el;
          slide.cardEl =
            el.querySelector(".slide__card-title") ??
            el.querySelector(".slide__card") ??
            undefined;
          slide.innerEl = el.querySelector(".slide__card-inner") ?? undefined;
        }
      }
      el = el.nextElementSibling;
    }

    slides = index;

    const rawWidth =
      (maxPosWithTail - slidesPerView - SLIDE_GAP) * SPACE_BETWEEN_SLIDER - 1;
    sliderWidth = rawWidth > 0 ? rawWidth : 0;
  };

  const getSlide = (position) => slides.get(position);

  const initCards = () => {
    const baseCards = activeSliderData.value.cards.map((card) => ({
      ...card,
      position: card.position + SLIDE_GAP,
    }));
    buildSlides(baseCards);
  };

  initCards();
  buildGridLines();

  let prevActiveElement = categoryElements[0];
  let thumbX = 0;
  let startX = 0;
  let startOffset = 0;
  let activeId = null;

  let targetStatus = 0;
  let sliderScrollStatus = 0;
  let status = 0;
  let speed = 0;
  let isAnimated = false;
  let lastFrameTime = 0;

  let activePosition = 0;
  let endPosition = 0;
  let visibleSlides = [];
  let firstPositionCard = undefined;
  let currentVisible = new Set();
  let isCategoryAnimating = false;
  let isSliderHovered = false;

  // Метрики
  let fps = 0;
  let frameDuration = 0;
  let maxFrameDuration = 0;
  let metricsLastTime = 0;
  let lastFrameTs = 0;
  let frameTimes = [];

  const updateMetrics = () => {
    fpsEl.textContent = `FPS: ${fps}`;
    frameEl.textContent = `Frame: ${frameDuration.toFixed(2)}ms`;
    frameMaxEl.textContent = `Max frame: ${maxFrameDuration.toFixed(2)}ms`;
  };

  const startAnimated = () => {
    if (isAnimated) return;

    isAnimated = true;
    lastFrameTime = 0;
    lastFrameTs = 0;
    frameDuration = 0;
    maxFrameDuration = 0;
    fps = 0;
    metricsLastTime = 0;
    frameTimes = [];
    updateMetrics();
    requestAnimationFrame(animate);
  };

  const getOffsetNorm = (slide) => {
    if (!slide) return 0.5;

    const anySlide = slide;
    const raw =
      (anySlide.card && typeof anySlide.card.offset === "number"
        ? anySlide.card.offset
        : undefined) ??
      (typeof anySlide.offset === "number" ? anySlide.offset : undefined) ??
      (typeof anySlide.titleOffset === "number"
        ? anySlide.titleOffset
        : undefined);

    if (typeof raw !== "number" || Number.isNaN(raw)) return 0.5;
    // нормализация [-1;1] -> [0;1]
    const t = (raw + 1) / 2;
    return clamp(t, 0, 1);
  };

  const renderCards = (cardsProgress) => {
    if (!cardsProgress.length) return;

    const first = getSlide(cardsProgress[0].position);
    if (!firstPositionCard || firstPositionCard.position !== first?.position) {
      firstPositionCard?.element?.classList.remove("slide__first");
      firstPositionCard = first;
      firstPositionCard?.element?.classList.add("slide__first");
    }

    const maxIdx = GRID_LINES_COUNT - 1;
    const hasGrid =
      lineXTop.length === GRID_LINES_COUNT &&
      lineXBottom.length === GRID_LINES_COUNT;

    for (let i = 0; i < cardsProgress.length; i += 1) {
      const { progress, position } = cardsProgress[i];
      const slide = getSlide(position);
      const el = slide?.element;
      if (!slide || !el) continue;

      const ease = progress * progress;
      el.style.setProperty("--progress", String(progress));

      if (hasGrid) {
        const tOffset = getOffsetNorm(slide);
        const idxFloat = tOffset * maxIdx;
        const i0 = idxFloat | 0;
        const i1 = i0 === maxIdx ? maxIdx : i0 + 1;
        const localT = i0 === i1 ? 0 : idxFloat - i0;

        const topX = lerp(lineXTop[i0], lineXTop[i1], localT);
        const bottomX = lerp(lineXBottom[i0], lineXBottom[i1], localT);

        const cardEl = slide.cardEl;

        if (cardEl) {
          cardEl.style.setProperty("--timeline3d-card-x-top", String(topX));
          cardEl.style.setProperty(
            "--timeline3d-card-x-bottom",
            String(bottomX)
          );
        }
      }

      const inner = slide.innerEl;
      if (inner) {
        const scale = lerp(CARD_SCALE_START, CARD_SCALE_END, ease);
        inner.style.setProperty("--card-scale", String(scale));
      }
    }
  };

  const render = () => {
    const maxOffset = thumbMaxOffset;
    const visualProgress = maxOffset ? thumbX / maxOffset : 0;
    const realProgress = visualToReal(visualProgress, progressMap);

    sliderScrollStatus = realProgress * 100;
    targetStatus = sliderWidth * realProgress;

    const distance = targetStatus - status;
    const absDistance = distance < 0 ? -distance : distance;

    let desiredSpeed = 0;
    if (absDistance > 0) {
      desiredSpeed = (distance > 0 ? 1 : -1) * MAX_SPEED;
      if (absDistance < SLOWDOWN_RANGE) {
        desiredSpeed *= absDistance / SLOWDOWN_RANGE;
      }
    }

    const deltaSpeed = clamp(
      desiredSpeed - speed,
      -MAX_CHANGE_SPEED,
      MAX_CHANGE_SPEED
    );
    speed += deltaSpeed;
    status = clamp(status + speed, -9999999, sliderWidth || 0);

    if (absDistance < 0.5 && Math.abs(speed) < 0.05) {
      status = targetStatus;
      speed = 0;
    }

    const realProgressFromStatus = sliderWidth ? status / sliderWidth : 0;
    root.style.setProperty("--progress", `${realProgressFromStatus}`);

    if (!isCategoryAnimating) {
      root.style.setProperty(
        "--timeline-visual-progress",
        `${realToVisual(realProgressFromStatus, progressMap)}`
      );
    }

    activePosition = Math.round(status / SPACE_BETWEEN_SLIDER);
    endPosition =
      activePosition + Math.round(SPACE_SLIDER_DURATION / SPACE_BETWEEN_SLIDER);

    visibleSlides = [];
    for (let i = activePosition; i <= endPosition; i += 1) {
      const start = (i - slidesPerView) * SPACE_BETWEEN_SLIDER;
      const rawProgress = (status - start) / SPACE_SLIDER_DURATION;
      if (rawProgress > 1 || rawProgress < 0) continue;

      const progress = Math.round(rawProgress * 1000) / 1000;
      visibleSlides.push({ progress, position: i });
    }

    renderCards(visibleSlides);

    const newVisible = new Set();
    for (let i = 0; i < visibleSlides.length; i += 1) {
      newVisible.add(visibleSlides[i].position);
    }

    newVisible.forEach((pos) => {
      if (!currentVisible.has(pos)) {
        getSlide(pos)?.element?.classList.add("slide_visible");
      }
    });

    currentVisible.forEach((pos) => {
      if (!newVisible.has(pos)) {
        getSlide(pos)?.element?.classList.remove("slide_visible");
      }
    });

    currentVisible = newVisible;
  };

  const animate = (time) => {
    if (!lastFrameTs) lastFrameTs = time;

    const delta = time - lastFrameTs;
    lastFrameTs = time;

    if (delta > 0) {
      frameDuration = delta;
      if (delta > maxFrameDuration) maxFrameDuration = delta;
    }

    frameTimes.push(time);
    while (frameTimes.length && frameTimes[0] <= time - 1000) {
      frameTimes.shift();
    }

    if (!metricsLastTime) metricsLastTime = time;

    if (time - metricsLastTime >= 1000) {
      fps = frameTimes.length;
      metricsLastTime = time;
      updateMetrics();
    }

    const shouldRender =
      !lastFrameTime || time - lastFrameTime >= FRAME_DURATION;
    if (shouldRender) {
      lastFrameTime = time;
      render();
    }

    if (Math.abs(targetStatus - status) > 0.01 || Math.abs(speed) > 0.01) {
      requestAnimationFrame(animate);
    } else {
      speed = 0;
      isAnimated = false;
      updateMetrics();
    }
  };

  const updateSliderSize = () => {
    const width = sliderEl.offsetWidth;
    const height = sliderEl.clientHeight;
    const scrollbarWidth = track.offsetWidth;
    const scrollbarHeight = track.clientHeight;

    root.style.setProperty("--slider-width", `${width}`);
    root.style.setProperty("--slider-height", `${height}`);
    root.style.setProperty("--scrollbar-width", `${scrollbarWidth}`);
    root.style.setProperty("--scrollbar-height", `${scrollbarHeight}`);

    thumbMaxOffset = scrollbarWidth - thumb.offsetWidth;
    if (thumbMaxOffset < 0) thumbMaxOffset = 0;

    if (height > 0 && gridLines.length === GRID_LINES_COUNT) {
      const scale = Math.min(1, width / GRID_BASE_WIDTH);
      const topGap = GRID_TOP_GAP_BASE * scale;
      const bottomGap = GRID_BOTTOM_GAP_BASE * scale;
      const center = width / 2;
      const segments = GRID_LINES_COUNT - 1;
      const topTotal = topGap * segments;
      const bottomTotal = bottomGap * segments;
      const topStart = center - topTotal / 2;
      const bottomStart = center - bottomTotal / 2;

      lineXTop = [];
      lineXBottom = [];

      for (let index = 0; index < GRID_LINES_COUNT; index += 1) {
        const line = gridLines[index];
        const topX = topStart + topGap * index;
        const bottomX = bottomStart + bottomGap * index;
        lineXTop.push(topX);
        lineXBottom.push(bottomX);

        const dx = bottomX - topX;
        const angle = Math.atan(dx / height);
        const angleDeg = (angle * 180) / Math.PI;
        const cos = Math.cos(angle);
        const len = cos !== 0 ? height / cos : height;
        const fadeStart = GRID_FADE_START * len;
        const fadeEnd = GRID_FADE_END * len;

        line.style.height = `${len}px`;
        line.style.left = `${bottomX}px`;
        line.style.transformOrigin = "bottom center";
        line.style.transform = `translateX(-50%) rotate(${-angleDeg}deg)`;
        line.style.background = `linear-gradient(
                    to bottom,
                    rgba(0,0,0,0) ${fadeStart}px,
                    rgba(0,0,0,0.5) ${fadeEnd}px,
                    rgba(0,0,0,0.5) 100%
                )`;
      }
    }
  };

  setTimeout(() => {
    updateSliderSize();
    render();
    updateMetrics();
  }, 0);

  window.addEventListener("resize", () => {
    updateSliderSize();
    render();
  });

  const onPointerMove = (e) => {
    const dx = e.clientX - startX;
    thumbX = clamp(startOffset + dx, 0, thumbMaxOffset);
    startAnimated();
  };

  const onPointerUp = () => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    if (activeId !== null) {
      thumb.releasePointerCapture(activeId);
      activeId = null;
    }
  };

  thumb.addEventListener("pointerdown", (e) => {
    if (isCategoryAnimating) return;
    activeId = e.pointerId;
    thumb.setPointerCapture(activeId);
    startX = e.clientX;
    startOffset = thumbX;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  });

  inner.addEventListener("click", (e) => {
    if (isCategoryAnimating) return;

    const rect = inner.getBoundingClientRect();
    const vProgress = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const realProgress = visualToReal(vProgress, progressMap);

    targetStatus = sliderWidth * realProgress;
    thumbX = vProgress * thumbMaxOffset;
    sliderScrollStatus = realProgress * 100;

    startAnimated();
  });

  const changeCategory = (index) => {
    if (index < 0 || index >= data.length) return;
    if (data[index] === activeSliderData) return;
    if (isCategoryAnimating) return;

    isCategoryAnimating = true;
    root.classList.add("timeline3d_category-disabled");

    prevActiveElement.classList.remove("timeline3d__category-item_active");
    prevActiveElement = categoryElements[index];
    prevActiveElement.classList.add("timeline3d__category-item_active");

    const prevTimelineProgressRaw =
      parseFloat(
        (
          getComputedStyle(root).getPropertyValue(
            "--timeline-visual-progress"
          ) || "0"
        ).trim()
      ) || 0;

    const trackRect = track.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const oldThumbLeft = thumbRect.left - trackRect.left;

    const oldThumbClone = thumb.cloneNode(true);
    oldThumbClone.removeAttribute("id");
    oldThumbClone.classList.add("scrollbar__thumb-clone");
    oldThumbClone.style.left = `${oldThumbLeft}px`;
    oldThumbClone.style.opacity = "1";
    oldThumbClone.style.transform = "translateX(0)";
    oldThumbClone.style.transition = `transform ${CATEGORY_ANIMATION_DURATION}ms ease, opacity ${CATEGORY_ANIMATION_DURATION}ms ease`;
    track.appendChild(oldThumbClone);

    const newThumbClone = thumb.cloneNode(true);
    newThumbClone.removeAttribute("id");
    newThumbClone.classList.add("scrollbar__thumb-clone");
    newThumbClone.style.left = "0px";
    newThumbClone.style.opacity = "0";
    newThumbClone.style.transform = `translateX(-${CATEGORY_THUMB_OFFSET}px)`;
    newThumbClone.style.transition = `transform ${CATEGORY_ANIMATION_DURATION}ms ease, opacity ${CATEGORY_ANIMATION_DURATION}ms ease`;
    track.appendChild(newThumbClone);

    thumb.style.opacity = "0";

    const visibleNow = Array.from(currentVisible).sort((a, b) => a - b);
    const hasVisible = visibleNow.length > 0;
    const firstVisiblePos = hasVisible ? visibleNow[0] : activePosition;

    const startFirst = (firstVisiblePos - slidesPerView) * SPACE_BETWEEN_SLIDER;
    const rawFirst =
      (status - startFirst) / SPACE_SLIDER_DURATION >= 0 &&
      (status - startFirst) / SPACE_SLIDER_DURATION <= 1
        ? (status - startFirst) / SPACE_SLIDER_DURATION
        : 0;

    const negativeZone =
      (hasVisible ? visibleNow.length : slidesPerView) + ANIMATION_GAP;
    const negStart = -negativeZone;

    const usedNeg = new Set();
    const negativeSlides = [];

    if (hasVisible) {
      for (let i = 0; i < visibleNow.length; i += 1) {
        const pos = visibleNow[i];
        const original = getSlide(pos);
        const newPos = negStart + i;
        usedNeg.add(newPos);
        negativeSlides.push(
          original
            ? { ...original, position: newPos, element: undefined }
            : { position: newPos }
        );
      }
    }

    for (let p = negStart; p <= -1; p += 1) {
      if (!usedNeg.has(p)) negativeSlides.push({ position: p });
    }

    activeSliderData = data[index];
    sliderTimeline = activeSliderData.value.timeline;
    progressMap = buildProgressMap(sliderTimeline);
    inner.innerHTML = renderTimeline(sliderTimeline);

    const baseCards = activeSliderData.value.cards.map((card) => ({
      ...card,
      position: card.position + SLIDE_GAP,
    }));

    const combined = [...negativeSlides, ...baseCards];

    const statusForFirst =
      rawFirst * SPACE_SLIDER_DURATION +
      (negStart - slidesPerView) * SPACE_BETWEEN_SLIDER;

    buildSlides(combined);

    currentVisible = new Set();
    firstPositionCard = undefined;

    thumbX = 0;
    sliderScrollStatus = 0;
    targetStatus = 0;
    status = statusForFirst;

    root.style.setProperty(
      "--timeline-visual-progress",
      `${prevTimelineProgressRaw}`
    );

    render();
    startAnimated();
    updateSliderSize();

    requestAnimationFrame(() => {
      oldThumbClone.style.transform = `translateX(${CATEGORY_THUMB_OFFSET}px)`;
      oldThumbClone.style.opacity = "0";
      newThumbClone.style.transform = "translateX(0)";
      newThumbClone.style.opacity = "1";
      inner.style.transition = `transform ${CATEGORY_ANIMATION_DURATION}ms ease`;
      root.style.setProperty("--timeline-visual-progress", "0");
    });

    window.setTimeout(() => {
      oldThumbClone.remove();
      newThumbClone.remove();
      inner.style.transition = "";
      thumb.style.opacity = "1";
      root.classList.remove("timeline3d_category-disabled");
      isCategoryAnimating = false;
    }, CATEGORY_ANIMATION_DURATION);
  };

  categoryElements.forEach((el, index) => {
    el.addEventListener("click", () => changeCategory(index));
  });

  sliderEl.addEventListener("mouseenter", () => {
    isSliderHovered = true;
  });

  sliderEl.addEventListener("mouseleave", () => {
    isSliderHovered = false;
  });

  sliderEl.addEventListener(
    "wheel",
    (e) => {
      if (!isSliderHovered || isCategoryAnimating) return;
      const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
      if (!delta) return;

      e.preventDefault();
      if (!thumbMaxOffset) return;

      const diff = delta * WHEEL_SCROLL_SENSITIVITY;
      thumbX = clamp(thumbX + diff, 0, thumbMaxOffset);

      const vProgress = thumbMaxOffset ? thumbX / thumbMaxOffset : 0;
      const realProgress = visualToReal(vProgress, progressMap);

      targetStatus = sliderWidth * realProgress;
      sliderScrollStatus = realProgress * 100;

      startAnimated();
    },
    { passive: false }
  );

  render();
  updateMetrics();
  startAnimated();
};

// Запуск скрипта после загрузки DOM
document.addEventListener("DOMContentLoaded", runScript);
