import React from 'react';
export default class Patcher {
    static patches = {};
    static register(func) {
        return (...args) => {
            let returnValue = func(...args);
            if (this.patches[func.name])
                for (const patch of this.patches[func.name])
                    returnValue = patch(returnValue);
            return returnValue;
        };
    }
    
    static patch(name, func) {
        (this.patches[name] = this.patches[name] ?? []).push(func);
    }

    static patchChild(name, type, func) {
        this.patch(name, child => ({...child, props: {
            ...child.props,
            children: Patcher.mapRecursive(child => {
                if (child?.type?.name === type)
                    return func(child);
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
};