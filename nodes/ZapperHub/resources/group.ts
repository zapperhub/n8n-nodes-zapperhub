import type { INodeProperties } from 'n8n-workflow';

import {
	bodyField,
	commaList,
	operationSelector,
	optionsCollection,
	pathField,
	pathParam,
	queryOption,
	showFor,
	splitInto,
} from '../shared';

const R = 'group';
const show = (...operations: string[]) => showFor(R, operations);

export const groupDescription: INodeProperties[] = [
	operationSelector(
		R,
		[
			{
				name: 'Get',
				value: 'get',
				action: 'Get a group',
				routing: { request: { method: 'GET', url: `=/groups/${pathParam('groupId')}` } },
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many groups',
				description: 'List the groups of the connected account',
				routing: {
					request: { method: 'GET', url: '/groups' },
					output: splitInto('groups'),
				},
			},
			{
				name: 'Update Participants',
				value: 'updateParticipants',
				action: 'Add remove promote or demote participants',
				routing: {
					request: { method: 'PATCH', url: `=/groups/${pathParam('groupId')}/participants` },
				},
			},
		],
		'getMany',
	),
	pathField(show('get', 'updateParticipants'), {
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		default: '',
		placeholder: '120363012345678901@g.us',
	}),
	optionsCollection(show('getMany'), [
		queryOption({
			displayName: 'Include Participants',
			name: 'showParticipants',
			type: 'boolean',
			default: true,
			description: 'Whether to include the participants of each group',
		}),
	]),
	bodyField(show('updateParticipants'), {
		displayName: 'Action',
		name: 'action',
		type: 'options',
		required: true,
		options: [
			{ name: 'Add', value: 'add' },
			{ name: 'Demote From Admin', value: 'demote' },
			{ name: 'Promote to Admin', value: 'promote' },
			{ name: 'Remove', value: 'remove' },
		],
		default: 'add',
	}),
	bodyField(
		show('updateParticipants'),
		{
			displayName: 'Participants',
			name: 'participants',
			type: 'string',
			required: true,
			default: '',
			placeholder: '5511912345678, 5521987654321',
			description: 'Comma-separated phone numbers with country code',
		},
		'participants',
		commaList,
	),
];
