'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { Rocket, Satellite } from 'lucide-react';

// Toques animados de "espaço" atrás do card de login — um satélite à deriva
// e um foguete que decola de tempos em tempos, via anime.js (Starfield ao
// lado é CSS puro; aqui é JS de propósito). Só faz sentido no céu noturno
// do modo escuro, mesma regra do Starfield. A regra global de
// prefers-reduced-motion em globals.css só zera CSS animations/transitions,
// não pega animações setadas via JS — por isso o check manual abaixo.
export default function SpaceScene() {
  const satelliteRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const flameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const instances: ReturnType<typeof animate>[] = [];

    if (satelliteRef.current) {
      instances.push(
        animate(satelliteRef.current, {
          translateX: ['-10vw', '20vw', '48vw'],
          translateY: ['0vh', '-3vh', '2vh'],
          rotate: ['-6deg', '4deg', '-4deg'],
          duration: 26000,
          ease: 'inOutSine',
          loop: true,
          alternate: true,
        }),
      );
    }

    if (rocketRef.current) {
      // 2 trechos iguais: primeiro fica "na plataforma" (sem deslocamento,
      // só o brilho de ignição crescendo), segundo é a subida de fato —
      // simula a pausa entre lançamentos sem precisar de timeline separada.
      instances.push(
        animate(rocketRef.current, {
          translateY: ['0vh', '0vh', '-68vh'],
          translateX: ['0vw', '0vw', '5vw'],
          rotate: ['6deg', '6deg', '-4deg'],
          opacity: [0, 1, 0],
          duration: 20000,
          ease: 'inOutQuad',
          loop: true,
        }),
      );
    }

    if (flameRef.current) {
      instances.push(
        animate(flameRef.current, {
          scaleY: [0.6, 1.15, 0.6],
          opacity: [0.5, 1, 0.5],
          duration: 260,
          ease: 'inOutSine',
          loop: true,
        }),
      );
    }

    return () => {
      instances.forEach((instance) => instance.pause());
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden dark:block">
      <div ref={satelliteRef} className="absolute left-0 top-[20%] text-slate-300/60">
        <Satellite className="h-6 w-6" strokeWidth={1.5} />
      </div>
      <div ref={rocketRef} className="absolute bottom-[10%] right-[16%] text-accent-300">
        <div
          ref={flameRef}
          className="absolute left-1/2 top-full h-3 w-1.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-accent-400 via-accent-500/70 to-transparent blur-[2px]"
        />
        <Rocket className="h-6 w-6 rotate-45" strokeWidth={1.75} />
      </div>
    </div>
  );
}
