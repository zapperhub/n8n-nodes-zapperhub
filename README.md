# n8n-nodes-zapperhub

Official [n8n](https://n8n.io/) nodes for [ZapperHub](https://zapperhub.com), the WhatsApp API for
messages and voice calls, on the official Meta connection (Cloud API) or by QR Code.

This package replaces `n8n-nodes-zapperapi`. ZapperAPI is now ZapperHub.

- [Installation](#installation)
- [Credentials](#credentials)
- [Nodes](#nodes)
- [Compatibility](#compatibility)
- [Resources](#resources)

## Installation

In n8n, open **Settings > Community Nodes**, click **Install** and enter `n8n-nodes-zapperhub`.
See the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

## Credentials

Each credential is one ZapperHub instance (one connected number). In the
[ZapperHub panel](https://app.zapperhub.com), open **Instances** and copy:

- **Instance ID**, for example `inst_abcdefg123456`
- **API Key** of the instance

## Nodes

### ZapperHub Trigger

Starts the workflow when an event happens in the instance. When the workflow is published, or when
you listen for a test event, the node creates a webhook in the instance with the events you chose.
It removes the webhook when the workflow stops.

- Every delivery is checked against the `x-webhook-signature` header (HMAC-SHA256 with the API key).
  Deliveries without a valid signature get `401`.
- **Ignore Messages Sent by Me** is on by default, so a workflow that replies does not trigger itself.
- ZapperHub only accepts HTTPS webhook URLs, so n8n must be reachable from the internet.

Events: message received or sent, message status, message error, message edited or deleted, connection
update, call update, group participants update, marketing preference change, contact identity change,
template sync finished, storage failed or recovered, Instagram comment, Instagram token expired or
refresh failed.

### ZapperHub

| Resource | Operations |
| --- | --- |
| Message | Send text, media, audio, sticker, location, contact, buttons, list, carousel, template, PIX charge, text as voice; react; mark as read; delete; get many; get delivery receipts; check the 24-hour service window |
| Call | Make, play audio, hang up, reject, get, get many, get and request call permission |
| Chat | Archive, unarchive, mute, pin, delete |
| Contact | Check numbers, get, get profile picture, get phone number from LID, block, unblock, get blocked, get marketing opt-outs, set marketing preference, delete data |
| Group | Create, get, get many, update name and description, update and remove picture, update settings, get and reset invite link, get invite info, join with invite, leave, update participants, get and approve or reject join requests. QR Code instances only. |
| Community | Create, get many, get groups, create group, link and unlink group, get participants. QR Code instances only. |
| Template | Get, get many, sync with Meta, get sync status |
| Instagram | Reply privately to a comment, comment on a post, get post, get many posts |
| Channel | Get many |
| Profile | Update picture, remove picture, update about |
| Connection | Get (status, QR Code or pairing code) |

Media, audio and sticker accept a URL, a base64 file or a binary file from a previous node. Messages
sent by the node carry `trackSource: "n8n"` in the message log and in the webhook events.

Send Text, Send Media (image, video and audio) and Send Audio have the Group Status option. It posts
the message as a status of the group, which only the participants of the group see. QR Code instances
only.

The node can be used as a tool by the n8n AI Agent.

## Compatibility

Tested with n8n 2.48.

## Resources

- [ZapperHub documentation](https://docs.zapperhub.com)
- [API reference](https://docs.zapperhub.com/api-reference)
- [Webhook events](https://docs.zapperhub.com/integrations/webhooks)
- [n8n community nodes](https://docs.n8n.io/integrations/#community-nodes)
