import { HighlightText, PluginPreferences } from "src/types";
import GeminiModel from "./GeminiModel";
import { randomUUID } from "crypto";

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
		console.log(content);
		return Promise.resolve(
			this.getMatchIndices(content, /\s(систем)/g, "claim")
				.concat(this.getMatchIndices(content, /\s(работ)/g, "evidence"))
		);
	}

	generateQuestionsFor(content: string): Promise<string[]> {
		return Promise.resolve(DEFAULT_QUESTIONS);
	}

	getMatchIndices(text: string, pattern: RegExp, style: string): HighlightText[] {

		const matches: Array<HighlightText> = [];
		let match: RegExpExecArray | null;

		while ((match = pattern.exec(text)) !== null) {
			matches.push({
				id: randomUUID(),
				labelType: style,
				text: match[0],
				startIndex: match.index,
				endIndex: match.index + match[0].length
			});
		}

		return matches;
	}
}

