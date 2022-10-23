import React, { useState } from 'react';

import ImagePreview from './ImagePreview';
import ImageTransition from './Transition/Image';

import Patcher from '/src/common/plugins/patcher';
export default Patcher.register(function InstanceIcon({ instance, size, props }) {
    const [preview, setPreview] = useState(false);
    size = `${size ?? 48}px`;
    return <React.Fragment>
        <ImageTransition src={instance.webIcon} onClick={() => setPreview(true)} background="$secondaryBackground" borderRadius="8.33333333%" {...props} css={{
            width: 'fit-content',
            cursor: 'zoom-in',
            height: 'fit-content',
            display: 'block',
            minWidth: size,
            minHeight: size,
            boxShadow: '$buttonShadow',
            
            ...props?.css
        }}/>
        {preview && <ImagePreview src={instance.webIcon} size={192} onClose={() => setPreview(false)}/>}
    </React.Fragment>;
});