import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add(
  {
    noPreference: '(prefers-reduced-motion: no-preference)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  },
  (context) => {
    const { reduceMotion } = context.conditions as {
      reduceMotion: boolean;
      noPreference: boolean;
    };

    if (reduceMotion) {
      gsap.set('#historia', { opacity: 1, y: 0 });
      gsap.set('#ubicaciones', { opacity: 1, y: 0 });
      gsap.set('#departamentos', { opacity: 1, y: 0 });
      return;
    }

    gsap.from('#historia', {
      opacity: 0,
      y: 60,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#historia',
        start: 'top 85%',
        once: true,
      },
    });

    gsap.from('#ubicaciones', {
      opacity: 0,
      y: 60,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#ubicaciones',
        start: 'top 85%',
        once: true,
      },
    });

    gsap.from('#departamentos', {
      opacity: 0,
      y: 60,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: '#departamentos',
        start: 'top 85%',
        once: true,
      },
    });
  }
);
