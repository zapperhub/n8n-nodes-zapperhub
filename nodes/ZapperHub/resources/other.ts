import type { INodeProperties } from 'n8n-workflow';

import {
	bodyField,
	operationSelector,
	optionsCollection,
	queryOption,
	showFor,
	splitInto,
} from '../shared';

export const channelDescription: INodeProperties[] = [
	operationSelector(
		'channel',
		[
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many channels',
				description: 'List the WhatsApp channels (newsletters) the account follows or owns',
				routing: {
					request: { method: 'GET', url: '/newsletters' },
					output: splitInto('newsletters'),
				},
			},
		],
		'getMany',
	),
];

export const profileDescription: INodeProperties[] = [
	operationSelector(
		'profile',
		[
			{
				name: 'Remove Picture',
				value: 'removePicture',
				action: 'Remove the profile picture',
				routing: { request: { method: 'DELETE', url: '/profile/picture' } },
			},
			{
				name: 'Update About',
				value: 'updateStatus',
				action: 'Update the about text',
				routing: { request: { method: 'PATCH', url: '/profile/status' } },
			},
			{
				name: 'Update Picture',
				value: 'updatePicture',
				action: 'Update the profile picture',
				routing: { request: { method: 'PATCH', url: '/profile/picture' } },
			},
		],
		'updatePicture',
	),
	bodyField(showFor('profile', ['updatePicture']), {
		displayName: 'Picture',
		name: 'picture',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com/logo.jpg',
		description: 'Public URL or base64 image',
	}),
	bodyField(showFor('profile', ['updateStatus']), {
		displayName: 'About',
		name: 'status',
		type: 'string',
		required: true,
		default: '',
	}),
];

export const connectionDescription: INodeProperties[] = [
	operationSelector(
		'connection',
		[
			{
				name: 'Get',
				value: 'get',
				action: 'Get the connection',
				description:
					'Get the connection status, or a QR Code to connect when the number is disconnected',
				routing: { request: { method: 'GET', url: '/connection' } },
			},
		],
		'get',
	),
	optionsCollection(showFor('connection', ['get']), [
		queryOption({
			displayName: 'Pairing Phone Number',
			name: 'number',
			type: 'string',
			default: '',
			placeholder: '5511912345678',
			description: 'Get a pairing code for this number instead of a QR Code',
		}),
	]),
];
