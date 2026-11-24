import type { INodeProperties } from 'n8n-workflow';

import {
	bodyField,
	bodyOption,
	operationSelector,
	optionsCollection,
	pathField,
	pathParam,
	queryField,
	queryOption,
	showFor,
	splitInto,
} from '../shared';

const R = 'channel';
const show = (...operations: string[]) => showFor(R, operations);
const channelUrl = (suffix = '') => `=/newsletters/${pathParam('newsletterId')}${suffix}`;

const userDescription =
	'Phone number with country code (for example 5511912345678) or LID ending in @lid, such as the ID that Get Followers returns';

export const channelDescription: INodeProperties[] = [
	operationSelector(
		R,
		[
			{
				name: 'Accept Admin Invite',
				value: 'acceptAdminInvite',
				action: 'Accept an admin invite of a channel',
				description:
					'Accept the admin invite that the connected account received for a channel. QR Code connection only.',
				routing: {
					request: { method: 'POST', url: channelUrl('/admins/accept') },
				},
			},
			{
				name: 'Create',
				value: 'create',
				action: 'Create a channel',
				routing: {
					request: { method: 'POST', url: '/newsletters' },
					output: splitInto('newsletter'),
				},
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a channel',
				description:
					'Delete a channel permanently. Only the owner of the channel can delete it.',
				routing: {
					request: { method: 'DELETE', url: `=/newsletters/${pathParam('newsletterId')}` },
				},
			},
			{
				name: 'Follow',
				value: 'follow',
				action: 'Follow a channel',
				routing: {
					request: { method: 'POST', url: `=/newsletters/${pathParam('newsletterId')}/follow` },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a channel',
				description: 'Get a channel that the account follows or manages',
				routing: {
					request: { method: 'GET', url: `=/newsletters/${pathParam('newsletterId')}` },
					output: splitInto('newsletter'),
				},
			},
			{
				name: 'Get Admins',
				value: 'getAdmins',
				action: 'Get the admins of a channel',
				description:
					'Get the number of admins of a channel and the admin invites that are pending. QR Code connection only.',
				routing: {
					request: { method: 'GET', url: channelUrl('/admins') },
				},
			},
			{
				name: 'Get Followers',
				value: 'getFollowers',
				action: 'Get the followers of a channel',
				description:
					'List the followers of a channel. Returns 100 followers when no limit is set. QR Code connection only.',
				routing: {
					request: { method: 'GET', url: channelUrl('/followers') },
					output: splitInto('followers'),
				},
			},
			{
				name: 'Get Insights',
				value: 'getInsights',
				action: 'Get the insights of a channel',
				description:
					'Get the follower and visitor statistics of a channel. QR Code connection only.',
				routing: {
					request: { method: 'GET', url: channelUrl('/insights') },
				},
			},
			{
				name: 'Get Invite Info',
				value: 'getInviteInfo',
				action: 'Get the channel of an invite',
				description:
					'Get the data of the channel of an invite link, without following the channel. Works for all channels.',
				routing: {
					request: { method: 'GET', url: '/newsletters/invite-info' },
					output: splitInto('newsletter'),
				},
			},
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
			{
				name: 'Invite Admin',
				value: 'inviteAdmin',
				action: 'Invite a user to be an admin of a channel',
				description: 'Invite a user to be an admin of a channel. QR Code connection only.',
				routing: {
					request: { method: 'POST', url: channelUrl('/admins/invites') },
				},
			},
			{
				name: 'Mute',
				value: 'mute',
				action: 'Mute or unmute a channel',
				routing: {
					request: { method: 'PUT', url: `=/newsletters/${pathParam('newsletterId')}/mute` },
				},
			},
			{
				name: 'Pin Message',
				value: 'pinMessage',
				action: 'Pin a message of a channel',
				description:
					'Pin a message of a channel. Returns the pinned messages of the channel. QR Code connection only.',
				routing: {
					request: {
						method: 'PUT',
						url: channelUrl(`/messages/${pathParam('serverId')}/pin`),
					},
				},
			},
			{
				name: 'Remove Admin',
				value: 'removeAdmin',
				action: 'Remove an admin of a channel',
				description: 'Remove an admin of a channel. QR Code connection only.',
				routing: {
					request: { method: 'DELETE', url: channelUrl(`/admins/${pathParam('user')}`) },
				},
			},
			{
				name: 'Remove Picture',
				value: 'removePicture',
				action: 'Remove the picture of a channel',
				routing: {
					request: {
						method: 'DELETE',
						url: `=/newsletters/${pathParam('newsletterId')}/picture`,
					},
				},
			},
			{
				name: 'Revoke Admin Invite',
				value: 'revokeAdminInvite',
				action: 'Revoke an admin invite of a channel',
				description: 'Revoke a pending admin invite of a channel. QR Code connection only.',
				routing: {
					request: {
						method: 'DELETE',
						url: channelUrl(`/admins/invites/${pathParam('user')}`),
					},
				},
			},
			{
				name: 'Send Poll',
				value: 'sendPoll',
				action: 'Send a poll to a channel',
				description: 'Send a poll or a quiz to a channel. QR Code connection only.',
				routing: {
					request: { method: 'POST', url: channelUrl('/polls') },
				},
			},
			{
				name: 'Send Question',
				value: 'sendQuestion',
				action: 'Send a question to a channel',
				description:
					'Send a question that the followers answer with text to a channel. QR Code connection only.',
				routing: {
					request: { method: 'POST', url: channelUrl('/questions') },
				},
			},
			{
				name: 'Transfer Ownership',
				value: 'transferOwnership',
				action: 'Transfer the ownership of a channel',
				description:
					'Transfer the ownership of a channel to another user. This cannot be undone by the account that transfers. QR Code connection only.',
				routing: {
					request: { method: 'PUT', url: channelUrl('/owner') },
				},
			},
			{
				name: 'Unfollow',
				value: 'unfollow',
				action: 'Unfollow a channel',
				routing: {
					request: {
						method: 'POST',
						url: `=/newsletters/${pathParam('newsletterId')}/unfollow`,
					},
				},
			},
			{
				name: 'Unpin Message',
				value: 'unpinMessage',
				action: 'Unpin a message of a channel',
				description:
					'Unpin a message of a channel. Returns the pinned messages of the channel. QR Code connection only.',
				routing: {
					request: {
						method: 'DELETE',
						url: channelUrl(`/messages/${pathParam('serverId')}/pin`),
					},
				},
			},
			{
				name: 'Update',
				value: 'update',
				action: 'Update the name or description of a channel',
				routing: {
					request: { method: 'PATCH', url: `=/newsletters/${pathParam('newsletterId')}` },
				},
			},
			{
				name: 'Update Picture',
				value: 'updatePicture',
				action: 'Update the picture of a channel',
				routing: {
					request: {
						method: 'PATCH',
						url: `=/newsletters/${pathParam('newsletterId')}/picture`,
					},
				},
			},
		],
		'getMany',
	),
	pathField(
		show(
			'acceptAdminInvite',
			'delete',
			'follow',
			'get',
			'getAdmins',
			'getFollowers',
			'getInsights',
			'inviteAdmin',
			'mute',
			'pinMessage',
			'removeAdmin',
			'removePicture',
			'revokeAdminInvite',
			'sendPoll',
			'sendQuestion',
			'transferOwnership',
			'unfollow',
			'unpinMessage',
			'update',
			'updatePicture',
		),
		{
			displayName: 'Channel ID',
			name: 'newsletterId',
			type: 'string',
			default: '',
			placeholder: '120363012345678901@newsletter',
			description: 'ID of the channel, with or without @newsletter',
		},
	),
	bodyField(show('create'), {
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
	}),
	optionsCollection(show('create'), [
		bodyOption({
			displayName: 'Description',
			name: 'description',
			type: 'string',
			typeOptions: { rows: 3 },
			default: '',
		}),
	]),
	optionsCollection(show('getFollowers'), [
		queryOption({
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			typeOptions: { minValue: 1, maxValue: 1000 },
			default: 50,
			description: 'Max number of results to return',
		}),
	]),
	pathField(show('removeAdmin', 'revokeAdminInvite'), {
		displayName: 'User',
		name: 'user',
		type: 'string',
		default: '',
		placeholder: '5511912345678',
		description: userDescription,
	}),
	bodyField(show('inviteAdmin', 'transferOwnership'), {
		displayName: 'User',
		name: 'user',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5511912345678',
		description: userDescription,
	}),
	optionsCollection(show('inviteAdmin'), [
		bodyOption({
			displayName: 'Message',
			name: 'message',
			type: 'string',
			typeOptions: { rows: 3 },
			default: '',
			description: 'Text sent to the user together with the invite',
		}),
	]),
	pathField(show('pinMessage', 'unpinMessage'), {
		displayName: 'Message Server ID',
		name: 'serverId',
		type: 'number',
		typeOptions: { minValue: 1, numberPrecision: 0 },
		default: 1,
		description: 'Server ID of the message in the channel, a positive integer',
	}),
	bodyField(show('sendPoll'), {
		displayName: 'Question',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Question of the poll',
	}),
	bodyField(
		show('sendPoll'),
		{
			displayName: 'Poll Options',
			name: 'pollOptions',
			type: 'fixedCollection',
			placeholder: 'Add Option',
			typeOptions: { multipleValues: true, maxAllowedFields: 12 },
			required: true,
			default: {},
			description: 'From 2 to 12 options, without duplicates',
			options: [
				{
					name: 'option',
					displayName: 'Option',
					values: [
						{
							displayName: 'Text',
							name: 'text',
							type: 'string',
							default: '',
						},
					],
				},
			],
		},
		'options',
		'={{ ($value.option ?? []).map(item => item.text) }}',
	),
	optionsCollection(show('sendPoll'), [
		bodyOption({
			displayName: 'Correct Option',
			name: 'correctOption',
			type: 'number',
			typeOptions: { minValue: 0, numberPrecision: 0 },
			default: 0,
			description:
				'Position of the correct option, starting at 0. When set, the poll becomes a quiz.',
		}),
		bodyOption({
			displayName: 'Single Choice',
			name: 'singleChoice',
			type: 'boolean',
			default: false,
			description: 'Whether each follower can select only one option',
		}),
	]),
	bodyField(show('sendQuestion'), {
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		default: '',
		description: 'Text of the question',
	}),
	queryField(show('getInviteInfo'), {
		displayName: 'Invite',
		name: 'invite',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'https://whatsapp.com/channel/0029VaAbCdEfGhIjKlMnOp',
		description: 'Invite link or only the code',
	}),
	bodyField(show('mute'), {
		displayName: 'Mute',
		name: 'mute',
		type: 'boolean',
		default: true,
		description: 'Whether to mute the channel. Turn off to unmute.',
	}),
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show('update'),
		description:
			'Give the name, the description or both. An empty description removes the description.',
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
		description: 'URL or Base64 of a square JPEG image of 640x640 px',
	}),
];
