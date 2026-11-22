import type { INodeProperties } from 'n8n-workflow';

import {
	bodyField,
	commaList,
	operationSelector,
	optionsCollection,
	paginationOptions,
	pathField,
	pathParam,
	queryOption,
	showFor,
	splitInto,
} from '../shared';

const R = 'contact';
const show = (...operations: string[]) => showFor(R, operations);

const contactDescriptionText = 'Phone number with country code (for example 5511912345678), LID or BSUID';

export const contactDescription: INodeProperties[] = [
	operationSelector(
		R,
		[
			{
				name: 'Block',
				value: 'block',
				action: 'Block a contact',
				routing: { request: { method: 'POST', url: '/contacts/block' } },
			},
			{
				name: 'Check Numbers',
				value: 'checkNumbers',
				action: 'Check if numbers are on WhatsApp',
				routing: {
					request: { method: 'POST', url: '/contacts/check-numbers' },
					output: splitInto('numbers'),
				},
			},
			{
				name: 'Delete Data',
				value: 'deleteData',
				action: 'Delete the data of a contact',
				description: 'Delete what ZapperHub stores about the contact (LGPD / GDPR request)',
				routing: {
					request: { method: 'DELETE', url: `=/contacts/${pathParam('contact')}` },
				},
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a contact',
				description: 'Get the phone number, BSUID, username and marketing status of a contact',
				routing: { request: { method: 'GET', url: `=/contacts/${pathParam('contact')}` } },
			},
			{
				name: 'Get Blocked',
				value: 'getBlocked',
				action: 'Get the blocked contacts',
				routing: { request: { method: 'GET', url: '/contacts/blocked' } },
			},
			{
				name: 'Get Marketing Opt-Outs',
				value: 'getOptOuts',
				action: 'Get the contacts that opted out of marketing',
				description: 'Official connection only',
				routing: { request: { method: 'GET', url: '/contacts/marketing-opt-outs' } },
			},
			{
				name: 'Get Phone Number From LID',
				value: 'parseLid',
				action: 'Get the phone number of a LID',
				routing: { request: { method: 'POST', url: '/contacts/parse-lid' } },
			},
			{
				name: 'Get Profile Picture',
				value: 'getProfilePicture',
				action: 'Get the profile picture of a contact',
				routing: {
					request: { method: 'GET', url: `=/contacts/${pathParam('phoneNumber')}/avatar` },
				},
			},
			{
				name: 'Set Marketing Preference',
				value: 'setMarketingPreference',
				action: 'Set the marketing preference of a contact',
				description: 'Official connection only. An opt-out blocks marketing templates to the contact.',
				routing: {
					request: {
						method: 'PUT',
						url: `=/contacts/${pathParam('contact')}/marketing-preference`,
					},
				},
			},
			{
				name: 'Unblock',
				value: 'unblock',
				action: 'Unblock a contact',
				routing: { request: { method: 'POST', url: '/contacts/unblock' } },
			},
		],
		'checkNumbers',
	),

	bodyField(
		show('checkNumbers'),
		{
			displayName: 'Phone Numbers',
			name: 'numbers',
			type: 'string',
			required: true,
			default: '',
			placeholder: '5511912345678, 5521987654321',
			description: 'Comma-separated phone numbers with country code',
		},
		'numbers',
		commaList,
	),

	bodyField(show('block', 'unblock'), {
		displayName: 'Contact',
		name: 'contact',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5511912345678',
		description: contactDescriptionText,
	}),

	pathField(show('get', 'deleteData', 'setMarketingPreference'), {
		displayName: 'Contact',
		name: 'contact',
		type: 'string',
		default: '',
		placeholder: '5511912345678',
		description: contactDescriptionText,
	}),

	bodyField(show('setMarketingPreference'), {
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		options: [
			{ name: 'Opted In', value: 'opted_in', description: 'Allow marketing templates' },
			{ name: 'Opted Out', value: 'opted_out', description: 'Block marketing templates' },
		],
		default: 'opted_out',
	}),

	pathField(show('getProfilePicture'), {
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		default: '',
		placeholder: '5511912345678',
	}),
	optionsCollection(show('getProfilePicture'), [
		queryOption({
			displayName: 'Preview',
			name: 'preview',
			type: 'boolean',
			default: true,
			description: 'Whether to get the small version of the picture',
		}),
	]),

	bodyField(show('parseLid'), {
		displayName: 'LID',
		name: 'lid',
		type: 'string',
		required: true,
		default: '',
		placeholder: '123456789012345@lid',
	}),

	optionsCollection(
		show('getBlocked', 'getOptOuts'),
		paginationOptions(100, 'The next value of the previous page'),
	),
];
