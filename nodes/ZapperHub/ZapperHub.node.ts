import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

import { callDescription } from './resources/call';
import { chatDescription } from './resources/chat';
import { communityDescription } from './resources/community';
import { contactDescription } from './resources/contact';
import { groupDescription } from './resources/group';
import { instagramDescription } from './resources/instagram';
import { messageDescription } from './resources/message';
import { channelDescription, connectionDescription, profileDescription } from './resources/other';
import { templateDescription } from './resources/template';

export class ZapperHub implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ZapperHub',
		name: 'zapperHub',
		icon: { light: 'file:zapperhub.svg', dark: 'file:zapperhub.dark.svg' },
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Send and manage WhatsApp messages, calls, contacts, groups and communities with the ZapperHub API',
		defaults: {
			name: 'ZapperHub',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'zapperHubApi', required: true }],
		requestDefaults: {
			baseURL: '={{$credentials.apiUrl}}/{{$credentials.instanceId}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Call', value: 'call' },
					{ name: 'Channel', value: 'channel' },
					{ name: 'Chat', value: 'chat' },
					{ name: 'Community', value: 'community' },
					{ name: 'Connection', value: 'connection' },
					{ name: 'Contact', value: 'contact' },
					{ name: 'Group', value: 'group' },
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'Message', value: 'message' },
					{ name: 'Profile', value: 'profile' },
					{ name: 'Template', value: 'template' },
				],
				default: 'message',
			},
			...messageDescription,
			...callDescription,
			...channelDescription,
			...chatDescription,
			...communityDescription,
			...connectionDescription,
			...contactDescription,
			...groupDescription,
			...instagramDescription,
			...profileDescription,
			...templateDescription,
		],
	};
}
