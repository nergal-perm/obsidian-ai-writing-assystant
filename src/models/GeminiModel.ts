import { HighlightText } from "src/types";
import { ModelWrapper } from "./ModelAdapter";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default class GeminiModel implements ModelWrapper {
	private model;

	constructor(apiKey: string | undefined) {
		if (!apiKey) {
			throw new Error("API key is required to use the Gemini model");
		}
		this.model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
			model: 'gemini-1.5-pro',
			generationConfig: {
				responseMimeType: 'application/json'
			}
		});
	}

	async analyseForHighlights(content: string): Promise<HighlightText[]> {
		throw new Error("Method not implemented.");
	}

	async generateQuestionsFor(content: string): Promise<string[]> {
		const prompt = GeminiModel.constructQuestionPrompt(content);
		console.log(prompt);
		return this.model.generateContent(prompt).then((result) => {
			console.log(result.response.text());
			return JSON.parse(result.response.text())
		});
	}

	// Helper method to construct the question generation prompt
	private static constructQuestionPrompt(content: string): string {
		return `
	You are a critical thinking assistant helping a writer develop their ideas on the topic of their writing.
	
	Based on what they've written so far, generate 3 thought-provoking questions that will help them explore their ideas more deeply.
	
	Good questions should:
	- Be specific to the content they've written
	- Push them to consider different perspectives
	- Help them elaborate on their reasoning
	- Be concise (no more than 12 words each)
	- Focus on critical thinking
	
	Their current text:
	${content.slice(-1000)} [...]
	
	Answer in Russian.
	
	Return only the questions as a valid JSON array of strings.
	
	The answer should be just the resulting JSON array using this JSON schema:
	
	Return: Array<string>
	`;
	}
}
