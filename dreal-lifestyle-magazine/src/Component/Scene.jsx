import React, {useRef, useState} from 'react';
import { useFrame } from '@react-three/fiber';
import Magazine from "./Magazine";
import MouseTiltMesh from "./MouseTiltMesh";
import * as THREE from "three";
import {useAtom} from "jotai";
import {isAnimationCompleteAtom, pageAtom} from "./Util";

function Scene() {
    const [, setIsAnimationComplete] = useAtom(isAnimationCompleteAtom);
    const [, setPage] = useAtom(pageAtom);
    const [isMoving, setIsMoving] = useState(true);
    const cameraPosition = useRef({ x: -6, y: -3, z: 8 });
    const progress = useRef(0);

    useFrame(({ camera }) => {
        if (isMoving) {
            progress.current += 0.012;

            const t = Math.min(progress.current, 1);
            // Enhanced curve movement
            const curve = Math.sin(t * Math.PI) * 1.2; // Increased amplitude

            // More dramatic path
            cameraPosition.current.x = THREE.MathUtils.lerp(-4, 0, t); // Start from -4 instead of -2
            cameraPosition.current.y = THREE.MathUtils.lerp(-3, 0, t) + curve; // Start from -3, bigger curve
            cameraPosition.current.z = THREE.MathUtils.lerp(6, 4, t); // Start further back


            camera.position.set(
                cameraPosition.current.x,
                cameraPosition.current.y,
                cameraPosition.current.z
            );

            camera.lookAt(0, 0, 0);

            if (progress.current >= 1) {
                setIsMoving(false);
                    setIsAnimationComplete(true);
            }
        }
    });
    
    return (
        <>
            <directionalLight
                position={[2, 5, 2]}
                intensity={3.5}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-bias={-0.0001}
            />

            <pointLight
                intensity={5}
                position={[0, 0, 5]}
            />

            <MouseTiltMesh>
                <Magazine />
            </MouseTiltMesh>
        </>
    );
}

export default Scene;