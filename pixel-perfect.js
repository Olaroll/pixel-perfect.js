export function makePixelPerfect(elem) {
  if (elem instanceof HTMLImageElement && !elem.complete) {
    elem.decode()
      .then(() => {
        makePixelPerfect(elem);
       });
    return;
  }
  const origWidth = elem.naturalWidth || elem.width || elem.dataset.ppWidth; // TODO, handle canvas, video?
  const origHeight = elem.naturalHeight || elem.height || elem.dataset.ppHeight;
  const options = {
    scale: 1,
  };

  {
    const q = elem.dataset.ppScale;
    if (q) {
      if (q.includes('=')) {
        Object.assign(options, Object.fromEntries(new URLSearchParams(elem.dataset.ppScale || '').entries()));
      } else {
        const scale = parseInt(q);
        if (scale > 0) {
          options.scale = scale;
        }
      }
    } else {
      // guess the scale based on the natural size vs the CSS size
      const cssWidth = parseFloat(getComputedStyle(elem).width);
      const scale = Math.floor(Math.max(1, cssWidth / origWidth));
      if (scale > 0) {
        elem.dataset.ppScale = scale;
        options.scale = scale;
      }
    }

  }

  const scale = options.scale
  if (scale % 1 !== 0) {
    console.warn('scale must be an integer value');
  }

  const px = v => `${v}px`;

  const desiredWidth = origWidth * scale;
  const targetWidth = desiredWidth * devicePixelRatio;
  const mult = Math.max(1, Math.round(targetWidth / origWidth));
  elem.style.width = px(origWidth * mult / devicePixelRatio);
  elem.style.height = px(origHeight * mult / devicePixelRatio);
}

function makeAllPixelPerfect() {
  document.querySelectorAll(".pixel-perfect").forEach(makePixelPerfect);
}
window.addEventListener('resize', makeAllPixelPerfect);
makeAllPixelPerfect();

// NOTE: ResizeObserver will not work as
// from the POV of HTML the elements are not changing
// size when the user zooms.
