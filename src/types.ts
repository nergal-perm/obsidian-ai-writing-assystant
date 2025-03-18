export class Metadata {
	assistantOn: boolean;

	static create() {
		return new Metadata();
	}

	constructor() {
		this.assistantOn = false;
	}

	toggleAssistant(): void {
		if (this.hasOwnProperty("assistantOn")) {
			this.assistantOn = !this.assistantOn;
		} else {
			this.assistantOn = true;
		}
	}
}

export interface PluginPreferences {
	geminiApiKey: string;
}

export interface HighlightText {
	id: string;
	labelType: string;
	text: string;
	startIndex: number;
	endIndex: number;
}
