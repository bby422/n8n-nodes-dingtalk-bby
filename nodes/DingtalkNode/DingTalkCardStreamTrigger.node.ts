import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeConnectionType,
} from 'n8n-workflow';
import { DWClient, RobotMessage, TOPIC_CARD } from 'dingtalk-stream';

interface DingTalkCardCredentials {
	clientId: string;
	clientSecret: string;
}
export class DingTalkCardStreamTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DingTalkCardStreamTrigger',
		name: 'dingTalkCardStreamTrigger',
		icon: 'file:dingtalk.svg',
		group: ['trigger'],
		version: 1,
		description: '钉钉卡片流式触发节点',
		defaults: {
			name: '钉钉卡片流式触发节点',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'isAutoResponse',
				name: 'isAutoResponse',
				type: 'boolean',
				default: true,
				placeholder: '',
				description: 'Whether to automatically respond (to avoid server-side retries)',
			},
		],
		credentials: [
			{
				name: 'dingTalkCardApi',
				required: true,
			},
		]
	};

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
		let client: DWClient | null = null;
		const isAutoResponse = this.getNodeParameter('isAutoResponse') as boolean;
		const credentials = (await this.getCredentials('dingTalkCardApi')) as DingTalkCardCredentials;
		const { clientId, clientSecret } = credentials || {};

		client = new DWClient({ clientId, clientSecret });
		client
			.registerCallbackListener(TOPIC_CARD, async (res) => {
				const message = JSON.parse(res.data) as RobotMessage;
				const messageId = res.headers.messageId;
				const accessToken = await client?.getAccessToken();

				if (isAutoResponse) {
					client?.socketCallBackResponse(messageId, {});
				}
				this.emit([
					this.helpers.returnJsonArray([
						{
							accessToken,
							messageId,
							message,
						},
					]),
				]);
			})
			.connect();

		return {
			closeFunction: async () => {
				client?.disconnect();
				client = null;
			},
		};
	}
}
