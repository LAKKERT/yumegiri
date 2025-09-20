"use client";

import { Control, Controller } from "react-hook-form";
import Script from 'next/script';
import Image from "next/image";
import * as THREE from "three";
import { motion, AnimatePresence, MotionValue } from "framer-motion";
import styles from '@/app/styles/reservatoin/variables.module.scss';
import { Places } from "@/lib/interfaces/mockup";
import { Reservation } from "@/lib/interfaces/reservation";
import { RefObject, useRef, useEffect, useState, useCallback } from "react";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EffectComposer } from "three/examples/jsm/Addons.js";
import { RenderPass, OutputPass } from "three/examples/jsm/Addons.js";
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';

interface RestaurantMockUp {
    constraintsRef: RefObject<HTMLDivElement | null>;
    currentRestaurant: Places | undefined;
    currentFloor: number;
    seatsIsSelected: boolean;
    control: Control<Reservation, unknown, Reservation>;
    seatsRefs: RefObject<HTMLDivElement[]>;
    visibleMenu: {
        [key: string]: boolean;
    };
    x: MotionValue<number>;
    ChangeSeatState: (mode: boolean) => void;
    onClickHandler: (index: string, placeIndex: number) => void;
    isSwitchingFloor: boolean;
    changeSwithichFloorHandler: (mode: boolean) => void;
}

export function RestaurantMockUp({ constraintsRef, currentRestaurant, currentFloor, seatsIsSelected, control, seatsRefs, visibleMenu, x, ChangeSeatState, onClickHandler, isSwitchingFloor, changeSwithichFloorHandler }: RestaurantMockUp) {

    const aspectRatio = `1110 / ${currentRestaurant?.floors[currentFloor].mockup_height || 600}`;

    const containerRef = useRef<HTMLDivElement>(null);
    const [mapFocus, setMapFocus] = useState<boolean>(false);
    const [seatIsSelected, setSeatIsSelected] = useState<string>('');
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const seatsArrayRef = useRef<THREE.Mesh[]>([]);
    const tablesRef = useRef<THREE.Mesh[]>([]);
    const floorZsRef = useRef<number[]>([]);
    const floorsRef = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial, THREE.Object3DEventMap>[]>([]);
    const currentFloorRef = useRef<number>(0);
    const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 0 });

    const isSwitchingFloorRef = useRef(isSwitchingFloor);

    const lastMousePosition = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const isDragging = useRef<boolean>(false);
    const isClick = useRef<boolean>(false);
    const isZooming = useRef<boolean>(false);
    const zoomScale = useRef<number>(3);

    useEffect(() => {
        isSwitchingFloorRef.current = isSwitchingFloor;
    }, [isSwitchingFloor]);

    const FLOOR_SPACING = 5;
    const DEFAULT_ZOOM = 3;
    const MAP_MOVEMENT_CONSTRAINTS = { minX: -1.5, maxX: 1.5, minY: -1.5, maxY: 1.5 };

    const scrollOff = useCallback((e: MouseEvent | PointerEvent | React.MouseEvent<HTMLDivElement>) => {
        if (e.target === document.getElementById('CanvasID')) {
            setMapFocus(true);
        } else {
            setMapFocus(false);
        }
    }, []);

    const mouseDownHandler = useCallback((e: MouseEvent) => {
        if (e.button === 0) {
            isDragging.current = true;
            isClick.current = true;
            lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    }, [])

    const mouseUpHandler = useCallback(() => {
        isDragging.current = false;
        isClick.current = false;
    }, [])

    const mouseMoveHandler = useCallback((e: MouseEvent) => {
        if (!cameraRef || !isDragging) return;
        const camera = cameraRef.current;

        if (isDragging.current && lastMousePosition.current && camera) {
            const newX = e.clientX - lastMousePosition.current.x;
            const newY = e.clientY - lastMousePosition.current.y;

            const nextX = camera.position.x - newX * 0.01;
            const nextY = camera.position.y + newY * 0.01;

            camera.position.x = clamp(nextX, MAP_MOVEMENT_CONSTRAINTS.minX, MAP_MOVEMENT_CONSTRAINTS.maxX);
            camera.position.y = clamp(nextY, MAP_MOVEMENT_CONSTRAINTS.minY, MAP_MOVEMENT_CONSTRAINTS.maxY);

            lastMousePosition.current = { x: e.clientX, y: e.clientY };
        }
    }, []);

    useEffect(() => {
        if (mapFocus) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "scroll";
    }, [mapFocus]);

    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max)
    }

    useEffect(() => {
        if (!containerRef.current || !currentRestaurant) return;

        cameraRef.current = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        );
        sceneRef.current = new THREE.Scene();

        const scene = sceneRef.current;
        const camera = cameraRef.current;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.id = 'CanvasID';
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.toneMappingExposure = 1.0;
        containerRef.current.appendChild(renderer.domElement);

        zoomScale.current = 5
        camera.zoom = zoomScale.current;
        camera.updateProjectionMatrix();

        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

        const composer = new EffectComposer(renderer);

        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const outlinePass = new OutlinePass(new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight), scene, camera)
        outlinePass.renderToScreen = false;
        composer.addPass(outlinePass);

        const outputPass = new OutputPass();
        composer.addPass(outputPass);

        if (outlinePass) {
            outlinePass.edgeStrength = 5;
            outlinePass.edgeGlow = 0;
            outlinePass.visibleEdgeColor.set(0xae3d3d);
            outlinePass.hiddenEdgeColor.set(0xae3d3d);
        }

        function onPointerMove(e: MouseEvent) {
            const rect = renderer.domElement.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            pointer.x = (x / rect.width) * 2 - 1;
            pointer.y = -(y / rect.height) * 2 + 1;
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

        window.addEventListener("wheel", ScaleMapHandler);
        window.addEventListener("pointermove", onPointerMove);

        camera.position.z = 5;

        const animate = () => {

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            const selectedObjects: THREE.Object3D[] = [];

            for (let i = 0; i < intersects.length; i++) {
                const obj = intersects[i].object;

                if (obj.parent instanceof THREE.Group) {
                    const objParent = obj.parent.children;
                      
                    for (let i = 0; i < objParent.length; i++) {
                        if (objParent[i] instanceof THREE.Mesh && objParent[i].name.startsWith('Table')) {
                            if (isClick.current) {
                                if (obj.parent.userData.TableID) {
                                    setSeatIsSelected(obj.parent.userData.TableID);
                                }
                            }
                            selectedObjects.push(objParent[i]);
                        }
                    }

                }
            }

            if (isSwitchingFloorRef.current && currentFloorRef.current && floorZsRef.current && floorsRef.current) {
                isZooming.current = false;
                zoomScale.current = 3;

                const floor = currentFloorRef.current;
                const targetZ = floorZsRef.current[floor - 1] + 5;
                const floorDistanceDiff = targetZ - camera.position.z;
                camera.position.z += floorDistanceDiff * 0.025

                const zoomDiff = DEFAULT_ZOOM - camera.zoom;
                camera.zoom += zoomDiff * .05;
                camera.updateProjectionMatrix();

                const cameraPositionDiffX = 0 - camera.position.x;
                const cameraPositionDiffY = 0 - camera.position.y;
                camera.position.x += cameraPositionDiffX * .05;
                camera.position.y += cameraPositionDiffY * .05;

                scene.traverse((child) => {
                    if (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry) {
                        const meshFloorIndex = child.userData.floorIndex;
                        const mat = child.material as THREE.MeshBasicMaterial;

                        if (meshFloorIndex === currentFloorRef.current - 1) {
                            mat.opacity = Math.min(1, mat.opacity + 0.009);
                        } else {
                            mat.opacity = Math.max(0, mat.opacity - 0.009);
                        }
                    }
                })

                if (Math.abs(floorDistanceDiff) < 0.005) {
                    camera.position.z = targetZ;
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

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            renderer.dispose();
            if (containerRef.current && renderer.domElement.parentNode) {
                containerRef.current.removeChild(renderer.domElement);
            }
            window.removeEventListener("wheel", ScaleMapHandler);
            window.removeEventListener("pointermove", onPointerMove);
        };
    }, [currentRestaurant]);

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
        }
    }, [scrollOff, mouseDownHandler, mouseUpHandler, mouseMoveHandler]);

    // Инициализирование сцены и посадочных мест
    useEffect(() => {
        if (!currentRestaurant || !sceneRef.current || !containerRef.current) return;

        floorsRef.current = [];
        floorZsRef.current = [];

        const scene = sceneRef.current;

        const loader = new GLTFLoader();

        function dumpObject(obj: THREE.Mesh, lines: string[] = [], isLast = true, prefix = '') {
            const localPrefix = isLast ? '└─' : '├─';
            lines.push(
                `${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`
            );
            const newPrefix = prefix + (isLast ? "  " : "| ");
            const lastNds = obj.children.length - 1;
            obj.children.forEach((child, ndx) => {
                const isLast = ndx === lastNds;
                dumpObject(child, lines, isLast, newPrefix);

            });
            return lines;
        }

        let tables: THREE.Object3D | null = null;

        loader.load('Restaurant.glb', function (gltf) {
            scene.add(gltf.scene);

            tables = gltf.scene.getObjectByName('Tables');

            gltf.scene.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.transparent = true;
                    child.material.opacity = 1;
                    child.material.needsUpdate = true;
                }
            });

            gltf.scene.rotateX(1.57 / 2);
            gltf.scene.rotateY(1.57 / 2);
            gltf.scene.position.set(0, 0, -10);

            const lightAreaWidth = 10;
            const lightAreaHight = 10;
            const intensity = 3;
            const LightAreaColor = 0xFFA666;
            const lightArea = new THREE.RectAreaLight(LightAreaColor, intensity, lightAreaWidth, lightAreaHight);
            lightArea.position.set(0, 4, 0);
            lightArea.lookAt(0, 0, 0);
            gltf.scene.add(lightArea);

            const floorZ = floorZsRef.current[currentFloor] || 0;

            if (tables && 'children' in tables) {
                const tableCount = tables.children.length;
                currentRestaurant.floors[currentFloor]?.places.forEach((place, placeInd) => {
                    if (placeInd < tableCount && tables !== null && tables.children[placeInd] instanceof THREE.Object3D) {
                        const table = tables.children[placeInd];
                        
                        tables.children[placeInd].userData.TableID = place.id;

                        const worldPosition = new THREE.Vector3();
                        table.getWorldPosition(worldPosition);
                    }
                });
            }
        }, undefined, function (error) {
            console.error(error);
        });

        const TextureLoader = new THREE.TextureLoader();
        let distanceToNextFloorZ = 0;

        currentRestaurant.floors.forEach((floor, floorIndex) => {
            const floorMockUP = currentRestaurant.floors[floorIndex].mockup;
            const mockUPWidthPx = currentRestaurant.floors[floorIndex].mockup_width;
            const mockUPHeightPx = currentRestaurant.floors[floorIndex].mockup_height;

            const mockUP = TextureLoader.load(`${floorMockUP}`);
            mockUP.colorSpace = THREE.SRGBColorSpace;
            const geometry = new THREE.PlaneGeometry(16 / 3, 9 / 3);
            const material = new THREE.MeshBasicMaterial({ map: mockUP, side: THREE.DoubleSide, transparent: true, opacity: 0 });

            if (floorIndex === 0) {
                material.opacity = 1;
            } else {
                material.opacity = 0;
            }

            const plane = new THREE.Mesh(geometry, material);
            plane.userData.floorIndex = floorIndex;
            plane.position.set(2 * floorIndex, 0, distanceToNextFloorZ);
            floorsRef.current[floorIndex] = plane;

            floorZsRef.current[floorIndex] = distanceToNextFloorZ;
            distanceToNextFloorZ -= FLOOR_SPACING;
        });

        currentFloorRef.current = currentFloor + 1;

        seatsArrayRef.current.forEach(seat => scene.remove(seat));
        seatsArrayRef.current.length = 0;
    }, [currentFloor, currentRestaurant]);

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
                style={{ width: 1110, height: 600 }}
                onClick={(e) => scrollOff(e)}
            >

            </div>

            {seatIsSelected.length !== 0 ? (
                <div>
                    <h1>SEAT WAS SELECTED!!!!!!</h1>
                    <p>{seatIsSelected}</p>
                </div>
            ) : (
                null
            )}

            {/* <AnimatePresence mode='sync'>
                <motion.div
                    key={currentRestaurant?.floors[currentFloor].mockup}
                    className={`absolute top-0 left-0 w-full h-full`}
                    initial={{
                        scale: 1,
                        x: x.get(),
                    }}
                    exit={{
                        scale: .75,
                        opacity: 0,
                        x: x.get(),
                    }}
                    animate={{
                        scale: 1,
                        x: 0
                    }}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    transition={{
                        duration: .3,
                    }}
                >
                    <Image
                        src={`http://localhost:3000/${currentRestaurant?.floors[currentFloor].mockup}`}
                        alt="mockup"
                        fill // Layout fill для заполнения родителя
                        className="rounded-2xl opacity-100 object-contain"
                        sizes="(max-width: 1024px) 100vw, 1110px"
                    />
                </motion.div>
            </AnimatePresence>

            {currentRestaurant && currentRestaurant.floors[currentFloor].places.map((place, placeIndex) => (
                <Controller
                    key={place.id}
                    name='place_id'
                    control={control}
                    defaultValue={''}
                    render={({ field }) => (
                        <motion.div
                            key={place.id}>
                            <motion.div
                                className={`absolute min-h-[15px] min-w-[15px] w-[25px] h-[25px] rounded-full bg-orange-500 outline-2 z-30`}
                                style={{
                                    // width: `${2.25}%`,
                                    // height: `${2.25}%`,
                                    // minWidth: '15px',
                                    // minHeight: '15px',
                                    left: `calc(${place?.xPer}%)`,
                                    top: `calc(${place?.yPer}%)`,
                                }}
                                onClick={() => onClickHandler(place.id, placeIndex)}
                            >

                            </motion.div>

                            <motion.div
                                ref={(el: HTMLDivElement) => seatsRefs.current[placeIndex] = el}
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: visibleMenu[place?.id] ? 100 : 0,
                                    height: visibleMenu[place?.id] ? 400 : 0,
                                }}
                                transition={{
                                    duration: .3
                                }}
                                className={`overflow-hidden absolute w-[300px] bg-white rounded-xl `}
                                style={{
                                    left: `calc(${place?.xPer}%`,
                                    top: `calc(${place?.yPer}%`,
                                }}
                            >
                                <motion.div
                                    initial={{ width: '100%' }}
                                    transition={{
                                        duration: .3
                                    }}
                                    className={`flex justify-end gap-4 px-2 h-[25px] bg-orange-500`}
                                >
                                </motion.div>

                                <motion.div
                                    className={`${styles.place_card}`}
                                >
                                    <h3 className={`${styles.place_heading}`}>{place?.name}</h3>

                                    <p className={`${styles.place_description}`}>{place?.description}</p>

                                    <p className="text-black self-start">Мест: {place?.number_of_seats}</p>

                                    <div className="relative w-full h-28">
                                        <Image
                                            src={`http://localhost:3000/${place?.image}`}
                                            alt="design"
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded"
                                        />
                                    </div>
                                    {place?.status ? (
                                        <p className="text-black">Столик занят</p>
                                    ) : (
                                        <button
                                            className={`${styles.orange_button}`}
                                            type="button"
                                            disabled={seatsIsSelected ? true : false}
                                            onClick={() => {
                                                field.onChange(place?.id);
                                                ChangeSeatState(true);
                                            }}
                                        >
                                            Выбрать
                                        </button>
                                    )}
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    )}
                >
                </Controller>
            ))} */}
        </motion.div>
    )
}