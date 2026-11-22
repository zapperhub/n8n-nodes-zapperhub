import type { IDataObject, IExecuteSingleFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

type PreSend = (
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
) => Promise<IHttpRequestOptions>;

function body(requestOptions: IHttpRequestOptions): IDataObject {
	requestOptions.body ??= {};
	return requestOptions.body as IDataObject;
}

/**
 * When "File Source" is "Binary File", reads the binary property of the input item and sends it
 * as a base64 data URL in `bodyProperty`. For documents, also fills in the file name and MIME type.
 */
export function binaryFile(bodyProperty: string): PreSend {
	return async function (this: IExecuteSingleFunctions, requestOptions) {
		if (this.getNodeParameter('fileSource', 'url') !== 'binary') return requestOptions;
		const propertyName = this.getNodeParameter('binaryPropertyName', 'data') as string;
		const binary = this.helpers.assertBinaryData(propertyName);
		const buffer = await this.helpers.getBinaryDataBuffer(propertyName);
		const data = body(requestOptions);
		data[bodyProperty] = `data:${binary.mimeType};base64,${buffer.toString('base64')}`;
		if (data.mediaType === 'document') {
			data.filename ??= binary.fileName;
			data.mimetype ??= binary.mimeType;
		}
		return requestOptions;
	};
}

interface ButtonInput {
	type: string;
	displayText: string;
	id: string;
	url?: string;
	copyCode?: string;
	phoneNumber?: string;
}

/** Builds `buttons` of the buttons message, keeping only the field each button type uses. */
export const buildButtons: PreSend = async function (this: IExecuteSingleFunctions, requestOptions) {
	const input = this.getNodeParameter('buttons', {}) as { button?: ButtonInput[] };
	body(requestOptions).buttons = (input.button ?? []).map((button) => {
		const result: IDataObject = {
			type: button.type,
			displayText: button.displayText,
			id: button.id,
		};
		if (button.type === 'url') result.url = button.url;
		if (button.type === 'copy') result.copyCode = button.copyCode;
		if (button.type === 'call') result.phoneNumber = button.phoneNumber;
		return result;
	});
	return requestOptions;
};

interface RowInput {
	section?: string;
	title: string;
	description?: string;
	rowId: string;
}

/**
 * Builds `sections` of the list message. Each row names its section; rows with the same section
 * title are grouped in the order they appear.
 */
export const buildListSections: PreSend = async function (
	this: IExecuteSingleFunctions,
	requestOptions,
) {
	const input = this.getNodeParameter('rows', {}) as { row?: RowInput[] };
	const sections: Array<{ title: string; rows: IDataObject[] }> = [];
	for (const row of input.row ?? []) {
		const title = row.section?.trim() ?? '';
		let section = sections.find((item) => item.title === title);
		if (!section) {
			section = { title, rows: [] };
			sections.push(section);
		}
		section.rows.push({
			title: row.title,
			rowId: row.rowId,
			...(row.description ? { description: row.description } : {}),
		});
	}
	body(requestOptions).sections = sections.map((section) =>
		section.title ? section : { rows: section.rows },
	);
	return requestOptions;
};

interface CardInput {
	mediaType: string;
	mediaUrl: string;
	text?: string;
	buttonType: string;
	buttonText: string;
	buttonUrl?: string;
	buttonId?: string;
	secondButtonText?: string;
	secondButtonId?: string;
}

/** Builds `cards` of the carousel: one URL button, or one or two quick replies per card. */
export const buildCarouselCards: PreSend = async function (
	this: IExecuteSingleFunctions,
	requestOptions,
) {
	const input = this.getNodeParameter('cards', {}) as { card?: CardInput[] };
	body(requestOptions).cards = (input.card ?? []).map((card) => {
		const buttons: IDataObject[] =
			card.buttonType === 'url'
				? [{ type: 'url', text: card.buttonText, url: card.buttonUrl }]
				: [{ type: 'reply', text: card.buttonText, id: card.buttonId }];
		if (card.buttonType === 'reply' && card.secondButtonText) {
			buttons.push({ type: 'reply', text: card.secondButtonText, id: card.secondButtonId });
		}
		return {
			header: { type: card.mediaType, url: card.mediaUrl },
			...(card.text ? { body: card.text } : {}),
			buttons,
		};
	});
	return requestOptions;
};

interface PhoneInput {
	number: string;
	type: string;
}

/** Builds `vcard.tel` of the contact message. */
export const buildContactPhones: PreSend = async function (
	this: IExecuteSingleFunctions,
	requestOptions,
) {
	const input = this.getNodeParameter('phones', {}) as { phone?: PhoneInput[] };
	const data = body(requestOptions);
	const vcard = (data.vcard ?? {}) as IDataObject;
	vcard.tel = (input.phone ?? []).map((phone) => ({ value: phone.number, type: [phone.type] }));
	data.vcard = vcard;
	return requestOptions;
};

/** Parses a JSON parameter (string or already an array/object) and sends it in `bodyProperty`. */
export function jsonParameter(parameterName: string, bodyProperty: string): PreSend {
	return async function (this: IExecuteSingleFunctions, requestOptions) {
		const value = this.getNodeParameter(parameterName, '') as unknown;
		if (value === '' || value === undefined || value === null) return requestOptions;
		let parsed = value;
		if (typeof value === 'string') {
			try {
				parsed = JSON.parse(value);
			} catch {
				throw new NodeOperationError(this.getNode(), `"${parameterName}" is not valid JSON`);
			}
		}
		const data = body(requestOptions);
		const path = bodyProperty.split('.');
		let target = data;
		for (const key of path.slice(0, -1)) {
			target[key] ??= {};
			target = target[key] as IDataObject;
		}
		target[path[path.length - 1]] = parsed as IDataObject;
		return requestOptions;
	};
}
