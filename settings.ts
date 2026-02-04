export interface ShareHubSettings {
	githubToken: string;
	repoOwner: string;
	repoName: string;
	branch: string;
	homeMoc: string;
}

export const DEFAULT_SETTINGS: ShareHubSettings = {
	githubToken: '',
	repoOwner: '',
	repoName: '',
	branch: 'main',
	homeMoc: '_home.md'
};