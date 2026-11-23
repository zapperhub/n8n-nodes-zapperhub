import type { INodeProperties } from 'n8n-workflow';

import {
	bodyField,
	bodyOption,
	commaList,
	operationSelector,
	optionsCollection,
	pathField,
	pathParam,
	queryField,
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
				name: 'Get Invite Info',
				value: 'getInviteInfo',
				action: 'Get the group of an invite',
				description: 'Get the data of the group of an invite link, without joining the group',
				routing: { request: { method: 'GET', url: '/groups/invite-info' } },
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
				name: 'Get Join Requests',
				value: 'getJoinRequests',
				action: 'Get the pending join requests of a group',
				routing: {
					request: { method: 'GET', url: `=/groups/${pathParam('groupId')}/requests` },
					output: splitInto('requests'),
				},
			},
			{
				name: 'Join',
				value: 'join',
				action: 'Join a group with an invite',
				description:
					'Join a group with an invite link. When the group requires approval, `pendingApproval` is true and the account joins only after an admin approves.',
				routing: { request: { method: 'POST', url: '/groups/join' } },
			},
			{
				name: 'Leave',
				value: 'leave',
				action: 'Leave a group',
				routing: {
					request: { method: 'POST', url: `=/groups/${pathParam('groupId')}/leave` },
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
				name: 'Update Join Requests',
				value: 'updateJoinRequests',
				action: 'Approve or reject join requests',
				description:
					'Outputs one item per request. Check `success` in each item: WhatsApp can reject a part of the list.',
				routing: {
					request: { method: 'PATCH', url: `=/groups/${pathParam('groupId')}/requests` },
					output: splitInto('participants'),
				},
			},
			{
				name: 'Update Participants',
				value: 'updateParticipants',
				action: 'Add remove promote or demote participants',
				description:
					'Outputs one item per participant. Check `success` in each item: WhatsApp can reject a part of the list.',
				routing: {
					request: { method: 'PATCH', url: `=/groups/${pathParam('groupId')}/participants` },
					output: splitInto('participants'),
				},
			},
			{
				name: 'Update Settings',
				value: 'updateSettings',
				action: 'Update the settings of a group',
				routing: {
					request: { method: 'PATCH', url: `=/groups/${pathParam('groupId')}/settings` },
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
			'getJoinRequests',
			'leave',
			'removePicture',
			'resetInviteLink',
			'update',
			'updateJoinRequests',
			'updateParticipants',
			'updatePicture',
			'updateSettings',
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
	{
		displayName: 'Settings',
		name: 'settings',
		type: 'collection',
		placeholder: 'Add Setting',
		default: {},
		displayOptions: show('updateSettings'),
		description:
			'Give one or more settings. The connected account must be an admin. They are applied in this order: only admins send, only admins edit, approve new members, disappearing messages.',
		options: [
			bodyOption({
				displayName: 'Approve New Members',
				name: 'joinApprovalMode',
				type: 'boolean',
				default: false,
				description:
					'Whether a person who joins with the invite link needs the approval of an admin',
			}),
			bodyOption({
				displayName: 'Disappearing Messages',
				name: 'ephemeralDuration',
				type: 'options',
				options: [
					{ name: 'Off', value: 0 },
					{ name: '24 Hours', value: 86400 },
					{ name: '7 Days', value: 604800 },
					{ name: '90 Days', value: 7776000 },
				],
				default: 0,
			}),
			bodyOption({
				displayName: 'Only Admins Edit Group Info',
				name: 'restrict',
				type: 'boolean',
				default: false,
				description: 'Whether only admins can change the name, the description and the picture',
			}),
			bodyOption({
				displayName: 'Only Admins Send Messages',
				name: 'announce',
				type: 'boolean',
				default: false,
				description: 'Whether only admins can send messages',
			}),
		],
	},
	bodyField(
		show('updateJoinRequests'),
		{
			displayName: 'Action',
			name: 'requestAction',
			type: 'options',
			required: true,
			options: [
				{ name: 'Approve', value: 'approve' },
				{ name: 'Reject', value: 'reject' },
			],
			default: 'approve',
		},
		'action',
	),
	bodyField(
		show('updateJoinRequests'),
		{
			displayName: 'Requesters',
			name: 'requesters',
			type: 'string',
			required: true,
			default: '',
			placeholder: '5511912345678, 123456789012345@lid',
			description:
				'Comma-separated IDs of the people who asked to join, as returned by Get Join Requests',
		},
		'participants',
		commaList,
	),
	queryField(show('getInviteInfo'), {
		displayName: 'Invite',
		name: 'invite',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://chat.whatsapp.com/AbCdEfGhIjK',
		description: 'Invite link or only the code',
	}),
	bodyField(show('join'), {
		displayName: 'Invite',
		name: 'invite',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://chat.whatsapp.com/AbCdEfGhIjK',
		description: 'Invite link or only the code',
	}),
];
