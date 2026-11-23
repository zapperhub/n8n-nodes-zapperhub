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

const R = 'community';
const show = (...operations: string[]) => showFor(R, operations);

export const communityDescription: INodeProperties[] = [
	operationSelector(
		R,
		[
			{
				name: 'Create',
				value: 'create',
				action: 'Create a community',
				description:
					'Create a community. WhatsApp also creates its announcement group. To change the name, description, picture or settings, use the Group operations with the community ID.',
				routing: { request: { method: 'POST', url: '/communities' } },
			},
			{
				name: 'Create Group',
				value: 'createGroup',
				action: 'Create a group in a community',
				routing: {
					request: { method: 'POST', url: `=/communities/${pathParam('communityId')}/groups` },
				},
			},
			{
				name: 'Get Groups',
				value: 'getGroups',
				action: 'Get the groups of a community',
				description: 'List the groups of a community, the announcement group included',
				routing: {
					request: { method: 'GET', url: `=/communities/${pathParam('communityId')}/groups` },
					output: splitInto('groups'),
				},
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many communities',
				description: 'List the communities of the connected account',
				routing: {
					request: { method: 'GET', url: '/communities' },
					output: splitInto('communities'),
				},
			},
			{
				name: 'Get Participants',
				value: 'getParticipants',
				action: 'Get the participants of a community',
				description: 'List the participants of all the groups of a community',
				routing: {
					request: {
						method: 'GET',
						url: `=/communities/${pathParam('communityId')}/participants`,
					},
				},
			},
			{
				name: 'Link Group',
				value: 'linkGroup',
				action: 'Link a group to a community',
				description:
					'Link an existing group. The account must be an admin of the community and of the group.',
				routing: {
					request: {
						method: 'PUT',
						url: `=/communities/${pathParam('communityId')}/groups/${pathParam('groupId')}`,
					},
				},
			},
			{
				name: 'Unlink Group',
				value: 'unlinkGroup',
				action: 'Unlink a group from a community',
				description: 'The group continues to exist with the same participants',
				routing: {
					request: {
						method: 'DELETE',
						url: `=/communities/${pathParam('communityId')}/groups/${pathParam('groupId')}`,
					},
				},
			},
		],
		'getMany',
	),
	pathField(show('createGroup', 'getGroups', 'getParticipants', 'linkGroup', 'unlinkGroup'), {
		displayName: 'Community ID',
		name: 'communityId',
		type: 'string',
		default: '',
		placeholder: '120363012345678901@g.us',
	}),
	pathField(show('linkGroup', 'unlinkGroup'), {
		displayName: 'Group ID',
		name: 'groupId',
		type: 'string',
		default: '',
		placeholder: '120363012345678902@g.us',
	}),
	bodyField(show('create', 'createGroup'), {
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
	}),
	bodyField(
		show('createGroup'),
		{
			displayName: 'Participants',
			name: 'participants',
			type: 'string',
			default: '',
			placeholder: '5511912345678, 5521987654321',
			description:
				'Comma-separated phone numbers with country code, in addition to the connected account. Optional.',
		},
		'participants',
		commaList,
	),
	optionsCollection(show('getMany'), [
		queryOption({
			displayName: 'Include Participants',
			name: 'showParticipants',
			type: 'boolean',
			default: false,
			description: 'Whether to include the participants of each community',
		}),
	]),
];
