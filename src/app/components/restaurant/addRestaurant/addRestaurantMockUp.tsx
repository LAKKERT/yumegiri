'use client';

import { motion } from "framer-motion";
import * as THREE from "three";
import { v4 as uuidv4 } from 'uuid';
import { useRef, useState, useEffect, useCallback, RefObject } from "react";
import { EffectComposer, RenderPass, OutlinePass, OutputPass, GLTFLoader } from "three/examples/jsm/Addons.js";
import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { DeletedScene, Places, Table } from "@/lib/interfaces/mockup";
import { UseFormRegister, FieldArrayWithId, UseFieldArrayUpdate } from "react-hook-form";
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { LongInEaseOut } from "@/helpers/easingFunctions";

interface AddRestaurantMockUp {
    constraintsRef: RefObject<HTMLDivElement | null>;
    update: UseFieldArrayUpdate<Places, "floors">;
    register: UseFormRegister<Places>;
    isSwitchingFloor: boolean;
    changeSwithichFloorHandler: (mode: boolean) => void;
    currentFloor: number;
    floors: FieldArrayWithId<Places, "floors", "id">[];
    ChangeSeatState: (mode: boolean, index: number) => void;
    initTables: (table: Table) => void;
    deletedScene: DeletedScene | null;
    ChangeDeletedScene: () => void;
}

export function AddRestaurantMockUp({ constraintsRef, update, isSwitchingFloor, changeSwithichFloorHandler, currentFloor, floors, ChangeSeatState, initTables, deletedScene, ChangeDeletedScene }: AddRestaurantMockUp) {
    const aspectRatio = `1110 / ${600}`;

    const containerRef = useRef<HTMLDivElement>(null);
    const [mapFocus, setMapFocus] = useState<boolean>(false);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
    const pointerRef = useRef<THREE.Vector2 | null>(null);
    const raycasterRef = useRef<THREE.Raycaster | null>(null);
    const renderPassRef = useRef<RenderPass | null>(null);
    const outlinePassRef = useRef<OutlinePass | null>(null);
    const outputPassRef = useRef<OutputPass | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);

    const [sceneIsReady, setSceneIsReady] = useState(false);

    const startAnimation = useRef(0.0);
    const opacityStartAnimation = useRef(0.0)

    const floorZsRef = useRef<number[]>([]);
    const floorsRef = useRef<THREE.Group<THREE.Object3DEventMap>[]>([]);
    const preFloorRef = useRef<number>(0);
    const currentFloorRef = useRef<number>(0);
    const preFloorSceneRef = useRef<THREE.Group<THREE.Object3DEventMap> | null>(null);
    const currentFloorSceneRef = useRef<THREE.Group<THREE.Object3DEventMap> | null>(null);

    const cloudsRef = useRef<THREE.Mesh[][]>([]);
    const ShouldShowClouds = useRef(true);

    const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 0 });
    const cameraPositionZ = useRef<number | null>(10);

    const isSwitchingFloorRef = useRef(isSwitchingFloor);

    const isDown = useRef<boolean>(false);
    const startPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const lastMousePosition = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const isDragging = useRef<boolean>(false);
    const isClick = useRef<boolean>(false);
    const isZooming = useRef<boolean>(false);
    const zoomScale = useRef<number>(3);

    const [mainSceneIsLoaded, setMainSceneIsLoaded] = useState<boolean>(false);

    useEffect(() => {
        isSwitchingFloorRef.current = isSwitchingFloor;
        startAnimation.current = performance.now();
        opacityStartAnimation.current = performance.now();
    }, [isSwitchingFloor]);

    const FLOOR_SPACING = 40;
    const DEFAULT_ZOOM = 3;
    const MAP_MOVEMENT_CONSTRAINTS = { minX: -3.5, maxX: 3.5, minY: -3.5, maxY: 3.5 };
    const DRAG_THRESHOLD = 5;

    const animationDuration = 2000;

    const maxDistance = 20;
    const minOpacity = 0;
    const maxOpacity = 1;

    const maxScaleDistance = 30;
    const maxScale = 1;
    const minScale = .5;

    const clouds = [
        {
            x: -2.4,
            y: 1.3,
            z: 4,
            path: '/restaurant mockup/cloud1.png',
        },
        {
            x: -1.2,
            y: 2,
            z: 5,
            path: '/restaurant mockup/cloud2.png',
        },
        {
            x: 2,
            y: -1.5,
            z: 6,
            path: '/restaurant mockup/cloud3.png',
        },
        {
            x: -3.5,
            y: 3,
            z: 7,
            path: '/restaurant mockup/cloud4.png',
        },
        {
            x: 1.5,
            y: 2.5,
            z: 10,
            path: '/restaurant mockup/cloud5.png',
        },
        {
            x: 3.52,
            y: 4.5,
            z: 9,
            path: '/restaurant mockup/cloud6.png',
        },
        {
            x: -0.5,
            y: -1.5,
            z: 8,
            path: '/restaurant mockup/cloud7.png',
        },
    ]

    const scrollOff = useCallback((e: MouseEvent | PointerEvent | React.MouseEvent<HTMLDivElement>) => {
        if (e.target === document.getElementById('CanvasID')) {
            setMapFocus(true);
        } else {
            setMapFocus(false);
        }
    }, []);

    const mouseDownHandler = useCallback((e: MouseEvent) => {
        if (e.button === 0) {
            isDown.current = true;
            isDragging.current = false;
            startPosition.current = { x: e.clientX, y: e.clientY };
            lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    }, []);

    const mouseUpHandler = useCallback(() => {
        isDown.current = false;
        isDragging.current = false;
    }, []);

    const mouseMoveHandler = useCallback((e: MouseEvent) => {
        if (!isDown.current || !cameraRef.current) return;
        const camera = cameraRef.current;

        const deltaX = Math.abs(e.clientX - startPosition.current.x);
        const deltaY = Math.abs(e.clientY - startPosition.current.y);
        if (deltaX + deltaY > DRAG_THRESHOLD) {
            isDragging.current = true;
        }

        if (isDragging.current && lastMousePosition.current && camera) {
            const newX = e.clientX - lastMousePosition.current.x;
            const newY = e.clientY - lastMousePosition.current.y;
            console.log(newX, newY)

            const nextX = camera.position.x - newX * 0.01;
            const nextY = camera.position.y + newY * 0.01;

            camera.position.x = clamp(nextX, MAP_MOVEMENT_CONSTRAINTS.minX, MAP_MOVEMENT_CONSTRAINTS.maxX);
            camera.position.y = clamp(nextY, MAP_MOVEMENT_CONSTRAINTS.minY, MAP_MOVEMENT_CONSTRAINTS.maxY);

            lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    }, [cameraRef]);

    useEffect(() => {
        if (mapFocus) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "scroll";
    }, [mapFocus]);

    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max)
    }

    useEffect(() => {
        if (!containerRef.current) return;

        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const raycaster = raycasterRef.current;
        const pointer = pointerRef.current
        const composer = composerRef.current;
        const outlinePass = outlinePassRef.current;

        if (!renderer || !scene || !camera || !raycaster || !pointer || !cameraPositionZ.current) return;

        const axesHelper = new THREE.AxesHelper(15);
        scene.add(axesHelper);

        const stats = new Stats();
        stats.showPanel(0)
        document.body.appendChild(stats.dom);

        zoomScale.current = 3
        camera.zoom = zoomScale.current;
        camera.updateProjectionMatrix();

        if (outlinePass) {
            outlinePass.edgeStrength = 5;
            outlinePass.edgeGlow = 0;
            outlinePass.visibleEdgeColor.set(0xffffff);
            outlinePass.hiddenEdgeColor.set(0xffffff);
        }

        camera.position.z = cameraPositionZ.current

        const animate = () => {
            stats.begin();

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            const selectedObjects: THREE.Object3D[] = [];


            for (let i = 0; i < intersects.length; i++) {
                const obj = intersects[i].object;

                if (obj.parent instanceof THREE.Group) {
                    const objParent = obj.parent.children;

                    for (let i = 0; i < objParent.length; i++) {
                        if (objParent[i] instanceof THREE.Mesh && objParent[i].name.startsWith('Table') && (currentFloorRef.current === obj.parent.userData.floorIndex)) {
                            if (isClick.current && !isDragging.current) {
                                // Рейкаст для столов
                                // сделать debaunce т.к запускается слишком часто
                                ChangeSeatState(true, obj.parent.userData.tableIndex);
                                isClick.current = false;
                            }
                            selectedObjects.push(objParent[i]);
                        }
                    }
                }
            }

            if (isSwitchingFloorRef.current && currentFloorSceneRef.current && preFloorSceneRef.current && cloudsRef.current && cameraPositionZ.current) {
                isZooming.current = false;
                zoomScale.current = 3;

                const floor = currentFloorRef.current;
                const targetZ = floorZsRef.current[floor] + 20;
                const floorDistanceDiff = targetZ - cameraPositionZ.current;

                const now = performance.now();
                const elapsed = now - startAnimation.current;

                let t = elapsed / animationDuration;
                if (t > 1) t = 1;

                const easedT = LongInEaseOut(t);

                camera.position.z = cameraPositionZ.current + floorDistanceDiff * easedT

                const zoomDiff = DEFAULT_ZOOM - camera.zoom;
                camera.zoom += zoomDiff * .05;
                camera.updateProjectionMatrix();

                const cameraPositionDiffX = 0 - camera.position.x;
                const cameraPositionDiffY = 0 - camera.position.y;
                camera.position.x += cameraPositionDiffX * .05;
                camera.position.y += cameraPositionDiffY * .05;

                if (t <= 0.3) {
                    const fadeOutStrength = 1 - t / 0.3;
                    preFloorSceneRef.current.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            const material = child.material as THREE.MeshStandardMaterial;
                            material.transparent = true;
                            material.opacity = fadeOutStrength;
                            material.needsUpdate = true;
                        }
                    });
                } else {
                    preFloorSceneRef.current.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            const material = child.material as THREE.MeshStandardMaterial;
                            material.transparent = true;
                            material.opacity = 0;
                            material.needsUpdate = true;
                        }
                    });
                }

                if (t >= 0.7) {
                    const fadeInStrength = (t - 0.7) / 0.3;
                    currentFloorSceneRef.current.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            const material = child.material as THREE.MeshStandardMaterial;
                            material.transparent = true;
                            material.opacity = Math.min(1, fadeInStrength);
                            material.needsUpdate = true;
                        }
                    });
                }

                if (ShouldShowClouds.current) {
                    cloudsRef.current[currentFloorRef.current < preFloorRef.current ? preFloorRef.current - 1 : preFloorRef.current].forEach((cloudMesh) => {
                        const material = cloudMesh.material as THREE.MeshBasicMaterial;

                        const distance = Math.abs(cloudMesh.position.z - camera.position.z);

                        let opacity = 1 - distance / maxDistance;

                        opacity = Math.max(minOpacity, Math.min(maxOpacity, opacity));

                        material.opacity = opacity;

                        let scale = 1 - distance / maxScaleDistance;

                        scale = Math.max(minScale, Math.min(maxScale, scale));

                        cloudMesh.scale.x = scale;
                        cloudMesh.scale.y = scale;
                        cloudMesh.scale.z = scale;
                    })
                }

                if (Math.abs(t) >= 1) {
                    cameraPositionZ.current = targetZ;
                    changeSwithichFloorHandler(false);
                    isSwitchingFloorRef.current = false;

                }
            }

            if (isZooming.current) {
                zoomScale.current = clamp(zoomScale.current, 3, 7);
                const diff = zoomScale.current - camera.zoom;
                camera.zoom += diff * 0.01
                camera.updateProjectionMatrix();

                if (Math.abs(diff) < 0.05) {
                    isZooming.current = false;
                }
            }

            if (cameraRef.current) {
                const { x, y, z } = cameraRef.current.position;
                setCameraPos({ x, y, z });
            }

            if (outlinePass) {
                outlinePass.selectedObjects = selectedObjects;
            }

            if (composer) {
                composer.render();
            } else {
                renderer.render(scene, camera);
            }

            stats.end();

            requestAnimationFrame(animate);
        };

        animate();

        return (() => {
            if (stats) {
                document.body.removeChild(stats.dom);
            }

            if (containerRef.current && renderer.domElement.parentNode) {
                containerRef.current.removeChild(renderer.domElement);
            }
        })
    }, [sceneIsReady]);

    useEffect(() => {
        window.addEventListener('click', scrollOff);
        window.addEventListener("mousedown", mouseDownHandler);
        window.addEventListener("mouseup", mouseUpHandler);
        window.addEventListener("mousemove", mouseMoveHandler);

        return () => {
            window.removeEventListener('click', scrollOff)
            window.removeEventListener("mousedown", mouseDownHandler);
            window.removeEventListener("mouseup", mouseUpHandler);
            window.removeEventListener("mousemove", mouseMoveHandler);
        };
    }, [scrollOff, mouseDownHandler, mouseUpHandler, mouseMoveHandler]);

    // Инициализирование камеры, сцены, outliner, raycaster;
    useEffect(() => {
        if (!containerRef.current) return;

        cameraRef.current = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        sceneRef.current = new THREE.Scene();

        rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        rendererRef.current.setClearColor(0x000000, 0);
        rendererRef.current.domElement.id = 'CanvasID';
        rendererRef.current.domElement.style.borderRadius = `8px`
        rendererRef.current.outputColorSpace = THREE.SRGBColorSpace;
        rendererRef.current.toneMapping = THREE.NoToneMapping;
        rendererRef.current.toneMappingExposure = 0;
        rendererRef.current.shadowMap.enabled = true;
        rendererRef.current.shadowMap.type = THREE.PCFSoftShadowMap;

        containerRef.current.appendChild(rendererRef.current.domElement);

        composerRef.current = new EffectComposer(rendererRef.current);

        raycasterRef.current = new THREE.Raycaster();
        pointerRef.current = new THREE.Vector2();

        renderPassRef.current = new RenderPass(sceneRef.current, cameraRef.current);
        composerRef.current.addPass(renderPassRef.current);

        outlinePassRef.current = new OutlinePass(new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight), sceneRef.current, cameraRef.current)
        outlinePassRef.current.renderToScreen = false;
        composerRef.current.addPass(outlinePassRef.current);

        outputPassRef.current = new OutputPass();
        composerRef.current.addPass(outputPassRef.current);

        if (rendererRef.current, sceneRef.current, cameraRef.current, raycasterRef.current, pointerRef.current, composerRef.current, outlinePassRef.current) {
            setSceneIsReady(true);
        }

        window.addEventListener("wheel", ScaleMapHandler);
        window.addEventListener("pointermove", onPointerMove);

        function onPointerMove(e: MouseEvent) {
            if (!pointerRef.current || !rendererRef.current) return
            const rect = rendererRef.current.domElement.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            pointerRef.current.x = (x / rect.width) * 2 - 1;
            pointerRef.current.y = -(y / rect.height) * 2 + 1;
        }

        function ScaleMapHandler(e: WheelEvent) {
            if (e.deltaY > 0) {
                isZooming.current = true;
                zoomScale.current -= 1;
            } else {
                isZooming.current = true;
                zoomScale.current += 1;
            }
        }



        return () => {
            if (!rendererRef.current) return;
            rendererRef.current.dispose();
            window.removeEventListener("wheel", ScaleMapHandler);
            window.removeEventListener("pointermove", onPointerMove);
        };
    }, [])

    // Развёртывание древа сцены
    // function dumpObject(obj: THREE.Mesh, lines: string[] = [], isLast = true, prefix = '') {
    //     const localPrefix = isLast ? '└─' : '├─';
    //     lines.push(
    //         `${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`
    //     );
    //     const newPrefix = prefix + (isLast ? "  " : "| ");
    //     const lastNds = obj.children.length - 1;
    //     obj.children.forEach((child, ndx) => {
    //         const isLast = ndx === lastNds;
    //         dumpObject(child, lines, isLast, newPrefix);
    //     });
    //     return lines;
    // }

    // Инициализирование сцены и посадочных мест
    useEffect(() => {
        if (!sceneRef.current || !containerRef.current) return;
        const scene = sceneRef.current;

        const disposeScene = (object: THREE.Object3D) => {
            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.geometry?.dispose()
                    if (child.material instanceof THREE.Material) {
                        child.material.dispose();
                    } else if (Array.isArray(child.material)) {
                        child.material.forEach((material) => material.dispose());
                    }
                    if (child.material.map) child.material.map.dispose();
                }
            });
            scene.remove(object);
        }

        const loadedFloors: THREE.Group[] = [];

        const intensity = 10;
        const LightAreaColor = 0xFFBB9C;

        const directionalLight = new THREE.DirectionalLight(LightAreaColor, intensity);
        directionalLight.position.set(-4.5, 4, -0.3);
        directionalLight.target.position.set(-0.3, 2.75, -10);

        // Настройка теней
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        directionalLight.shadow.bias = -0.0001;
        directionalLight.shadow.normalBias = 0.05;
        directionalLight.shadow.radius = 4;
        directionalLight.shadow.blurSamples = 10;

        scene.add(directionalLight);
        scene.add(directionalLight.target);

        const ambientLight = new THREE.AmbientLight(0x60588B, 1);
        scene.add(ambientLight);

        const dirLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
        scene.add(dirLightHelper);

        const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);

        const gui = new GUI();
        gui.add(directionalLight, 'intensity', 0, 10, 0.01);

        const onChange = () => {

            directionalLight.target.updateMatrixWorld();
            dirLightHelper.update();

        };

        onChange();

        function makeXYZGUI(gui: GUI, vector3: THREE.Vector3, name: string, onChangeFn: () => void) {

            const folder = gui.addFolder(name);
            folder.add(vector3, 'x', - 10, 10).onChange(onChangeFn);
            folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
            folder.add(vector3, 'z', - 10, 10).onChange(onChangeFn);
            folder.open();
        }

        makeXYZGUI(gui, directionalLight.position, 'position', onChange);
        makeXYZGUI(gui, directionalLight.target.position, 'target', onChange);

        setMainSceneIsLoaded(true);

        return () => {
            loadedFloors.forEach(disposeScene);
            loadedFloors.length = 0;

            floorsRef.current = [];
            floorZsRef.current = [];

            scene.remove(directionalLight);
            scene.remove(directionalLight.target);
            scene.remove(ambientLight);
            scene.remove(dirLightHelper);
            scene.remove(cameraHelper);

            dirLightHelper.dispose();
            cameraHelper.dispose();

            gui.destroy();
        }
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        if (!scene) return;

        const isMounted = true;
        const loader = new GLTFLoader();
        const textureLoader = new THREE.TextureLoader();
        const loadedFloors: THREE.Group[] = [];

        let tables: THREE.Object3D | null = null;

        if (deletedScene && deletedScene.isDeleted && deletedScene.index !== null) {

            scene.remove(floorsRef.current[deletedScene.index]);

            if (cloudsRef.current[deletedScene.index]) {
                cloudsRef.current[deletedScene.index].forEach(cloud => {
                    scene.remove(cloud);
                    cloud.geometry.dispose();
                    const mat = cloud.material as THREE.MeshBasicMaterial;
                    mat.dispose();
                    if (mat.map) mat.map.dispose();
                });

                cloudsRef.current.splice(deletedScene.index, 1);
            }

            floorsRef.current.splice(deletedScene.index, 1);
            floorZsRef.current.splice(deletedScene.index, 1);

            if (deletedScene.index === currentFloorRef.current || deletedScene.index >= floorsRef.current.length) {
                currentFloorRef.current = floorsRef.current.length > 0 ? floorsRef.current.length - 1 : 0;
                if (floorsRef.current.length > 0) {
                    isSwitchingFloorRef.current = true;
                    changeSwithichFloorHandler(true);
                }
            }

            for (let i = deletedScene.index; i < floorsRef.current.length; i++) {
                const shift = FLOOR_SPACING;
                floorZsRef.current[i] += shift;
                floorsRef.current[i].position.z += shift;
                if (cloudsRef.current[i]) {
                    cloudsRef.current[i].forEach(cloud => {
                        cloud.position.z += shift;
                    });
                }

                floorsRef.current[i].userData.floorIndex = i;
                floorsRef.current[i].traverse(child => {
                    if (child instanceof THREE.Group && child.userData.floorIndex !== undefined) {
                        child.userData.floorIndex = i;
                    }
                });
            }

            ChangeDeletedScene();
        }

        floors.forEach((floor, floorIdx) => {
            if (!floor.hasMockupUpdate) return;

            if (floorsRef.current[floorIdx]) {
                scene.remove(floorsRef.current[floorIdx]);
                if (cloudsRef.current[floorIdx]) {
                    cloudsRef.current[floorIdx].forEach(cloud => {
                        scene.remove(cloud);
                        cloud.geometry.dispose();
                        const mat = cloud.material as THREE.MeshBasicMaterial;
                        mat.dispose();
                        if (mat.map) mat.map.dispose();
                    });
                    cloudsRef.current[floorIdx] = [];
                }
            }

            floorsRef.current[floorIdx] = new THREE.Group();
            floorsRef.current[floorIdx].userData.floorIndex = floorIdx;

            let GLBModalURL: string | null = null;
            if (floor.mockup !== null) {
                GLBModalURL = URL.createObjectURL(floor.mockup);
            }

            const currentZ = -10 - floorIdx * FLOOR_SPACING;
            floorZsRef.current[floorIdx] = currentZ;

            if (GLBModalURL !== null) {
                loader.load(GLBModalURL, function (gltf) {
                    if (!isMounted) return;

                    const sceneModal = gltf.scene;

                    loadedFloors.push(sceneModal);

                    sceneModal.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            const material = child.material as THREE.MeshStandardMaterial;
                            material.side = THREE.FrontSide;
                            material.transparent = true;
                            material.opacity = floorIdx === currentFloorRef.current ? 1 : 0;
                            material.needsUpdate = true;

                            child.castShadow = true;
                            child.receiveShadow = true;
                        } else if (child instanceof THREE.Group) {
                            child.traverse((subChild) => {
                                if (subChild instanceof THREE.Mesh) {
                                    const material = subChild.material as THREE.MeshStandardMaterial;
                                    material.side = THREE.FrontSide;
                                    material.transparent = true;
                                    material.opacity = floorIdx === currentFloorRef.current ? 1 : 0;
                                    material.needsUpdate = true;

                                    subChild.castShadow = true;
                                    subChild.receiveShadow = true;
                                }
                            });
                        }
                    });

                    tables = sceneModal.getObjectByName('Tables') ?? null;

                    if (tables) {
                        let index = 0;
                        tables.traverse((child) => {
                            if (child instanceof THREE.Group) {
                                const uuid = uuidv4();
                                child.userData.floorIndex = floorIdx;
                                child.userData.tableIndex = index;
                                child.userData.uuid = uuid;
                                index++;

                                initTables({
                                    id: uuid,
                                    status: false,
                                    floor_order: currentFloorRef.current,
                                    order: index,
                                    number_of_seats: 0,
                                });
                            }
                        });
                    }

                    sceneModal.rotateX(1.57 / 2);
                    sceneModal.rotateY(1.57 / 2);

                    sceneModal.position.set(0, 0, currentZ);

                    update(floorIdx, { ...floor, hasMockupUpdate: false });

                    floorsRef.current[floorIdx].add(sceneModal);
                    scene.add(floorsRef.current[floorIdx]);

                    cloudsRef.current[floorIdx] = [];
                    clouds.forEach((cloud) => {
                        textureLoader.load(cloud.path, (texture) => {
                            const material = new THREE.MeshBasicMaterial({
                                map: texture,
                                transparent: true,
                                opacity: 0,
                            });

                            const geometry = new THREE.PlaneGeometry(2, 1.5);
                            const mesh = new THREE.Mesh(geometry, material);
                            mesh.position.set(cloud.x, cloud.y, currentZ - FLOOR_SPACING / 3.5 - cloud.z);
                            scene.add(mesh);

                            mesh.userData.reverse = false;
                            mesh.scale.set(0.5, 0.5, 0.5);

                            cloudsRef.current[floorIdx].push(mesh);
                        });
                    });
                }, undefined, function (error) {
                    console.error("Error occurred", error);
                });
            }
        });

    }, [mainSceneIsLoaded, floors]);


    useEffect(() => {

        preFloorRef.current = currentFloorRef.current;

        currentFloorRef.current = currentFloor;

        if ((currentFloor || currentFloor === 0) && floorsRef.current) {
            preFloorSceneRef.current = floorsRef.current[preFloorRef.current];
            currentFloorSceneRef.current = floorsRef.current[currentFloorRef.current];

            if (currentFloorSceneRef.current && preFloorSceneRef.current) {
                currentFloorSceneRef.current.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                    }
                })

                if (currentFloorRef.current !== preFloorRef.current) {
                    preFloorSceneRef.current.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = false;
                        }
                    })
                }
            }
        }
    }, [floors, currentFloor])

    return (
        <motion.div
            ref={constraintsRef}
            className={`relative mx-auto overflow-visible`}
            style={{
                width: "100%",
                maxWidth: "1110px",
                aspectRatio: aspectRatio,
            }}
        >

            <div style={{
                position: "absolute",
                top: 10,
                left: 10,
                color: "white",
                background: "rgba(0,0,0,0.5)",
                padding: "4px 8px",
                borderRadius: "4px",
                fontSize: "12px"
            }}>
                {`x: ${cameraPos.x.toFixed(2)}, y: ${cameraPos.y.toFixed(2)}, z: ${cameraPos.z.toFixed(2)}`}
            </div>

            <div
                ref={containerRef}
                className="rounded"
                style={{ width: 1110, height: 600 }}
                onClick={(e) => scrollOff(e)}
            >
            </div>
        </motion.div>
    )
}