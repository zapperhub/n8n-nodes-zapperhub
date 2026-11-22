import { createHmac, timingSafeEqual } from 'crypto';
import type {
	IDataObject,
	IHookFunctions,
	IHttpRequestMethods,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes } from 'n8n-workflow';

function isNotFound(error: unknown): boolean {
	const err = error as {
		httpCode?: string;
		status?: number;
		response?: { status?: number };
		cause?: { response?: { status?: number } };
	};
	return (
		err.httpCode === '404' ||
		err.status === 404 ||
		err.response?.status === 404 ||
		err.cause?.response?.status === 404
	);
}

/**
 * Calls the ZapperHub API of the instance. Returns `undefined` when the resource does not exist
 * (404), for example a webhook that was removed in the panel.
 */
async function zapperHubRequest(
	this: IHookFunctions,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
): Promise<IDataObject | undefined> {
	const credentials = await this.getCredentials('zapperHubApi');
	try {
		return (await this.helpers.httpRequestWithAuthentication.call(this, 'zapperHubApi', {
			method,
			url: `${(credentials.apiUrl as string) || 'https://api.zapperhub.com'}/${encodeURIComponent(credentials.instanceId as string)}${path}`,
			body,
			json: true,
		})) as IDataObject;
	} catch (error) {
		if (isNotFound(error)) return undefined;
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

function sameEvents(a: unknown, b: string[]): boolean {
	if (!Array.isArray(a) || a.length !== b.length) return false;
	return b.every((event) => a.includes(event));
}

/**
 * ZapperHub signs each delivery with HMAC-SHA256 of the raw body, using the API key of the
 * instance as the secret, in the `x-webhook-signature` header (hex).
 */
function isSignedByZapperHub(this: IWebhookFunctions, apiKey: string): boolean {
	const req = this.getRequestObject();
	const signature = req.header('x-webhook-signature');
	if (!signature || !req.rawBody) return false;
	const raw = Buffer.isBuffer(req.rawBody)
		? req.rawBody
		: Buffer.from(typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(req.rawBody));
	const expected = Buffer.from(createHmac('sha256', apiKey).update(raw).digest('hex'), 'utf8');
	const received = Buffer.from(signature, 'utf8');
	return expected.length === received.length && timingSafeEqual(expected, received);
}

export class ZapperHubTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ZapperHub Trigger',
		name: 'zapperHubTrigger',
		icon: { light: 'file:zapperhub.svg', dark: 'file:zapperhub.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when a WhatsApp or Instagram event happens in ZapperHub',
		defaults: {
			name: 'ZapperHub Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'zapperHubApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName:
					'The webhook is created in the instance when the workflow is published or when you listen for a test event, and removed when it stops. ZapperHub only accepts HTTPS URLs, so n8n must be reachable from the internet.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: ['messages.upsert'],
				options: [
					{
						name: 'Call Update',
						value: 'calls.update',
						description:
							'A call was received, answered or ended. On the official connection, subscribing turns on calling for the number at Meta.',
					},
					{
						name: 'Comment Received (Instagram)',
						value: 'comments.upsert',
						description: 'Someone commented on a post of the Instagram account',
					},
					{
						name: 'Connection Update',
						value: 'connection.update',
						description: 'The connection of the number opened or closed',
					},
					{
						name: 'Contact Identity Change',
						value: 'contacts.identity',
						description: 'The phone, BSUID or username of a contact changed (official connection)',
					},
					{
						name: 'Group Participants Update',
						value: 'group-participants.update',
						description: 'Participants joined, left, were promoted or demoted (QR Code connection)',
					},
					{
						name: 'Marketing Preference Change',
						value: 'contacts.preference',
						description: 'A contact opted out of, or back into, marketing messages (official connection)',
					},
					{
						name: 'Message Edited or Deleted',
						value: 'messages.update',
						description: 'The contact edited or deleted a message (official connection)',
					},
					{
						name: 'Message Error',
						value: 'messages.error',
						description: 'A message could not be sent',
					},
					{
						name: 'Message Received or Sent',
						value: 'messages.upsert',
						description: 'A message arrived, or was sent from the number',
					},
					{
						name: 'Message Status',
						value: 'messages.status',
						description: 'A sent message was delivered, read or failed',
					},
					{
						name: 'Storage Failed',
						value: 'storage.failed',
						description: 'A file could not be saved in your own storage',
					},
					{
						name: 'Storage Recovered',
						value: 'storage.recovered',
						description: 'Your own storage saved a file again after a failure',
					},
					{
						name: 'Template Sync Finished',
						value: 'templates.sync',
						description: 'A template sync with Meta finished (official connection)',
					},
					{
						name: 'Token Expired (Instagram)',
						value: 'token.expired',
						description: 'The Instagram token expired or was revoked',
					},
					{
						name: 'Token Refresh Failed (Instagram)',
						value: 'token.refresh.failed',
						description: 'An attempt to refresh the Instagram token failed',
					},
				],
			},
			{
				displayName: 'Ignore Messages Sent by Me',
				name: 'ignoreOwnMessages',
				type: 'boolean',
				default: true,
				displayOptions: { show: { events: ['messages.upsert'] } },
				description:
					'Whether to skip messages sent from the number, including the ones this workflow sends. Keep it on to avoid a loop when the workflow replies.',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Ignore Group Messages',
						name: 'ignoreGroups',
						type: 'boolean',
						default: true,
						description: 'Whether to skip messages from groups',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const webhookId = staticData.webhookId as string | undefined;
				if (!webhookId) return false;

				const url = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events') as string[];
				const path = `/webhooks/${encodeURIComponent(webhookId)}`;
				const found = await zapperHubRequest.call(this, 'GET', path);
				const webhook = found?.webhook as IDataObject | undefined;
				if (webhook) {
					if (webhook.url === url && sameEvents(webhook.subscriptions, events)) return true;
					// Same webhook, other URL or events: replace it.
					await zapperHubRequest.call(this, 'DELETE', path);
				}
				delete staticData.webhookId;
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const url = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events') as string[];
				const workflowName = this.getWorkflow().name ?? this.getWorkflow().id ?? 'workflow';
				// ZapperHub posts a webhook.test event to the URL before it creates the webhook.
				// webhook() answers it without starting the workflow.
				const created = await zapperHubRequest.call(this, 'POST', '/webhooks', {
					name: `n8n: ${workflowName}`,
					url,
					subscriptions: events,
				});
				const webhook = created?.webhook as IDataObject | undefined;
				if (!webhook?.id) return false;
				this.getWorkflowStaticData('node').webhookId = webhook.id;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');
				const webhookId = staticData.webhookId as string | undefined;
				if (webhookId) {
					// A webhook already removed in the panel answers 404, which counts as removed.
					await zapperHubRequest.call(this, 'DELETE', `/webhooks/${encodeURIComponent(webhookId)}`);
				}
				delete staticData.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();

		// The check that ZapperHub sends once, before the webhook exists. It is not signed and
		// must not start the workflow, or the test listening in the editor would end on it.
		if (body.type === 'webhook.test') return { webhookResponse: 'OK' };

		const { apiKey } = await this.getCredentials('zapperHubApi');
		if (!isSignedByZapperHub.call(this, apiKey as string)) {
			const res = this.getResponseObject();
			res.status(401).send('Invalid signature').end();
			return { noWebhookResponse: true };
		}

		const events = this.getNodeParameter('events', []) as string[];
		if (typeof body.type !== 'string' || !events.includes(body.type)) return {};

		if (body.type === 'messages.upsert') {
			const key = (body.key ?? {}) as IDataObject;
			if (key.fromMe === true && this.getNodeParameter('ignoreOwnMessages', true)) return {};
			const ignoreGroups = this.getNodeParameter('options.ignoreGroups', false) as boolean;
			if (ignoreGroups && String(key.remoteJid ?? '').endsWith('@g.us')) return {};
		}

		return { workflowData: [this.helpers.returnJsonArray(body)] };
	}
}
