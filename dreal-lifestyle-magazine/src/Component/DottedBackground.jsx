import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const DottedBackground = () => {
    const canvasRef = useRef(null);
    
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    
    const springX = useSpring(mouseX, { damping: 25, stiffness: 700 });
    const springY = useSpring(mouseY, { damping: 25, stiffness: 700 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        const dotSize = 2;
        const spacing = 40;
        const baseOpacity = 0.2;
        const maxAdditionalOpacity = 0.6;

        const drawDots = () => {
            const rows = Math.ceil(canvas.height / spacing);
            const cols = Math.ceil(canvas.width / spacing);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const currentX = springX.get();
            const currentY = springY.get();

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const dotX = x * spacing;
                    const dotY = y * spacing;
                    const distance = Math.sqrt(
                        Math.pow(dotX - currentX, 2) + Math.pow(dotY - currentY, 2)
                    );

                    let additionalOpacity = Math.max(0, maxAdditionalOpacity * (1 - distance / 200));
                    let totalOpacity = Math.min(0.5, baseOpacity + additionalOpacity);

                    const vh = window.innerHeight / 100;
                    const distanceFromBottom = window.innerHeight - currentY;
                    
                    if (distanceFromBottom < 30 * vh) {
                        const fadeStart = 30 * vh;
                        const fadeEnd = 22 * vh;
                        const fadeRange = fadeStart - fadeEnd;
                        const fadeFactor = Math.max(0, (distanceFromBottom - fadeEnd) / fadeRange);
                        totalOpacity *= fadeFactor;
                    }
                    
                    if (distanceFromBottom < 20 * vh) {
                        totalOpacity = 0;
                    }
                    
                    ctx.beginPath();
                    ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(57, 60, 60, ${totalOpacity})`;
                    ctx.fill();
                }
            }
        };

        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animationFrame = requestAnimationFrame(function animate() {
            drawDots();
            requestAnimationFrame(animate);
        });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrame);
        };
    }, [springX, springY]);

    return (
        <motion.canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                background: 'black',
            }}
        />
    );
};

export default DottedBackground;