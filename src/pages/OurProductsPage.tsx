import React, { useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';

const productSequence = {
  basePath: '/assets/Products/Sony-NX100/',
  frameCount: 862,
  extension: 'jpg'
};

const PACKAGE_ROUTE = '/paket';

const getFrameUrl = (index: number) => {
  return `${productSequence.basePath}Video%20%20%20%20Web${index
    .toString()
    .padStart(3, '0')}.${productSequence.extension}`;
};

const clamp = (
  value: number,
  min: number,
  max: number
) => {
  return Math.max(
    min,
    Math.min(max, value)
  );
};

const smoothStep = (value: number) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

/*
 * Frame-driven animation.
 *
 * Default behavior:
 * - fade in
 * - hold
 * - fade out
 *
 * Special case:
 * fadeInDuration = 0
 * means the element is immediately visible
 * at startFrame and only fades OUT.
 *
 * Because everything is driven by frame position,
 * reverse scrolling automatically reverses the animation.
 */
const getOverlayAnimation = (
  frame: number,
  startFrame: number,
  endFrame: number,
  fadeInDuration = 12,
  fadeOutDuration = 12
) => {
  if (
    frame < startFrame ||
    frame > endFrame
  ) {
    return {
      opacity: 0,
      translateY: 24,
      scale: 0.985
    };
  }

  const fadeInEnd =
    fadeInDuration <= 0
      ? startFrame
      : Math.min(
          startFrame + fadeInDuration,
          endFrame
        );

  const fadeOutStart =
    fadeOutDuration <= 0
      ? endFrame
      : Math.max(
          endFrame - fadeOutDuration,
          startFrame
        );

  let opacity = 1;
  let translateY = 0;
  let scale = 1;

  /*
   * FADE IN
   *
   * Disabled when fadeInDuration = 0.
   */
  if (
    fadeInDuration > 0 &&
    frame < fadeInEnd
  ) {
    const progress = smoothStep(
      (frame - startFrame) /
        Math.max(
          1,
          fadeInEnd - startFrame
        )
    );

    opacity = progress;

    translateY =
      24 * (1 - progress);

    scale =
      0.985 +
      0.015 * progress;
  }

  /*
   * FADE OUT
   */
  if (
    fadeOutDuration > 0 &&
    frame > fadeOutStart
  ) {
    const progress = smoothStep(
      (frame - fadeOutStart) /
        Math.max(
          1,
          endFrame - fadeOutStart
        )
    );

    opacity = 1 - progress;

    translateY =
      -20 * progress;

    scale =
      1 - 0.015 * progress;
  }

  return {
    opacity,
    translateY,
    scale
  };
};

/*
 * ==============================================================
 * PERFORMANCE: overlay section registry
 * ==============================================================
 * Each text overlay only needs to be touched (DOM write) while the
 * scroll frame is anywhere near its active window. Outside of that
 * window (with a small safety buffer) it is already fully hidden
 * from a previous update, so there is nothing new to paint and we
 * skip it entirely. This turns "10 DOM writes every single animation
 * tick" into "1-2 DOM writes only when something is actually moving",
 * which is the main source of scroll jank/lag.
 * ==============================================================
 */
const OVERLAY_BUFFER_FRAMES = 20;

type OverlayAnimationState = {
  opacity: number;
  translateY: number;
  scale: number;
};

const isFrameNearRange = (
  frame: number,
  startFrame: number,
  endFrame: number,
  buffer: number
) => {
  return (
    frame >= startFrame - buffer &&
    frame <= endFrame + buffer
  );
};

export const OurProductsPage: React.FC = () => {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  /*
   * ==========================================================
   * TEXT REFS
   * ==========================================================
   */

  const heroOverlayRef =
    useRef<HTMLDivElement>(null);

  const sonyTitleRef =
    useRef<HTMLDivElement>(null);

  const sonySpecsRef =
    useRef<HTMLDivElement>(null);

  const feelworldTitleRef =
    useRef<HTMLDivElement>(null);

  const feelworldSpecsRef =
    useRef<HTMLDivElement>(null);

  const godoxTitleRef =
    useRef<HTMLDivElement>(null);

  const godoxSpecsRef =
    useRef<HTMLDivElement>(null);

  const hollylandTitleRef =
    useRef<HTMLDivElement>(null);

  const hollylandSpecsRef =
    useRef<HTMLDivElement>(null);

  const ctaOverlayRef =
    useRef<HTMLDivElement>(null);

  /*
   * PERFORMANCE: cache of the last value written to each overlay so
   * we never write the exact same opacity/transform twice in a row.
   */
  const lastOverlayStateRef =
    useRef<Map<string, OverlayAnimationState>>(
      new Map()
    );

  /*
   * ==========================================================
   * IMAGE CACHE
   * ==========================================================
   */

  const imageCache =
    useRef<Map<number, HTMLImageElement>>(
      new Map()
    );

  const loadingFrames =
    useRef<Map<number, Promise<void>>>(
      new Map()
    );

  const failedFrames =
    useRef<Set<number>>(
      new Set()
    );

  /*
   * ==========================================================
   * CONTROLLED IMAGE QUEUE
   * ==========================================================
   */

  const frameQueue =
    useRef<number[]>([]);

  const queueSet =
    useRef<Set<number>>(
      new Set()
    );

  const activeLoadsRef =
    useRef<number>(0);

  /*
   * Keep network concurrency controlled to avoid choking mobile
   * devices, but high enough that fast scrolling doesn't outrun
   * the loader and cause visible stepping/stutter. 3 was too low
   * for a 862-frame sequence; 6 keeps things buffered without
   * saturating slow connections.
   */
  const MAX_CONCURRENT_LOADS = 6;

  /*
   * ==========================================================
   * FRAME STATE
   * ==========================================================
   */

  const currentFrameRef =
    useRef<number>(0);

  const smoothFrameRef =
    useRef<number>(0);

  const targetFrameRef =
    useRef<number>(0);

  const scrollRequestRef =
    useRef<number>(0);

  const renderLoopRef =
    useRef<number>(0);

  /*
   * ==========================================================
   * FRAME HELPERS
   * ==========================================================
   */

  const getSafeFrame = (
    index: number
  ) => {
    return Math.max(
      0,
      Math.min(
        productSequence.frameCount - 1,
        Math.round(index)
      )
    );
  };

  /*
   * ==========================================================
   * CANVAS DRAWING
   * ==========================================================
   */

  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvas: HTMLCanvasElement
  ) => {
    const canvasWidth =
      canvas.width;

    const canvasHeight =
      canvas.height;

    const imageWidth =
      img.naturalWidth ||
      img.width;

    const imageHeight =
      img.naturalHeight ||
      img.height;

    if (
      imageWidth <= 0 ||
      imageHeight <= 0
    ) {
      return;
    }

    const imageRatio =
      imageWidth /
      imageHeight;

    const canvasRatio =
      canvasWidth /
      canvasHeight;

    let sourceWidth =
      imageWidth;

    let sourceHeight =
      imageHeight;

    let sourceX = 0;
    let sourceY = 0;

    /*
     * Crop source image as needed
     * so the viewport stays completely filled.
     */
    if (
      imageRatio > canvasRatio
    ) {
      sourceWidth =
        imageHeight *
        canvasRatio;

      sourceX =
        (imageWidth -
          sourceWidth) /
        2;
    } else if (
      imageRatio < canvasRatio
    ) {
      sourceHeight =
        imageWidth /
        canvasRatio;

      sourceY =
        (imageHeight -
          sourceHeight) /
        2;
    }

    ctx.clearRect(
      0,
      0,
      canvasWidth,
      canvasHeight
    );

    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvasWidth,
      canvasHeight
    );
  };

  const resizeCanvas = () => {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const width =
      Math.max(
        1,
        Math.round(
          window.innerWidth
        )
      );

    const height =
      Math.max(
        1,
        Math.round(
          window.innerHeight
        )
      );

    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    canvas.width =
      Math.round(
        width * dpr
      );

    canvas.height =
      Math.round(
        height * dpr
      );

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    const ctx =
      canvas.getContext('2d');

    if (!ctx) return;

    ctx.imageSmoothingEnabled =
      true;

    ctx.imageSmoothingQuality =
      'high';

    const currentFrame =
      getSafeFrame(
        smoothFrameRef.current
      );

    const currentImage =
      imageCache.current.get(
        currentFrame
      );

    if (currentImage) {
      drawImageCover(
        ctx,
        currentImage,
        canvas
      );
    }
  };

  /*
   * ==========================================================
   * IMAGE LOADING QUEUE
   * ==========================================================
   */

  const enqueueFrame = (
    index: number
  ) => {
    const safeIndex =
      getSafeFrame(index);

    if (
      imageCache.current.has(
        safeIndex
      ) ||
      loadingFrames.current.has(
        safeIndex
      ) ||
      failedFrames.current.has(
        safeIndex
      ) ||
      queueSet.current.has(
        safeIndex
      )
    ) {
      return;
    }

    frameQueue.current.push(
      safeIndex
    );

    queueSet.current.add(
      safeIndex
    );
  };

  const processFrameQueue = () => {
    while (
      activeLoadsRef.current <
        MAX_CONCURRENT_LOADS &&
      frameQueue.current.length >
        0
    ) {
      const frame =
        frameQueue.current.pop();

      if (
        frame === undefined
      ) {
        break;
      }

      queueSet.current.delete(
        frame
      );

      if (
        imageCache.current.has(
          frame
        ) ||
        loadingFrames.current.has(
          frame
        ) ||
        failedFrames.current.has(
          frame
        )
      ) {
        continue;
      }

      activeLoadsRef.current++;

      const request =
        new Promise<void>(
          (resolve) => {
            const img =
              new Image();

            img.decoding =
              'async';

            img.onload = () => {
              imageCache.current.set(
                frame,
                img
              );

              loadingFrames.current.delete(
                frame
              );

              activeLoadsRef.current--;

              resolve();

              processFrameQueue();

              /*
               * Immediately render the frame
               * if it is still the current frame.
               */
              const currentFrame =
                getSafeFrame(
                  smoothFrameRef.current
                );

              if (
                currentFrame ===
                frame
              ) {
                const canvas =
                  canvasRef.current;

                if (!canvas) return;

                const ctx =
                  canvas.getContext(
                    '2d'
                  );

                if (!ctx) return;

                drawImageCover(
                  ctx,
                  img,
                  canvas
                );
              }
            };

            img.onerror = () => {
              failedFrames.current.add(
                frame
              );

              loadingFrames.current.delete(
                frame
              );

              activeLoadsRef.current--;

              resolve();

              processFrameQueue();
            };

            img.src =
              getFrameUrl(
                frame
              );
          }
        );

      loadingFrames.current.set(
        frame,
        request
      );
    }
  };

  const loadFrame = (
    index: number
  ): Promise<void> => {
    const safeIndex =
      getSafeFrame(index);

    if (
      imageCache.current.has(
        safeIndex
      ) ||
      failedFrames.current.has(
        safeIndex
      )
    ) {
      return Promise.resolve();
    }

    const existing =
      loadingFrames.current.get(
        safeIndex
      );

    if (existing) {
      return existing;
    }

    enqueueFrame(
      safeIndex
    );

    processFrameQueue();

    return Promise.resolve();
  };

  /*
   * ==========================================================
   * FRAME RENDER
   * ==========================================================
   */

  const findClosestLoadedFrame = (
    targetFrame: number
  ) => {
    let closest:
      | HTMLImageElement
      | null = null;

    let closestDistance =
      Infinity;

    imageCache.current.forEach(
      (img, frameIndex) => {
        const distance =
          Math.abs(
            frameIndex -
              targetFrame
          );

        if (
          distance <
          closestDistance
        ) {
          closestDistance =
            distance;

          closest = img;
        }
      }
    );

    return closest;
  };

  const drawFrame = (
    index: number
  ) => {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const ctx =
      canvas.getContext('2d');

    if (!ctx) return;

    const safeIndex =
      getSafeFrame(index);

    const exactImage =
      imageCache.current.get(
        safeIndex
      );

    /*
     * Exact frame available.
     */
    if (exactImage) {
      drawImageCover(
        ctx,
        exactImage,
        canvas
      );

      return;
    }

    /*
     * Keep closest available frame
     * rather than flashing blank.
     */
    const closestImage =
      findClosestLoadedFrame(
        safeIndex
      );

    if (closestImage) {
      drawImageCover(
        ctx,
        closestImage,
        canvas
      );
    }

    /*
     * Queue requested frame.
     */
    enqueueFrame(
      safeIndex
    );

    processFrameQueue();
  };

  /*
   * ==========================================================
   * LIGHTWEIGHT PRELOAD
   * ==========================================================
   */

  const preloadAhead = (
    currentIndex: number
  ) => {
    const center =
      getSafeFrame(
        currentIndex
      );

    const offsets = [
      1,
      -1,
      2,
      -2,
      3,
      -3,
      4,
      -4,
      5,
      -5,
      6,
      -6
    ];

    for (
      const offset of offsets
    ) {
      enqueueFrame(
        center + offset
      );
    }

    processFrameQueue();
  };

  /*
   * ==========================================================
   * SCROLL -> FRAME
   * ==========================================================
   */

  const updateScroll = () => {
    const section =
      containerRef.current;

    if (!section) return;

    const sectionTop =
      section
        .getBoundingClientRect()
        .top +
      window.scrollY;

    const sectionHeight =
      section.offsetHeight;

    const viewportHeight =
      window.innerHeight;

    const scrollableDistance =
      sectionHeight -
      viewportHeight;

    if (
      scrollableDistance <= 0
    ) {
      targetFrameRef.current =
        0;

      return;
    }

    const currentScroll =
      window.scrollY -
      sectionTop;

    let progress =
      currentScroll /
      scrollableDistance;

    progress =
      clamp(
        progress,
        0,
        1
      );

    targetFrameRef.current =
      progress *
      (productSequence.frameCount - 1);
  };

  /*
   * ==========================================================
   * TEXT OVERLAY
   * ==========================================================
   */

  const updateOverlay = (
    key: string,
    element: HTMLDivElement | null,
    animation: OverlayAnimationState
  ) => {
    if (!element) return;

    /*
     * PERFORMANCE: skip the DOM write entirely if this exact value
     * was already applied last tick. Prevents redundant style
     * recalculation when the section is fully hidden and nothing
     * about it is actually changing.
     */
    const last =
      lastOverlayStateRef.current.get(key);

    const changed =
      !last ||
      Math.abs(last.opacity - animation.opacity) > 0.001 ||
      Math.abs(last.translateY - animation.translateY) > 0.05 ||
      Math.abs(last.scale - animation.scale) > 0.0005;

    if (!changed) return;

    element.style.opacity =
      String(
        animation.opacity
      );

    element.style.transform =
      `translate3d(0, ${animation.translateY}px, 0) scale(${animation.scale})`;

    element.style.pointerEvents =
      animation.opacity > 0.01
        ? 'auto'
        : 'none';

    lastOverlayStateRef.current.set(
      key,
      animation
    );
  };

  /*
   * PERFORMANCE: only compute + write a section's overlay if the
   * current frame is anywhere near its active window. Everything
   * far outside that window was already hidden by a previous tick
   * and needs no further work, so we skip it completely instead of
   * touching the DOM for all 10 overlays on every single frame.
   */
  const updateOverlaySection = (
    key: string,
    element: HTMLDivElement | null,
    frame: number,
    startFrame: number,
    endFrame: number,
    fadeInDuration: number,
    fadeOutDuration: number
  ) => {
    if (
      !isFrameNearRange(
        frame,
        startFrame,
        endFrame,
        OVERLAY_BUFFER_FRAMES
      )
    ) {
      return;
    }

    updateOverlay(
      key,
      element,
      getOverlayAnimation(
        frame,
        startFrame,
        endFrame,
        fadeInDuration,
        fadeOutDuration
      )
    );
  };

  const updateTextOverlays = (
    frame: number
  ) => {
    /*
     * ========================================================
     * HERO
     *
     * Frame 0-59
     *
     * IMPORTANT:
     * NO FADE IN.
     *
     * It is visible immediately at frame 0
     * and only fades OUT near frame 59.
     * ========================================================
     */
    updateOverlaySection(
      'hero',
      heroOverlayRef.current,
      frame,
      0,
      59,
      0,
      12
    );

    /*
     * SONY TITLE
     * Frame 60-179
     */
    updateOverlaySection(
      'sonyTitle',
      sonyTitleRef.current,
      frame,
      60,
      179,
      14,
      16
    );

    /*
     * SONY SPECS
     * Frame 180-299
     */
    updateOverlaySection(
      'sonySpecs',
      sonySpecsRef.current,
      frame,
      180,
      299,
      14,
      16
    );

    /*
     * FEELWORLD TITLE
     * Frame 300-404
     */
    updateOverlaySection(
      'feelworldTitle',
      feelworldTitleRef.current,
      frame,
      300,
      404,
      14,
      14
    );

    /*
     * FEELWORLD SPECS
     * Frame 405-569
     */
    updateOverlaySection(
      'feelworldSpecs',
      feelworldSpecsRef.current,
      frame,
      405,
      569,
      16,
      18
    );

    /*
     * GODOX TITLE
     * Frame 619-653
     */
    updateOverlaySection(
      'godoxTitle',
      godoxTitleRef.current,
      frame,
      619,
      653,
      8,
      8
    );

    /*
     * GODOX SPECS
     * Frame 652-691
     */
    updateOverlaySection(
      'godoxSpecs',
      godoxSpecsRef.current,
      frame,
      652,
      691,
      8,
      8
    );

    /*
     * HOLLYLAND TITLE
     * Frame 692-768
     */
    updateOverlaySection(
      'hollylandTitle',
      hollylandTitleRef.current,
      frame,
      692,
      768,
      12,
      12
    );

    /*
     * HOLLYLAND SPECS
     * Frame 768-839
     */
    updateOverlaySection(
      'hollylandSpecs',
      hollylandSpecsRef.current,
      frame,
      768,
      839,
      12,
      12
    );

    /*
     * FINAL CTA
     * Frame 840-861
     *
     * Fade in only.
     * No fade out, so it remains visible
     * through the final frame.
     */
    updateOverlaySection(
      'cta',
      ctaOverlayRef.current,
      frame,
      840,
      861,
      8,
      0
    );
  };

  /*
   * ==========================================================
   * EVENTS
   * ==========================================================
   */

  const handleScroll = () => {
    if (
      scrollRequestRef.current
    ) {
      cancelAnimationFrame(
        scrollRequestRef.current
      );
    }

    scrollRequestRef.current =
      requestAnimationFrame(
        updateScroll
      );
  };

  const handleResize = () => {
    resizeCanvas();
    updateScroll();
  };

  /*
   * ==========================================================
   * EFFECT
   * ==========================================================
   */

  useEffect(() => {
    let mounted = true;

    currentFrameRef.current =
      0;

    smoothFrameRef.current =
      0;

    targetFrameRef.current =
      0;

    resizeCanvas();

    /*
     * Load first frame only.
     */
    loadFrame(0).then(() => {
      if (!mounted) return;

      resizeCanvas();

      drawFrame(0);

      /*
       * Hero immediately visible.
       */
      updateTextOverlays(0);

      /*
       * Start lightweight background preload.
       */
      preloadAhead(0);
    });

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true
      }
    );

    window.addEventListener(
      'resize',
      handleResize
    );

    updateScroll();

    /*
     * ========================================================
     * SMOOTH RENDER LOOP
     * ========================================================
     */
    const renderLoop = () => {
      if (!mounted) return;

      const target =
        targetFrameRef.current;

      const current =
        smoothFrameRef.current;

      const difference =
        target - current;

      /*
       * Preserve existing smoothness.
       */
      if (
        Math.abs(difference) >
        0.05
      ) {
        smoothFrameRef.current =
          current +
          difference *
            0.15;
      } else {
        smoothFrameRef.current =
          target;
      }

      /*
       * Text follows smooth frame.
       * Reverse scrolling therefore reverses
       * every animation naturally.
       */
      updateTextOverlays(
        smoothFrameRef.current
      );

      const renderFrame =
        getSafeFrame(
          smoothFrameRef.current
        );

      /*
       * Render only when the integer frame changes.
       */
      if (
        renderFrame !==
        currentFrameRef.current
      ) {
        currentFrameRef.current =
          renderFrame;

        drawFrame(
          renderFrame
        );

        preloadAhead(
          renderFrame
        );
      }

      renderLoopRef.current =
        requestAnimationFrame(
          renderLoop
        );
    };

    renderLoopRef.current =
      requestAnimationFrame(
        renderLoop
      );

    return () => {
      mounted = false;

      window.removeEventListener(
        'scroll',
        handleScroll
      );

      window.removeEventListener(
        'resize',
        handleResize
      );

      if (
        scrollRequestRef.current
      ) {
        cancelAnimationFrame(
          scrollRequestRef.current
        );
      }

      if (
        renderLoopRef.current
      ) {
        cancelAnimationFrame(
          renderLoopRef.current
        );
      }

      loadingFrames.current.clear();
      imageCache.current.clear();
      failedFrames.current.clear();

      frameQueue.current = [];
      queueSet.current.clear();

      lastOverlayStateRef.current.clear();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black font-sans">

      <Navbar />

      <main>

        {/* =====================================================
            SINGLE SCROLL-DRIVEN EXPERIENCE
            ===================================================== */}
        <section
          ref={containerRef}
          className="relative w-full"
          style={{
            height: '400vh'
          }}
        >

          <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">

            {/* =================================================
                CANVAS
                ================================================= */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 block w-full h-full"
            />

            {/* =================================================
                TEXT LAYER
                ================================================= */}
            <div className="absolute inset-0 z-20 pointer-events-none">

              {/* =================================================
                  HERO
                  FRAME 0-59
                  CENTER
                  NO FADE IN
                  ================================================= */}
              <div
                ref={heroOverlayRef}
                className="absolute inset-0 flex items-center justify-center px-4 sm:px-5 md:px-6 text-center"
                style={{
                  opacity: 1,
                  transform:
                    'translate3d(0, 0, 0) scale(1)',
                  willChange:
                    'opacity, transform'
                }}
              >
                <div className="max-w-4xl">

                  <h1
                    className="text-3xl sm:text-[2.15rem] md:text-[2.5rem] lg:text-8xl font-black tracking-[-0.04em] leading-none drop-shadow-2xl"
                    style={{
                      color: '#FFFFFF'
                    }}
                  >
                    Our Premium Equipment
                  </h1>

                  <p
                    className="mt-3 sm:mt-3 md:mt-4 lg:mt-6 text-[0.7rem] sm:text-[0.78rem] md:text-[0.9rem] lg:text-2xl font-medium tracking-wide drop-shadow-xl"
                    style={{
                      color:
                        'rgba(255,255,255,0.9)'
                    }}
                  >
                    Professional broadcast equipment behind every production.
                  </p>

                  <div
                    className="mt-8 sm:mt-9 md:mt-10 flex flex-col items-center"
                    style={{
                      color: '#FFFFFF'
                    }}
                  >
                    <span className="text-[0.6rem] sm:text-[0.65rem] md:text-xs font-semibold uppercase tracking-[0.22em] opacity-90">
                      Scroll Down
                    </span>

                    <div
                      className="mt-3"
                      style={{
                        animation:
                          'scrollArrow 1.5s ease-in-out infinite'
                      }}
                    >
                      <svg
                        width="20"
                        height="28"
                        viewBox="0 0 20 28"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M10 1V24"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                        />

                        <path
                          d="M3.5 17.5L10 24L16.5 17.5"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>

                </div>
              </div>

              {/* =================================================
                  SONY TITLE
                  FRAME 60-179
                  LEFT
                  ================================================= */}
              <div
                ref={sonyTitleRef}
                className="absolute inset-0 flex items-center justify-start"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
                  willChange:
                    'opacity, transform'
                }}
              >
                <div className="w-full px-4 sm:px-6 md:px-8 lg:pl-12 xl:pl-16">

                  <div className="max-w-xl">

                    <p
                      className="text-[0.55rem] sm:text-[0.6rem] md:text-xs lg:text-sm font-bold uppercase tracking-[0.24em] mb-2 sm:mb-3"
                      style={{
                        color: '#ff3157'
                      }}
                    >
                      WE PRESENT
                    </p>

                    <p className="text-[0.55rem] sm:text-[0.65rem] md:text-xs lg:text-sm uppercase tracking-[0.18em] font-semibold text-white/85 mb-2">
                      Professional Broadcast Camera
                    </p>

                    <h2
                      className="text-2xl sm:text-[2rem] md:text-[2.5rem] lg:text-7xl font-black tracking-[-0.04em] leading-none drop-shadow-2xl"
                      style={{
                        color: '#FFFFFF'
                      }}
                    >
                      SONY NX-100
                    </h2>

                    <p
                      className="mt-3 sm:mt-4 md:mt-5 text-[0.65rem] sm:text-[0.72rem] md:text-[0.8rem] lg:text-xl leading-relaxed font-medium max-w-xl drop-shadow-xl"
                      style={{
                        color:
                          'rgba(255,255,255,0.9)'
                      }}
                    >
                      A professional camera system used for multi-camera event production, live streaming, documentation, and broadcast applications.
                    </p>

                  </div>

                </div>
              </div>

              {/* =================================================
                  SONY SPECS
                  FRAME 180-299
                  RIGHT
                  ================================================= */}
              <div
                ref={sonySpecsRef}
                className="absolute inset-0 flex items-center justify-end"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
                  willChange:
                    'opacity, transform'
                }}
              >
                <div className="w-full px-4 sm:px-6 md:px-8 lg:pr-12 xl:pr-16 flex justify-end">

                  <div className="max-w-xl">

                    <div className="text-white/90 text-[0.65rem] sm:text-[0.72rem] md:text-[0.82rem] lg:text-lg leading-relaxed font-medium space-y-3">

                      <p>
                        <strong className="text-white">1.</strong>{' '}
                        Sensor: 1.0-type (13.2 x 8.8 mm) Back-Illuminated Exmor R CMOS Sensor [0.142 Megapixel efektif].
                      </p>

                      <p>
                        <strong className="text-white">2.</strong>{' '}
                        Full HD 1920 x 1080p hingga 60 fps.
                      </p>

                      <p>
                        <strong className="text-white">3.</strong>{' '}
                        Sony G Lens dengan 12x optical zoom, 24x Clear Image Zoom, dan 48x digital zoom.
                      </p>

                    </div>

                  </div>

                </div>
              </div>

              {/* =================================================
                  FEELWORLD TITLE
                  FRAME 300-404
                  LEFT
                  ================================================= */}
              <div
                ref={feelworldTitleRef}
                className="absolute inset-0 flex items-center justify-start"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
                  willChange:
                    'opacity, transform'
                }}
              >
                <div className="w-full px-4 sm:px-6 md:px-8 lg:pl-12 xl:pl-16">

                  <div className="max-w-xl">

                    <p
                      className="text-[0.55rem] sm:text-[0.6rem] md:text-xs lg:text-sm font-bold uppercase tracking-[0.24em] mb-2 sm:mb-3"
                      style={{
                        color: '#ff3157'
                      }}
                    >
                      WE PRESENT
                    </p>

                    <h2
                      className="text-2xl sm:text-[2rem] md:text-[2.5rem] lg:text-7xl font-black tracking-[-0.04em] leading-none drop-shadow-2xl"
                      style={{
                        color: '#FFFFFF'
                      }}
                    >
                      SWITCHER FEELWORLD L4
                    </h2>

                  </div>

                </div>
              </div>

              {/* =================================================
                  FEELWORLD SPECS
                  FRAME 405-569
                  RIGHT
                  ================================================= */}
              <div
                ref={feelworldSpecsRef}
                className="absolute inset-0 flex items-center justify-end"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
                  willChange:
                    'opacity, transform'
                }}
              >
                <div className="w-full px-4 sm:px-6 md:px-8 lg:pr-12 xl:pr-16 flex justify-end">

                  <div className="max-w-xl">

                    <div className="text-white/90 text-[0.65rem] sm:text-[0.72rem] md:text-[0.82rem] lg:text-lg leading-relaxed font-medium space-y-3">

                      <p>
                        <strong className="text-white">1.</strong>{' '}
                        Input 4x HDMI (HDMI 1.4) dan 1x 3G-SDI.
                      </p>

                      <p>
                        <strong className="text-white">2.</strong>{' '}
                        Output 1x HDMI, 1x SDI, dan 1x USB Type-C/3.0.
                      </p>

                      <p>
                        <strong className="text-white">3.</strong>{' '}
                        Resolusi Up to 1080p60.
                      </p>

                      <p>
                        <strong className="text-white">4.</strong>{' '}
                        Fitur Spesial: T-Bar untuk transisi, 13 efek transisi, Chroma Key, PIP, dan Logo Overlay.
                      </p>

                    </div>

                  </div>

                </div>
              </div>

              {/* =================================================
                  GODOX TITLE
                  FRAME 619-653
                  LEFT
                  ================================================= */}
              <div
                ref={godoxTitleRef}
                className="absolute inset-0 flex items-center justify-start"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
                  willChange:
                    'opacity, transform'
                }}
              >
                <div className="w-full px-4 sm:px-6 md:px-8 lg:pl-12 xl:pl-16">

                  <div className="max-w-xl">

                    <p
                      className="text-[0.55rem] sm:text-[0.6rem] md:text-xs lg:text-sm font-bold uppercase tracking-[0.24em] mb-2 sm:mb-3"
                      style={{
                        color: '#ff3157'
                      }}
                    >
                      WE PRESENT
                    </p>

                    <h2
                      className="text-2xl sm:text-[2rem] md:text-[2.5rem] lg:text-7xl font-black tracking-[-0.04em] leading-none drop-shadow-2xl"
                      style={{
                        color: '#FFFFFF'
                      }}
                    >
                      GODOX SL60W
                    </h2>

                  </div>

                </div>
              </div>

              {/* =================================================
                  GODOX SPECS
                  FRAME 652-691
                  RIGHT
                  ================================================= */}
              <div
                ref={godoxSpecsRef}
                className="absolute inset-0 flex items-center justify-end"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
                  willChange:
                    'opacity, transform'
                }}
              >
                <div className="w-full px-4 sm:px-6 md:px-8 lg:pr-12 xl:pr-16 flex justify-end">

                  <div className="max-w-xl">

                    <div className="text-white/90 text-[0.65rem] sm:text-[0.72rem] md:text-[0.82rem] lg:text-lg leading-relaxed font-medium space-y-3">

                      <p>
                        <strong className="text-white">1.</strong>{' '}
                        Daya Output: 60 Watt dengan kecerahan hingga 4100 Lux pada jarak 1 meter.
                      </p>

                      <p>
                        <strong className="text-white">2.</strong>{' '}
                        Temperatur &amp; Akurasi Warna: 5600K (Daylight) dengan CRI &gt;93 dan TLCI &gt;95 untuk warna yang akurat.
                      </p>

                      <p>
                        <strong className="text-white">3.</strong>{' '}
                        Rentang Peredupan: Kontrol kecerahan (dimming) yang dapat diatur dari 10% hingga 100%.
                      </p>

                      <p>
                        <strong className="text-white">4.</strong>{' '}
                        Mounting Aksesoris: Menggunakan Bowens S-Type Mount yang kompatibel dengan berbagai jenis softbox.
                      </p>

                      <p>
                        <strong className="text-white">5.</strong>{' '}
                        Kontrol &amp; Dimensi: Dilengkapi layar LCD, mendukung remote nirkabel (433MHz), dan memiliki berat 1.61 kg.
                      </p>

                    </div>

                  </div>

                </div>
              </div>

              {/* =================================================
                  HOLLYLAND TITLE
                  FRAME 692-768
                  LEFT
                  ================================================= */}
              <div
                ref={hollylandTitleRef}
                className="absolute inset-0 flex items-center justify-start"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
                  willChange:
                    'opacity, transform'
                }}
              >
                <div className="w-full px-4 sm:px-6 md:px-8 lg:pl-12 xl:pl-16">

                  <div className="max-w-xl">

                    <p
                      className="text-[0.55rem] sm:text-[0.6rem] md:text-xs lg:text-sm font-bold uppercase tracking-[0.24em] mb-2 sm:mb-3"
                      style={{
                        color: '#ff3157'
                      }}
                    >
                      WE PRESENT
                    </p>

                    <h2
                      className="text-2xl sm:text-[2rem] md:text-[2.5rem] lg:text-7xl font-black tracking-[-0.04em] leading-none drop-shadow-2xl"
                      style={{
                        color: '#FFFFFF'
                      }}
                    >
                      Hollyland Pyro H
                    </h2>

                  </div>

                </div>
              </div>

              {/* =================================================
                  HOLLYLAND SPECS
                  FRAME 768-839
                  LEFT
                  ================================================= */}
              <div
                ref={hollylandSpecsRef}
                className="absolute inset-0 flex items-center justify-start"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
                  willChange:
                    'opacity, transform'
                }}
              >
                <div className="w-full px-4 sm:px-6 md:px-8 lg:pl-12 xl:pl-16">

                  <div className="max-w-xl">

                    <div className="text-white/90 text-[0.65rem] sm:text-[0.72rem] md:text-[0.82rem] lg:text-lg leading-relaxed font-medium space-y-3">

                      <p>
                        <strong className="text-white">1.</strong>{' '}
                        Resolusi hingga 4K pada 30 fps.
                      </p>

                      <p>
                        <strong className="text-white">2.</strong>{' '}
                        Jangkauan Transmisi Hingga 1.300 kaki (400 meter) LOS.
                      </p>

                      <p>
                        <strong className="text-white">3.</strong>{' '}
                        Latensi: Sangat rendah, sekitar 60ms.
                      </p>

                      <p>
                        <strong className="text-white">4.</strong>{' '}
                        Dual-band 2.4 GHz dan 5 GHz.
                      </p>

                    </div>

                  </div>

                </div>
              </div>

              {/* =================================================
                  FINAL CTA
                  FRAME 840-861
                  CENTER
                  ================================================= */}
              <div
                ref={ctaOverlayRef}
                className="absolute inset-0 flex items-center justify-center px-5 text-center"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
                  willChange:
                    'opacity, transform'
                }}
              >

                {/* ================= CTA CENTER ================= */}
                <div className="max-w-3xl">

                  <h2
                    className="text-3xl sm:text-[2.4rem] md:text-[3rem] lg:text-6xl font-black tracking-[-0.04em] leading-tight drop-shadow-2xl"
                    style={{
                      color: '#FFFFFF'
                    }}
                  >
                    Your event, our priority.
                  </h2>

                  <p
                    className="mt-2 text-xl sm:text-2xl md:text-3xl font-semibold"
                    style={{
                      color:
                        'rgba(255,255,255,0.95)'
                    }}
                  >
                    Trust the experts.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href =
                        PACKAGE_ROUTE;
                    }}
                    className="mt-6 inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm sm:text-base font-bold transition-transform duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background:
                        '#A40D35',
                      color:
                        '#FFFFFF',
                      boxShadow:
                        '0 10px 30px rgba(0,0,0,0.25)'
                    }}
                  >
                    Order Now
                  </button>

                </div>

                {/* =================================================
                    AI DISCLAIMER
                    BOTTOM LEFT
                    BLACK
                    ================================================= */}
                <p
                  className="absolute bottom-4 left-4 sm:bottom-5 sm:left-6 md:bottom-6 md:left-8 lg:bottom-8 lg:left-10 max-w-[220px] sm:max-w-[260px] text-left text-[8px] sm:text-[9px] md:text-[10px] leading-relaxed font-medium"
                  style={{
                    color: 'rgba(0,0,0,0.65)'
                  }}
                >
                  Ilustrasi visual dibuat menggunakan AI.
                  Gambar ini bukan produk yang kami jual,
                  melainkan produk yang kami gunakan dalam produksi.
                </p>

              </div>

            </div>
          </div>
        </section>

      </main>

      <style>
        {`
          @keyframes scrollArrow {
            0% {
              transform: translateY(0);
              opacity: 0.65;
            }

            50% {
              transform: translateY(8px);
              opacity: 1;
            }

            100% {
              transform: translateY(0);
              opacity: 0.65;
            }
          }
        `}
      </style>

    </div>
  );
};
