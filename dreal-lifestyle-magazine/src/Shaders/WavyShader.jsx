import { Shaders, Node, GLSL } from 'gl-react';
import React, { useEffect, useState } from 'react';
import { Surface } from "gl-react-dom";

const shaders = Shaders.create({
    wavy: {
        frag: GLSL`
            #version 300 es
              precision highp float;
            out vec4 fragColor;

            void main() {
                fragColor = vec4(1.0, 0.0, 0.0, 1.0);  // Solid red color
            }
        `,
    },
});

const WavyShader = ({ width, height }) => {
    const [dimensions, setDimensions] = useState({
        width: width || 300,  
        height: height || 300
    });

    useEffect(() => {
        console.log("Component mounted. Dimensions:", dimensions);
    }, []);

    return (
        <div style={{ border: '1px solid black' }}>  
            <Surface
                width={dimensions.width}
                height={dimensions.height}
                onContextCreate={(gl) => {
                    console.log('WebGL context created:', gl);
                    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                    if (debugInfo) {
                        console.log('Renderer:', gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
                        console.log('Vendor:', gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
                    }
                }}
                onContextFailure={(e) => console.error('WebGL context creation failed:', e)}
                onContextLost={(e) => console.error('WebGL context lost:', e)}
                onContextRestored={(gl) => console.log('WebGL context restored:', gl)}
            >
                <Node shader={shaders.wavy} />
            </Surface>
        </div>
    );
};

export default WavyShader;