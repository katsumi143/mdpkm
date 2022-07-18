import React from 'react';
export default class Patcher {
    static patches = {};
    static registered = {};
    static register(func) {
        const newFunction = (...args) => {
            let returnValue = func(...args);
            if (this.patches[func.name])
                for (const patch of this.patches[func.name]) {
                    try {
                        returnValue = patch(returnValue) ?? returnValue;
                    } catch(err) {
                        console.error(err);
                    }
                }
            return returnValue;
        };
        this.registered[func.name] = newFunction;
        return newFunction;
    }
    
    static patch(name, func) {
        (this.patches[name] = this.patches[name] ?? []).push(func);
    }

    static patchChild(name, type, func) {
        this.patch(name, child => ({...child, props: {
            ...child.props,
            children: Patcher.mapRecursive(child => {
                if (child?.type?.name === type)
                    return func(child) ?? child;
                return child;
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