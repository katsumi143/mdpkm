import { JSXElementConstructor } from 'react';

import type { Instance } from '../../../voxura';
export default abstract class InstanceCreator {
    public static id: string;

    public abstract create(data: any[]): Promise<Instance>;
    
	public get id() {
        return (<typeof InstanceCreator>this.constructor).id;
    }

	public abstract ReactComponent: JSXElementConstructor<{
		creator: any
		setData: (value: any[]) => void
		setSatisfied: (value: boolean) => void
	}>
};