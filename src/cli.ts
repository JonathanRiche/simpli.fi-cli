#!/usr/bin/env bun
import { SimplifiClient } from "simpl.fi-api-client";
import { Command } from 'commander';
const actions = [
	'list-campaigns',
	'update-campaign',
	'create-campaign',
	'list-ads',
	'create-ad',
	'update-ad',
	'delete-ad'
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
	.option('-ot --output-type <type>', 'Output type (json, csv)')
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
	outputType?: 'json' | 'csv'
	debug?: boolean
};

// if (Bun.env.APP_API_TOKEN && !options.apiKey) {
// 	console.log('Using env variables for APP_API_TOKEN');
// }
// if (Bun.env.USER_API_KEY && !options.userKey) {
// 	console.log('Using env variables for USER_API_KEY');
// }
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
async function saveOutput(output: any) {
	if (options.saveOutput) {
		const baseName = options.saveOutput.replace(/\.[^/.]+$/, ""); // Remove file extension if present
		const jsonFileName = `${baseName}.json`;
		const csvFileName = `${baseName}.csv`;

		if (options.outputType === 'csv') {
			console.log(`Saving ${options.action} output to ${csvFileName}`);

			// Save as CSV
			try {
				let csvContent = '';
				const dataToConvert = Array.isArray(output) ? output : [output];

				if (dataToConvert.length > 0) {
					// Add headers
					csvContent += Object.keys(dataToConvert[0]).join(',') + '\n';

					// Add data rows
					dataToConvert.forEach(item => {
						csvContent += Object.values(item).map(value => {
							if (typeof value === 'string' && value.includes(',')) {
								// Escape strings containing commas
								return `"${value.replace(/"/g, '""')}"`;
							}
							return value;
						}).join(',') + '\n';
					});
				}

				await Bun.write(csvFileName, csvContent);
			} catch (err) {
				console.error("Error converting to CSV:", err);
			}
		} else {
			console.log(`Saving ${options.action} output to ${jsonFileName}`);

			// Save as JSON
			await Bun.write(jsonFileName, JSON.stringify(output, null, 2));
		}


	} else {
		console.log(output);
	}
}
// async function saveOutput(output: any) {
// 	if (options.saveOutput) {
// 		console.log(`Saving ${options.action} output to ${options.saveOutput}`);
// 		await Bun.write(options.saveOutput, JSON.stringify(output));
// 	} else {
// 		console.log(output);
// 	}
// }
async function main() {
	if (options.listActions) {
		console.log(`Available actions: ${actions.map((a) => { return `\n✅${a}` }).join('')}`);
		return;
	}
	switch (options.action) {
		case 'list-campaigns':
			if (!options.orgId) {
				console.error('Organization ID required');
				return;
			}
			const campaigns = await client.listCampaigns();
			if (options.saveOutput) {
				await saveOutput(campaigns.campaigns);
			} else {
				console.log(campaigns.campaigns);
			}
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

