import React from 'react';

// For plugin developers:
// https://docs.mdpkm.voxelified.com/docs/plugin-api/patcher
export default class Patcher {
    static patches = {};
    static registered = {};
    static register(func) {
        const newFunction = (...args) => {
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
    static patch(name, func) {
        (this.patches[name] = this.patches[name] ?? []).push(func);
    }

    // https://docs.mdpkm.voxelified.com/docs/plugin-api/patcher#patchchild
    static patchChild(name, type, func) {
        this.patch(name, child => ({...child, props: {
            ...child.props,
            children: Patcher.mapRecursive(child2 => {
                if (child2?.type?.name === type)
                    return func(child2, child) ?? child2;
                return child2;
            }, child.props.children)
        }}));
    }

    static mapRecursive(func, children) {
        return React.Children.map(children, child => {
            if (!React.isValidElement(child))
                return child;
            return React.cloneElement(child, {
                children: this.mapRecursive(func, func(child)?.props?.children)
            });
        });
    }

    static joinChild(child, children) {
        return [
            ...(Array.isArray(children) || React.isValidElement(children) ? children : [children]),
            child
        ];
    }

    static pushChild(...args) {
        return this.joinChild(...args);
    }

    static unshiftChild(child, children) {
        return [
            child,
            ...(Array.isArray(children) || React.isValidElement(children) ? children : [children])
        ];
    } 
};