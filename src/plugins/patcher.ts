import React, { ReactNode } from 'react';

// For plugin developers:
// https://docs.mdpkm.voxelified.com/docs/plugin-api/patcher
type PatchFunction = (child: ReactNode) => ReactNode;
export default class Patcher {
    static patches: Record<string, PatchFunction[]> = {};
    static registered: Record<string, any> = {};
    static register<T extends Function>(func: T) {
        const newFunction = (...args: any[]) => {
            let returnValue = func(...args);
            if (this.patches[func.name])
                for (const patch of this.patches[func.name]) {
                    try {
                        if (returnValue)
                            returnValue = patch(returnValue) ?? returnValue;
                    } catch(err) {
                        console.warn(err);
                    }
                }
            return returnValue;
        };
        this.registered[func.name] = newFunction;
        return newFunction;
    }
    
    // https://docs.mdpkm.voxelified.com/docs/plugin-api/patcher#patch
    static patch(name: string, func: PatchFunction) {
        (this.patches[name] = this.patches[name] ?? []).push(func);
    }

    // https://docs.mdpkm.voxelified.com/docs/plugin-api/patcher#patchchild
    static patchChild(name: string, type: string, func: any) {
        this.patch(name, (child: any) => ({...child, props: {
            ...child.props,
            children: Patcher.mapRecursive((child2: any) => {
                if (child2?.type?.name === type)
                    return func(child2, child) ?? child2;
                return child2;
            }, child.props.children)
        }}));
    }

    static mapRecursive(func: PatchFunction, children: any): any[] {
        return React.Children.map(children, child => {
            if (!React.isValidElement(child))
                return child;
            return React.cloneElement(child, {
                children: this.mapRecursive(func, func(child)?.props?.children)
            });
        });
    }

    static joinChild(child: any, children: any[]) {
        return [
            ...(Array.isArray(children) || React.isValidElement(children) ? children : [children]),
            child
        ];
    }

    static pushChild(...args: any[]) {
        return this.joinChild(...args);
    }

    static unshiftChild(child: any, children: any[]) {
        return [
            child,
            ...(Array.isArray(children) || React.isValidElement(children) ? children : [children])
        ];
    } 
};