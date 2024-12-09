import { useEffect, useMemo, useRef, useState } from "react";
import {
    Bone,
    BoxGeometry,
    Color,
    Float32BufferAttribute,
    MathUtils,
    MeshStandardMaterial,
    Skeleton,
    SkeletonHelper,
    SkinnedMesh,
    SRGBColorSpace,
    Uint16BufferAttribute,
    Vector3
} from "three";
import { useCursor, useHelper, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { pageAtom, pages } from "./Util";
import { degToRad } from "three/src/math/MathUtils";
import { easing } from "maath";
import { useAtom } from "jotai";

// Animation constants
const ANIMATION = {
    EASING: {
        NORMAL: 0.5,
        FOLD: 0.3
    },
    CURVE_STRENGTH: {
        INSIDE: 0.18,
        OUTSIDE: 0.05,
        TURNING: 0.09
    }
};

// Page dimensions
const PAGE = {
    WIDTH: 1.28,
    HEIGHT: 1.71,
    DEPTH: 0.003,
    SEGMENTS: 30,
    get SEGMENT_WIDTH() {
        return this.WIDTH / this.SEGMENTS; 
    }
};

// Create and configure geometry
const createGeometry = () => {
    const geometry = new BoxGeometry(
        PAGE.WIDTH,
        PAGE.HEIGHT,
        PAGE.DEPTH,
        PAGE.SEGMENTS,
        2
    );
    geometry.translate(PAGE.WIDTH / 2, 0, 0);

    const position = geometry.attributes.position;
    const vertex = new Vector3();
    const skinIndexes = [];
    const skinWeights = [];

    for (let i = 0; i < position.count; i++) {
        vertex.fromBufferAttribute(position, i);
        const x = vertex.x;
        const skinIndex = Math.max(0, Math.floor(x / PAGE.SEGMENT_WIDTH));
        const skinWeight = (x % PAGE.SEGMENT_WIDTH) / PAGE.SEGMENT_WIDTH;

        skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
        skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
    }

    geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndexes, 4));
    geometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4));

    return geometry;
};

//Create base materials
const createBaseMaterials = () => {
    const white = new Color("white");
    return [
        new MeshStandardMaterial({ color: white }),
        new MeshStandardMaterial({ color: "#111" }),
        new MeshStandardMaterial({ color: white }),
        new MeshStandardMaterial({ color: white })
    ];
};

const pageGeometry = createGeometry();
const baseMaterials = createBaseMaterials();


const updateTurningTime = (lastOpened, turnedAt, opened) => {
    if (lastOpened.current !== opened) {
        turnedAt.current = +new Date();
        lastOpened.current = opened;
    }

    return Math.sin(
        Math.min(400, new Date() - turnedAt.current) / 400 * Math.PI
    );
};

const calculateTargetRotation = (opened, closed, number) => {
    let rotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!closed) {
        rotation += degToRad(number * 0.8);
    }
    return rotation;
};

const calculateBoneRotation = (
    bone,
    index,
    {
        group,
        bones,
        turningTime,
        targetRotation,
        closed,
        delta
    }
) => {
    const target = index === 0 ? group.current : bone;

    // Calculate intensities
    const insideCurveIntensity = index < 8 ? Math.sin(index * 0.2) : 0;
    
    const outsideCurveIntensity = index >= 8 ? Math.cos(index * 0.3) : 0;
    
    const turningIntensity = Math.sin(index * Math.PI * (1 / bones.length)) * turningTime;

    // Calculate rotation angles
    let rotationAngle =
        ANIMATION.CURVE_STRENGTH.INSIDE * insideCurveIntensity * targetRotation -
        ANIMATION.CURVE_STRENGTH.OUTSIDE * outsideCurveIntensity * targetRotation +
        ANIMATION.CURVE_STRENGTH.TURNING * turningIntensity * targetRotation;

    let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);

    // Handle closed state
    if (closed) {
        if (index === 0) {
            rotationAngle = targetRotation;
            foldRotationAngle = 0;
        } else {
            rotationAngle = 0;
            foldRotationAngle = 0;
        }
    }

    // Apply rotations
    easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        ANIMATION.EASING.NORMAL,
        delta
    );

    const foldIntensity = index > 8
        ? Math.sin(index * Math.PI * (1 / bones.length) - 0.5) * turningTime
        : 0;

    easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        ANIMATION.EASING.FOLD,
        delta
    );
};

const Page = ({ number, front, back, page, opened, closed, ...props }) => {
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
   // useHelper(skinnedMeshRef, SkeletonHelper);

    // Create complete materials array with textures
    const materials = useMemo(() => {
        const emissiveColor = new Color("orange");
        return [
            ...baseMaterials,
            new MeshStandardMaterial({
                color: new Color("white"),
                map: picture,
                roughness: 0.25,
                emissive: emissiveColor,
                emissiveIntensity: 0,
            }),
            new MeshStandardMaterial({
                color: new Color("white"),
                map: picture2,
                roughness: 0.25,
                emissive: emissiveColor,
                emissiveIntensity: 0,
            }),
        ];
    }, [picture, picture2]);

    // Create skinned mesh
    const manualSkinnedMesh = useMemo(() => {
        const bones = [];

        // Create bones
        for (let i = 0; i <= PAGE.SEGMENTS; i++) {
            const bone = new Bone();
            bone.position.x = i === 0 ? 0 : PAGE.SEGMENT_WIDTH;
            bones.push(bone);

            if (i > 0) {
                bones[i - 1].add(bone);
            }
        }

        // Create and configure mesh
        const skeleton = new Skeleton(bones);
        const mesh = new SkinnedMesh(pageGeometry, materials);

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;

        mesh.add(bones[0]);
        mesh.bind(skeleton);

        return mesh;
    }, [materials]);

    // Animation frame
    useFrame((_, delta) => {
        if (!skinnedMeshRef.current) return;

        // Calculate timing and rotation
        const turningTime = updateTurningTime(lastOpened, turnedAt, opened);
        const targetRotation = calculateTargetRotation(opened, closed, number);

        // Animate bones
        const bones = skinnedMeshRef.current.skeleton.bones;
        bones.forEach((bone, index) => {
            calculateBoneRotation(bone, index, {
                group,
                bones,
                turningTime,
                targetRotation,
                closed,
                delta
            });
        });
    });

    useEffect(() => {
        console.log("Index", number);
    }, []);

    return (
        <group {...props} ref={group}>
            <primitive
                object={manualSkinnedMesh}
                ref={skinnedMeshRef}
                position-z={-number * PAGE.DEPTH + page * PAGE.DEPTH}
            />
        </group>
    );
};

export default Page;