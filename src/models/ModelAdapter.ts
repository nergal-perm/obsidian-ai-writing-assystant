// Default questions to show when user starts typing
export const DEFAULT_QUESTIONS = [
	"What do you currently believe about this?",
	"What do you want to say about it?",
	"Why is this an interesting problem?",
];

export class ModelAdapter {
	private model: ModelWrapper;

	static create(): ModelAdapter {
		return new ModelAdapter(new MockModel());
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
}

interface ModelWrapper {
	generateQuestionsFor(content: string): Promise<string[]>;

}

class MockModel implements ModelWrapper {
	generateQuestionsFor(content: string): Promise<string[]> {
		return Promise.resolve(DEFAULT_QUESTIONS);
	}

}
