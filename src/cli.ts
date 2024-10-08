#!/usr/bin/env bun
import { SimplifiClient } from "simpl.fi-api-client";
import { Command } from 'commander';
const actions = [
	'list-campaigns',
	'update-campaign',
	'create-campaign',
	'list-ads'
] as const;

const program = new Command();
program
	.name('simplifi')
	.description('CLI to interact with Simpli.fi API')
	.version('1.0.0')
	.option('-o, --org-id <id>', 'Organization ID')
	.option('-k, --api-key [key]', 'App API Key for Simpli.fi')
	.option('-u, --user-key [key]', 'User API Key for Simpli.fi')
	.option('-a, --action <action>', 'Action to perform (e.g., list-campaigns, create-campaign)')
	.option('-c, --campaign-id <id>', 'Campaign ID')
	.option('-f, --file <file>', 'File to read for specific actions, such as a JSON file for create-campaign')
	.option('-s --save-output <path>', 'Save output to a file')
	.option('-d --debug', 'Debug output of data from API')
	.option('-l --list-actions', 'List available actions')
	.parse(Bun.argv);
const options = program.opts() as {
	orgId: string,
	apiKey?: string,
	userKey?: string,
	action: typeof actions[number],
	campaignId?: string,
	file?: string,
	listActions?: boolean,
	saveOutput?: string
	debug?: boolean
};

if (Bun.env.APP_API_TOKEN && !options.apiKey) {
	console.log('Using env variables for APP_API_TOKEN');
}
if (Bun.env.USER_API_KEY && !options.userKey) {
	console.log('Using env variables for USER_API_KEY');
}
if (!options.orgId) {
	if (options.listActions) {
		//do nothing
	} else {
		console.error('Organization ID required');
	}
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
	if (options.listActions) {
		console.log('Available actions:', actions.join(', '));
		return;
	}
	switch (options.action) {
		case 'list-campaigns':
			const campaigns = await client.listCampaigns();
			console.log(campaigns);
			break;
		case 'list-ads':
			if (!options.campaignId) {
				console.error('Campaign ID required');
				return;
			}
			const ads = await client.listAds({
				campaignId: +options.campaignId
			});
			if (options.saveOutput) {
				console.log(`Saving ads to ${options.saveOutput}`);
				await Bun.write(options.saveOutput, JSON.stringify(ads));
			} else {
				console.log(ads);
			}
			break;
		case 'create-campaign':
			console.log('Creating a campaign');
			// You would need to add more options for campaign details
			// const newCampaign = await client.createCampaign({ ... });
			// console.log(newCampaign);
			break;
		case 'update-campaign':
			if (!options.campaignId) {
				console.error('Campaign ID required');
				return;
			}
			if (!options.file) {
				console.error('Please provide the campaign body for updating a campaign')
				return;
			}
			const file = Bun.file(options.file);
			const contents = await file.json();
			const updatedCampaign = await client.updateCampaign({
				campaignId: +options.campaignId,
				campaignData: {
					name: contents.name,
					end_date: contents.end_date
				}
			});
			if (options.saveOutput) {
				console.log(`Saving updated campaign to ${options.saveOutput}`);
				await Bun.write(options.saveOutput, JSON.stringify(updatedCampaign));
			} else {
				console.log(`Updating a campaign with ID ${options.campaignId}`, updatedCampaign);
			}

			break;

		default:
			console.log('Unknown action. Use --help for usage information.');
	}
}

main().catch(console.error);

