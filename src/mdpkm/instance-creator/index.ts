import { ReactNode } from 'react';

import type { Instance } from '../../../voxura';
export default abstract class InstanceCreator {
    public static id: string;

    public abstract create(data: any[]): Promise<Instance>;
    public abstract render(setData: (value: any[]) => void, setSatisfied: (value: boolean) => void): ReactNode;

    public get id() {
        return (<typeof InstanceCreator>this.constructor).id;
    }
};