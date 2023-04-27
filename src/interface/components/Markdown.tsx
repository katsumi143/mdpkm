import React from 'react';
import { open } from '@tauri-apps/api/shell';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { CSS, styled } from '@stitches/react';
import { Link, Tooltip } from 'voxeliface';

const StyledMarkdown = styled(ReactMarkdown, {
	color: '$primaryColor',
	fontSize: 16,
	wordWrap: 'break-word',
	fontWeight: 400,
	lineHeight: 1.5,
	fontFamily: '$primary',
	'& h2': { fontSize: '1.5em' },
	'& h3': { fontSize: '1.25em' },
	'& h1, & h2': { fontFamily: '$tertiary' },
	'& h1, & h2, & h3, & h4, & h5, & h6': {
		marginTop: 24,
		fontWeight: 600,
		lineHeight: 1.25,
		marginBottom: 16
	},

	'& a span': {
		padding: '.2em .4em',
		fontSize: '85%',
		lineHeight: 1.25,
		fontFamily: 'monospace',
		background: '$secondaryBackground',
		borderRadius: 6
	},
	'& ul, & ol': {
		paddingLeft: '2em'
	},
	'& p, & blockquote, & ul, & ol, & dl, & table, & pre, & details': {
		marginTop: 0,
		marginBottom: 16
	},

	'& > *:first-child': { marginTop: 0 }
});
export interface MarkdownProps {
	css?: CSS
	text: string
}
export default function Markdown({ css, text }: MarkdownProps) {
	return <StyledMarkdown
		css={css}
		children={text}
		components={{
			a: ({ node, ...props }) => {
				const link = props.href!;
				const isCompare = link.includes('/compare/');
				return <Tooltip.Root>
					<Tooltip.Trigger asChild>
						<Link onClick={() => open(props.href!)} css={{
							display: 'inline-flex',
							fontFamily: 'inherit'
						}}>
							{isCompare ? <span>{link.replace(/^.*compare\//, '')}</span> : props.children}
						</Link>
					</Tooltip.Trigger>
					<Tooltip.Portal>
						<Tooltip.Content sideOffset={4} style={{ zIndex: 1000 }}>
							{link}
							<Tooltip.Arrow/>
						</Tooltip.Content>
					</Tooltip.Portal>
				</Tooltip.Root>;
			}
		}}
		remarkPlugins={[remarkGfm]}
	/>;
}