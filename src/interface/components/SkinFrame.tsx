import { CSS } from '@stitches/react';
import { Vector3 } from 'three';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { Grid, Image } from 'voxeliface';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { SkinViewer, PlayerObject, PlayerAnimation } from 'skinview3d';
import React, { useMemo, useState, useEffect, ReactNode } from 'react';

export type SkinFrameProps = {
	css?: CSS,
	skin: any,
	cape?: any,
	walk?: boolean,
	zoom?: boolean,
	width?: number,
	image?: boolean,
	model?: 'auto-detect' | 'default' | 'slim',
	height?: number,
	control?: boolean,
	children?: ReactNode,
	stillWalk?: boolean,
	background?: 'none' | string
};
export default function SkinFrame({ css, skin, cape, walk, zoom = false, image = false, model = 'auto-detect', width = 64, height = 64, control = false, children, stillWalk, background }: SkinFrameProps) {
	const skinViewer = useMemo(() => new SkinViewer({
		fov: 8,
		width,
		height,
		canvas: document.createElement('canvas'),
		renderPaused: image
	}), []);
	const [src, setSrc] = useState<string | undefined>();
	useEffect(() => {
		if (skin && !image)
			skinViewer.loadSkin(skin, { model });
	}, [skin]);
	useEffect(() => {
		if (cape && !image)
			skinViewer.loadCape(cape);
	}, [cape]);
	useEffect(() => {
		skinViewer.setSize(width, height);

		skinViewer.controls.enableZoom, skinViewer.controls.enableRotate = zoom, control;
	}, [width, height, zoom, control]);
	useEffect(() => {
		if (background === 'none')
			skinViewer.renderer.setClearColor(0xffffff, 0);
		else if (background)
			skinViewer.background = background;
	}, [background]);
	useEffect(() => {
		if (image)
			skinViewer.loadSkin(skin, {
				model
			})?.then(async() => {
				if (cape)
					await skinViewer.loadCape(cape);
				skinViewer.animation?.update(skinViewer.playerObject, 0);
				skinViewer.render();

				setSrc(skinViewer.canvas.toDataURL());
				skinViewer.dispose();
			});
	}, [image]);
	useEffect(() => {
		if (walk) 
			skinViewer.animation = new WalkAnimation();
		if (stillWalk)
			skinViewer.animation = new WalkAnimationStill();
	}, [walk, stillWalk]);
    useEffect(() => {
		const composer = new EffectComposer(skinViewer.renderer);
		const renderPass = new RenderPass(skinViewer.scene, skinViewer.camera);
		const fxaaPass = new ShaderPass(FXAAShader);
		composer.addPass(renderPass);
		composer.addPass(fxaaPass);

		composer.setSize(width, height);

		const pixelRatio = skinViewer.renderer.getPixelRatio();
		composer.setPixelRatio(pixelRatio);
		fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
		fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);

		skinViewer.render = () => {
			skinViewer.playerObject.lookAt(new Vector3(12, 0, 24));
			composer.render();
		};
	
		skinViewer.controls.enablePan = false;
		skinViewer.controls.autoRotate = false;
		skinViewer.controls.rotateSpeed = .25;
	
		skinViewer.renderer.forceContextRestore();
		return () => skinViewer.dispose();
    }, []);

	if (image)
		return <Image src={src} width={width} height={height} css={{
			position: 'relative', ...css
		}}>{children}</Image>;
    return <Grid ref={node => node && node.appendChild(skinViewer.canvas)} width={width} height={height} css={{
		position: 'relative', ...css
	}}>{children}</Grid>;
};

class WalkAnimation extends PlayerAnimation {
    animate({ skin, cape }: PlayerObject) {
        const time = this.progress * 4;
        skin.leftLeg.rotation.x = Math.sin(time) / 3;
        skin.rightLeg.rotation.x = Math.sin(time + Math.PI) / 3;

        skin.leftArm.rotation.x = Math.sin(time + Math.PI) / 3;
        skin.rightArm.rotation.x = Math.sin(time) / 3;

		cape.rotation.x = Math.PI / 10 + Math.sin(time / 4) / 30;
    }
};
class WalkAnimationStill extends PlayerAnimation {
    animate({ skin, cape }: PlayerObject) {
        const time = 5;
        skin.leftLeg.rotation.x = Math.sin(time) / 3;
        skin.rightLeg.rotation.x = Math.sin(time + Math.PI) / 3;

        skin.leftArm.rotation.x = Math.sin(time + Math.PI) / 3;
        skin.rightArm.rotation.x = Math.sin(time) / 3;

		cape.rotation.x = Math.PI / 10 + Math.sin(time / 4) / 30;
    }
};