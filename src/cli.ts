#!/usr/bin/env bun
import { SimplifiClient } from "simpl.fi-api-client";
import { Command } from 'commander';
const program = new Command();
program
	.name('simplifi')
	.description('CLI to interact with Simpli.fi API')
	.version('1.0.0')
	.requiredOption('-o, --org-id <id>', 'Organization ID')
	.option('-k, --api-key [key]', 'App API Key for Simpli.fi')
	.option('-u, --user-key [key]', 'User API Key for Simpli.fi')
	.option('-a, --action <action>', 'Action to perform (e.g., list-campaigns, create-campaign)')
	.option('-f, --file <file>', 'File to read for specific actions, such as a JSON file for create-campaign')
	.option('-s --save-output', 'Save output to a file')
	.parse(Bun.argv);
const options = program.opts();

if (Bun.env.APP_API_TOKEN && !options.apiKey) {
	console.log('Using env variables for APP_API_TOKEN');
}
if (Bun.env.USER_API_KEY && !options.userKey) {
	console.log('Using env variables for USER_API_KEY');
}
if (!options.orgId) {
	console.error('Organization ID required');
}

const config: {
	userApiKey?: string,
	appApiKey?: string,
	orgId?: string

} = {};
if (options.apiKey) {
	config.appApiKey = options.apiKey;
}
if (options.userKey) {
	config.userApiKey = options.userKey;
}
if (options.orgId) {
	config.orgId = options.orgId;
}
const client = new SimplifiClient(config);

async function main() {
	switch (options.action) {
		case 'list-campaigns':
			const campaigns = await client.listCampaigns();
			console.log(campaigns);
			break;
		case 'create-campaign':
			console.log('Creating a campaign');
			// You would need to add more options for campaign details
			// const newCampaign = await client.createCampaign({ ... });
			// console.log(newCampaign);
			break;
		default:
			console.log('Unknown action. Use --help for usage information.');
	}
}

main().catch(console.error);

