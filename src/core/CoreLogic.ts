import { ModelAdapter} from '../models/ModelAdapter';
import { DbAdapter } from '../db/db';
import { HighlightText, Metadata, PluginPreferences } from "../types";

export class CoreLogic {
	db: DbAdapter;
	llm: ModelAdapter;

	static createFor(mode: string, settings?: PluginPreferences, ) {
		if (mode === 'development') {
			return new CoreLogic(DbAdapter.createNullable(), ModelAdapter.createNullable());
		} else {
			return new CoreLogic(DbAdapter.create(), ModelAdapter.create(settings));
		}
	}

	constructor(db: DbAdapter, llm: ModelAdapter) {
		this.db = db;
		this.llm = llm;
	}

	metadataFor(activeFile: string | undefined): Promise<Metadata> {
		return this.db.fetchMetadata(activeFile);
	}

	updateMetadata(activeFile: string | undefined, newVersion: Metadata) {
		if (activeFile) {
			this.db.saveMetadata(activeFile, newVersion);
		}
	}

	async generateQuestionsFor(content: string | undefined): Promise<string[]> {
		if (!content) {
			return [];
		}
		return this.llm.generateQuestionsFor(content);
	}

	async analyseForHighlights(content: string | undefined): Promise<HighlightText[]> {
		if (!content) {
			return [];
		}
		return this.llm.analyseForHighlights(content);
	}
}
