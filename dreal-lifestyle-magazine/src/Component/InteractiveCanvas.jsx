import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import '../Styles/InteractiveCavnas.css';
import Scene from "./Scene";

const InteractiveCanvas = () => {
    return (
        <div className="canvas-container">
            <Canvas
                shadows
                camera={{
                    position: [0, 0, 4],
                    fov: 40
                }}
            >
                <Scene />
            </Canvas>
        </div>
    );
};

export default InteractiveCanvas;