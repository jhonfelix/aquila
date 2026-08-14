import { cn } from '@/lib/cn';

type Star = { left: number; top: number; size: number; delay: number; duration: number; bright: boolean };
type ShootingStar = { left: number; top: number; angle: number; distance: number; length: number; delay: number; duration: number };

// PRNG determinístico (mulberry32) — mesmo seed sempre gera a mesma sequência
// no server e no client. Um Math.random() direto aqui causaria mismatch de
// hidratação, já que este componente é renderizado no SSR.
function mulberry32(seed: number) {
  let s = seed;
  return function random() {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateStars(count: number, seed: number): Star[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    left: rand() * 100,
    top: rand() * 100,
    size: 1 + rand() * 1.6,
    delay: rand() * 5,
    duration: 2.5 + rand() * 3,
    bright: rand() > 0.86,
  }));
}

const STARS = generateStars(150, 7);

// Poucos pontos que de fato atravessam o céu (estrela cadente) de cima pra
// baixo, diferente do cintilar parado das demais — cada uma some por um bom
// tempo antes de repetir (ver keyframe `shoot`), então não ficam todas
// riscando ao mesmo tempo. Ângulo perto de 90° (rotate no sentido horário,
// direção (cosθ, sinθ)) é o que dá a trajetória vertical descendente; a
// variação de ±20° só evita que todas caiam exatamente retas.
function generateShootingStars(count: number, seed: number): ShootingStar[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => ({
    left: 5 + rand() * 65,
    top: 2 + rand() * 25,
    angle: 70 + rand() * 40,
    distance: 220 + rand() * 180,
    length: 70 + rand() * 60,
    delay: rand() * 16,
    duration: 7 + rand() * 6,
  }));
}

const SHOOTING_STARS = generateShootingStars(4, 42);

// Fundo "céu noturno" da tela de login — combina com um sistema de
// investigação espacial. Só faz sentido no modo escuro (não se vê estrela de
// dia); no modo claro fica só um degradê suave de atmosfera. Estrelas
// cintilam em ritmos levemente fora de sincronia entre si e o campo inteiro
// deriva muito lentamente, pro "movimento suave" — nada chamativo.
export default function Starfield() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-mist-50 dark:bg-space-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(47,139,255,0.10),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_45%_at_50%_-10%,rgba(47,139,255,0.22),transparent_70%)]" />
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_70%_55%_at_12%_110%,rgba(11,70,150,0.28),transparent_70%)]" />
      <div className="absolute inset-[-6%] hidden dark:block animate-drift-slow">
        {STARS.map((s, i) => (
          <span
            key={i}
            className={cn('absolute rounded-full bg-white animate-twinkle', s.bright && 'shadow-[0_0_6px_1px_rgba(191,219,254,0.6)]')}
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              // Atraso negativo: o navegador trata como se a animação já
              // estivesse rodando há esse tempo, então ao carregar a página
              // as estrelas já aparecem em pontos variados do ciclo, em vez
              // de todas "zeradas" e só começando a cintilar aos poucos.
              animationDelay: `-${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 hidden dark:block">
        {SHOOTING_STARS.map((s, i) => (
          <span
            key={i}
            className="absolute h-px animate-shoot rounded-full bg-gradient-to-l from-white via-white/70 to-transparent"
            style={
              {
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.length}px`,
                // Negativo pelo mesmo motivo do twinkle acima: já nasce em
                // andamento, sem esperar até 16s em branco na carga da página.
                animationDelay: `-${s.delay}s`,
                animationDuration: `${s.duration}s`,
                '--shoot-angle': `${s.angle}deg`,
                '--shoot-dist': `${s.distance}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
