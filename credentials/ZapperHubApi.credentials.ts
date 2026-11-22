import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class ZapperHubApi implements ICredentialType {
	name = 'zapperHubApi';

	displayName = 'ZapperHub API';

	icon: Icon = { light: 'file:zapperhub.svg', dark: 'file:zapperhub.dark.svg' };

	documentationUrl = 'https://docs.zapperhub.com/quickstart';

	properties: INodeProperties[] = [
		{
			// Hidden: always the ZapperHub API. A different value is only set by tests.
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'hidden',
			default: 'https://api.zapperhub.com',
		},
		{
			displayName: 'Instance ID',
			name: 'instanceId',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'inst_abcdefg123456',
			description:
				'ID of the instance, shown in the ZapperHub panel under Instances. Each instance is one connected number.',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'API key of the instance, shown next to the instance ID in the ZapperHub panel',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiUrl}}/{{$credentials.instanceId}}',
			url: '/connection',
		},
	};
}
