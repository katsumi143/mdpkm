import type { Instance } from '../voxura';
import type { InstanceCreatorOptionType } from './enums';
export interface InstanceCreator {
	id: string
	options: VersionPickerInstanceCreatorOption[]
	categoryId: string

	execute: (instance: Instance, data: any) => Promise<void> | void
}
export interface InstanceCreatorOption {
	id: string
	type: InstanceCreatorOptionType
}
export interface VersionPickerInstanceCreatorOption extends InstanceCreatorOption {
	type: InstanceCreatorOptionType.VersionPicker
	targetId: string
}