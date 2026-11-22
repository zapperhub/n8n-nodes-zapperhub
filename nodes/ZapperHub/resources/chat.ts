import type { INodeProperties } from 'n8n-workflow';

import { bodyField, operationSelector, showFor } from '../shared';

const R = 'chat';
const show = (...operations: string[]) => showFor(R, operations);
const ALL = ['archive', 'delete', 'mute', 'pin', 'unarchive'];

export const chatDescription: INodeProperties[] = [
	operationSelector(
		R,
		[
			{
				name: 'Archive',
				value: 'archive',
				action: 'Archive a chat',
				routing: { request: { method: 'PATCH', url: '/chats/archive' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a chat',
				description: 'Delete the chat from the connected account',
				routing: { request: { method: 'POST', url: '/chats/delete' } },
			},
			{
				name: 'Mute',
				value: 'mute',
				action: 'Mute or unmute a chat',
				routing: { request: { method: 'PATCH', url: '/chats/mute' } },
			},
			{
				name: 'Pin',
				value: 'pin',
				action: 'Pin or unpin a chat',
				routing: { request: { method: 'PATCH', url: '/chats/pin' } },
			},
			{
				name: 'Unarchive',
				value: 'unarchive',
				action: 'Unarchive a chat',
				routing: { request: { method: 'PATCH', url: '/chats/unarchive' } },
			},
		],
		'archive',
	),
	bodyField(show(...ALL), {
		displayName: 'Chat ID',
		name: 'jid',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5511912345678',
		description: 'Phone number with country code, LID or group ID ending in @g.us',
	}),
	bodyField(show('mute'), {
		displayName: 'Duration',
		name: 'time',
		type: 'options',
		required: true,
		options: [
			{ name: '8 Hours', value: '8h' },
			{ name: '7 Days', value: '7d' },
			{ name: 'Unmute', value: 'remove' },
		],
		default: '8h',
	}),
	bodyField(show('pin'), {
		displayName: 'Pin',
		name: 'pin',
		type: 'boolean',
		default: true,
		description: 'Whether to pin the chat. Turn off to unpin.',
	}),
];
