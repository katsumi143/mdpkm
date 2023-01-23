import { useState } from 'react';
export function useBind<T>(initialValue: T) {
	const [value, setValue] = useState(initialValue);
	return {
		value,
		onChange: setValue
	};
}