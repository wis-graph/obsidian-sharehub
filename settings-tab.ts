import { PluginSettingTab, App, Setting } from 'obsidian';
import ShareHubPlugin from './main';

export class ShareHubSettingTab extends PluginSettingTab {
	plugin: ShareHubPlugin;

	constructor(app: App, plugin: ShareHubPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'ShareHub Settings' });

		new Setting(containerEl)
			.setName('GitHub Token')
			.setDesc('Personal Access Token with repo permissions')
			.addText((text) =>
				text
					.setPlaceholder('ghp_...')
					.setValue(this.plugin.settings.githubToken)
					.onChange(async (value) => {
						this.plugin.settings.githubToken = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Repository Owner')
			.setDesc('GitHub username or organization name')
			.addText((text) =>
				text
					.setPlaceholder('your-username')
					.setValue(this.plugin.settings.repoOwner)
					.onChange(async (value) => {
						this.plugin.settings.repoOwner = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Repository Name')
			.setDesc('Name of the GitHub repository')
			.addText((text) =>
				text
					.setPlaceholder('your-repo')
					.setValue(this.plugin.settings.repoName)
					.onChange(async (value) => {
						this.plugin.settings.repoName = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Branch')
			.setDesc('Git branch to push to (default: main)')
			.addText((text) =>
				text
					.setPlaceholder('main')
					.setValue(this.plugin.settings.branch)
					.onChange(async (value) => {
						this.plugin.settings.branch = value || 'main';
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Home MOC File')
			.setDesc('Filename of the home Map of Content file')
			.addText((text) =>
				text
					.setPlaceholder('_home.md')
					.setValue(this.plugin.settings.homeMoc)
					.onChange(async (value) => {
						this.plugin.settings.homeMoc = value || '_home.md';
						await this.plugin.saveSettings();
					})
			);
	}
}