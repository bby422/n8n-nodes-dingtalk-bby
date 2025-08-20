import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class DingTalkBbyApi implements ICredentialType {
	name = 'dingTalkBbyApi';

	displayName = 'DingTalk API';

	documentationUrl = 'https://github.com/bby422/n8n-nodes-dingtalk-bby';

	properties: INodeProperties[] = [
		{
			displayName: 'DingTalkClientId',
			name: 'clientId',
			type: 'string',
			default: '',
		},
		{
			displayName: 'DingTalkClientSecret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
	];
}
