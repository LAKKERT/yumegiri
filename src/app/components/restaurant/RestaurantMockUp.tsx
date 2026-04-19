'use client';

import { motion } from "framer-motion";
import * as THREE from "three";
import { useRef, useState, useCallback, RefObject, useEffect } from "react";
import { EffectComposer, RenderPass, OutlinePass, OutputPass, GLTFLoader } from "three/examples/jsm/Addons.js";
import { Places } from "@/lib/interfaces/mockup";
import { UseFieldArrayUpdate } from "react-hook-form";
import { LongInEaseOut } from "@/helpers/easingFunctions";

interface RestaurantMockUp {
    constraintsRef: RefObject<HTMLDivElement | null>;
    update: UseFieldArrayUpdate<Places, "floors">;
    currentRestaurant: Places | undefined;
    isSwitchingFloor: boolean;
    changeSwithichFloorHandler: (mode: boolean) => void;
    currentFloor: number;
    seatIsSelected: boolean;
    ChangeSeatState: (mode: boolean) => void;
    changeSelectedSeat: (seatID: string) => void;
    changeIsLoading: () => void;
}

export function RestaurantMockUp({ constraintsRef, update, isSwitchingFloor, changeSwithichFloorHandler, currentRestaurant, currentFloor, seatIsSelected, ChangeSeatState, changeSelectedSeat, changeIsLoading }: RestaurantMockUp) {
    const aspectRatio = `1110 / ${600}`;

    const containerRef = useRef<HTMLDivElement>(null);
    const [mapFocus, setMapFocus] = useState<boolean>(false);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const pointerRef = useRef<THREE.Vector2 | null>(null);
    const raycasterRef = useRef<THREE.Raycaster | null>(null);
    const renderPassRef = useRef<RenderPass | null>(null);
    const outlinePassRef = useRef<OutlinePass | null>(null);
    const outputPassRef = useRef<OutputPass | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const animationFrameId = useRef<number | null>(null);

    const [mainSceneIsLoaded, setMainSceneIsLoaded] = useState<boolean>(false);
    const [sceneIsReady, setSceneIsReady] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState<number>(0);

    const startAnimation = useRef(0.0);
    const opacityStartAnimation = useRef(0.0);

    const floorZsRef = useRef<number[]>([]);
    const floorsRef = useRef<THREE.Group<THREE.Object3DEventMap>[]>([]);
    const preFloorRef = useRef<number>(0);
    const currentFloorRef = useRef<number>(0);
    const preFloorSceneRef = useRef<THREE.Group<THREE.Object3DEventMap> | null>(null);
    const currentFloorSceneRef = useRef<THREE.Group<THREE.Object3DEventMap> | null>(null);

    const cloudsRef = useRef<THREE.Mesh[][]>([]);
    const ShouldShowClouds = useRef(true);

    const cameraPositionZ = useRef<number | null>(10);

    const isSwitchingFloorRef = useRef(isSwitchingFloor);

    const isDown = useRef<boolean>(false);
    const startPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const lastMousePosition = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const isDragging = useRef<boolean>(false);
    const isZooming = useRef<boolean>(false);
    const zoomScale = useRef<number>(3);

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
            z: 8,
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
    ];

    useEffect(() => {
        if (sceneIsReady && mainSceneIsLoaded && loadingProgress >= 100) {
            changeIsLoading();
        }
    }, [sceneIsReady, mainSceneIsLoaded, loadingProgress, changeIsLoading]);

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

            const nextX = camera.position.x - newX * 0.01;
            const nextY = camera.position.y + newY * 0.01;

            camera.position.x = clamp(nextX, MAP_MOVEMENT_CONSTRAINTS.minX, MAP_MOVEMENT_CONSTRAINTS.maxX);
            camera.position.y = clamp(nextY, MAP_MOVEMENT_CONSTRAINTS.minY, MAP_MOVEMENT_CONSTRAINTS.maxY);

            lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cameraRef]);

    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    // Инициализирование камеры, сцены, outliner, raycaster;
    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

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
        rendererRef.current.domElement.style.borderRadius = `8px`;
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

        outlinePassRef.current = new OutlinePass(new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight), sceneRef.current, cameraRef.current);
        outlinePassRef.current.renderToScreen = false;
        composerRef.current.addPass(outlinePassRef.current);

        outputPassRef.current = new OutputPass();
        composerRef.current.addPass(outputPassRef.current);

        if (rendererRef.current && sceneRef.current && cameraRef.current && raycasterRef.current && pointerRef.current && composerRef.current && outlinePassRef.current) {
            setSceneIsReady(true);
        }

        const onPointerMove = (e: MouseEvent) => {
            if (!pointerRef.current || !rendererRef.current) return;
            const rect = rendererRef.current.domElement.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            pointerRef.current.x = (x / rect.width) * 2 - 1;
            pointerRef.current.y = -(y / rect.height) * 2 + 1;
        };

        window.addEventListener("pointermove", onPointerMove);

        return () => {
            window.removeEventListener("pointermove", onPointerMove);

            if (rendererRef.current) {
                if (container && rendererRef.current.domElement.parentNode) {
                    container.removeChild(rendererRef.current.domElement);
                }
                rendererRef.current.forceContextLoss();
                rendererRef.current.dispose();
                rendererRef.current = null;
            }

            if (composerRef.current) {
                composerRef.current.dispose();
                composerRef.current = null;
            }
            if (renderPassRef.current) {
                renderPassRef.current.dispose();
                renderPassRef.current = null;
            }
            if (outlinePassRef.current) {
                outlinePassRef.current.dispose();
                outlinePassRef.current = null;
            }
            if (outputPassRef.current) {
                outputPassRef.current.dispose();
                outputPassRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const ScaleMapHandler = (e: WheelEvent) => {
            if (!mapFocus) return;
            e.preventDefault();

            isZooming.current = true;

            if (e.deltaY > 0) {
                zoomScale.current -= 1;
            } else {
                zoomScale.current += 1;
            }
        };

        window.addEventListener("wheel", ScaleMapHandler, { passive: false });

        return () => {
            window.removeEventListener("wheel", ScaleMapHandler);
        };
    }, [mapFocus]);

    // Инициализирование сцены и посадочных мест
    useEffect(() => {
        if (!sceneRef.current || !containerRef.current) return;
        const scene = sceneRef.current;

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

        const onChange = () => {
            directionalLight.target.updateMatrixWorld();
        };

        onChange();

        setMainSceneIsLoaded(true);

        return () => {
            loadedFloors.forEach(disposeScene);
            loadedFloors.length = 0;

            floorsRef.current = [];
            floorZsRef.current = [];

            scene.remove(directionalLight);
            scene.remove(directionalLight.target);
            scene.remove(ambientLight);

            if (cameraRef.current) {
                scene.remove(cameraRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const scene = sceneRef.current;
        const localClouds = cloudsRef.current;
        if (!scene) return;

        let isMounted = true;
        const loader = new GLTFLoader();
        const textureLoader = new THREE.TextureLoader();
        const loadedFloors: THREE.Group[] = [];

        const totalResources = (currentRestaurant?.floors.length || 0) * (1 + clouds.length);
        let loadedResources = 0;

        const updateProgress = () => {
            loadedResources++;
            const progress = (loadedResources / totalResources) * 100;
            setLoadingProgress(Math.min(progress, 100));
        };

        const loadPromises: Promise<void>[] = [];

        currentRestaurant?.floors.forEach((floor, floorIdx) => {
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

            const currentZ = -10 - floorIdx * FLOOR_SPACING;
            floorZsRef.current[floorIdx] = currentZ;

            const floorTables = currentRestaurant.floors[floorIdx].places;

            if (typeof floor.mockup === 'string') {
                const floorPromise = new Promise<void>((resolve, reject) => {
                    loader.load(
                        `${floor.mockup}`,
                        function (gltf) {
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

                            const tables = sceneModal.getObjectByName('Tables') ?? null;

                            if (tables) {
                                let placeIndex = 0;
                                tables.traverse((child) => {
                                    if (child instanceof THREE.Group) {
                                        if (!floorTables[placeIndex]) {
                                            console.warn(`No table data for placeIndex ${placeIndex} (floorIdx ${floorIdx})`);
                                            placeIndex++;
                                            return;
                                        }

                                        child.userData.floorIndex = floorIdx;
                                        child.userData.tableId = floorTables[placeIndex].id;
                                        child.userData.status = floorTables[placeIndex].status;
                                        placeIndex++;
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
                            const cloudPromises: Promise<void>[] = clouds.map((cloud) => {
                                return new Promise((resolve) => {
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
                                        updateProgress();
                                        resolve();
                                    });
                                });
                            });

                            updateProgress();
                            Promise.all(cloudPromises).then(() => resolve());
                        },
                        undefined,
                        function (error) {
                            console.error("Error occurred", error);
                            reject(error);
                        }
                    );
                });
                loadPromises.push(floorPromise);
            }
        });

        return () => {
            isMounted = false;

            loadedFloors.forEach(disposeScene);
            loadedFloors.length = 0;

            localClouds.forEach((floor) => {
                floor.forEach((cloud) => {
                    if (cloud instanceof THREE.Mesh) {
                        cloud.geometry.dispose();
                        const material = cloud.material as THREE.Material;
                        material.dispose();
                        scene.remove(cloud);
                    }
                });
            });
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainSceneIsLoaded, currentRestaurant]);

    useEffect(() => {
        isSwitchingFloorRef.current = isSwitchingFloor;
        startAnimation.current = performance.now();
        opacityStartAnimation.current = performance.now();

        return () => { };
    }, [isSwitchingFloor]);

    useEffect(() => {
        if (!containerRef.current) return;

        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const raycaster = raycasterRef.current;
        const pointer = pointerRef.current;
        const composer = composerRef.current;
        const outlinePass = outlinePassRef.current;

        if (seatIsSelected || !renderer || !scene || !camera || !raycaster || !pointer || !cameraPositionZ.current || !outlinePass  ) return;

        zoomScale.current = DEFAULT_ZOOM;
        camera.zoom = zoomScale.current;
        camera.updateProjectionMatrix();

        if (outlinePass) {
            outlinePass.edgeStrength = 5;
            outlinePass.edgeGlow = 0;
            outlinePass.visibleEdgeColor.set(0xffffff);
            outlinePass.hiddenEdgeColor.set(0xffffff);
        }

        camera.position.z = cameraPositionZ.current;

        const animate = () => {
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            const selectedObjects: THREE.Object3D[] = [];

            for (let i = 0; i < intersects.length; i++) {
                const obj = intersects[i].object;

                if (obj.parent instanceof THREE.Group) {
                    const objParent = obj.parent.children;

                    for (let i = 0; i < objParent.length; i++) {
                        if (objParent[i] instanceof THREE.Mesh && objParent[i].name.startsWith('Table') && (currentFloorRef.current === obj.parent.userData.floorIndex)) {
                            if (isDown.current && !isDragging.current) {
                                if (obj.parent.userData.tableId && obj.parent.userData.status) {
                                    console.log('Столик занят');
                                } else {
                                    changeSelectedSeat(obj.parent.userData.tableId);
                                    ChangeSeatState(true);
                                }
                            }

                            if (!obj.parent.userData.status) {
                                outlinePass.visibleEdgeColor.set(0xffffff);
                                outlinePass.hiddenEdgeColor.set(0xffffff);
                            } else {
                                outlinePass.edgeStrength = 10;
                                outlinePass.visibleEdgeColor.set("#FF0000");
                                outlinePass.hiddenEdgeColor.set("#FF0000");
                            }
                            selectedObjects.push(objParent[i]);
                        }
                    }
                }
            }

            if (isSwitchingFloorRef.current && currentFloorSceneRef.current && preFloorSceneRef.current && cloudsRef.current && cameraPositionZ.current) {
                isZooming.current = false;
                zoomScale.current = DEFAULT_ZOOM;

                const floor = currentFloorRef.current;
                const targetZ = floorZsRef.current[floor] + 20;
                const floorDistanceDiff = targetZ - cameraPositionZ.current;

                const now = performance.now();
                const elapsed = now - startAnimation.current;

                let t = elapsed / animationDuration;
                if (t > 1) t = 1;

                const easedT = LongInEaseOut(t);

                camera.position.z = cameraPositionZ.current + floorDistanceDiff * easedT;

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
                    });
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
                camera.zoom += diff * 0.01;
                camera.updateProjectionMatrix();

                if (Math.abs(diff) < 0.05) {
                    isZooming.current = false;
                }
            }

            if (outlinePass) {
                outlinePass.selectedObjects = selectedObjects;
            }

            if (composer) {
                composer.render();
            } else {
                renderer.render(scene, camera);
            }

            animationFrameId.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sceneIsReady, seatIsSelected]);

    useEffect(() => {
        if (mapFocus) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "scroll";

        return () => {
            document.body.style.overflow = "scroll";
        };
    }, [mapFocus]);

    useEffect(() => {
        window.addEventListener('click', scrollOff);
        window.addEventListener("mousedown", mouseDownHandler);
        window.addEventListener("mouseup", mouseUpHandler);
        window.addEventListener("mousemove", mouseMoveHandler);

        return () => {
            window.removeEventListener('click', scrollOff);
            window.removeEventListener("mousedown", mouseDownHandler);
            window.removeEventListener("mouseup", mouseUpHandler);
            window.removeEventListener("mousemove", mouseMoveHandler);
        };
    }, [scrollOff, mouseDownHandler, mouseUpHandler, mouseMoveHandler]);

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
                });

                if (currentFloorRef.current !== preFloorRef.current) {
                    preFloorSceneRef.current.traverse((child) => {
                        if (child instanceof THREE.Mesh) {
                            child.castShadow = false;
                        }
                    });
                }
            }
        }

        return () => { };
    }, [currentFloor]);

    const disposeScene = (object: THREE.Object3D) => {
        if (!sceneRef.current) return;
        object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.geometry?.dispose();
                if (child.material instanceof THREE.Material) {
                    child.material.dispose();
                } else if (Array.isArray(child.material)) {
                    child.material.forEach((material) => material.dispose());
                }
                if (child.material.map) child.material.map.dispose();
            }
        });
        sceneRef.current.remove(object);
    };

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
            {loadingProgress < 100 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white text-lg font-(family-name:--font-arimo)">
                        Загрузка: {Math.round(loadingProgress)}%
                    </div>
                </div>
            )}
            <div
                ref={containerRef}
                style={{ width: 1110, height: 600 }}
                onClick={(e) => scrollOff(e)}
            >
            </div>
        </motion.div>
    );
}