import React from 'react';
import { Vector3 } from 'three';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { SkinViewer, PlayerAnimation } from 'skinview3d';
export default function SkinFrame({ skin, cape, walk, zoom = false, model = 'auto-detect', width, height, control = false, stillWalk, background }) {
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
            skinViewer.playerObject.lookAt(new Vector3(12, 0, 24));
        };
    
        skinViewer.controls.enablePan = false;
        skinViewer.controls.enableZoom = zoom;
        skinViewer.controls.autoRotate = false;
        skinViewer.controls.rotateSpeed = .25;
        skinViewer.controls.enableRotate = control;

        if (background === 'none')
            skinViewer.renderer.setClearColor(0xffffff, 0);
        else 
            skinViewer.background = background;
    
        if (walk) 
            skinViewer.animation = new WalkAnimation();
        if (stillWalk)
            skinViewer.animation = new WalkAnimationStill();
    
        return () => skinViewer.dispose();
    }, [skin, cape, model, width, height, control, walk, background]);
    return <canvas ref={canvas}/>
};
class WalkAnimation extends PlayerAnimation {
    animate({ skin }) {
        const time = this.progress * 4;
        skin.leftLeg.rotation.x = Math.sin(time) / 3;
        skin.rightLeg.rotation.x = Math.sin(time + Math.PI) / 3;

        skin.leftArm.rotation.x = Math.sin(time + Math.PI) / 3;
        skin.rightArm.rotation.x = Math.sin(time) / 3;
    }
};
class WalkAnimationStill extends PlayerAnimation {
    animate({ skin }) {
        const time = 5;
        skin.leftLeg.rotation.x = Math.sin(time) / 3;
        skin.rightLeg.rotation.x = Math.sin(time + Math.PI) / 3;

        skin.leftArm.rotation.x = Math.sin(time + Math.PI) / 3;
        skin.rightArm.rotation.x = Math.sin(time) / 3;
    }
};