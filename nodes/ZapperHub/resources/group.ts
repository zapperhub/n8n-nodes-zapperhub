import type { INodeProperties } from 'n8n-workflow';

import {
	bodyField,
	bodyOption,
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
				name: 'Create',
				value: 'create',
				action: 'Create a group',
				routing: { request: { method: 'POST', url: '/groups' } },
			},
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
				name: 'Get Invite Link',
				value: 'getInviteLink',
				action: 'Get the invite link of a group',
				routing: {
					request: { method: 'GET', url: `=/groups/${pathParam('groupId')}/invite-link` },
				},
			},
			{
				name: 'Remove Picture',
				value: 'removePicture',
				action: 'Remove the picture of a group',
				routing: {
					request: { method: 'DELETE', url: `=/groups/${pathParam('groupId')}/picture` },
				},
			},
			{
				name: 'Reset Invite Link',
				value: 'resetInviteLink',
				action: 'Reset the invite link of a group',
				description: 'Create a new invite link. The previous link stops working.',
				routing: {
					request: {
						method: 'POST',
						url: `=/groups/${pathParam('groupId')}/invite-link/reset`,
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update the name or description of a group',
				routing: { request: { method: 'PATCH', url: `=/groups/${pathParam('groupId')}` } },
			},
			{
				name: 'Update Participants',
				value: 'updateParticipants',
				action: 'Add remove promote or demote participants',
				routing: {
					request: { method: 'PATCH', url: `=/groups/${pathParam('groupId')}/participants` },
				},
			},
			{
				name: 'Update Picture',
				value: 'updatePicture',
				action: 'Update the picture of a group',
				routing: {
					request: { method: 'PATCH', url: `=/groups/${pathParam('groupId')}/picture` },
				},
			},
		],
		'getMany',
	),
	pathField(
		show(
			'get',
			'getInviteLink',
			'removePicture',
			'resetInviteLink',
			'update',
			'updateParticipants',
			'updatePicture',
		),
		{
			displayName: 'Group ID',
			name: 'groupId',
			type: 'string',
			default: '',
			placeholder: '120363012345678901@g.us',
		},
	),
	bodyField(show('create'), {
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
	}),
	bodyField(
		show('create'),
		{
			displayName: 'Participants',
			name: 'participants',
			type: 'string',
			required: true,
			default: '',
			placeholder: '5511912345678, 5521987654321',
			description:
				'Comma-separated phone numbers with country code. Give at least one, in addition to the connected account.',
		},
		'participants',
		commaList,
	),
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show('update'),
		description: 'Give the name, the description or both. The name is changed first.',
		options: [
			bodyOption({
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
			}),
			bodyOption({
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
			}),
		],
	},
	bodyField(show('updatePicture'), {
		displayName: 'Picture',
		name: 'picture',
		type: 'string',
		required: true,
		default: '',
		description: 'URL or Base64 of a JPEG image of 640x640 px',
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
