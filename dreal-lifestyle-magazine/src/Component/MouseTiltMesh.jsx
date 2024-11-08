import {useFrame, useThree} from "@react-three/fiber";
import {useEffect, useRef, useState} from "react";
import * as THREE from "three";
import {useAtom} from "jotai";
import {isMeshRenderingAtom} from "./Util";

function MouseTiltMesh({ children }) {
    const ref = useRef();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { viewport } = useThree();
    const [isMeshRendering, setIsMeshRendering] = useAtom(isMeshRenderingAtom);

    useEffect(() => {
        const handleMouseMove = (event) => {
            setMousePosition({
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: -(event.clientY / window.innerHeight) * 2 + 1
            });
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        console.log('MouseTiltMesh mounted');
    }, []);

    useFrame((state) => {
        if (!ref.current) return;

        const targetRotationX = mousePosition.y * 0.3;
        const targetRotationY = mousePosition.x * 0.3;

        ref.current.rotation.x = THREE.MathUtils.lerp(
            ref.current.rotation.x,
            targetRotationX,
            0.1
        );
        ref.current.rotation.y = THREE.MathUtils.lerp(
            ref.current.rotation.y,
            targetRotationY,
            0.1
        );
    });

    const handleAfterRender = (e) => {
        if (isMeshRendering) {
            setIsMeshRendering(false);
        }
    };
    
    return <mesh onAfterRender={handleAfterRender} ref={ref}>{children}</mesh>;
}

export default MouseTiltMesh;