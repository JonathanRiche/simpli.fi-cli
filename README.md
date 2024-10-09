# Simpli.fi API CLI Tool

This CLI tool allows you to interact with the Simpli.fi API, performing actions such as listing campaigns and creating new campaigns.

This package relies onto the [Simpli.fi API Client](https://github.com/JonathanRiche/simpli.fi-api) package, which is a wrapper around the Simpli.fi API.
## Installation

To install the CLI tool globally, run:

```bash
npm install -g simpl.fi-api-client
```

## Usage

The general syntax for using the CLI is:

```bash
simplifi [options] --action <action>
```

### Options

- `-o, --org-id <id>` (required): Your Simpli.fi Organization ID
- `-k, --api-key [key]`: App API Key for Simpli.fi
- `-u, --user-key [key]`: User API Key for Simpli.fi
- `-a, --action <action>`: Action to perform (e.g., list-campaigns, create-campaign)
- `-f, --file <file>`: File to read for specific actions (e.g., a JSON file for create-campaign)
- `-s, --save-output`: Save output to a file
- `-V, --version`: Output the version number
- `-h, --help`: Display help for command

### Environment Variables

You can set the following environment variables instead of passing them as command-line options:

- `APP_API_TOKEN`: For the App API Key
- `USER_API_KEY`: For the User API Key

If these environment variables are set, the CLI will use them automatically.

### Actions

#### List Campaigns

To list all campaigns:

```bash
simplifi -o <your-org-id> --action list-campaigns
```

#### Create Campaign

To create a new campaign:

```bash
simplifi -o <your-org-id> --action create-campaign
```

Note: The create-campaign action is currently a placeholder and needs to be implemented with the necessary options for campaign details.

### Examples

1. List campaigns using environment variables for API keys:

```bash
export APP_API_TOKEN=your_app_token
export USER_API_KEY=your_user_key
simplifi -o 12345 --action list-campaigns
```

2. List campaigns with API keys provided as options:

```bash
simplifi -o 12345 -k your_app_token -u your_user_key --action list-campaigns
```

3. Save output to a file:

```bash
simplifi -o 12345 --action list-campaigns --save-output
```

## Development

To contribute to this project:

1. Clone the repository
2. Install dependencies with `npm install` or `bun install`
3. Make your changes
4. Build the project with `bun run build`
5. Test your changes
