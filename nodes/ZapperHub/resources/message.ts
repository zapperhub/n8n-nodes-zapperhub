import type { INodeProperties } from 'n8n-workflow';

import {
	binaryFile,
	buildButtons,
	buildCarouselCards,
	buildContactPhones,
	buildListSections,
	jsonParameter,
} from '../presend';
import {
	bodyField,
	bodyOption,
	commaList,
	delayOption,
	groupStatusOption,
	humanAgentOption,
	operationSelector,
	optionsCollection,
	pathField,
	pathParam,
	paginationOptions,
	queryField,
	queryOption,
	quotedMessageOption,
	recipientField,
	showFor,
	splitInto,
	trackIdOption,
	trackSourceField,
} from '../shared';

const R = 'message';
const show = (...operations: string[]) => showFor(R, operations);

const SEND_OPERATIONS = [
	'sendAudio',
	'sendButtons',
	'sendCarousel',
	'sendContact',
	'sendList',
	'sendLocation',
	'sendMedia',
	'sendPix',
	'sendSticker',
	'sendTemplate',
	'sendText',
	'sendTextToSpeech',
];

const post = (url: string) => ({ request: { method: 'POST' as const, url } });

/** "File Source" and "Input Binary Field" of the operations that send a file. */
function fileSourceFields(operations: string[], urlField: INodeProperties): INodeProperties[] {
	return [
		{
			displayName: 'File Source',
			name: 'fileSource',
			type: 'options',
			displayOptions: show(...operations),
			options: [
				{ name: 'URL or Base64', value: 'url' },
				{ name: 'Binary File', value: 'binary', description: 'A binary file from a previous node' },
			],
			default: 'url',
		},
		{ ...urlField, displayOptions: { show: { ...show(...operations).show, fileSource: ['url'] } } },
		{
			displayName: 'Input Binary Field',
			name: 'binaryPropertyName',
			type: 'string',
			required: true,
			default: 'data',
			displayOptions: { show: { ...show(...operations).show, fileSource: ['binary'] } },
			hint: 'The name of the input binary field that holds the file',
		},
	];
}

const templateOptions: INodeProperties[] = [
	{
		displayName: 'Template Name',
		name: 'templateName',
		type: 'string',
		default: '',
		description: 'Approved template to use when the 24-hour service window is closed (official connection)',
		routing: { send: { type: 'body', property: 'template.name' } },
	},
	{
		displayName: 'Template Language',
		name: 'templateLanguage',
		type: 'string',
		default: 'pt_BR',
		description: 'Language code of the template, for example pt_BR',
		routing: { send: { type: 'body', property: 'template.language' } },
	},
	{
		displayName: 'Template Components (JSON)',
		name: 'templateComponents',
		type: 'json',
		default: '[]',
		description: 'Parameters of the template, in the Meta format',
	},
];

export const messageDescription: INodeProperties[] = [
	operationSelector(
		R,
		[
			{
				name: 'Check Service Window',
				value: 'checkWindow',
				action: 'Check the 24 hour service window',
				description: 'Check whether the contact sent a message in the last 24 hours',
				routing: { request: { method: 'GET', url: '/check-message-window' } },
			},
			{
				name: 'Delete',
				value: 'delete',
				action: 'Delete a message for everyone',
				routing: post('/messages/delete'),
			},
			{
				name: 'Get Delivery Receipts',
				value: 'getReceipts',
				action: 'Get the delivery receipts of a message',
				routing: {
					request: { method: 'GET', url: `=/messages/${pathParam('messageId')}/receipts` },
				},
			},
			{
				name: 'Get Many',
				value: 'getMany',
				action: 'Get many messages',
				description: 'List the messages of the instance in a period',
				routing: {
					request: { method: 'GET', url: '/messages' },
					output: splitInto('messages'),
				},
			},
			{
				name: 'Mark as Read',
				value: 'markAsRead',
				action: 'Mark messages as read',
				routing: post('/messages/read'),
			},
			{
				name: 'React',
				value: 'react',
				action: 'React to a message',
				routing: post('/messages/react'),
			},
			{
				name: 'Send Audio',
				value: 'sendAudio',
				action: 'Send an audio message',
				description: 'Send a voice message (MP3, MP4, WAV or OGG)',
				routing: { ...post('/messages/audio'), send: { preSend: [binaryFile('audio')] } },
			},
			{
				name: 'Send Buttons',
				value: 'sendButtons',
				action: 'Send a message with buttons',
				routing: { ...post('/messages/buttons'), send: { preSend: [buildButtons] } },
			},
			{
				name: 'Send Carousel',
				value: 'sendCarousel',
				action: 'Send a carousel message',
				routing: { ...post('/messages/carousel'), send: { preSend: [buildCarouselCards] } },
			},
			{
				name: 'Send Contact',
				value: 'sendContact',
				action: 'Send a contact card',
				routing: { ...post('/messages/contact'), send: { preSend: [buildContactPhones] } },
			},
			{
				name: 'Send List',
				value: 'sendList',
				action: 'Send a list message',
				routing: { ...post('/messages/list'), send: { preSend: [buildListSections] } },
			},
			{
				name: 'Send Location',
				value: 'sendLocation',
				action: 'Send a location',
				routing: post('/messages/location'),
			},
			{
				name: 'Send Media',
				value: 'sendMedia',
				action: 'Send an image video or document',
				routing: { ...post('/messages/media'), send: { preSend: [binaryFile('media')] } },
			},
			{
				name: 'Send PIX Charge',
				value: 'sendPix',
				action: 'Send a PIX charge',
				description: 'Send a PIX payment request with the copy and paste code',
				routing: {
					...post('/messages/pix'),
					send: { preSend: [jsonParameter('options.templateComponents', 'template.components')] },
				},
			},
			{
				name: 'Send Sticker',
				value: 'sendSticker',
				action: 'Send a sticker',
				routing: { ...post('/messages/sticker'), send: { preSend: [binaryFile('sticker')] } },
			},
			{
				name: 'Send Template',
				value: 'sendTemplate',
				action: 'Send a template message',
				description: 'Send an approved template (official connection)',
				routing: {
					...post('/messages/template'),
					send: { preSend: [jsonParameter('components', 'components')] },
				},
			},
			{
				name: 'Send Text',
				value: 'sendText',
				action: 'Send a text message',
				routing: post('/messages/text'),
			},
			{
				name: 'Send Text as Voice',
				value: 'sendTextToSpeech',
				action: 'Send text as a voice message',
				description:
					'Turn text into a voice message with ElevenLabs. Set up the ElevenLabs key of the instance in the ZapperHub panel first.',
				routing: post('/messages/text-to-speech'),
			},
		],
		'sendText',
	),

	// Recipient and track source of every send operation
	recipientField(show(...SEND_OPERATIONS.filter((op) => op !== 'sendPix'))),
	recipientField(
		show('sendPix'),
		'Phone number with country code, LID or BSUID. Groups are not accepted.',
	),
	trackSourceField(show(...SEND_OPERATIONS)),

	// Send Text
	bodyField(show('sendText'), {
		displayName: 'Text',
		name: 'message',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
	}),
	optionsCollection(show('sendText'), [
		bodyOption({
			displayName: 'Auto Caption',
			name: 'autoCaption',
			type: 'boolean',
			default: false,
			description:
				'Whether to use the text as the caption of the image, when Send Image Links as Images is on',
		}),
		delayOption,
		bodyOption({
			displayName: 'Disappearing Message',
			name: 'expiration',
			type: 'options',
			options: [
				{ name: 'Off', value: 'none' },
				{ name: '24 Hours', value: '24h' },
				{ name: '7 Days', value: '7d' },
				{ name: '90 Days', value: '90d' },
			],
			default: 'none',
		}),
		groupStatusOption,
		humanAgentOption,
		bodyOption(
			{
				displayName: 'Mentions',
				name: 'mentions',
				type: 'string',
				default: '',
				placeholder: '5511912345678, 5521987654321',
				description: 'Comma-separated phone numbers to mention. Works only in groups.',
			},
			'mentions',
			commaList,
		),
		bodyOption({
			displayName: 'Mention Everyone',
			name: 'mentionsEveryone',
			type: 'boolean',
			default: false,
			description: 'Whether to mention all participants of the group. Mentions is then ignored.',
		}),
		quotedMessageOption,
		bodyOption({
			displayName: 'Send Image Links as Images',
			name: 'processImageLink',
			type: 'boolean',
			default: false,
			description:
				'Whether to send the image of an image link in the text right after the text message',
		}),
		bodyOption({
			displayName: 'Show Link Preview',
			name: 'showLinkPreview',
			type: 'boolean',
			default: true,
			description: 'Whether to show the preview of the link in the message',
		}),
		bodyOption({
			displayName: 'Split by Line Breaks',
			name: 'splitMessage',
			type: 'boolean',
			default: false,
			description: 'Whether to send each line break of the text as a separate message',
		}),
		trackIdOption,
	]),

	// Send Media
	bodyField(show('sendMedia'), {
		displayName: 'Media Type',
		name: 'mediaType',
		type: 'options',
		required: true,
		options: [
			{ name: 'Audio', value: 'audio' },
			{ name: 'Document', value: 'document' },
			{ name: 'Image', value: 'image' },
			{ name: 'Video', value: 'video' },
		],
		default: 'image',
	}),
	...fileSourceFields(
		['sendMedia'],
		bodyField(show('sendMedia'), {
			displayName: 'Media',
			name: 'media',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'https://example.com/photo.jpg',
			description: 'Public URL (HTTP or HTTPS), base64 file or base64 data URL',
		}),
	),
	optionsCollection(show('sendMedia'), [
		bodyOption({
			displayName: 'Caption',
			name: 'caption',
			type: 'string',
			default: '',
		}),
		delayOption,
		bodyOption({
			displayName: 'File Name',
			name: 'filename',
			type: 'string',
			default: '',
			description: 'Name of the file shown to the contact. Documents only.',
		}),
		groupStatusOption,
		humanAgentOption,
		bodyOption({
			displayName: 'MIME Type',
			name: 'mimetype',
			type: 'string',
			default: '',
			placeholder: 'application/pdf',
			description: 'MIME type of the file. Documents only.',
		}),
		quotedMessageOption,
		trackIdOption,
	]),

	// Send Audio
	...fileSourceFields(
		['sendAudio'],
		bodyField(show('sendAudio'), {
			displayName: 'Audio',
			name: 'audio',
			type: 'string',
			required: true,
			default: '',
			placeholder: 'https://example.com/audio.mp3',
			description: 'Public URL (HTTP or HTTPS), base64 file or base64 data URL. MP3, MP4, WAV or OGG.',
		}),
	),
	optionsCollection(show('sendAudio'), [
		delayOption,
		groupStatusOption,
		humanAgentOption,
		quotedMessageOption,
		trackIdOption,
	]),

	// Send Sticker
	...fileSourceFields(
		['sendSticker'],
		bodyField(show('sendSticker'), {
			displayName: 'Sticker',
			name: 'sticker',
			type: 'string',
			required: true,
			default: '',
			description: 'Public URL or base64 file, in WEBP (image) or MP4 (animated)',
		}),
	),
	optionsCollection(show('sendSticker'), [quotedMessageOption, trackIdOption]),

	// Send Location
	bodyField(
		show('sendLocation'),
		{
			displayName: 'Latitude',
			name: 'latitude',
			type: 'number',
			typeOptions: { numberPrecision: 7 },
			required: true,
			default: 0,
		},
		'location.lat',
	),
	bodyField(
		show('sendLocation'),
		{
			displayName: 'Longitude',
			name: 'longitude',
			type: 'number',
			typeOptions: { numberPrecision: 7 },
			required: true,
			default: 0,
		},
		'location.lon',
	),
	optionsCollection(show('sendLocation'), [
		bodyOption(
			{
				displayName: 'Place Name',
				name: 'placeName',
				type: 'string',
				default: '',
			},
			'location.name',
		),
		quotedMessageOption,
		trackIdOption,
	]),

	// Send Contact
	bodyField(
		show('sendContact'),
		{
			displayName: 'Contact Name',
			name: 'contactName',
			type: 'string',
			required: true,
			default: '',
			description: 'Full name shown on the contact card',
		},
		'vcard.fn',
	),
	{
		displayName: 'Phone Numbers',
		name: 'phones',
		type: 'fixedCollection',
		placeholder: 'Add Phone Number',
		typeOptions: { multipleValues: true },
		default: {},
		displayOptions: show('sendContact'),
		options: [
			{
				name: 'phone',
				displayName: 'Phone Number',
				values: [
					{
						displayName: 'Number',
						name: 'number',
						type: 'string',
						default: '',
						placeholder: '+55 11 91234-5678',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Cell', value: 'cell' },
							{ name: 'Home', value: 'home' },
							{ name: 'Work', value: 'work' },
						],
						default: 'cell',
					},
				],
			},
		],
	},
	optionsCollection(show('sendContact'), [
		bodyOption(
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
			},
			'vcard.email',
			'={{ [{ value: $value }] }}',
		),
		bodyOption(
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
			},
			'vcard.note',
		),
		quotedMessageOption,
		trackIdOption,
	]),

	// Send Buttons
	bodyField(show('sendButtons'), {
		displayName: 'Text',
		name: 'body',
		type: 'string',
		typeOptions: { rows: 3 },
		default: '',
	}),
	{
		displayName: 'Buttons',
		name: 'buttons',
		type: 'fixedCollection',
		placeholder: 'Add Button',
		typeOptions: { multipleValues: true, maxAllowedFields: 5 },
		required: true,
		default: {},
		displayOptions: show('sendButtons'),
		description: 'From 1 to 5 buttons. Quick reply buttons are not accepted in groups.',
		options: [
			{
				name: 'button',
				displayName: 'Button',
				// Type first: it decides which of the last fields is shown.
				// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
				values: [
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Call', value: 'call', description: 'Calls a phone number' },
							{ name: 'Copy Code', value: 'copy', description: 'Copies a code' },
							{ name: 'Open URL', value: 'url', description: 'Opens a link' },
							{
								name: 'Quick Reply',
								value: 'reply',
								description: 'Sends the button ID back as a reply',
							},
						],
						default: 'reply',
					},
					{
						displayName: 'Text',
						name: 'displayText',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Button ID',
						name: 'id',
						type: 'string',
						default: '',
						description: 'Your identifier of the button, unique in the message',
					},
					{
						displayName: 'URL',
						name: 'url',
						type: 'string',
						default: '',
						displayOptions: { show: { type: ['url'] } },
					},
					{
						displayName: 'Code to Copy',
						name: 'copyCode',
						type: 'string',
						default: '',
						displayOptions: { show: { type: ['copy'] } },
					},
					{
						displayName: 'Phone Number',
						name: 'phoneNumber',
						type: 'string',
						default: '',
						displayOptions: { show: { type: ['call'] } },
					},
				],
			},
		],
	},
	optionsCollection(show('sendButtons'), [
		bodyOption({
			displayName: 'Footer',
			name: 'footer',
			type: 'string',
			default: '',
		}),
		bodyOption({
			displayName: 'Media URL',
			name: 'media',
			type: 'string',
			default: '',
			description: 'Image or video shown above the text',
		}),
		bodyOption({
			displayName: 'Media Type',
			name: 'mediaType',
			type: 'options',
			options: [
				{ name: 'Image', value: 'image' },
				{ name: 'Video', value: 'video' },
			],
			default: 'image',
		}),
		quotedMessageOption,
		bodyOption({
			displayName: 'Title',
			name: 'title',
			type: 'string',
			default: '',
		}),
		trackIdOption,
	]),

	// Send List
	bodyField(show('sendList'), {
		displayName: 'Text',
		name: 'description',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		default: '',
	}),
	bodyField(show('sendList'), {
		displayName: 'Button Text',
		name: 'buttonText',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'See options',
		description: 'Text of the button that opens the list',
	}),
	{
		displayName: 'Rows',
		name: 'rows',
		type: 'fixedCollection',
		placeholder: 'Add Row',
		typeOptions: { multipleValues: true, maxAllowedFields: 10 },
		required: true,
		default: {},
		displayOptions: show('sendList'),
		description:
			'From 1 to 10 rows. Rows with the same section title are grouped. With 2 or more sections, every row needs a section title.',
		options: [
			{
				name: 'row',
				displayName: 'Row',
				values: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Up to 24 characters',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Up to 72 characters, shown below the title',
					},
					{
						displayName: 'Row ID',
						name: 'rowId',
						type: 'string',
						default: '',
						description: 'Returned when the contact picks the row. Unique in the message.',
					},
					{
						displayName: 'Section Title',
						name: 'section',
						type: 'string',
						default: '',
						description: 'Up to 24 characters',
					},
				],
			},
		],
	},
	optionsCollection(show('sendList'), [
		bodyOption({
			displayName: 'Footer',
			name: 'footer',
			type: 'string',
			default: '',
		}),
		quotedMessageOption,
		bodyOption({
			displayName: 'Title',
			name: 'title',
			type: 'string',
			default: '',
		}),
		trackIdOption,
	]),

	// Send Carousel
	bodyField(show('sendCarousel'), {
		displayName: 'Text',
		name: 'body',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		default: '',
	}),
	{
		displayName: 'Cards',
		name: 'cards',
		type: 'fixedCollection',
		placeholder: 'Add Card',
		typeOptions: { multipleValues: true, maxAllowedFields: 10 },
		required: true,
		default: {},
		displayOptions: show('sendCarousel'),
		description:
			'From 2 to 10 cards. All cards need the same button type and the same number of buttons.',
		options: [
			{
				name: 'card',
				displayName: 'Card',
				// Media, text, then buttons: the order a card is read in.
				// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
				values: [
					{
						displayName: 'Media Type',
						name: 'mediaType',
						type: 'options',
						options: [
							{ name: 'Image', value: 'image' },
							{ name: 'Video', value: 'video' },
						],
						default: 'image',
					},
					{
						displayName: 'Media URL',
						name: 'mediaUrl',
						type: 'string',
						default: '',
						description: 'Public URL of the image or video',
					},
					{
						displayName: 'Text',
						name: 'text',
						type: 'string',
						default: '',
						description: 'Up to 160 characters',
					},
					{
						displayName: 'Button Type',
						name: 'buttonType',
						type: 'options',
						options: [
							{ name: 'Open URL', value: 'url', description: 'One button' },
							{ name: 'Quick Reply', value: 'reply', description: 'One or two buttons' },
						],
						default: 'reply',
					},
					{
						displayName: 'Button Text',
						name: 'buttonText',
						type: 'string',
						default: '',
						description: 'Up to 20 characters',
					},
					{
						displayName: 'Button URL',
						name: 'buttonUrl',
						type: 'string',
						default: '',
						displayOptions: { show: { buttonType: ['url'] } },
					},
					{
						displayName: 'Button ID',
						name: 'buttonId',
						type: 'string',
						default: '',
						description: 'Returned when the contact taps the button',
						displayOptions: { show: { buttonType: ['reply'] } },
					},
					{
						displayName: 'Second Button Text',
						name: 'secondButtonText',
						type: 'string',
						default: '',
						displayOptions: { show: { buttonType: ['reply'] } },
					},
					{
						displayName: 'Second Button ID',
						name: 'secondButtonId',
						type: 'string',
						default: '',
						displayOptions: { show: { buttonType: ['reply'] } },
					},
				],
			},
		],
	},
	optionsCollection(show('sendCarousel'), [quotedMessageOption, trackIdOption]),

	// Send Template
	bodyField(show('sendTemplate'), {
		displayName: 'Template Name',
		name: 'templateName',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of an approved template. Use Template > Get Many to see the templates.',
	}),
	bodyField(show('sendTemplate'), {
		displayName: 'Language',
		name: 'language',
		type: 'string',
		required: true,
		default: 'pt_BR',
		description: 'Language code of the template, for example pt_BR',
	}),
	{
		displayName: 'Components (JSON)',
		name: 'components',
		type: 'json',
		default: '[]',
		displayOptions: show('sendTemplate'),
		description:
			'Values of the template variables, in the Meta format. Leave [] for a template without variables.',
	},
	optionsCollection(show('sendTemplate'), [quotedMessageOption, trackIdOption]),

	// Send PIX Charge
	bodyField(show('sendPix'), {
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		options: [
			{
				name: 'Dynamic',
				value: 'dynamic',
				description: 'Copy and paste code with the amount. Any connection.',
			},
			{
				name: 'Static',
				value: 'static',
				description: 'PIX key only, optional amount. QR Code connection only.',
			},
		],
		default: 'dynamic',
	}),
	bodyField(show('sendPix'), {
		displayName: 'Key Type',
		name: 'keyType',
		type: 'options',
		required: true,
		options: [
			{ name: 'CNPJ', value: 'CNPJ' },
			{ name: 'CPF', value: 'CPF' },
			{ name: 'Email', value: 'EMAIL' },
			{ name: 'Phone', value: 'PHONE' },
			{ name: 'Random Key', value: 'EVP' },
		],
		default: 'CNPJ',
	}),
	bodyField(show('sendPix'), {
		displayName: 'PIX Key',
		name: 'key',
		type: 'string',
		required: true,
		default: '',
	}),
	bodyField(show('sendPix'), {
		displayName: 'Receiver Name',
		name: 'merchantName',
		type: 'string',
		required: true,
		default: '',
		description: 'Name shown to the contact, up to 60 characters',
	}),
	bodyField(
		{ show: { resource: [R], operation: ['sendPix'], mode: ['dynamic'] } },
		{
			displayName: 'Copy and Paste Code',
			name: 'code',
			type: 'string',
			required: true,
			default: '',
			description: 'PIX BR Code, up to 512 characters',
		},
	),
	bodyField(
		{ show: { resource: [R], operation: ['sendPix'], mode: ['dynamic'] } },
		{
			displayName: 'Amount',
			name: 'amount',
			type: 'number',
			typeOptions: { minValue: 0.01, numberPrecision: 2 },
			required: true,
			default: 0,
			description: 'Amount in BRL. Must match the amount in the code.',
		},
	),
	optionsCollection(show('sendPix'), [
		bodyOption({
			displayName: 'Amount (Static Mode)',
			name: 'staticAmount',
			type: 'number',
			typeOptions: { minValue: 0.01, numberPrecision: 2 },
			default: 0,
			description: 'Optional amount in BRL for the static mode',
		}, 'amount'),
		bodyOption({
			displayName: 'Footer',
			name: 'footer',
			type: 'string',
			default: '',
		}),
		quotedMessageOption,
		bodyOption({
			displayName: 'Reference ID',
			name: 'referenceId',
			type: 'string',
			default: '',
			description:
				'Your reference for the charge: letters, numbers, _, - and . (up to 48). Generated when empty.',
		}),
		bodyOption({
			displayName: 'Text',
			name: 'body',
			type: 'string',
			default: '',
			description: 'Text of the message. Default: Pagamento via PIX.',
		}),
		...templateOptions,
		trackIdOption,
	]),

	// Send Text as Voice
	bodyField(show('sendTextToSpeech'), {
		displayName: 'Text',
		name: 'text',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		default: '',
	}),
	optionsCollection(show('sendTextToSpeech'), [
		quotedMessageOption,
		trackIdOption,
		bodyOption({
			displayName: 'Voice ID',
			name: 'voiceId',
			type: 'string',
			default: '',
			description: 'ElevenLabs voice. Uses the default voice of the instance when empty.',
		}),
	]),

	// React
	bodyField(show('react'), {
		displayName: 'Chat ID',
		name: 'remoteJid',
		type: 'string',
		required: true,
		default: '',
		description: 'The chat of the message: phone number, LID or group ID (remoteJid in the webhook)',
	}),
	bodyField(show('react'), {
		displayName: 'Message ID',
		name: 'id',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the message (key.ID in the webhook)',
	}),
	bodyField(show('react'), {
		displayName: 'Emoji',
		name: 'text',
		type: 'string',
		required: true,
		default: '',
		placeholder: '👍',
	}),

	// Mark as Read
	bodyField(show('markAsRead'), {
		displayName: 'Chat ID',
		name: 'remoteJid',
		type: 'string',
		required: true,
		default: '',
		description: 'The chat of the messages: phone number, LID or group ID',
	}),
	bodyField(
		show('markAsRead'),
		{
			displayName: 'Message IDs',
			name: 'ids',
			type: 'string',
			required: true,
			default: '',
			description: 'Comma-separated IDs of the messages',
		},
		'ids',
		commaList,
	),
	optionsCollection(show('markAsRead'), [
		bodyOption({
			displayName: 'Sender',
			name: 'senderJid',
			type: 'string',
			default: '',
			description: 'Who wrote the messages. Required in groups.',
		}),
	]),

	// Delete
	bodyField(
		show('delete'),
		{
			displayName: 'Chat ID',
			name: 'remoteJid',
			type: 'string',
			required: true,
			default: '',
			description: 'The chat of the message: phone number, LID or group ID',
		},
		'key.remoteJid',
	),
	bodyField(
		show('delete'),
		{
			displayName: 'Message ID',
			name: 'messageId',
			type: 'string',
			required: true,
			default: '',
		},
		'key.id',
	),
	bodyField(
		show('delete'),
		{
			displayName: 'Sent by Me',
			name: 'fromMe',
			type: 'boolean',
			default: true,
			description: 'Whether the message was sent by the connected account',
		},
		'key.fromMe',
	),

	// Get Many
	queryField(show('getMany'), {
		displayName: 'From',
		name: 'from',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'Start of the period, included',
	}),
	queryField(show('getMany'), {
		displayName: 'To',
		name: 'to',
		type: 'dateTime',
		required: true,
		default: '',
		description: 'End of the period, included',
	}),
	optionsCollection(show('getMany'), [
		...paginationOptions(
			100,
			'Cursor of the next page: the cursor field of the last message of the previous page',
		),
		queryOption({
			displayName: 'Sent by Me Only',
			name: 'fromMe',
			type: 'boolean',
			default: true,
			description: 'Whether to return only the messages sent by the connected account',
		}),
	]),

	// Get Delivery Receipts
	pathField(show('getReceipts'), {
		displayName: 'Message ID',
		name: 'messageId',
		type: 'string',
		default: '',
	}),

	// Check Service Window
	queryField(show('checkWindow'), {
		displayName: 'Phone Number',
		name: 'phone',
		type: 'string',
		required: true,
		default: '',
		placeholder: '5511912345678',
	}),
];
