import {ItemView, Notice, Workspace, WorkspaceLeaf} from "obsidian";
import AiAssistantPlugin from "../main";


const VIEW_TYPE_WRITING_ASSISTANT: string = 'writing-assistant-side-panel'

export default class AssistantPanelView extends ItemView {
	plugin: AiAssistantPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: AiAssistantPlugin) {
		super(leaf)
		this.plugin = plugin
	}

	getViewType(): string {
		return VIEW_TYPE_WRITING_ASSISTANT
	}

	getDisplayText(): string {
		return 'AI Writing Assistant '
	}

	async onOpen(): Promise<void> {
		this.registerEvent(
			this.app.workspace.on("active-leaf-change", (leaf) => {
				if (leaf?.getViewState().type === "markdown") {
					this.update()
				}
			})
		);
		this.update()
	}

	private update() {
		this.plugin.fetchMetadata().then((metadata) => {
			const container = this.containerEl.children[1]
			container.empty()

			const button = container.createEl('button', {text: 'Toggle Assistant'});
			button.addEventListener('click', async () => {
				try {
					metadata.toggleAssistant();
					await this.plugin.updateMetadata(metadata);
					this.update();
				} catch (error) {
					new Notice('Failed to enable assistant');
				}
			});

			if (metadata.hasOwnProperty('assistantOn')) {
				container.createEl('p', {text: `Assistant is ${metadata.assistantOn ? 'enabled' : 'disabled'}`})
			}
		});
	}

	static async activateView(workspace: Workspace) {
		let leaf: WorkspaceLeaf | null = null;

		workspace.iterateAllLeaves(leaf => {
			if (leaf.view instanceof AssistantPanelView) {
				workspace.revealLeaf(leaf);
			}
		})

		if (workspace.getLeavesOfType(VIEW_TYPE_WRITING_ASSISTANT).length == 0) {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			try {
				leaf = workspace.getRightLeaf(false);
			} catch (e) {
			}
			if (leaf) {
				await leaf.setViewState({type: VIEW_TYPE_WRITING_ASSISTANT, active: true});
			}

			// "Reveal" the leaf in case it is in a collapsed sidebar
			if (leaf) {
				await workspace.revealLeaf(leaf);
			}
		}
	}

	static async register(plugin: AiAssistantPlugin) {
		plugin.registerView(
			VIEW_TYPE_WRITING_ASSISTANT,
			(leaf: WorkspaceLeaf) => new AssistantPanelView(leaf, plugin)
		)
		await AssistantPanelView.activateView(plugin.app.workspace)
	}

}
