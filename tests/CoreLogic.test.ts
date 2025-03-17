import { CoreLogic } from "../src/core/CoreLogic";
import { DEFAULT_QUESTIONS } from "../src/models/ModelAdapter";

describe('CoreLogic', () => {
	it('should generate default questions', async () => {
		const target = CoreLogic.createFor('development');

		// Act
		const questions = await target.generateQuestionsFor("Any content");

		// Assert
		expect(questions).toEqual(DEFAULT_QUESTIONS);
	});
});
