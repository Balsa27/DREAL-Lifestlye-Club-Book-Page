import React, {useEffect, useRef, useState} from 'react';
import { useFrame } from '@react-three/fiber';
import Magazine from "./Magazine";
import MouseTiltMesh from "./MouseTiltMesh";
import * as THREE from "three";
import {useAtom} from "jotai";
import {isAnimationCompleteAtom, lerpCameraForSidebar, pageAtom} from "./Util";

//move the camera to its own component to reduce one render
//with that I`ll get down to only one render
function Scene() {
    const [, setIsAnimationComplete] = useAtom(isAnimationCompleteAtom);
    const [moveCamera, setMoveCamera] = useAtom(lerpCameraForSidebar);
    const [isMoving, setIsMoving] = useState(true); 
    const cameraPosition = useRef({ x: -6, y: -3, z: 8 });
    const progress = useRef(0);
    const sidebarProgress = useRef(0);
    const [lightIntensity, setLightIntensity] = useState(3.5);  

    useFrame(({ camera }) => {
        if (isMoving) {
            progress.current += 0.012;

            const t = Math.min(progress.current, 1);
            const curve = Math.sin(t * Math.PI) * 1.4; 

            cameraPosition.current.x = THREE.MathUtils.lerp(-4, 0, t);
            cameraPosition.current.y = THREE.MathUtils.lerp(-3, 0, t) + curve; 
            cameraPosition.current.z = THREE.MathUtils.lerp(6, 4, t); 

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

        if (moveCamera) {
            sidebarProgress.current = Math.min(sidebarProgress.current + 0.015, 1);
            const eased = (1 - Math.cos(sidebarProgress.current * Math.PI)) / 2;
            const newIntensity = THREE.MathUtils.lerp(3.5, 0, eased);
            setLightIntensity(newIntensity);
        } else {
            sidebarProgress.current = Math.max(sidebarProgress.current - 0.015, 0);
            const eased = (1 - Math.cos(sidebarProgress.current * Math.PI)) / 2;
            const newIntensity = THREE.MathUtils.lerp(3.5, 0, eased);
            setLightIntensity(newIntensity);
        }
    });

    useEffect(() => {
        console.log("RRRRREND")
    });
    
    return (
        <>
            <directionalLight
                intensity={lightIntensity}
                position={[2, 5, 2]}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-bias={-0.0001}
            />

            <directionalLight
                position={[5, 2, 2]}
                // Reduced from 2 to 0.3 for barely visible state
                intensity={moveCamera ? 0 : 0.3}
                castShadow={false}
            />

            <pointLight
                // Reduced from 5 to 2 for overall dimmer scene
                intensity={2}
                position={[0, 0, 5]}
            />


            <MouseTiltMesh>
                <Magazine />
            </MouseTiltMesh>
        </>
    );
}

export default Scene;