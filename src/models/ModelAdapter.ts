import { HighlightText, PluginPreferences } from "src/types";
import GeminiModel from "./GeminiModel";

// Default questions to show when user starts typing
export const DEFAULT_QUESTIONS = [
	"What do you currently believe about this?",
	"What do you want to say about it?",
	"Why is this an interesting problem?",
];

export class ModelAdapter {
	private model: ModelWrapper;

	static create(settings: PluginPreferences | undefined): ModelAdapter {
		return new ModelAdapter(new GeminiModel(settings?.geminiApiKey));
	}
	static createNullable(): ModelAdapter {
		return new ModelAdapter(new MockModel());
	}

	private constructor(model: ModelWrapper) {
		this.model = model;
	}

	async generateQuestionsFor(content: string): Promise<string[]> {
		return this.model.generateQuestionsFor(content);
	}

	async analyseForHighlights(content: string): Promise<HighlightText[]> {
		return this.model.analyseForHighlights(content);
	}
}

export interface ModelWrapper {
	analyseForHighlights(content: string): Promise<HighlightText[]>;
	generateQuestionsFor(content: string): Promise<string[]>;

}

class MockModel implements ModelWrapper {
	analyseForHighlights(content: string): Promise<HighlightText[]> {
		return Promise.resolve([{
			id: "1",
			labelType: "highlight",
			text: "Hello, world!",
			startIndex: 0,
			endIndex: 12,
		}
		]);
	}
	generateQuestionsFor(content: string): Promise<string[]> {
		return Promise.resolve(DEFAULT_QUESTIONS);
	}
}

