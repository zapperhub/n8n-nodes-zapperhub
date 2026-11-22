import type { INodeProperties } from 'n8n-workflow';

import {
	bodyField,
	bodyOption,
	operationSelector,
	optionsCollection,
	paginationOptions,
	pathField,
	pathParam,
	showFor,
	trackSourceField,
} from '../shared';

const R = 'instagram';
const show = (...operations: string[]) => showFor(R, operations);

export const instagramDescription: INodeProperties[] = [
	operationSelector(
		R,
		[
			{
				name: 'Comment on Post',
				value: 'comment',
				action: 'Comment on a post',
				description: 'Publish a public comment, or a reply to a comment, on a post of the account',
				routing: {
					request: { method: 'POST', url: `=/posts/${pathParam('postId')}/comments` },
				},
			},
			{
				name: 'Get Many Posts',
				value: 'getPosts',
				action: 'Get many posts',
				routing: { request: { method: 'GET', url: '/posts' } },
			},
			{
				name: 'Get Post',
				value: 'getPost',
				action: 'Get a post',
				routing: { request: { method: 'GET', url: `=/posts/${pathParam('postId')}` } },
			},
			{
				name: 'Reply Privately to Comment',
				value: 'replyPrivately',
				action: 'Reply privately to a comment',
				description: 'Send a direct message to the author of a comment',
				routing: { request: { method: 'POST', url: '/messages/text' } },
			},
		],
		'replyPrivately',
	),
	pathField(show('comment', 'getPost'), {
		displayName: 'Post ID',
		name: 'postId',
		type: 'string',
		default: '',
		description: 'ID of the post (comment.postID in the comments.upsert event)',
	}),
	bodyField(show('comment'), {
		displayName: 'Comment',
		name: 'message',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		default: '',
	}),
	optionsCollection(show('comment'), [
		bodyOption({
			displayName: 'Reply to Comment ID',
			name: 'replyToCommentId',
			type: 'string',
			default: '',
			description: 'Publish the comment as a reply to this comment',
		}),
	]),
	bodyField(show('replyPrivately'), {
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the comment (comment.ID in the comments.upsert event)',
	}),
	bodyField(show('replyPrivately'), {
		displayName: 'Text',
		name: 'message',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		default: '',
	}),
	trackSourceField(show('replyPrivately')),
	optionsCollection(
		show('getPosts'),
		paginationOptions(50, 'The nextCursor value of the previous page'),
	),
];
