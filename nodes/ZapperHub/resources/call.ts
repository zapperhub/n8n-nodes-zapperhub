import type { INodeProperties } from 'n8n-workflow';

import { jsonParameter } from '../presend';
import {
	bodyField,
	bodyOption,
	operationSelector,
	optionsCollection,
	paginationOptions,
	pathField,
	pathParam,
	queryField,
	queryOption,
	recipientDescription,
	showFor,
	splitInto,
	trackIdOption,
	trackSourceField,
} from '../shared';

const R = 'call';
const show = (...operations: string[]) => showFor(R, operations);
const callUrl = (suffix = '') => `=/calls/${pathParam('callId')}${suffix}`;

export const callDescription: INodeProperties[] = [
	operationSelector(
		R,
		[
			{
				name: 'Get',
				value: 'get',
				action: 'Get a call',
				routing: { request: { method: 'GET', url: callUrl() } },
			},
			{
				name: 'Get Call Permission',
				value: 'getPermission',
				action: 'Check if you can call a contact',
				description: 'Official connection: check whether the contact allowed business calls',
				routing: { request: { method: 'GET', url: '/calls/permissions' } },
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many calls',
				routing: {
					request: { method: 'GET', url: '/calls' },
					output: splitInto('calls'),
				},
			},
			{
				name: 'Hang Up',
				value: 'hangUp',
				action: 'Hang up a call',
				routing: { request: { method: 'POST', url: callUrl('/hangup') } },
			},
			{
				name: 'Make',
				value: 'make',
				action: 'Make a call',
				description:
					'Call a contact. When the call is answered, use Play Audio, then Hang Up. Follow the call with the calls.update event of the trigger.',
				routing: { request: { method: 'POST', url: '/calls' } },
			},
			{
				name: 'Play Audio',
				value: 'playAudio',
				action: 'Play an audio in a call',
				routing: { request: { method: 'POST', url: callUrl('/audio') } },
			},
			{
				name: 'Reject',
				value: 'reject',
				action: 'Reject an incoming call',
				routing: { request: { method: 'POST', url: callUrl('/reject') } },
			},
			{
				name: 'Request Call Permission',
				value: 'requestPermission',
				action: 'Ask a contact for permission to call',
				description:
					'Official connection: send the call permission request. Outside the 24-hour window, use a template.',
				routing: {
					request: { method: 'POST', url: '/calls/permissions/request' },
					send: { preSend: [jsonParameter('options.templateComponents', 'template.components')] },
				},
			},
		],
		'make',
	),

	bodyField(show('make', 'requestPermission'), {
		displayName: 'Contact',
		name: 'jid',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5511912345678',
		description: recipientDescription,
	}),
	trackSourceField(show('make')),
	optionsCollection(show('make'), [
		bodyOption({
			displayName: 'Record',
			name: 'record',
			type: 'boolean',
			default: true,
			description:
				'Whether to record the call. The recording comes in a calls.update event and is kept for 7 days. Up to 30 recorded calls per instance per day.',
		}),
		trackIdOption,
	]),

	pathField(show('get', 'hangUp', 'playAudio', 'reject'), {
		displayName: 'Call ID',
		name: 'callId',
		type: 'string',
		default: '',
	}),

	bodyField(show('playAudio'), {
		displayName: 'Audio',
		name: 'audio',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://example.com/message.mp3',
		description: 'Public URL (HTTP or HTTPS), base64 file or base64 data URL. MP3, MP4, WAV or OGG.',
	}),

	optionsCollection(show('getMany'), [
		queryOption({
			displayName: 'Agent ID',
			name: 'agentId',
			type: 'string',
			default: '',
			description: 'Only calls handled by this softphone agent',
		}),
		...paginationOptions(
			100,
			'Cursor of the next page: the cursor field of the last call of the previous page',
		),
		queryOption({
			displayName: 'Direction',
			name: 'direction',
			type: 'options',
			options: [
				{ name: 'Made by the Business', value: 'BUSINESS_INITIATED' },
				{ name: 'Made by the Contact', value: 'USER_INITIATED' },
			],
			default: 'USER_INITIATED',
		}),
		queryOption({
			displayName: 'State',
			name: 'state',
			type: 'options',
			options: [
				{ name: 'Active', value: 'ACTIVE' },
				{ name: 'Ended', value: 'ENDED' },
				{ name: 'Ringing', value: 'RINGING' },
			],
			default: 'ENDED',
		}),
	]),

	queryField(show('getPermission'), {
		displayName: 'Contact',
		name: 'jid',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5511912345678',
	}),

	optionsCollection(show('requestPermission'), [
		bodyOption({
			displayName: 'Text',
			name: 'body',
			type: 'string',
			default: '',
			description: 'Text of the request, inside the 24-hour window. Ignored when a template is set.',
		}),
		bodyOption(
			{
				displayName: 'Template Name',
				name: 'templateName',
				type: 'string',
				default: '',
				description: 'Approved call permission template, required outside the 24-hour window',
			},
			'template.name',
		),
		bodyOption(
			{
				displayName: 'Template Language',
				name: 'templateLanguage',
				type: 'string',
				default: 'pt_BR',
			},
			'template.language',
		),
		{
			displayName: 'Template Components (JSON)',
			name: 'templateComponents',
			type: 'json',
			default: '[]',
			description: 'Components of the template, in the Meta format',
		},
	]),
];
