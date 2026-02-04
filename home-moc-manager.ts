import { ShareHubSettings } from './settings';
import { GitHubService } from './github-service';

export class HomeMocManager {
	static parseImageLinks(content: string): string[] {
		const imageRegex = /!\[\[(.*?)\]\]/g;
		const images: string[] = [];
		let match;

		while ((match = imageRegex.exec(content)) !== null) {
			images.push(match[1]);
		}

		return images;
	}

	static parseNoteLinks(content: string): string[] {
		const noteRegex = /\[\[(.*?)\]\]/g;
		const notes: string[] = [];
		let match;

		while ((match = noteRegex.exec(content)) !== null) {
			const noteName = match[1];
			if (!noteName.includes('.') || noteName.endsWith('.md')) {
				notes.push(noteName);
			}
		}

		return notes;
	}

	static async addNoteToHome(
		noteName: string,
		settings: ShareHubSettings,
		githubService: GitHubService
	): Promise<void> {
		const homeContent = await githubService.getFileContent(settings.homeMoc, settings);

		const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
		const noteLink = `- [[${noteName}]] ${timestamp}`;

		if (!homeContent) {
			const initialContent = `# Home MOC\n\n## Recent Notes\n\n${noteLink}\n`;
			await githubService.createOrUpdateFile(
				settings.homeMoc,
				initialContent,
				settings,
				`Add ${noteName} to Home MOC`
			);
			return;
		}

		const lines = homeContent.content.split('\n');
		const recentSectionIndex = lines.findIndex(line =>
			line.trim().toLowerCase() === '## recent notes'
		);

		if (recentSectionIndex === -1) {
			const newContent = homeContent.content + `\n\n## Recent Notes\n\n${noteLink}\n`;
			await githubService.createOrUpdateFile(
				settings.homeMoc,
				newContent,
				settings,
				`Add ${noteName} to Home MOC`
			);
			return;
		}

		lines.splice(recentSectionIndex + 2, 0, noteLink);
		const newContent = lines.join('\n');

		await githubService.createOrUpdateFile(
			settings.homeMoc,
			newContent,
			settings,
			`Add ${noteName} to Home MOC`
		);
	}
}