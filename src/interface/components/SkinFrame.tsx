import { Grid, BasicSpinner } from 'voxeliface';
import { useTexture, OrbitControls } from '@react-three/drei';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import React, { useRef, ReactNode, Suspense } from 'react';
import { Group, Texture, OneFactor, DoubleSide, AddEquation, NearestFilter, CustomBlending, PerspectiveCamera, Float32BufferAttribute, OneMinusSrcAlphaFactor } from 'three';

export interface SkinFrameProps {
	skin: any
	cape?: any
	slim?: boolean
	walk?: boolean
	width?: number
	height?: number
	control?: boolean
	children?: ReactNode
}
export default function SkinFrame({ skin, slim = false, cape, walk = false, width = 64, height = 64, control = false }: SkinFrameProps) {
	return <Grid width={width} height={height} alignItems="center" justifyContent="center">
		<Suspense fallback={<BasicSpinner/>}>
			<Canvas dpr={2} flat camera={{ fov: 8, far: 300, position: [0, 0, 1] }} linear frameloop="demand">
				<ambientLight intensity={1}/>
				<SkinModel slim={slim} cape={cape} walk={walk} texture={skin}/>
				{control && <OrbitControls enablePan={false} enableZoom={false} rotateSpeed={0.25} enableDamping={false}/>}
			</Canvas>
		</Suspense>
	</Grid>;
}

export interface SkinModelProps {
	slim: boolean
	walk: boolean
	cape?: string
	texture: string
}
export function SkinModel({ slim, walk, cape, texture }: SkinModelProps) {
	const color = useTexture(texture, t => (t as Texture).magFilter = NearestFilter);
	useThree(state => {
		const camera = state.camera as PerspectiveCamera;
		const distance = 4.5 + 16.5 / Math.tan(camera.fov / 180 * Math.PI / 2) / 0.9;
		camera.position.multiplyScalar(distance / camera.position.length());
		camera.updateProjectionMatrix();
	});
	return <group rotation={[0, Math.PI / 6, 0]}>
		<SkinObject slim={slim} walk={walk} texture={color}/>
		{cape && <Cape texture={cape}/>}
	</group>;
}

export interface SkinObjectProps {
	slim: boolean
	walk: boolean
	texture: Texture
}
export function SkinObject({ slim, walk, texture }: SkinObjectProps) {
	const leftArm = useRef<Group>(null!);
	const leftLeg = useRef<Group>(null!);
	const rightArm = useRef<Group>(null!);
	const rightLeg = useRef<Group>(null!);
	const { invalidate } = useThree();
	useFrame(({ clock }) => {
		const time = walk ? clock.getElapsedTime() * 4 : 1;
		leftArm.current.rotation.x = Math.sin(time + Math.PI) / 3;
		rightArm.current.rotation.x = Math.sin(time) / 3;

		leftLeg.current.rotation.x = Math.sin(time) / 3;
		rightLeg.current.rotation.x = Math.sin(time + Math.PI) / 3;

		if (walk || clock.getElapsedTime() === 0)
			invalidate();
	});

	const armX = slim ? 5.5 : 6;
	const armWidth = slim ? 3 : 4;
	return <group position={[0, 8, 0]}>
		<group name="head">
			<BodyPart uv={[0, 0, 8, 8, 8]} pos={[0, 4, 0]} size={[8, 8, 8]} texture={texture}/>
			<BodyPart uv={[32, 0, 8, 8, 8]} pos={[0, 4, 0]} size={[9, 9, 9]} texture={texture} isLayer/>
		</group>

		<group name="body" position={[0, -6, 0]}>
			<BodyPart uv={[16, 16, 8, 12, 4]} size={[8, 12, 4]} texture={texture}/>
			<BodyPart uv={[16, 32, 8, 12, 4]} size={[8.5, 12.5, 4.5]} texture={texture} isLayer/>
		</group>

		<group ref={leftArm} name="leftArm">
			<BodyPart uv={[32, 48, armWidth, 12, 4]} pos={[armX, -6, 0]} size={[armWidth, 12, 4]} texture={texture}/>
			<BodyPart uv={[48, 48, armWidth, 12, 4]} pos={[armX, -6, 0]} size={[armWidth + 1, 13, 5]} texture={texture} isLayer/>
		</group>

		<group ref={rightArm} name="rightArm">
			<BodyPart uv={[40, 16, armWidth, 12, 4]} pos={[-armX, -6, 0]} size={[armWidth, 12, 4]} texture={texture}/>
			<BodyPart uv={[40, 32, armWidth, 12, 4]} pos={[-armX, -6, 0]} size={[armWidth + 1, 13, 5]} texture={texture} isLayer/>
		</group>

		<group ref={leftLeg} name="leftLeg" position={[0, -10, 0]}>
			<BodyPart uv={[16, 48, 4, 12, 4]} pos={[2, -8, 0]} size={[4, 12, 4]} texture={texture}/>
			<BodyPart uv={[0, 48, 4, 12, 4]} pos={[2, -8, 0]} size={[5, 13, 5]} texture={texture} isLayer/>
		</group>

		<group ref={rightLeg} name="rightLeg" position={[0, -10, 0]}>
			<BodyPart uv={[0, 16, 4, 12, 4]} pos={[-2, -8, 0]} size={[4, 12, 4]} texture={texture}/>
			<BodyPart uv={[0, 32, 4, 12, 4]} pos={[-2, -8, 0]} size={[5, 13, 5]} texture={texture} isLayer/>
		</group>
	</group>;
}

export interface CapeProps {
	texture: string
}
export function Cape({ texture }: CapeProps) {
	const cape = useRef<Group>(null!);
	const color = useTexture(texture, t => (t as Texture).magFilter = NearestFilter);
	return <group ref={cape} name="cape" position={[0, 8, -2]} rotation={[Math.PI / 10, 0, 0]}>
		<BodyPart uv={[0, 0, 10, 16, 1]} cape pos={[0, -8, -0.5]} rot={[0, Math.PI, 0]} size={[10, 16, 1]} texture={color}/>
	</group>;
}

export interface BodyPartProps {
	uv: [number, number, number, number, number]
	pos?: [number, number, number]
	rot?: [number, number, number]
	size: [number, number, number]
	cape?: boolean
	texture: Texture
	isLayer?: boolean
}
export function BodyPart({ uv, pos, rot, size, cape, texture, isLayer }: BodyPartProps) {
	return <mesh position={pos} rotation={rot}>
		<boxGeometry args={size} attributes-uv={getUVs(...uv, 64, cape ? 32 : 64)}/>
		<meshStandardMaterial
			map={texture}
			side={isLayer ? DoubleSide : undefined}
			alphaTest={isLayer ? 1e-5 : undefined}
			transparent={isLayer}

			blending={CustomBlending}
			blendSrc={OneFactor}
			blendDst={OneMinusSrcAlphaFactor}
			blendEquation={AddEquation}
			blendSrcAlpha={OneFactor}
			blendDstAlpha={OneMinusSrcAlphaFactor}
		/>
	</mesh>;
}

function getUVs(u: number, v: number, width: number, height: number, depth: number, textureWidth: number, textureHeight: number) {
	// shrinking the uv inwards to partially avoid seams
	u += 0.01;
	v += 0.01;
	width -= 0.02;
	height -= 0.02;
	const toFaceVertices = (x1: number, y1: number, x2: number, y2: number) => [
		[x1 / textureWidth, 1 - y2 / textureHeight],
		[x2 / textureWidth, 1 - y2 / textureHeight],
		[x2 / textureWidth, 1 - y1 / textureHeight],
		[x1 / textureWidth, 1 - y1 / textureHeight]
	];
	const top = toFaceVertices(u + depth, v, u + width + depth, v + depth);
	const bottom = toFaceVertices(u + width + depth, v, u + width * 2 + depth, v + depth);
	const left = toFaceVertices(u, v + depth, u + depth, v + depth + height);
	const front = toFaceVertices(u + depth, v + depth, u + width + depth, v + depth + height);
	const right = toFaceVertices(u + width + depth, v + depth, u + width + depth * 2, v + height + depth);
	const back = toFaceVertices(u + width + depth * 2, v + depth, u + width * 2 + depth * 2, v + height + depth);

	return new Float32BufferAttribute([
		...right[3], ...right[2], ...right[0], ...right[1],
		...left[3], ...left[2], ...left[0], ...left[1],
		...top[3], ...top[2], ...top[0], ...top[1],
		...bottom[0], ...bottom[1], ...bottom[3], ...bottom[2],
		...front[3], ...front[2], ...front[0], ...front[1],
		...back[3], ...back[2], ...back[0], ...back[1]
	], 2);
}