import React, { useEffect, useRef } from 'react';
import { Navbar } from '../components/Navbar';

const productSequence = {
  basePath: '/assets/Products/Sony-NX100/',
  frameCount: 862,
  extension: 'jpg'
};

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

const getOverlayAnimation = (
  frame: number,
  startFrame: number,
  endFrame: number,
  fadeInEnd: number,
  fadeOutStart: number
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

  let opacity = 1;
  let translateY = 0;
  let scale = 1;

  if (frame < fadeInEnd) {
    const progress = smoothStep(
      (frame - startFrame) /
        (fadeInEnd - startFrame)
    );

    opacity = progress;
    translateY =
      24 * (1 - progress);
    scale =
      0.985 + 0.015 * progress;
  }

  if (frame > fadeOutStart) {
    const progress = smoothStep(
      (frame - fadeOutStart) /
        (endFrame - fadeOutStart)
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

export const OurProductsPage: React.FC = () => {
  const containerRef =
    useRef<HTMLDivElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const heroOverlayRef =
    useRef<HTMLDivElement>(null);

  const productOverlayRef =
    useRef<HTMLDivElement>(null);

  const standardOverlayRef =
    useRef<HTMLDivElement>(null);

  /*
   * Successfully loaded frames.
   */
  const imageCache =
    useRef<Map<number, HTMLImageElement>>(
      new Map()
    );

  /*
   * Frames currently loading.
   */
  const loadingFrames =
    useRef<Map<number, Promise<void>>>(
      new Map()
    );

  /*
   * Frames that failed to load.
   * Prevents endless retry loops.
   */
  const failedFrames =
    useRef<Set<number>>(
      new Set()
    );

  /*
   * Loading queue.
   *
   * Instead of firing many image requests at once,
   * frames are queued and processed with a small
   * concurrency limit.
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
   * A very small concurrency limit is intentional.
   *
   * The goal is to keep scrolling responsive instead
   * of saturating the browser with hundreds of JPG
   * downloads + decodes at once.
   */
  const MAX_CONCURRENT_LOADS = 3;

  /*
   * Current integer frame actually rendered.
   */
  const currentFrameRef =
    useRef<number>(0);

  /*
   * Floating-point frame used for smooth interpolation.
   */
  const smoothFrameRef =
    useRef<number>(0);

  /*
   * Frame target generated from scroll.
   */
  const targetFrameRef =
    useRef<number>(0);

  const scrollRequestRef =
    useRef<number>(0);

  const renderLoopRef =
    useRef<number>(0);

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
     * Crop source image when necessary so
     * the Canvas is always completely filled.
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

    /*
     * Use a capped DPR.
     *
     * This reduces the amount of pixels the Canvas
     * has to redraw while keeping the visual crisp.
     */
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

  const removeFromQueueSet = (
    frame: number
  ) => {
    queueSet.current.delete(
      frame
    );
  };

  const enqueueFrame = (
    index: number
  ) => {
    const safeIndex =
      getSafeFrame(index);

    /*
     * Don't queue frames that are already
     * loaded, loading, or known to be invalid.
     */
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

  const enqueueFramesByPriority = (
    targetFrame: number
  ) => {
    const center =
      getSafeFrame(
        targetFrame
      );

    /*
     * Current frame gets highest priority.
     */
    enqueueFrame(center);

    /*
     * Then frames immediately around it.
     *
     * This helps both forward and backward scrolling.
     */
    const priorityOffsets = [
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
      const offset of priorityOffsets
    ) {
      enqueueFrame(
        center + offset
      );
    }
  };

  const processFrameQueue = () => {
    while (
      activeLoadsRef.current <
        MAX_CONCURRENT_LOADS &&
      frameQueue.current.length > 0
    ) {
      /*
       * Always process the most recently
       * requested queue item first.
       *
       * This helps when the user scrolls quickly.
       */
      const frame =
        frameQueue.current.pop();

      if (
        frame === undefined
      ) {
        break;
      }

      removeFromQueueSet(
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

            /*
             * Async decode prevents synchronous
             * decode work from blocking the UI.
             */
            img.decoding = 'async';

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

              /*
               * Continue processing queued frames
               * as soon as this one completes.
               */
              processFrameQueue();

              /*
               * If this is the frame currently needed,
               * render it immediately.
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
              /*
               * Mark failed permanently for this
               * page lifetime so it cannot create
               * an endless request loop.
               */
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
              getFrameUrl(frame);
          }
        );

      loadingFrames.current.set(
        frame,
        request
      );
    }
  };

  /*
   * Public loader used by rendering.
   *
   * It does NOT immediately fire unlimited requests.
   * It adds the frame to the controlled queue.
   */
  const loadFrame = (
    index: number
  ): Promise<void> => {
    const safeIndex =
      getSafeFrame(index);

    if (
      imageCache.current.has(
        safeIndex
      )
    ) {
      return Promise.resolve();
    }

    if (
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

    const queuedPromise =
      new Promise<void>(
        (resolve) => {
          const check = () => {
            if (
              imageCache.current.has(
                safeIndex
              ) ||
              failedFrames.current.has(
                safeIndex
              )
            ) {
              resolve();
              return;
            }

            requestAnimationFrame(
              check
            );
          };

          check();
        }
      );

    return queuedPromise;
  };

  /*
   * ==========================================================
   * FRAME RENDERING
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

    /*
     * Exact frame already available.
     */
    const exactImage =
      imageCache.current.get(
        safeIndex
      );

    if (exactImage) {
      drawImageCover(
        ctx,
        exactImage,
        canvas
      );

      return;
    }

    /*
     * Fallback to the closest loaded frame.
     *
     * This prevents the Canvas from going blank
     * when the requested frame is still loading.
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
     * Queue the exact frame with highest priority.
     */
    loadFrame(
      safeIndex
    );

    enqueueFramesByPriority(
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

    /*
     * Only preload a small number of nearby frames.
     *
     * No huge preload window.
     */
    const offsets = [
      1,
      -1,
      2,
      -2,
      3,
      -3,
      4,
      -4
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
   * TEXT OVERLAYS
   * ==========================================================
   */

  const updateOverlay = (
    element: HTMLDivElement | null,
    animation: {
      opacity: number;
      translateY: number;
      scale: number;
    }
  ) => {
    if (!element) return;

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
  };

  const updateTextOverlays = (
    frame: number
  ) => {
    /*
     * OUR PRODUCTS
     * Frame 0-50
     */
    updateOverlay(
      heroOverlayRef.current,
      getOverlayAnimation(
        frame,
        0,
        50,
        12,
        38
      )
    );

    /*
     * SONY NX-100
     * Frame 50-180
     */
    updateOverlay(
      productOverlayRef.current,
      getOverlayAnimation(
        frame,
        50,
        180,
        70,
        150
      )
    );

    /*
     * Membangun Standard Penyiaran
     * Frame 200-250
     */
    updateOverlay(
      standardOverlayRef.current,
      getOverlayAnimation(
        frame,
        200,
        250,
        215,
        235
      )
    );
  };

  /*
   * ==========================================================
   * EVENT HANDLERS
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

    /*
     * Start at Frame 000.
     */
    currentFrameRef.current =
      0;

    smoothFrameRef.current =
      0;

    targetFrameRef.current =
      0;

    /*
     * Canvas setup.
     */
    resizeCanvas();

    /*
     * CRITICAL:
     * Only request the first frame initially.
     *
     * The remaining sequence is NOT loaded upfront.
     */
    loadFrame(0).then(() => {
      if (!mounted) return;

      const canvas =
        canvasRef.current;

      if (!canvas) return;

      const ctx =
        canvas.getContext('2d');

      if (!ctx) return;

      const firstImage =
        imageCache.current.get(
          0
        );

      if (firstImage) {
        drawImageCover(
          ctx,
          firstImage,
          canvas
        );
      }

      updateTextOverlays(0);

      /*
       * Begin very small background preload.
       */
      preloadAhead(0);
    });

    /*
     * Scroll listener.
     */
    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true
      }
    );

    /*
     * Resize listener.
     */
    window.addEventListener(
      'resize',
      handleResize
    );

    updateScroll();

    /*
     * ========================================================
     * SMOOTH FRAME RENDER LOOP
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
       * Preserve the exact smoothness factor.
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
       * Update text on the floating frame value
       * so fade animations remain smooth and reversible.
       */
      updateTextOverlays(
        smoothFrameRef.current
      );

      const renderFrame =
        getSafeFrame(
          smoothFrameRef.current
        );

      /*
       * Only draw when integer frame changes.
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

        /*
         * Nearby background preload.
         */
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

      /*
       * Clear runtime caches.
       */
      loadingFrames.current.clear();
      imageCache.current.clear();
      failedFrames.current.clear();
      frameQueue.current = [];
      queueSet.current.clear();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black font-sans">
      <Navbar />

      <main>
        {/* =====================================================
            ONE SINGLE SCROLL-DRIVEN CANVAS EXPERIENCE
            ===================================================== */}
        <section
          ref={containerRef}
          className="relative w-full"
          style={{
            height: '400vh'
          }}
        >
          {/* Sticky viewport */}
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

              {/* ================= HERO ================= */}
              <div
                ref={heroOverlayRef}
                className="absolute inset-0 flex items-center justify-center px-4 sm:px-5 md:px-6 text-center"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
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
                    OUR PRODUCTS
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

                </div>
              </div>

              {/* ================= PRODUCT ================= */}
              <div
                ref={productOverlayRef}
                className="absolute inset-0 flex items-center"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
                  willChange:
                    'opacity, transform'
                }}
              >
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-20">

                  <div className="max-w-xl md:max-w-2xl">

                    <p
                      className="text-[0.5rem] sm:text-[0.55rem] md:text-[0.65rem] lg:text-base font-bold uppercase tracking-[0.24em] mb-2 lg:mb-3 drop-shadow-lg"
                      style={{
                        color: '#ff3157'
                      }}
                    >
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
                      className="mt-3 sm:mt-3 md:mt-4 lg:mt-5 text-[0.65rem] sm:text-[0.72rem] md:text-[0.8rem] lg:text-xl leading-relaxed font-medium max-w-xl drop-shadow-xl"
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

              {/* ================= STANDARD ================= */}
              <div
                ref={standardOverlayRef}
                className="absolute inset-0 flex items-center justify-center px-4 sm:px-5 md:px-6 text-center"
                style={{
                  opacity: 0,
                  transform:
                    'translate3d(0, 24px, 0) scale(0.985)',
                  willChange:
                    'opacity, transform'
                }}
              >
                <div className="max-w-3xl">

                  <h2
                    className="text-2xl sm:text-[2rem] md:text-[2.5rem] lg:text-6xl font-black tracking-[-0.03em] leading-tight drop-shadow-2xl"
                    style={{
                      color: '#FFFFFF'
                    }}
                  >
                    Membangun Standard Penyiaran
                  </h2>

                  <p
                    className="mt-3 sm:mt-3 md:mt-4 lg:mt-5 text-[0.65rem] sm:text-[0.72rem] md:text-[0.8rem] lg:text-xl leading-relaxed font-medium max-w-2xl mx-auto drop-shadow-xl"
                    style={{
                      color:
                        'rgba(255,255,255,0.9)'
                    }}
                  >
                    Prime Broadcast memastikan setiap momen direkam menggunakan ekosistem peralatan terbaik di kelasnya untuk memberikan tayangan yang jernih, stabil, dan profesional.
                  </p>

                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
};