import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting
} from 'obsidian';
import AssistantPanelView from './app/RightPane';
import { CoreLogic } from "./core/CoreLogic";
import { HighlightText, Metadata, PluginPreferences } from "./types";
import { EditorView, Decoration, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { StateField, StateEffect, RangeSet, RangeValue } from '@codemirror/state';

declare const MODE: string;

const DEFAULT_SETTINGS: PluginPreferences = {
	geminiApiKey: ''
}

export default class AiAssistantPlugin extends Plugin {
	settings: PluginPreferences;
	core: CoreLogic;

	async onload() {
		await this.loadSettings();
		await AssistantPanelView.register(this);

		// 4. Register extensions
		this.registerEditorExtension([
			highlightField,
			highlightPlugin
		]);

		this.core = CoreLogic.createFor(MODE, this.settings);

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'analyse-for-highlights',
			name: 'Analyse for highlights',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				// @ts-expect-error
				const editorView = editor.cm as EditorView;
				const newRanges = await this.analyseForHighlights()
					.then(highlights => highlights.map(h => ({ from: h.startIndex, to: h.endIndex })));
				editorView.dispatch({
					effects: [
						clearHighlightsEffect.of(null),
						...newRanges.map((range: { from: number; to: number; }) => addHighlightEffect.of(range))
					]
				});
			}
		});

		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new AiAssistantSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async generateQuestions(): Promise<string[]> {
		const content = await this.getCurrentFileText();
		return this.core.generateQuestionsFor(content);
	}

	async analyseForHighlights(): Promise<HighlightText[]> {
		const content = await this.getCurrentFileText();
		return this.core.analyseForHighlights(content);
	}

	private async getCurrentFileText() {
		const lastFile = this.app.workspace.getActiveFile();
		const content = lastFile ? await this.app.vault.cachedRead(lastFile) : undefined;
		return content;
	}

	fetchMetadata(): Promise<Metadata> {
		return this.core.metadataFor(this.app.workspace.getActiveFile()?.name);
	}

	async updateMetadata(newVersion: Metadata) {
		this.core.updateMetadata(this.app.workspace.getActiveFile()?.name, newVersion);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah, MODE is: ' + MODE);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

class AiAssistantSettingTab extends PluginSettingTab {
	plugin: AiAssistantPlugin;

	constructor(app: App, plugin: AiAssistantPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Gemini API Key')
			.setDesc('Can be obtained at https://aistudio.google.com/')
			.addText(text => text
				.setPlaceholder('Enter your Gemini API Key')
				.setValue(this.plugin.settings.geminiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.geminiApiKey = value;
					await this.plugin.saveSettings();
				}));
	}
}

// 1. Define state effects
const addHighlightEffect = StateEffect.define<{ from: number; to: number }>();
const clearHighlightsEffect = StateEffect.define();

// 2. Create state field for decorations
const highlightField = StateField.define<RangeSet<Decoration>>({
	create() {
		return Decoration.none;
	},
	update(value, tr) {
		value = value.map(tr.changes);

		for (const effect of tr.effects) {
			if (effect.is(addHighlightEffect)) {
				const deco = Decoration.mark({
					class: 'custom-highlight',
				}).range(effect.value.from, effect.value.to);

				value = value.update({ add: [deco], sort: true });
			}
			else if (effect.is(clearHighlightsEffect)) {
				value = Decoration.none;
			}
		}

		return value;
	}
});

// 3. Updated ViewPlugin implementation
const highlightPlugin = ViewPlugin.fromClass(class {
	decorations: RangeSet<Decoration>;

	constructor(view: EditorView) {
		this.decorations = view.state.field(highlightField);
	}

	update(update: ViewUpdate) {
		this.decorations = update.view.state.field(highlightField);
	}
}, {
	decorations: v => v.decorations
});
