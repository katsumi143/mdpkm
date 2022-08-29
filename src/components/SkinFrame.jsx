import React from 'react';
import { Vector3 } from 'three';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { SkinViewer, PlayerAnimation } from 'skinview3d';
export default function SkinFrame({ skin, cape, walk, zoom = false, image = false, model = 'auto-detect', width, height, control = false, stillWalk, background }) {
    const canvas = React.useRef();
    React.useLayoutEffect(() => {
        try {
            const skinViewer = new SkinViewer({
                width,
                height,
                canvas: image ? undefined : canvas.current,
                renderPaused: image
            });
            if (skin && !image)
                skinViewer.loadSkin(skin, {
                    model
                });
            if (cape && !image)
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
                skinViewer.playerObject.lookAt(new Vector3(12, 0, 24));
                composer.render();
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

            if (image) {
                skinViewer.loadSkin(skin, {
                    model
                }).then(async() => {
                    if (cape)
                        await skinViewer.loadCape(cape);
                    skinViewer.animation?.update(skinViewer.playerObject, 0);
                    skinViewer.render();

                    const img = canvas.current;
                    if (img) {
                        img.src = skinViewer.canvas.toDataURL();
                        img.width = skinViewer.width;
                        img.height = skinViewer.height;
                    }

                    skinViewer.dispose();
                });
            }
        
            skinViewer.renderer.forceContextRestore();
            return () => {
                skinViewer.dispose();
            };
        } catch(err) {
            console.log(err);
        }
    }, [skin, cape, model, width, height, control, walk, background]);
    if (image)
        return <img ref={canvas}/>
    else
        return <canvas ref={canvas}/>;
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