import type { IDisplayOptions, INodeProperties, INodePropertyOptions } from 'n8n-workflow';

/** Fields shown only for the given resource and operations. */
export function showFor(resource: string, operations: string[]): IDisplayOptions {
	return { show: { resource: [resource], operation: operations } };
}

type Field = Omit<INodeProperties, 'displayOptions' | 'routing'>;

/** A field sent as a property of the JSON body. Dots in `property` create nested objects. */
export function bodyField(
	displayOptions: IDisplayOptions,
	field: Field,
	property: string = field.name,
	value?: string,
): INodeProperties {
	return {
		...field,
		displayOptions,
		routing: { send: { type: 'body', property, ...(value ? { value } : {}) } },
	};
}

/** A field sent as a query string parameter. */
export function queryField(
	displayOptions: IDisplayOptions,
	field: Field,
	property: string = field.name,
): INodeProperties {
	return { ...field, displayOptions, routing: { send: { type: 'query', property } } };
}

/** A field used only in the request URL (see `pathParam`). */
export function pathField(displayOptions: IDisplayOptions, field: Field): INodeProperties {
	return { ...field, required: true, displayOptions };
}

/** Expression for a URL segment, encoded so IDs such as `123@g.us` stay intact. */
export function pathParam(name: string): string {
	return `{{encodeURIComponent($parameter["${name}"])}}`;
}

/** Expression that turns "a, b, c" into ["a", "b", "c"]. */
export const commaList =
	'={{ String($value).split(",").map(item => item.trim()).filter(item => item) }}';

export const recipientDescription =
	'Phone number with country code (for example 5511912345678), LID, BSUID, group ID ending in @g.us or newsletter ID ending in @newsletter';

/** The `jid` field of the send operations. */
export function recipientField(
	displayOptions: IDisplayOptions,
	description = recipientDescription,
): INodeProperties {
	return bodyField(displayOptions, {
		displayName: 'Recipient',
		name: 'jid',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5511912345678',
		description,
	});
}

/**
 * Marks every message sent by the node with `trackSource: "n8n"`, so the message log of the
 * instance shows where the message came from.
 */
export function trackSourceField(displayOptions: IDisplayOptions): INodeProperties {
	return bodyField(displayOptions, {
		displayName: 'Track Source',
		name: 'trackSource',
		type: 'hidden',
		default: 'n8n',
	});
}

/** An option of an "Options" collection, sent as a body property when the user adds it. */
export function bodyOption(field: Field, property: string = field.name, value?: string): INodeProperties {
	return {
		...field,
		routing: { send: { type: 'body', property, ...(value ? { value } : {}) } },
	};
}

/** An option of an "Options" collection, sent as a query parameter when the user adds it. */
export function queryOption(field: Field, property: string = field.name): INodeProperties {
	return { ...field, routing: { send: { type: 'query', property } } };
}

export const quotedMessageOption = bodyOption({
	displayName: 'Quoted Message ID',
	name: 'quotedMessageId',
	type: 'string',
	default: '',
	description:
		'ID of the message to reply to. If the message is not in the history of the instance, the message is sent without the quote.',
});

export const trackIdOption = bodyOption({
	displayName: 'Track ID',
	name: 'trackId',
	type: 'string',
	default: '',
	description:
		'Your own reference for the message, returned in the webhook events. It does not need to be unique.',
});

export const delayOption = bodyOption({
	displayName: 'Delay (Seconds)',
	name: 'delay',
	type: 'number',
	typeOptions: { minValue: 0, maxValue: 20 },
	default: 0,
	description: 'Seconds to wait before the message is sent, from 0 to 20',
});

export const humanAgentOption = bodyOption({
	displayName: 'Human Agent',
	name: 'humanAgent',
	type: 'boolean',
	default: false,
	description:
		'Whether the message is a reply from a human agent. Instagram only: it lets you reply up to 7 days after the last message of the contact. Meta does not allow it in automated messages.',
});

/** The "Options" collection of an operation. Options are sorted by display name. */
export function optionsCollection(
	displayOptions: IDisplayOptions,
	options: INodeProperties[],
): INodeProperties {
	return {
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions,
		options: [...options].sort((a, b) => a.displayName.localeCompare(b.displayName)),
	};
}

/**
 * The "Operation" selector of a resource. Operations are sorted by name, as n8n expects.
 */
export function operationSelector(
	resource: string,
	operations: INodePropertyOptions[],
	defaultOperation: string,
): INodeProperties {
	return {
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [resource] } },
		options: [...operations].sort((a, b) => a.name.localeCompare(b.name)),
		// eslint-disable-next-line n8n-nodes-base/node-param-default-wrong-for-options
		default: defaultOperation,
	};
}

/** Splits a list response into one item per element of `property`. */
export function splitInto(property: string) {
	return {
		postReceive: [{ type: 'rootProperty' as const, properties: { property } }],
	};
}

/** The "Limit" and "Cursor" options of the list operations. */
export function paginationOptions(maxLimit: number, cursorDescription: string): INodeProperties[] {
	return [
		queryOption({
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			typeOptions: { minValue: 1, maxValue: maxLimit },
			default: 50,
			description: 'Max number of results to return',
		}),
		queryOption({
			displayName: 'Cursor',
			name: 'cursor',
			type: 'string',
			default: '',
			description: cursorDescription,
		}),
	];
}
