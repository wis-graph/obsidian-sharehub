import { Octokit } from 'octokit';
import { ShareHubSettings } from './settings';

export class GitHubService {
	private octokit: Octokit;

	constructor(settings: ShareHubSettings) {
		if (!settings.githubToken) {
			throw new Error('GitHub token is required');
		}
		this.octokit = new Octokit({ auth: settings.githubToken });
	}

	async getFileContent(path: string, settings: ShareHubSettings): Promise<{ content: string; sha: string } | null> {
		try {
			const response = await this.octokit.rest.repos.getContent({
				owner: settings.repoOwner,
				repo: settings.repoName,
				path,
				ref: settings.branch
			});

			const data = response.data as any;
			if (data.type === 'file') {
				return {
					content: Buffer.from(data.content, 'base64').toString('utf-8'),
					sha: data.sha
				};
			}
			return null;
		} catch (error: any) {
			if (error.status === 404) {
				return null;
			}
			throw error;
		}
	}

	async createOrUpdateFile(
		path: string,
		content: string,
		settings: ShareHubSettings,
		message: string
	): Promise<void> {
		const existing = await this.getFileContent(path, settings);

		if (existing) {
			await this.octokit.rest.repos.createOrUpdateFileContents({
				owner: settings.repoOwner,
				repo: settings.repoName,
				path,
				message,
				content: Buffer.from(content).toString('base64'),
				sha: existing.sha,
				branch: settings.branch
			});
		} else {
			await this.octokit.rest.repos.createOrUpdateFileContents({
				owner: settings.repoOwner,
				repo: settings.repoName,
				path,
				message,
				content: Buffer.from(content).toString('base64'),
				branch: settings.branch
			});
		}
	}

	async uploadFile(
		path: string,
		content: ArrayBuffer,
		settings: ShareHubSettings,
		message: string
	): Promise<void> {
		const base64Content = Buffer.from(content).toString('base64');
		await this.octokit.rest.repos.createOrUpdateFileContents({
			owner: settings.repoOwner,
			repo: settings.repoName,
			path,
			message,
			content: base64Content,
			branch: settings.branch
		});
	}
}