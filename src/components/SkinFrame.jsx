import React from 'react';
import { Vector3 } from 'three';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SkinViewer, RotatingAnimation, createOrbitControls } from 'skinview3d';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
export default function SkinFrame({ skin, cape, walk, zoom = false, model = 'auto-detect', width, height, rotate, control = false, stillWalk, background }) {
    const canvas = React.useRef();
    React.useLayoutEffect(() => {
        const skinViewer = new SkinViewer({
            width,
            height,
            canvas: canvas.current
        });
        if (skin)
            skinViewer.loadSkin(skin, model);
        if (cape)
            skinViewer.loadCape(cape);
        skinViewer.fov = 8;
        
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
            composer.render();
        };
    
        const viewerControl = createOrbitControls(skinViewer);
        viewerControl.enablePan = false;
        viewerControl.enableZoom = zoom;
        viewerControl.autoRotate = false;
        viewerControl.rotateSpeed = .25;
        viewerControl.enableRotate = control;
        skinViewer.playerObject.lookAt(new Vector3(12, 0, 24));

        if (background === 'none')
            skinViewer.renderer.setClearColor(0xffffff, 0);
        else 
            skinViewer.background = background;
    
        if (walk) 
            skinViewer.animations.add(WalkAnimation);
        if (stillWalk)
            skinViewer.animations.add(WalkAnimationStill);
        if (rotate)
            skinViewer.animations.add(RotatingAnimation);
    
        return () => {
            if (control)
                viewerControl.dispose();
            skinViewer.dispose();
        };
    }, [skin, cape, model, width, height, control, walk, background]);
    return <canvas ref={canvas}/>
};
function WalkAnimation({ skin }, time) {
	time *= 4;
    
	skin.leftLeg.rotation.x = Math.sin(time) / 3;
	skin.rightLeg.rotation.x = Math.sin(time + Math.PI) / 3;

	skin.leftArm.rotation.x = Math.sin(time + Math.PI) / 3;
	skin.rightArm.rotation.x = Math.sin(time) / 3;
};
function WalkAnimationStill({ skin }, time) {
	time = 5;
	skin.leftLeg.rotation.x = Math.sin(time) / 3;
	skin.rightLeg.rotation.x = Math.sin(time + Math.PI) / 3;

	skin.leftArm.rotation.x = Math.sin(time + Math.PI) / 3;
	skin.rightArm.rotation.x = Math.sin(time) / 3;
};