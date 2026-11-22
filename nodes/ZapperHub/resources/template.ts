import type { INodeProperties } from 'n8n-workflow';

import {
	operationSelector,
	optionsCollection,
	pathField,
	pathParam,
	queryOption,
	showFor,
	splitInto,
} from '../shared';

const R = 'template';
const show = (...operations: string[]) => showFor(R, operations);

export const templateDescription: INodeProperties[] = [
	operationSelector(
		R,
		[
			{
				name: 'Get',
				value: 'get',
				action: 'Get a template',
				routing: {
					request: { method: 'GET', url: `=/message-templates/${pathParam('templateId')}` },
				},
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many templates',
				description: 'List the templates of the official connection, as of the last sync',
				routing: {
					request: { method: 'GET', url: '/message-templates' },
					output: splitInto('templates'),
				},
			},
			{
				name: 'Get Sync Status',
				value: 'getSync',
				action: 'Get the status of a template sync',
				routing: {
					request: {
						method: 'GET',
						url: '={{ $parameter.syncId ? "/message-templates/sync/" + encodeURIComponent($parameter.syncId) : "/message-templates/sync" }}',
					},
				},
			},
			{
				name: 'Sync',
				value: 'sync',
				action: 'Sync the templates with Meta',
				description: 'Fetch the templates from Meta. The templates.sync event tells when it ends.',
				routing: { request: { method: 'POST', url: '/message-templates/sync' } },
			},
		],
		'getMany',
	),
	pathField(show('get'), {
		displayName: 'Template ID',
		name: 'templateId',
		type: 'string',
		default: '',
	}),
	optionsCollection(show('getMany'), [
		queryOption({
			displayName: 'Name',
			name: 'name',
			type: 'string',
			default: '',
			description: 'Only templates with this name',
		}),
	]),
	{
		displayName: 'Sync ID',
		name: 'syncId',
		type: 'string',
		default: '',
		displayOptions: show('getSync'),
		description: 'ID returned by Sync. Leave empty to get the last sync.',
	},
];
