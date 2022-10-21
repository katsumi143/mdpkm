import React, { useState } from 'react';

import ImagePreview from './ImagePreview';
import ImageTransition from './Transition/Image';

import API from '../common/api';
import Patcher from '/src/common/plugins/patcher';
export default Patcher.register(function InstanceIcon({ instance, size, hideLoader, props }) {
    const [preview, setPreview] = useState(false);
    const loaderIcon = API.getLoader(instance?.config?.loader?.type)?.icon;
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
            
            '&:after': hideLoader || !loaderIcon ? undefined : {
                top: 0,
                left: 0,
                width: '1.2rem',
                height: '1.2rem',
                border: '$primaryBackground solid 2px',
                content: '',
                display: 'block',
                position: 'relative',
                transform: 'translate(175%, 175%)',
                borderRadius: '50%',
                backgroundSize: 'contain',
                backgroundColor: '$primaryBackground',
                backgroundImage: `url('${loaderIcon}')`,
                backgroundRepeat: 'no-repeat'
            },
            ...props?.css
        }}/>
        {preview && <ImagePreview src={instance.webIcon} size={192} onClose={() => setPreview(false)}/>}
    </React.Fragment>;
});