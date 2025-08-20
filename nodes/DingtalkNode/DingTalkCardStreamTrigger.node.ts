import {
	ITriggerFunctions,
	INodeType,
	INodeTypeDescription,
	ITriggerResponse,
	NodeConnectionType
} from 'n8n-workflow';
import { DWClient, RobotMessage, TOPIC_ROBOT, TOPIC_CARD } from 'dingtalk-stream';

enum DingTalkType{
	ROBOT = 'TOPIC_ROBOT',
	CARD = 'TOPIC_CARD',
}
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
		description: '钉钉流式触发节点',
		defaults: {
			name: '钉钉流式触发节点',
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

	async trigger(this: ITriggerFunctions): Promise<ITriggerResponse | undefined> {
		let client: DWClient | null = null;
		const isAutoResponse = this.getNodeParameter('isAutoResponse') as boolean;
		const credentials = (await this.getCredentials('dingTalkCardApi')) as DingTalkCardCredentials;
		const { clientId, clientSecret } = credentials || {};

		client = new DWClient({ clientId, clientSecret });
		client
			.registerCallbackListener(TOPIC_ROBOT, async (res) => {
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
							msgType: DingTalkType.ROBOT,
							messageId,
							message,
						},
					]),
				]);
			})
			.connect();
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
							msgType: DingTalkType.CARD,
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
