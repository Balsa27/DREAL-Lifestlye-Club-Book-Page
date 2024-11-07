import React, {useRef, useState} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import { OrbitControls} from '@react-three/drei';
import '../Styles/InteractiveCavnas.css';
import Magazine from "./Magazine";

const InteractiveCanvas = () => {
  const meshRef = useRef();
  // const [rotation, setRotation] = useState([0, 0, 0]);
  // const { gl, camera } = useThree();

    return (
        <div className="canvas-container">
            <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
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
                    position={[0,0,5]}
                />

                <mesh ref={meshRef} castShadow>
                    <Magazine />
                </mesh>

                <OrbitControls
                    minPolarAngle={0}
                    maxPolarAngle={Math.PI / 1.5}
                    enableZoom={true}
                    enablePan={true}
                />
            </Canvas>
        </div>
    );
};
export default InteractiveCanvas;