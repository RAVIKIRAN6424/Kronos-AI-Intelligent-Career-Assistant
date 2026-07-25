import React, { useEffect, useRef } from 'react';

export const RobotBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse tracker
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle Grid System
    const particleCount = Math.min(80, Math.floor(width / 20));
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    // Render loop
    const render = () => {
      // Dynamic Theme Color Resolution
      const compStyle = getComputedStyle(document.documentElement);
      const cyan = compStyle.getPropertyValue('--accent-cyan').trim() || '#00f2fe';
      const purple = compStyle.getPropertyValue('--accent-purple').trim() || '#9d4edd';

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // 1. Cyber Grid Lines
      ctx.strokeStyle = cyan;
      ctx.globalAlpha = 0.04;
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // 2. Draw & Link Particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = cyan;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Connect nearby particles
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = cyan;
            ctx.globalAlpha = 0.15 * (1 - dist / 130);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }

        // Mouse attraction lines
        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < 180) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = purple;
          ctx.globalAlpha = 0.28 * (1 - mdist / 180);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });

      // 3. Cyber Robot Head / Core Node reacting to mouse
      const botCenterX = mouse.x;
      const botCenterY = mouse.y;

      // Outer Glowing Ring
      ctx.beginPath();
      ctx.arc(botCenterX, botCenterY, 35, 0, Math.PI * 2);
      ctx.strokeStyle = cyan;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Core Avatar Eye / Sensor
      ctx.beginPath();
      ctx.arc(botCenterX, botCenterY, 12, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(botCenterX, botCenterY, 2, botCenterX, botCenterY, 15);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(0.5, cyan);
      gradient.addColorStop(1, purple);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Robot Visor Lines
      ctx.beginPath();
      ctx.moveTo(botCenterX - 24, botCenterY - 4);
      ctx.lineTo(botCenterX + 24, botCenterY - 4);
      ctx.strokeStyle = cyan;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};
