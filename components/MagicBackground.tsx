'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
}

export default function MagicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  
  // 根据页面调整色调
  // Pricing 页面稍微浅一点/蓝一点，其他页面保持深邃魔法紫
  const isPricing = pathname?.includes('/pricing');
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let stars: Star[] = [];
    let shootingStars: ShootingStar[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 初始化星星
    const initStars = () => {
      const starCount = Math.floor((width * height) / 3000); // 响应式数量
      stars = [];
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2, // 大小不一
          speed: Math.random() * 0.2 + 0.05, // 缓慢漂浮
          opacity: Math.random(),
          twinkleSpeed: Math.random() * 0.02 + 0.005,
        });
      }
    };

    // 创建流星
    const createShootingStar = () => {
      if (Math.random() < 0.02) { // 出现概率
        shootingStars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.5, // 主要在上半部分出现
          length: Math.random() * 80 + 20,
          speed: Math.random() * 10 + 5,
          angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1), // 45度角附近
          opacity: 1,
        });
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initStars();
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. 绘制背景渐变 (魔法星空基调)
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      if (isPricing) {
        // Pricing: 稍微亮一点，偏蓝/靛青
        gradient.addColorStop(0, '#1a1a2e'); 
        gradient.addColorStop(0.5, '#16213e'); 
        gradient.addColorStop(1, '#1f2041');
      } else {
        // Default: 深邃魔法紫/黑
        gradient.addColorStop(0, '#0B0C15');
        gradient.addColorStop(0.4, '#18122B'); // 深紫
        gradient.addColorStop(1, '#0F0C29');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. 绘制星云/光晕装饰 (Fancy Glows)
      const time = Date.now() * 0.001;
      
      // 左上角光晕
      const glow1 = ctx.createRadialGradient(
        width * 0.2, height * 0.2, 0,
        width * 0.2, height * 0.2, width * 0.5
      );
      glow1.addColorStop(0, isPricing ? 'rgba(78, 84, 200, 0.15)' : 'rgba(123, 31, 162, 0.15)'); // 紫/蓝光
      glow1.addColorStop(1, 'transparent');
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      // 右下角光晕 (动态移动)
      const moveX = Math.sin(time * 0.5) * 100;
      const glow2 = ctx.createRadialGradient(
        width * 0.8 + moveX, height * 0.8, 0,
        width * 0.8 + moveX, height * 0.8, width * 0.4
      );
      glow2.addColorStop(0, isPricing ? 'rgba(0, 212, 255, 0.1)' : 'rgba(59, 130, 246, 0.1)'); // 青/蓝光
      glow2.addColorStop(1, 'transparent');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      // 3. 绘制普通星星
      stars.forEach((star) => {
        // 闪烁效果
        star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
        star.opacity = Math.max(0.1, Math.min(1, star.opacity));
        
        // 缓慢移动
        star.y -= star.speed;
        if (star.y < 0) star.y = height;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        
        // 为大星星添加十字星芒 (更Fancy)
        if (star.size > 1.5 && star.opacity > 0.8) {
           ctx.shadowBlur = 5;
           ctx.shadowColor = "white";
        } else {
           ctx.shadowBlur = 0;
        }
      });
      ctx.shadowBlur = 0; // Reset

      // 4. 绘制流星
      createShootingStar();
      shootingStars.forEach((star, index) => {
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.02;
        if (star.opacity <= 0) {
          shootingStars.splice(index, 1);
          return;
        }
        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;
        const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [pathname, isPricing]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
      style={{ background: '#0B0C15' }} // Fallback color
    />
  );
}

