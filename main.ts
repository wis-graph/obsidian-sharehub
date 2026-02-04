import { Plugin } from 'obsidian';

export default class ShareHubPlugin extends Plugin {
	async onload() {
		console.log('Loading ShareHub plugin');

		this.addRibbonIcon('github', 'ShareHub', () => {
			console.log('ShareHub ribbon clicked');
		});

		this.addCommand({
			id: 'share-note',
			name: 'Share current note to GitHub',
			callback: () => {
				console.log('Share current note');
			}
		});
	}

	onunload() {
		console.log('Unloading ShareHub plugin');
	}
}