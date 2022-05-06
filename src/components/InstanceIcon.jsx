import React from 'react';

import ImageTransition from './Transition/Image';

import { LoaderIcons } from '../common/constants';
export default function InstanceIcon({ instance, size, hideLoader, props }) {
    size = `${size ?? 48}px`;
    return <ImageTransition src={
        instance.icon ? `data:image/png;base64,${instance.icon}` : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff99' viewBox='0 0 16 16'%3E%3Cpath d='M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z' /%3E%3C/svg%3E"
    } background="$secondaryBackground" borderRadius="8.33333333%" {...props} css={{
        width: 'fit-content',
        height: 'fit-content',
        display: 'block',
        minWidth: size,
        minHeight: size,
        backgroundSize: !instance.icon ? '50%' : 'contain',
        
        '&:after': hideLoader || !LoaderIcons[instance.config.loader.type] ? undefined : {
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
            backgroundImage: `url('${LoaderIcons[instance.config.loader.type]}')`,
            backgroundRepeat: 'no-repeat'
        },
        ...props?.css
    }}/>;
}