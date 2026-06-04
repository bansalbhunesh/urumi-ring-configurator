"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, PerspectiveCamera } from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import * as THREE from "three";
import { HybridRingModel, ModelBoundary } from "./RingModel";
import {
  getRingMotionReason,
  getRingMotionSeq,
  getRingPitchTarget,
  getRingYawTarget,
  getScrollVel,
  getScrollY,
  nudgeRing,
  setRingPose,
  setRingReveal,
  useConfigurator,
} from "@/store/configurator";

type Stage = {
  pos: THREE.Vector3;
  scale: number;
  camX?: number;
  camZ: number;
  lookX?: number;
  lookY: number;
  opacity: number;
};

const damp = THREE.MathUtils.damp;
const clamp = THREE.MathUtils.clamp;
const FILM_MAX_LINEAR_SPEED = 2.8;
const FILM_MAX_ANGULAR_SPEED = 5.5;
const COLLIDER_SCALE = 1.55;
const RING_BAND_COLLIDERS = Array.from({ length: 18 }, (_, index) => {
  const angle = (index / 18) * Math.PI * 2;
  const shoulderLift = Math.sin(angle) > 0.55 ? 0.08 : 0;
  return [
    Math.cos(angle) * 0.76 * COLLIDER_SCALE,
    (Math.sin(angle) * 0.68 - 0.06 + shoulderLift) * COLLIDER_SCALE,
    0,
  ] as const;
});

function readRingZone() {
  const y = getScrollY();
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const center = y + vh * 0.5;
  let zone = "hero";
  let progress = 0;

  if (typeof document !== "undefined") {
    const sections = document.querySelectorAll<HTMLElement>("[data-ring]");
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const top = rect.top + y;
      if (center >= top && center < top + rect.height) {
        zone = section.dataset.ring ?? "hero";
        progress = THREE.MathUtils.clamp(-rect.top / Math.max(1, rect.height - vh), 0, 1);
        break;
      }
    }
  }

  return { zone, progress, vh };
}

function springScalar(
  value: number,
  velocity: number,
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
) {
  const accel = (target - value) * stiffness - velocity * damping;
  const nextVelocity = velocity + accel * dt;
  return [value + nextVelocity * dt, nextVelocity] as const;
}

function springVector(
  value: THREE.Vector3,
  velocity: THREE.Vector3,
  target: THREE.Vector3,
  stiffness: number,
  damping: number,
  dt: number,
) {
  velocity.x += ((target.x - value.x) * stiffness - velocity.x * damping) * dt;
  velocity.y += ((target.y - value.y) * stiffness - velocity.y * damping) * dt;
  velocity.z += ((target.z - value.z) * stiffness - velocity.z * damping) * dt;
  value.addScaledVector(velocity, dt);
}

function ProductRing({
  mobile,
  reduceMotion,
}: {
  mobile: boolean;
  reduceMotion: boolean;
}) {
  const metal = useConfigurator((s) => s.metal);
  const previewMetal = useConfigurator((s) => s.previewMetal);
  const rigidRef = useRef<RapierRigidBody>(null);
  const cinematicStarted = useRef(false);
  const lastZone = useRef("hero");
  const eventStage = useRef(-1);
  const lastMotionSeq = useRef(getRingMotionSeq());
  const drag = useRef({ active: false, lastX: 0, torque: 0 });
  const gl = useThree((s) => s.gl);
  const rotationEuler = useMemo(() => new THREE.Euler(), []);
  const rotationQuat = useMemo(() => new THREE.Quaternion(), []);
  const reducedPose = useRef({
    yaw: -0.48,
    pitch: 0.16,
    roll: 0.08,
  });

  const resetCinematicBody = (ringRigid: RapierRigidBody) => {
    rotationEuler.set(mobile ? 1.1 : 0.85, mobile ? -0.4 : -0.95, mobile ? 0.55 : 0.75, "XYZ");
    rotationQuat.setFromEuler(rotationEuler);
    ringRigid.setTranslation(
      {
        x: mobile ? 0.06 : 0.42,
        y: mobile ? 2.4 : 3.2,
        z: mobile ? -0.08 : -0.22,
      },
      true,
    );
    ringRigid.setRotation(rotationQuat, true);
    ringRigid.setLinearDamping(mobile ? 0.85 : 0.62);
    ringRigid.setAngularDamping(mobile ? 1.15 : 0.86);
    ringRigid.setLinvel(
      {
        x: mobile ? -0.04 : -0.18,
        y: mobile ? -0.8 : -1.2,
        z: mobile ? 0.03 : 0.08,
      },
      true,
    );
    ringRigid.setAngvel(
      {
        x: mobile ? 0.95 : 1.85,
        y: mobile ? -0.52 : -1.05,
        z: mobile ? 0.8 : 1.48,
      },
      true,
    );
    ringRigid.applyImpulseAtPoint(
      {
        x: mobile ? -0.02 : -0.06,
        y: -0.035,
        z: mobile ? 0.015 : 0.04,
      },
      {
        x: mobile ? 0.08 : 0.2,
        y: 0.3,
        z: -0.12,
      },
      true,
    );
  };

  const parkCinematicBody = (ringRigid: RapierRigidBody) => {
    rotationEuler.set(mobile ? 1.0 : 0.78, mobile ? -0.32 : -0.62, mobile ? 0.2 : 0.34, "XYZ");
    rotationQuat.setFromEuler(rotationEuler);
    ringRigid.setTranslation(
      {
        x: mobile ? 0 : 0.12,
        y: mobile ? 1.02 : 1.03,
        z: mobile ? 0.02 : 0.08,
      },
      true,
    );
    ringRigid.setRotation(rotationQuat, true);
    ringRigid.setLinearDamping(4.2);
    ringRigid.setAngularDamping(5.4);
    ringRigid.setLinvel({ x: 0, y: 0, z: 0 }, true);
    ringRigid.setAngvel({ x: 0, y: 0, z: 0 }, true);
  };

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    drag.current.active = true;
    drag.current.lastX = event.clientX;
    gl.domElement.classList.add("is-dragging-ring");
    (event.target as Element)?.setPointerCapture?.(event.pointerId);
    event.stopPropagation();
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!drag.current.active) return;
    const delta = event.clientX - drag.current.lastX;
    drag.current.lastX = event.clientX;
    drag.current.torque += clamp(delta * (mobile ? 0.00055 : 0.00042), -0.08, 0.08);
    nudgeRing("pointer");
    event.stopPropagation();
  };

  const onPointerUp = (event: ThreeEvent<PointerEvent>) => {
    drag.current.active = false;
    gl.domElement.classList.remove("is-dragging-ring");
    event.stopPropagation();
  };

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.classList.add("can-drag-ring");
    return () => {
      canvas.classList.remove("can-drag-ring", "is-dragging-ring");
    };
  }, [gl]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const ringRigid = rigidRef.current;
      if (!ringRigid) return;
      if (event.key === "ArrowLeft") {
        ringRigid.applyTorqueImpulse({ x: 0.012, y: 0.035, z: -0.018 }, true);
      }
      if (event.key === "ArrowRight") {
        ringRigid.applyTorqueImpulse({ x: -0.012, y: -0.035, z: 0.018 }, true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useFrame((_state, dt) => {
    const step = Math.min(dt, 1 / 30);
    const scrollVel = clamp(getScrollVel(), -4.5, 4.5);
    const ringRigid = rigidRef.current;
    const { zone, progress } = readRingZone();
  const cinematicZone =
    zone === "impact" ||
    zone === "inspection" ||
    zone === "config" ||
    zone === "film" ||
    zone === "photo";

    if (!ringRigid) return;

    if (reduceMotion) {
      const yawTarget = getRingYawTarget();
      const pitchTarget = getRingPitchTarget();
      reducedPose.current.yaw = damp(reducedPose.current.yaw, yawTarget ?? -0.48, 7, step);
      reducedPose.current.pitch = damp(reducedPose.current.pitch, pitchTarget ?? 0.16, 7, step);
      reducedPose.current.roll = damp(reducedPose.current.roll, 0.08, 7, step);
      rotationEuler.set(reducedPose.current.pitch, reducedPose.current.yaw, reducedPose.current.roll, "XYZ");
      rotationQuat.setFromEuler(rotationEuler);
      ringRigid.setTranslation({ x: 0, y: 0.06, z: 0 }, true);
      ringRigid.setRotation(rotationQuat, true);
      ringRigid.setLinvel({ x: 0, y: 0, z: 0 }, true);
      ringRigid.setAngvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    if (zone !== lastZone.current) {
      if (zone === "impact" || zone === "film") {
        cinematicStarted.current = false;
        eventStage.current = -1;
      }
      lastZone.current = zone;
    }

    if (cinematicZone) {
      if (!cinematicStarted.current) {
        cinematicStarted.current = true;
        eventStage.current = 0;
        if (zone === "impact" || zone === "film") {
          resetCinematicBody(ringRigid);
        } else {
          parkCinematicBody(ringRigid);
        }
      }

      const nextStage =
        zone === "inspection"
          ? 3
          : zone === "config" || zone === "photo"
            ? 4
            : progress < 0.18
              ? 0
              : progress < 0.38
                ? 1
                : progress < 0.6
                  ? 2
                  : progress < 0.82
                    ? 3
                    : 4;
      if (nextStage !== eventStage.current) {
        eventStage.current = nextStage;
        if (nextStage === 1) {
          ringRigid.applyImpulseAtPoint(
            { x: mobile ? 0.032 : 0.085, y: 0.012, z: mobile ? -0.024 : -0.065 },
            { x: -0.22, y: -0.18, z: 0.14 },
            true,
          );
          ringRigid.applyTorqueImpulse({ x: -0.06, y: 0.045, z: -0.08 }, true);
        }
        if (nextStage === 2) {
          ringRigid.setLinearDamping(mobile ? 1.15 : 0.9);
          ringRigid.setAngularDamping(mobile ? 1.65 : 1.25);
          ringRigid.applyImpulseAtPoint(
            { x: mobile ? -0.022 : -0.065, y: 0.02, z: mobile ? 0.025 : 0.06 },
            { x: 0.18, y: 0.05, z: -0.12 },
            true,
          );
        }
        if (nextStage === 3) {
          ringRigid.setLinearDamping(mobile ? 2.1 : 1.7);
          ringRigid.setAngularDamping(mobile ? 3.0 : 2.35);
        }
        if (nextStage === 4) {
          ringRigid.setLinearDamping(3.8);
          ringRigid.setAngularDamping(5.0);
        }
      }

      const motionSeq = getRingMotionSeq();
      if (motionSeq !== lastMotionSeq.current) {
        lastMotionSeq.current = motionSeq;
        const reason = getRingMotionReason();
        const dir = reason === "stone" ? -1 : 1;
        const strength = reason === "pointer" ? 0.55 : reason === "park" ? 0.35 : 1;
        ringRigid.applyImpulseAtPoint(
          { x: 0.018 * dir * strength, y: 0.018 * strength, z: -0.012 * dir * strength },
          { x: 0.2 * dir, y: 0.16, z: -0.12 },
          true,
        );
        ringRigid.applyTorqueImpulse(
          { x: 0.025 * strength, y: -0.04 * dir * strength, z: 0.032 * strength },
          true,
        );
      }

      if (Math.abs(drag.current.torque) > 0.0001) {
        const torque = drag.current.torque;
        ringRigid.applyTorqueImpulse({ x: torque * 0.35, y: torque, z: -torque * 0.45 }, true);
        drag.current.torque *= 0.62;
      }

      const translation = ringRigid.translation();
      const linvel = ringRigid.linvel();
      const target = {
        x: mobile ? 0 : zone === "config" ? 0.18 : zone === "inspection" ? 0.03 : progress > 0.62 ? -0.04 : 0.06,
        y: mobile ? 1.0 : 1.04,
        z: zone === "config" ? 0.08 : progress > 0.55 ? 0.02 : -0.02,
      };
      /* Centering pull — just a gentle nudge, gravity + floor do the real work.
         Only the x/z axes pull toward centre; y is left to gravity entirely
         so the ring falls and bounces naturally. */
      const pull =
        zone === "config" || zone === "photo"
          ? 0.02
          : zone === "inspection"
            ? 0.012
            : progress > 0.6
              ? 0.01
              : 0.0045;
      ringRigid.applyImpulse(
        {
          x: (target.x - translation.x) * pull - linvel.x * 0.004,
          y: 0, // no artificial lift — let gravity and floor handle y
          z: (target.z - translation.z) * pull - linvel.z * 0.004,
        },
        true,
      );

      /* Scroll → torque: scrolling faster kicks the ring harder,
         like flicking a real object with your finger. */
      const scrollTorque = clamp(scrollVel * 0.003, -0.024, 0.024);
      if (Math.abs(scrollTorque) > 0.001 && progress > 0.25) {
        ringRigid.applyTorqueImpulse({ x: scrollTorque * 0.6, y: scrollTorque, z: -scrollTorque * 0.5 }, true);
        /* Scroll also gives a small upward kick — the ring lifts off
           the floor briefly like a coin being flicked on a table. */
        if (Math.abs(scrollVel) > 1.2) {
          ringRigid.applyImpulse(
            { x: 0, y: clamp(Math.abs(scrollVel) * 0.004, 0, 0.02), z: 0 },
            true,
          );
        }
      }

      const cappedLinvel = ringRigid.linvel();
      const linearSpeed = Math.hypot(cappedLinvel.x, cappedLinvel.y, cappedLinvel.z);
      if (linearSpeed > FILM_MAX_LINEAR_SPEED) {
        const ratio = FILM_MAX_LINEAR_SPEED / linearSpeed;
        ringRigid.setLinvel(
          {
            x: cappedLinvel.x * ratio,
            y: cappedLinvel.y * ratio,
            z: cappedLinvel.z * ratio,
          },
          true,
        );
      }

      const cappedAngvel = ringRigid.angvel();
      const angularSpeed = Math.hypot(cappedAngvel.x, cappedAngvel.y, cappedAngvel.z);
      if (angularSpeed > FILM_MAX_ANGULAR_SPEED) {
        const ratio = FILM_MAX_ANGULAR_SPEED / angularSpeed;
        ringRigid.setAngvel(
          {
            x: cappedAngvel.x * ratio,
            y: cappedAngvel.y * ratio,
            z: cappedAngvel.z * ratio,
          },
          true,
        );
      }

      if (
        translation.y < -0.85 ||
        Math.abs(translation.x) > 1.9 ||
        Math.abs(translation.z) > 1.7
      ) {
        resetCinematicBody(ringRigid);
      }
      return;
    }

    const yawTarget = getRingYawTarget();
    const pitchTarget = getRingPitchTarget();
    reducedPose.current.yaw = damp(reducedPose.current.yaw, yawTarget ?? -0.42, 5, step);
    reducedPose.current.pitch = damp(reducedPose.current.pitch, pitchTarget ?? 0.12, 5, step);
    reducedPose.current.roll = damp(reducedPose.current.roll, 0.06, 5, step);
    if (zone === "hidden") {
      ringRigid.setTranslation({ x: 0, y: -0.2, z: 0 }, true);
    } else {
      rotationEuler.set(reducedPose.current.pitch, reducedPose.current.yaw, reducedPose.current.roll, "XYZ");
      rotationQuat.setFromEuler(rotationEuler);
      ringRigid.setTranslation({ x: 0, y: Math.abs(scrollVel) * 0.002, z: 0 }, true);
      ringRigid.setRotation(rotationQuat, true);
    }
    ringRigid.setLinvel({ x: 0, y: 0, z: 0 }, true);
    ringRigid.setAngvel({ x: 0, y: 0, z: 0 }, true);
  });

  return (
    <Physics gravity={[0, mobile ? -3.2 : -4.8, 0]} timeStep="vary">
      <RigidBody
        ref={rigidRef}
        type="dynamic"
        colliders={false}
        canSleep={false}
        ccd
        linearDamping={0.62}
        angularDamping={0.86}
        friction={1.32}
        restitution={0.16}
        position={[0, 0, 0]}
      >
        {RING_BAND_COLLIDERS.map((point, index) => (
          <BallCollider
            key={index}
            args={[mobile ? 0.2 : 0.225]}
            position={point}
            friction={1.55}
            restitution={0.14}
          />
        ))}
        <CuboidCollider
          args={[0.52, 0.46, 0.34]}
          position={[0, 1.2, 0.04]}
          friction={1.28}
          restitution={0.12}
        />
        <CuboidCollider
          args={[0.28, 0.18, 0.32]}
          position={[0, 1.5, 0.08]}
          friction={1.12}
          restitution={0.1}
        />
        <group
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <ModelBoundary fallback={<LoadingRing mobile={mobile} />}>
            <HybridRingModel metalId={previewMetal ?? metal} mobile={mobile} />
          </ModelBoundary>
        </group>
      </RigidBody>
      <RigidBody type="fixed" position={[0, -0.34, 0]} rotation={[-0.045, 0, 0.018]} friction={2.35} restitution={0.08}>
        <CuboidCollider args={[2.8, 0.04, 2.6]} />
      </RigidBody>
      <RigidBody type="fixed" position={[-0.02, -0.22, 0.04]} rotation={[-0.03, 0, -0.1]}>
        <CuboidCollider args={[0.48, 0.028, 0.52]} friction={2.4} restitution={0.06} />
      </RigidBody>
      <RigidBody type="fixed" position={[-0.78, -0.2, 0.16]} rotation={[0, 0.08, 0]}>
        <CuboidCollider args={[0.035, 0.48, 1.2]} friction={2.0} restitution={0.12} />
      </RigidBody>
      <RigidBody type="fixed" position={[0.92, -0.2, -0.08]} rotation={[0, -0.06, 0]}>
        <CuboidCollider args={[0.035, 0.44, 1.2]} friction={2.0} restitution={0.1} />
      </RigidBody>
      <RigidBody type="fixed" position={[0.04, -0.22, -0.84]}>
        <CuboidCollider args={[1.25, 0.42, 0.035]} friction={1.95} restitution={0.1} />
      </RigidBody>
    </Physics>
  );
}

function StageDirector({
  isDesktop,
  reduceMotion,
  ringGroupRef,
}: {
  isDesktop: boolean;
  reduceMotion: boolean;
  ringGroupRef: RefObject<THREE.Group | null>;
}) {
  const groupPos = useRef(new THREE.Vector3(isDesktop ? 1.04 : 0, isDesktop ? -0.04 : 1.26, 0));
  const groupVel = useRef(new THREE.Vector3(0, 0, 0));
  const scale = useRef(isDesktop ? 0.98 : 0.32);
  const scaleVel = useRef(0);
  const camX = useRef(0);
  const camXVel = useRef(0);
  const camZ = useRef(isDesktop ? 7.42 : 8.6);
  const camZVel = useRef(0);
  const lookX = useRef(0);
  const lookXVel = useRef(0);
  const lookY = useRef(isDesktop ? 0.52 : 0.78);
  const lookYVel = useRef(0);
  const reveal = useRef(1);
  const previousZone = useRef("hero");
  const previousFilmBeat = useRef(-1);

  useFrame((state, dt) => {
    const step = Math.min(dt, 1 / 30);
    const y = getScrollY();
    const scrollVel = clamp(getScrollVel(), -4.5, 4.5);
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;
    const center = y + vh * 0.5;
    let zone = "hero";
    let zoneProgress = 0;

    if (typeof document !== "undefined") {
      const sections = document.querySelectorAll<HTMLElement>("[data-ring]");
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        const top = rect.top + y;
        if (center >= top && center < top + rect.height) {
          zone = section.dataset.ring ?? "hero";
          zoneProgress = THREE.MathUtils.clamp(-rect.top / Math.max(1, rect.height - vh), 0, 1);
          break;
        }
      }
    }

    const benchEase = THREE.MathUtils.smoothstep(zoneProgress, 0.05, 0.72);
    const bench: Stage = isDesktop
      ? {
          pos: new THREE.Vector3(
            THREE.MathUtils.lerp(0.72, 0.98, benchEase),
            THREE.MathUtils.lerp(-0.02, -0.08, benchEase),
            0,
          ),
          scale: THREE.MathUtils.lerp(0.64, 0.78, benchEase),
          camZ: THREE.MathUtils.lerp(7.8, 7.35, benchEase),
          lookY: THREE.MathUtils.lerp(0.54, 0.48, benchEase),
          opacity: 1,
        }
      : {
          pos: new THREE.Vector3(
            0,
            THREE.MathUtils.lerp(1.36, 1.22, benchEase),
            0,
          ),
          scale: THREE.MathUtils.lerp(0.32, 0.38, benchEase),
          camZ: THREE.MathUtils.lerp(8.6, 8.35, benchEase),
          lookY: THREE.MathUtils.lerp(0.8, 0.72, benchEase),
          opacity: 1,
        };
    const hero: Stage = isDesktop
      ? { pos: new THREE.Vector3(1.3, 0.02, 0), scale: 0.84, camZ: 8.0, lookY: 0.5, opacity: 1 }
      : { pos: new THREE.Vector3(0, 1.95, 0), scale: 0.38, camZ: 8.7, lookY: 0.84, opacity: 1 };
    const filmBeat =
      zoneProgress < 0.2 ? 0 : zoneProgress < 0.48 ? 1 : zoneProgress < 0.66 ? 2 : 3;
    const filmEase = THREE.MathUtils.smoothstep(zoneProgress, 0.02, 0.92);
    const filmStations = [
      { pos: new THREE.Vector3(0.72, -0.48, 0), scale: 0.64, camX: -0.18, camZ: 7.68, lookX: 0.06, lookY: 0.34 },
      { pos: new THREE.Vector3(0.94, -0.5, 0), scale: 0.54, camX: 0.08, camZ: 7.38, lookX: 0.04, lookY: 0.32 },
      { pos: new THREE.Vector3(0.72, -0.44, 0), scale: 0.52, camX: 0.28, camZ: 7.34, lookX: -0.02, lookY: 0.32 },
      { pos: new THREE.Vector3(0.06, -0.42, 0), scale: 0.51, camX: 0.38, camZ: 7.46, lookX: -0.03, lookY: 0.34 },
    ] as const;
    const filmStation = filmStations[filmBeat];
    const film: Stage = isDesktop
      ? {
          pos: filmStation.pos,
          scale: filmStation.scale,
          camX: filmStation.camX,
          camZ: filmStation.camZ,
          lookX: filmStation.lookX,
          lookY: filmStation.lookY,
          opacity: 1,
        }
      : {
          pos: new THREE.Vector3(
            0,
            THREE.MathUtils.lerp(1.08, 0.7, filmEase),
            0,
          ),
          scale: THREE.MathUtils.lerp(0.36, 0.38, filmEase),
          camX: THREE.MathUtils.lerp(0, 0.12, filmEase),
          camZ: THREE.MathUtils.lerp(8.6, 8.1, filmEase),
          lookX: THREE.MathUtils.lerp(0, -0.04, filmEase),
          lookY: THREE.MathUtils.lerp(0.78, 0.6, filmEase),
          opacity: 1,
        };
    const photoEase = THREE.MathUtils.smoothstep(zoneProgress, 0.02, 0.5);
    const photoExit = THREE.MathUtils.smoothstep(zoneProgress, 0.06, 0.18);
    const photoFade = 1 - photoExit;
    const photo: Stage = isDesktop
      ? {
          pos: new THREE.Vector3(
            THREE.MathUtils.lerp(0.16, 0.02, photoEase),
            THREE.MathUtils.lerp(0.04, 0.1, photoEase),
            0,
          ),
          scale: THREE.MathUtils.lerp(0.46, 0.0001, photoExit),
          camX: THREE.MathUtils.lerp(0.38, -0.18, photoEase),
          camZ: THREE.MathUtils.lerp(7.38, 7.75, photoEase),
          lookX: THREE.MathUtils.lerp(-0.04, 0.08, photoEase),
          lookY: THREE.MathUtils.lerp(0.48, 0.5, photoEase),
          opacity: photoFade,
        }
      : {
          pos: new THREE.Vector3(0, THREE.MathUtils.lerp(0.78, 0.66, photoEase), 0),
          scale: THREE.MathUtils.lerp(0.3, 0.0001, photoExit),
          camX: THREE.MathUtils.lerp(0.12, -0.06, photoEase),
          camZ: THREE.MathUtils.lerp(8.25, 8.6, photoEase),
          lookX: THREE.MathUtils.lerp(-0.04, 0.02, photoEase),
          lookY: THREE.MathUtils.lerp(0.64, 0.62, photoEase),
          opacity: photoFade,
        };
    const anatomyEase = THREE.MathUtils.smoothstep(zoneProgress, 0.08, 0.82);
    const anatomy: Stage = isDesktop
      ? {
          pos: new THREE.Vector3(
            THREE.MathUtils.lerp(0.58, 0.9, anatomyEase),
            THREE.MathUtils.lerp(-0.02, -0.1, anatomyEase),
            0,
          ),
          scale: THREE.MathUtils.lerp(0.72, 0.82, anatomyEase),
          camZ: THREE.MathUtils.lerp(7.7, 7.25, anatomyEase),
          lookY: THREE.MathUtils.lerp(0.52, 0.47, anatomyEase),
          opacity: 1,
        }
      : {
          pos: new THREE.Vector3(
            0,
            THREE.MathUtils.lerp(0.78, 0.58, anatomyEase),
            0,
          ),
          scale: THREE.MathUtils.lerp(0.34, 0.4, anatomyEase),
          camZ: THREE.MathUtils.lerp(8.55, 8.25, anatomyEase),
          lookY: THREE.MathUtils.lerp(0.72, 0.66, anatomyEase),
          opacity: 1,
        };
    const materialsEase = THREE.MathUtils.smoothstep(zoneProgress, 0.05, 0.86);
    const materials: Stage = isDesktop
      ? {
          pos: new THREE.Vector3(
            THREE.MathUtils.lerp(0.24, 0.1, materialsEase),
            THREE.MathUtils.lerp(-0.28, -0.34, materialsEase),
            0,
          ),
          scale: THREE.MathUtils.lerp(0.34, 0.4, materialsEase),
          camZ: THREE.MathUtils.lerp(7.9, 7.65, materialsEase),
          lookY: THREE.MathUtils.lerp(0.5, 0.48, materialsEase),
          opacity: 1,
        }
      : {
          pos: new THREE.Vector3(
            0,
            THREE.MathUtils.lerp(0.54, 0.44, materialsEase),
            0,
          ),
          scale: THREE.MathUtils.lerp(0.36, 0.42, materialsEase),
          camZ: THREE.MathUtils.lerp(8.4, 8.1, materialsEase),
          lookY: THREE.MathUtils.lerp(0.66, 0.62, materialsEase),
          opacity: 1,
        };
    const stage: Stage = isDesktop
      ? { pos: new THREE.Vector3(1.7, -0.02, 0), scale: 0.58, camZ: 8.2, lookY: 0.46, opacity: 1 }
      : { pos: new THREE.Vector3(0, 0.5, 0), scale: 0.0001, camZ: 8.6, lookY: 0.55, opacity: 0 };
    const finale: Stage = isDesktop
      ? { pos: new THREE.Vector3(0, -0.02, 0), scale: 0.58, camZ: 8.2, lookY: 0.48, opacity: 1 }
      : { pos: new THREE.Vector3(0, 0.2, 0), scale: 0.36, camZ: 8.8, lookY: 0.5, opacity: 1 };
    const hidden: Stage = { pos: new THREE.Vector3(0, 0.2, 0), scale: 0.0001, camZ: 8.6, lookY: 0.55, opacity: 0 };

    const target =
      zone === "impact" || zone === "film"
        ? film
        : zone === "inspection"
          ? anatomy
          : zone === "config"
            ? materials
        : zone === "photo"
          ? photo
        : zone === "bench"
        ? bench
        : zone === "anatomy"
          ? anatomy
        : zone === "materials"
          ? materials
        : zone === "stage"
          ? stage
          : zone === "finale"
            ? finale
            : zone === "hidden"
              ? hidden
              : hero;

    if (zone !== previousZone.current) {
      previousZone.current = zone;
      groupVel.current.x += zone === "impact" || zone === "film" ? -0.04 : 0.04;
      groupVel.current.y += 0.03;
      camZVel.current += zone === "hidden" ? 0.22 : -0.06;
    }
    if ((zone === "impact" || zone === "film") && filmBeat !== previousFilmBeat.current) {
      const direction = previousFilmBeat.current < filmBeat ? 1 : -1;
      previousFilmBeat.current = filmBeat;
      groupVel.current.x += direction * (filmBeat === 3 ? -0.12 : -0.07);
      groupVel.current.y += filmBeat === 1 ? -0.04 : 0.05;
      camZVel.current += filmBeat === 1 ? -0.1 : 0.06;
    }

    if (zone === "bench") {
      const yaw = THREE.MathUtils.lerp(-0.12, -0.58, benchEase);
      const pitch = THREE.MathUtils.lerp(0.02, 0.22, benchEase);
      setRingPose(yaw, pitch);
    }
    if (
      zone === "impact" ||
      zone === "inspection" ||
      zone === "config" ||
      zone === "film" ||
      zone === "photo"
    ) {
      setRingPose(null, null);
    }
    if (zone === "anatomy") {
      const yaw = THREE.MathUtils.lerp(-0.72, 0.92, anatomyEase);
      const pitch = THREE.MathUtils.lerp(0.16, 0.05, anatomyEase);
      setRingPose(yaw, pitch);
    }
    if (zone === "materials") {
      const yaw = THREE.MathUtils.lerp(-0.35, -0.82, materialsEase);
      const pitch = THREE.MathUtils.lerp(0.12, 0.2, materialsEase);
      setRingPose(yaw, pitch);
    }

    if (reduceMotion) {
      reveal.current = target.opacity;
      groupPos.current.copy(target.pos);
      groupVel.current.set(0, 0, 0);
      scale.current = target.scale;
      scaleVel.current = 0;
      camX.current = target.camX ?? 0;
      camXVel.current = 0;
      camZ.current = target.camZ;
      camZVel.current = 0;
      lookX.current = target.lookX ?? 0;
      lookXVel.current = 0;
      lookY.current = target.lookY;
      lookYVel.current = 0;
    } else {
      groupVel.current.x += scrollVel * 0.014;
      groupVel.current.y += -Math.abs(scrollVel) * 0.004;
      camXVel.current += scrollVel * 0.006;
      camZVel.current += scrollVel * 0.012;
      lookXVel.current += scrollVel * 0.002;
      lookYVel.current += -scrollVel * 0.004;

      springVector(groupPos.current, groupVel.current, target.pos, 42, 13.5, step);

      if (groupPos.current.y < target.pos.y - 0.16) {
        groupPos.current.y = target.pos.y - 0.16;
        groupVel.current.y *= -0.32;
      }

      [scale.current, scaleVel.current] = springScalar(
        scale.current,
        scaleVel.current,
        target.scale,
        34,
        12,
        step,
      );
      [camX.current, camXVel.current] = springScalar(
        camX.current,
        camXVel.current,
        target.camX ?? 0,
        24,
        10,
        step,
      );
      [camZ.current, camZVel.current] = springScalar(
        camZ.current,
        camZVel.current,
        target.camZ,
        28,
        10,
        step,
      );
      [lookX.current, lookXVel.current] = springScalar(
        lookX.current,
        lookXVel.current,
        target.lookX ?? 0,
        30,
        11,
        step,
      );
      [lookY.current, lookYVel.current] = springScalar(
        lookY.current,
        lookYVel.current,
        target.lookY,
        32,
        11,
        step,
      );
      reveal.current = damp(reveal.current, target.opacity, 7, step);
    }

    setRingReveal(Math.max(0, Math.min(1, scale.current / 0.58)));

    const group = ringGroupRef.current;
    if (group) {
      group.position.copy(groupPos.current);
      const photoHandedOff = zone === "photo" && zoneProgress > 0.16;
      group.scale.setScalar(photoHandedOff ? 0.0001 : Math.max(scale.current, 0.0001));
      group.visible = reveal.current > 0.02 && !photoHandedOff;
    }
    state.camera.position.set(camX.current, 0.52, camZ.current);
    state.camera.lookAt(lookX.current, lookY.current, 0);
  });

  return null;
}

function StudioLights() {
  return (
    <>
      <Environment resolution={128} frames={1} environmentIntensity={1.55}>
        <Lightformer form="rect" intensity={7.4} position={[-4.2, 4.8, 4]} scale={[5.2, 3.8, 1]} />
        <Lightformer form="rect" intensity={4.8} position={[4.2, 2.4, -3.4]} scale={[3.8, 3.1, 1]} />
        <Lightformer form="ring" intensity={4.2} position={[0, 4.8, 1.2]} scale={[2.6, 2.6, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[0, -1.4, 4]} scale={[6, 0.8, 1]} />
      </Environment>
      <ambientLight intensity={0.26} />
      <spotLight
        position={[-5, 8, 7]}
        angle={0.38}
        penumbra={1}
        intensity={4.1}
        color="#fff6ec"
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[6, 5, -5]}
        angle={0.55}
        penumbra={1}
        intensity={2.0}
        color="#cddcff"
      />
      <pointLight position={[3.5, -1, 3]} intensity={0.52} color="#e8cda0" />
      <pointLight position={[0, 6, 1]} intensity={1.1} color="#fff8f0" />
      <ContactShadows
        position={[0, -0.36, 0]}
        opacity={0.66}
        scale={6}
        blur={2.8}
        far={4.5}
        color="#1a130b"
      />
    </>
  );
}

function LoadingRing({ mobile }: { mobile: boolean }) {
  const metal = useConfigurator((s) => s.previewMetal ?? s.metal);
  const color =
    metal === "yellow-gold" ? "#d2ac55" : metal === "rose-gold" ? "#d6a08d" : "#d9dde0";

  return (
    <group rotation={[mobile ? 0.05 : 0.1, -0.42, 0.03]}>
      <mesh position={[0, -0.08, 0]}>
        <torusGeometry args={[1.02, 0.055, 28, 128]} />
        <meshStandardMaterial color={color} metalness={0.58} roughness={0.28} />
      </mesh>
      <mesh position={[-0.18, 0.84, 0.07]} rotation={[0, 0, -0.58]}>
        <torusGeometry args={[0.42, 0.035, 18, 80, Math.PI * 1.08]} />
        <meshStandardMaterial color={color} metalness={0.58} roughness={0.24} />
      </mesh>
      <mesh position={[0.18, 0.84, -0.05]} rotation={[0, 0, 0.58]}>
        <torusGeometry args={[0.42, 0.032, 18, 80, Math.PI * 1.08]} />
        <meshStandardMaterial color={color} metalness={0.58} roughness={0.24} />
      </mesh>
      {Array.from({ length: 12 }).map((_, index) => (
        <mesh
          key={index}
          position={[0.44 + Math.cos(index * 0.11) * 0.08, 0.66 + index * 0.055, 0.08]}
          scale={0.032}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#f7fbff" metalness={0.05} roughness={0.08} />
        </mesh>
      ))}
      <mesh position={[0, 1.23, 0]} scale={[0.25, 0.25, 0.2]}>
        <octahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#f9fbff" metalness={0.02} roughness={0.04} transparent opacity={0.66} />
      </mesh>
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, 1.06, 0.07]} rotation={[0.25, 0, x > 0 ? -0.18 : 0.18]} scale={[0.026, 0.17, 0.026]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={color} metalness={0.58} roughness={0.24} />
        </mesh>
      ))}
    </group>
  );
}

export default function Scene() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );
  const [reduceMotion, setReduceMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const ringGroupRef = useRef<THREE.Group>(null);
  const cartOpen = useConfigurator((s) => s.cartOpen);
  const [docHidden, setDocHidden] = useState(
    () => typeof document !== "undefined" && document.hidden,
  );

  useEffect(() => {
    const onVis = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-20 h-full w-full">
      <Canvas
        shadows
        dpr={[1, isDesktop ? 1.5 : 1.25]}
        frameloop={cartOpen || docHidden ? "never" : "always"}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.setClearAlpha(0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
          gl.outputColorSpace = THREE.SRGBColorSpace;
        }}
        style={{ pointerEvents: "auto" }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.52, 7.2]} fov={31} />
        <StudioLights />
        <group ref={ringGroupRef}>
          <Suspense fallback={<LoadingRing mobile={!isDesktop} />}>
            <ProductRing mobile={!isDesktop} reduceMotion={reduceMotion} />
          </Suspense>
        </group>
        <StageDirector
          isDesktop={isDesktop}
          reduceMotion={reduceMotion}
          ringGroupRef={ringGroupRef}
        />
      </Canvas>
    </div>
  );
}
