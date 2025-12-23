import { App, Editor, MarkdownView, Modal, Notice, Plugin, TFile, debounce } from 'obsidian';
import { DEFAULT_SETTINGS, MyPluginSettings, SampleSettingTab } from "./settings";

// Remember to rename these classes and interfaces!

import { parseKanbanFile } from "./parser";
import { TaskTracker } from "./tracker";

export default class XPSystemPlugin extends Plugin {
	settings: MyPluginSettings;
	tracker: TaskTracker;

	async onload() {
		await this.loadSettings();

		// Hello World notice
		new Notice('XP System Plugin Loaded');
		console.log('XP System Plugin Loaded');

		// Initialize Tracker
		this.tracker = new TaskTracker(this.app.vault);

		// Track specific file (hardcoded for now as per plan Phase 0/1)
		const trackedFile = '00. Inbox/test.md';

		// Initialize state on load if file exists
		this.app.workspace.onLayoutReady(async () => {
			const file = this.app.vault.getAbstractFileByPath(trackedFile);
			if (file instanceof TFile) {
				await this.tracker.initializeFile(file);
			}
		});

		// Register File Modify Event with Debounce (1s)
		this.registerEvent(
			this.app.vault.on('modify', debounce((file) => {
				if (file instanceof TFile && file.path === trackedFile) {
					this.tracker.processFileChange(file);
				}
			}, 1000, true))
		);

		this.addCommand({
			id: 'xp-system-test',
			name: 'Test XP System Parser',
			callback: async () => {
				const file = this.app.vault.getAbstractFileByPath('00. Inbox/test.md');
				if (file) {
					// @ts-ignore - we know it's a TFile
					const content = await this.app.vault.read(file);
					const data = parseKanbanFile(content);
					console.log(data);

					// Write debug output
					const debugPath = '00. Inbox/debug_parser_output.json';
					let debugFile = this.app.vault.getAbstractFileByPath(debugPath);
					if (!debugFile) {
						// @ts-ignore
						debugFile = await this.app.vault.create(debugPath, JSON.stringify(data, null, 2));
					} else {
						// @ts-ignore
						await this.app.vault.modify(debugFile, JSON.stringify(data, null, 2));
					}
					new Notice('Parser test complete. Check debug_parser_output.json');
				} else {
					new Notice('Test file not found!');
				}
			}
		});

		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<MyPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
