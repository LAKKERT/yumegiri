"use client";

import { Control, Controller } from "react-hook-form";
import Script from 'next/script';
import Image from "next/image";
import * as THREE from "three";
import { motion, AnimatePresence, MotionValue, useAnimationFrame } from "framer-motion";
import styles from '@/app/styles/reservatoin/variables.module.scss';
import { Places } from "@/lib/interfaces/mockup";
import { Reservation } from "@/lib/interfaces/reservation";
import { RefObject, useRef, useEffect, useState, useCallback } from "react";

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

        // Создание холста
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.id = 'CanvasID';
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        containerRef.current.appendChild(renderer.domElement);

        // Дефолтные настройки камеры
        zoomScale.current = 3
        camera.zoom = zoomScale.current;
        camera.updateProjectionMatrix();

        // Инициализация Raycater
        const raycaster = new THREE.Raycaster();
        const pointer = new THREE.Vector2();

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
            scene.traverse((child) => {
                if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
                    (child.material as THREE.MeshBasicMaterial).color.set(0x000000);
                }
            });

            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, false);

            for (let i = 0; i < intersects.length; i++) {
                const obj = intersects[i].object;
                if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.SphereGeometry) {
                    const mat = obj.material as THREE.MeshBasicMaterial;
                    mat.color.set(0xffffff);
                    if (isClick.current) {
                        setSeatIsSelected(obj.uuid);
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
                console.log('zooming', zoomScale, camera.zoom);
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

            renderer.render(scene, camera);
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
        if (!currentRestaurant || !sceneRef.current || !currentRestaurant) return;

        floorsRef.current = [];
        floorZsRef.current = [];

        const scene = sceneRef.current;

        const TextureLoader = new THREE.TextureLoader();
        let distanceToNextFloorZ = 0;

        currentRestaurant.floors.forEach((floor, floorIndex) => {
            const mockUP = TextureLoader.load(`${currentRestaurant.floors[floorIndex].mockup}`);
            mockUP.colorSpace = THREE.SRGBColorSpace;
            const geometry = new THREE.PlaneGeometry(2, 2);
            const material = new THREE.MeshBasicMaterial({ map: mockUP, side: THREE.DoubleSide, transparent: true, opacity: 0 });

            if (floorIndex === 0) {
                material.opacity = 1;
            } else {
                material.opacity = 0;
            }

            const plane = new THREE.Mesh(geometry, material);
            plane.userData.floorIndex = floorIndex;
            plane.position.set(2 * floorIndex, 0, distanceToNextFloorZ);
            scene.add(plane);
            floorsRef.current[floorIndex] = plane;

            floorZsRef.current[floorIndex] = distanceToNextFloorZ;
            distanceToNextFloorZ -= FLOOR_SPACING;
        });

        currentFloorRef.current = currentFloor + 1;

        seatsArrayRef.current.forEach(seat => scene.remove(seat));
        seatsArrayRef.current.length = 0;

        const floorZ = floorZsRef.current[currentFloor] || 0;
        currentRestaurant.floors[currentFloor]?.places.forEach((place) => {
            const seatGeometry = new THREE.SphereGeometry(.05);
            const seatMaterial = new THREE.MeshBasicMaterial({ color: '#000000' });
            const seat = new THREE.Mesh(seatGeometry, seatMaterial);

            seat.uuid = place.id;

            seat.position.set(
                (place.xPer / 50) - 1,
                1 - (place.yPer / 50),
                floorZ + .01
            );

            scene.add(seat);
            seatsArrayRef.current.push(seat);
        });
    }, [currentFloor, currentRestaurant]);

    console.log('isClick', isClick)

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
        </motion.div>
    )
}