'use client';

import { useEffect, useRef } from 'react';

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    class Star {
      x: number;
      y: number;
      size: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedY = Math.random() * 0.5;
        this.opacity = Math.random();
      }

      update() {
        this.y += this.speedY;
        if (this.y > canvas.height) {
          this.y = 0;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const stars: Star[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push(new Star());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach(star => {
        star.update();
        star.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />
      
      <div className="fixed -left-64 top-1/4 w-[600px] h-[600px] -z-10 pointer-events-none">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 via-slate-900 to-black opacity-90 shadow-2xl"></div>
          
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 via-transparent to-transparent blur-xl"></div>
          
          <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-2xl"></div>
        </div>
      </div>

      <div className="fixed top-32 left-32 w-16 h-16 -z-10 animate-float">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/50">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
          </svg>
        </div>
      </div>

      <div className="fixed top-64 right-32 w-20 h-20 -z-10 animate-float-delayed">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
      </div>

      <div className="fixed bottom-32 right-64 w-14 h-14 -z-10 animate-float-slow">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/50">
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 19h20L12 2zm0 4.84L18.16 17H5.84L12 6.84z"/>
          </svg>
        </div>
      </div>

      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-0 left-1/3 w-[400px] h-[400px] bg-gradient-to-tr from-orange-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl -z-10"></div>
    </>
  );
}
