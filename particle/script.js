let particlesEnabled = true;
let particlesPaused = document.hidden;

function initParticles() {
  const instance = window.pJSDom?.[0]?.pJS;
  if (instance) {
    instance.particles.color.value = themeSelected.particleColors;
    instance.particles.shape.type = themeSelected.particleShape;
    if (particlesEnabled && !particlesPaused) {
      instance.fn.particlesRefresh();
    }
    return;
  }

  particlesJS("particles-js", {
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: themeSelected.particleColors,
      },
      shape: {
        type: themeSelected.particleShape,
        stroke: {
          width: 0,
          color: "#000000",
        },
        polygon: {
          nb_sides: 5,
        },
        image: {
          //src: "img/github.svg",
          width: 100,
          height: 100,
        },
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          minimumValue: 0.1,
          sync: false,
        },
      },
      size: {
        value: 10,
        random: true,
        anim: {
          enable: false,
          speed: 40,
          minimumValue: 0.1,
          sync: false,
        },
      },
      line_linked: {
        enable: false,
        distance: 150,
        color: "#ffffff",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: "window",
      events: {
        onhover: {
          enable: true,
          mode: "bubble",
        },
        onclick: {
          enable: true,
          mode: "push",
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 400,
          line_linked: {
            opacity: 1,
          },
        },
        bubble: {
          distance: 400,
          size: 20,
          duration: 2,
          opacity: 0.8,
          speed: 3,
        },
        repulse: {
          distance: 200,
        },
        push: {
          particles_nb: 4,
        },
        remove: {
          particles_nb: 2,
        },
      },
    },
    retina_detect: false,
  });

  if (particlesPaused) {
    setParticlesPaused(true);
  }
}

function setParticlesEnabled(enabled) {
  particlesEnabled = enabled;
  const instance = window.pJSDom?.[0]?.pJS;
  if (!instance) {
    if (enabled && !particlesPaused) initParticles();
    return;
  }

  if (enabled) {
    instance.canvas.el.style.display = "";
    if (!particlesPaused) {
      instance.fn.particlesRefresh();
    }
  } else {
    cancelAnimationFrame(instance.fn.drawAnimFrame);
    instance.canvas.el.style.display = "none";
  }
}

function setParticlesPaused(paused) {
  particlesPaused = paused;
  const instance = window.pJSDom?.[0]?.pJS;
  if (!instance || !particlesEnabled) return;

  if (paused) {
    cancelAnimationFrame(instance.fn.drawAnimFrame);
  } else {
    instance.fn.particlesRefresh();
  }
}
