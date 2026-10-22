/** Shared, deliberately paced transport for simulations and guided traces. */
export function setupPlayback(root: HTMLElement, options: {
  advance: () => void;
  reset: () => void;
  isDone?: () => boolean;
}) {
  const play = root.querySelector<HTMLButtonElement>('[data-act="play"]')!;
  const step = root.querySelector<HTMLButtonElement>('[data-act="step"]')!;
  const speed = root.querySelector<HTMLSelectElement>('[data-speed]')!;
  const status = root.querySelector<HTMLElement>('[data-playback-status]')!;
  let playing = false;
  let count = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  function render() {
    const done = options.isDone?.() ?? false;
    play.textContent = playing ? 'Pause' : done ? 'Replay' : 'Play';
    play.setAttribute('aria-pressed', String(playing));
    step.disabled = done;
    status.textContent = `${done ? 'Complete' : playing ? 'Playing' : 'Paused'} · step ${count}`;
  }
  function schedule() {
    clearTimeout(timer);
    if (playing) timer = setTimeout(() => {
      options.advance();
      count++;
      if (options.isDone?.()) playing = false;
      render();
      schedule();
    }, Number(speed.value));
  }
  function pause() {
    playing = false;
    clearTimeout(timer);
    root.getAnimations({ subtree: true }).forEach((animation) => {
      // Finish decorative reveals so pausing cannot freeze a label at zero opacity.
      if (animation instanceof CSSAnimation || animation instanceof CSSTransition) animation.finish();
      else animation.pause();
    });
    render();
  }
  function reset() {
    pause();
    count = 0;
    options.reset();
    render();
  }
  play.addEventListener('click', () => {
    if (playing) return pause();
    if (options.isDone?.()) reset();
    playing = true;
    root.getAnimations({ subtree: true }).forEach((animation) => animation.play());
    render();
    schedule();
  });
  step.addEventListener('click', () => {
    pause();
    if (!options.isDone?.()) {
      options.advance();
      count++;
    }
    render();
  });
  root.querySelector('[data-act="restart"]')!.addEventListener('click', reset);
  speed.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });
  // Do not let a lesson run ahead while the reader is down in the prose.
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) pause();
  });
  observer.observe(root);
  window.addEventListener('pagehide', () => { pause(); observer.disconnect(); }, { once: true });
  render();
  return { pause, reset, refresh: render };
}
