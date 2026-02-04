import { Plugin, TFile, Notice } from 'obsidian';
import { ShareHubSettings, DEFAULT_SETTINGS } from './settings';
import { ShareHubSettingTab } from './settings-tab';
import { GitHubService } from './github-service';
import { HomeMocManager } from './home-moc-manager';

export default class ShareHubPlugin extends Plugin {
	settings: ShareHubSettings;

	async onload() {
		console.log('Loading ShareHub plugin');

		await this.loadSettings();

		this.addRibbonIcon('github', 'ShareHub', () => {
			new Notice('ShareHub: Right-click a note or use the command to share');
		});

		this.addCommand({
			id: 'share-note',
			name: 'Share current note to GitHub',
			callback: () => {
				this.shareCurrentNote();
			}
		});

		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				if (file instanceof TFile && file.extension === 'md') {
					menu.addItem((item) => {
						item
							.setTitle('Share to GitHub')
							.setIcon('github')
							.onClick(() => {
								this.shareNote(file);
							});
					});
				}
			})
		);

		this.addSettingTab(new ShareHubSettingTab(this.app, this));
	}

	onunload() {
		console.log('Unloading ShareHub plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async shareCurrentNote() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('No active note found');
			return;
		}

		await this.shareNote(activeFile);
	}

	async shareNote(file: TFile) {
		if (!this.settings.githubToken) {
			new Notice('Please configure GitHub token in settings');
			return;
		}

		if (!this.settings.repoOwner || !this.settings.repoName) {
			new Notice('Please configure GitHub repository in settings');
			return;
		}

		try {
			new Notice('Sharing note to GitHub...', 2000);

			const githubService = new GitHubService(this.settings);

			const content = await this.app.vault.read(file);
			await githubService.createOrUpdateFile(
				file.name,
				content,
				this.settings,
				`Update ${file.name}`
			);

			const imageLinks = HomeMocManager.parseImageLinks(content);
			if (imageLinks.length > 0) {
				new Notice(`Found ${imageLinks.length} images, uploading...`, 2000);
				await this.uploadImages(imageLinks, githubService);
			}

			const noteName = file.name.replace('.md', '');
			await HomeMocManager.addNoteToHome(noteName, this.settings, githubService);

			const shareUrl = this.generateShareUrl(noteName);
			navigator.clipboard.writeText(shareUrl);

			new Notice(`Successfully shared! URL copied to clipboard`);
		} catch (error: any) {
			console.error('Error sharing note:', error);
			new Notice(`Error: ${error.message}`);
		}
	}

	async uploadImages(imageNames: string[], githubService: GitHubService) {
		for (const imageName of imageNames) {
			try {
				const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
				let foundFile: TFile | null = null;
				let foundExtension = '';

				for (const ext of extensions) {
					const file = this.app.vault.getAbstractFileByPath(imageName + ext);
					if (file instanceof TFile) {
						foundFile = file;
						foundExtension = ext;
						break;
					}
				}

				if (!foundFile) {
					console.warn(`Image file not found: ${imageName}`);
					continue;
				}

				const imageBuffer = await this.app.vault.readBinary(foundFile);
				const newFileName = `_image_${imageName}${foundExtension}`;

				await githubService.uploadFile(
					newFileName,
					imageBuffer,
					this.settings,
					`Upload ${newFileName}`
				);

				console.log(`Uploaded: ${newFileName}`);
			} catch (error: any) {
				console.error(`Error uploading image ${imageName}:`, error);
			}
		}
	}

	generateShareUrl(noteName: string): string {
		return `https://wis-graph.github.io/sharehub/#/${noteName}.md`;
	}
}