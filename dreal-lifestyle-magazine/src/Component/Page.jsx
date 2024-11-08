import {useEffect, useMemo, useRef, useState} from "react";
import {
    Bone,
    BoxGeometry,
    Color,
    Float32BufferAttribute, MathUtils,
    MeshStandardMaterial,
    Skeleton, SkeletonHelper,
    SkinnedMesh, SRGBColorSpace,
    Uint16BufferAttribute,
    Vector3
} from "three";
import {useCursor, useHelper, useTexture} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {pageAtom, pages} from "./Util";
import {degToRad} from "three/src/math/MathUtils";
import { easing } from "maath";
import {useAtom} from "jotai";

const easingFactor = 0.5;
const easingFactorFold = 0.3; 
const insideCurveStrength = 0.18;
const outsideCurveStrength = 0.05; 
const turningCurveStrength = 0.09;

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENT = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENT;

const pageGeometry = new BoxGeometry(
    PAGE_WIDTH,
    PAGE_HEIGHT,
    PAGE_DEPTH,
    PAGE_SEGMENT,
    2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    const x = vertex.x;

    const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
    let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

    skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute(
    "skinIndex",
    new Uint16BufferAttribute(skinIndexes, 4)
);

pageGeometry.setAttribute(
    "skinWeight",
    new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color("white");
const emissiveColor = new Color("orange");

const pageMaterials = [
    new MeshStandardMaterial({
        color: whiteColor,
    }),
    new MeshStandardMaterial({
        color: "#111",
    }),
    new MeshStandardMaterial({
        color: whiteColor,
    }),
    new MeshStandardMaterial({
        color: whiteColor,
    }),
];

pages.forEach((page) => {
    useTexture.preload(`/textures/${page.front}.jpg`);
    useTexture.preload(`/textures/${page.back}.jpg`);
})

const Page = ({number, front, back, page, opened, closed, ...props}) => {

    const [picture, picture2] = useTexture([
        `/textures/${front}.jpg`,
        `/textures/${back}.jpg`,
    ]);
    picture.colorSpace = picture2.colorSpace = SRGBColorSpace;
    
    const group = useRef();
    const skinnedMeshRef = useRef();
    const turnedAt = useRef(0);
    const lastOpened = useRef(opened);

    const [_, setPage] = useAtom(pageAtom);
    const [highlighted, setHighlighted] = useState(false);
    useCursor(highlighted);
    
    const materials = [
        ...pageMaterials,
        new MeshStandardMaterial({
            color: whiteColor,
            map: picture,
            roughness: 0.25,
            emissive: emissiveColor,
            emissiveIntensity: 0,
        }),
        new MeshStandardMaterial({
            color: whiteColor,
            map: picture2,
            roughness: 0.25,
            emissive: emissiveColor,
            emissiveIntensity: 0,
        }),
    ];

    const manualSkinnedMesh = useMemo(() => {
        const bones = [];

        for (let i = 0; i <= PAGE_SEGMENT; i++){
            let bone = new Bone();
            bones.push(bone);

            if (i === 0){
                bone.position.x = 0;
            } else {
                bone.position.x = SEGMENT_WIDTH;
            }

            if (i > 0) {
                bones[i - 1].add(bone);
            }
        }
    
        const skeleton = new Skeleton(bones);
        const mesh = new SkinnedMesh(pageGeometry, materials);

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;

        mesh.add(bones[0]);
        mesh.bind(skeleton);

        return mesh;
    }, []);

    useHelper(skinnedMeshRef, SkeletonHelper);

    //
    // const dampAngle = (current, target, smoothing, deltaTime) => {
    //     let diff = target - current;
    //
    //     while (diff > Math.PI) diff -= Math.PI * 2;
    //     while (diff < -Math.PI) diff += Math.PI * 2;
    //
    //     //apply dump
    //     const spring = 1; 
    //     const damping = smoothing;
    //
    //     const velocity = diff * spring * deltaTime;
    //     const smoothedVelocity = velocity * damping;
    //
    //     return current + smoothedVelocity;
    // }
    
    useFrame((_, delta) => {
        if (!skinnedMeshRef.current) {
            return;
        }

        const emissiveIntensity = highlighted ? 0.22 : 0;
        skinnedMeshRef.current.material[4].emissiveIntensity =
            skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
                skinnedMeshRef.current.material[4].emissiveIntensity,
                emissiveIntensity,
                0.1
            );

        if (lastOpened.current !== opened) {
            turnedAt.current = +new Date();
            lastOpened.current = opened;
        }
        
        let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
        turningTime = Math.sin(turningTime * Math.PI);

        let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
        
        if (!closed) {
            targetRotation += degToRad(number * 0.8);
        }

        const bones = skinnedMeshRef.current.skeleton.bones;
        for (let i = 0; i < bones.length; i++) {
            const target = i === 0 ? group.current : bones[i];
            
            const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
            const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;

            const turningIntensity =
                Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;

            let rotationAngle =
                insideCurveStrength * insideCurveIntensity * targetRotation -
                outsideCurveStrength * outsideCurveIntensity * targetRotation +
                turningCurveStrength * turningIntensity * targetRotation;

            let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);

            if (closed) {
                if (i === 0) {
                    rotationAngle = targetRotation;
                    foldRotationAngle = 0;
                } else {
                    rotationAngle = 0;
                    foldRotationAngle = 0;
                }
            }

            easing.dampAngle(
                target.rotation,
                "y",
                rotationAngle,
                easingFactor,
                delta
            );

            const foldIntensity =
                i > 8
                    ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
                    : 0;
            easing.dampAngle(
                target.rotation,
                "x",
                foldRotationAngle * foldIntensity,
                easingFactorFold,
                delta
            );
        }
    });

    useEffect(() => {
        console.log("Index", number)
    }, []);

    return (
        <group {...props} ref={group}>
            <primitive 
                object={manualSkinnedMesh}
                ref={skinnedMeshRef}
                position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
            />
        </group>
    );
};

export default Page;