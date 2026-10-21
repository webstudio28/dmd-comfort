(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-service-carousel]').forEach(rail => {
    let active = null;
    let dragged = false;
    let suppressClick = false;
    const release = event => {
      if (!active || event.pointerId !== active.id) return;
      if (dragged) suppressClick = true;
      const id = active.id;
      active = null;
      rail.classList.remove('is-dragging');
      if (rail.hasPointerCapture(id)) rail.releasePointerCapture(id);
    };
    rail.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch' || event.button !== 0 || !event.isPrimary) return;
      if (rail.scrollWidth <= rail.clientWidth + 2) return;
      suppressClick = false;
      dragged = false;
      active = {id:event.pointerId, x:event.clientX, left:rail.scrollLeft};
    });
    rail.addEventListener('pointermove', event => {
      if (!active || event.pointerId !== active.id) return;
      const dx = event.clientX - active.x;
      if (!dragged && Math.abs(dx) <= 5) return;
      if (!dragged) {
        dragged = true;
        rail.setPointerCapture(event.pointerId);
        rail.classList.add('is-dragging');
      }
      event.preventDefault();
      rail.scrollLeft = active.left - dx;
    });
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    rail.addEventListener('lostpointercapture', () => {
      active = null;
      rail.classList.remove('is-dragging');
    });
    rail.addEventListener('dragstart', event => event.preventDefault());
    rail.addEventListener('click', event => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }, true);
    rail.addEventListener('keydown', event => {
      if (event.target !== rail || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const step = rail.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).gap || 0);
      let left = rail.scrollLeft;
      if (event.key === 'ArrowLeft') left -= step;
      if (event.key === 'ArrowRight') left += step;
      if (event.key === 'Home') left = 0;
      if (event.key === 'End') left = rail.scrollWidth - rail.clientWidth;
      rail.scrollTo({left, behavior:reducedMotion ? 'instant' : 'smooth'});
    });
  });
})();
