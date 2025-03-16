import {DbAdapter} from '../db/db';
import {Metadata} from "../types";

export class CoreLogic {
	db: DbAdapter;

	constructor(mode: string) {
		if (mode === 'development') {
			this.db = DbAdapter.createNullable();
		} else {
			this.db = DbAdapter.create();
		}
	}

	metadataFor(activeFile: string | undefined) :Promise<Metadata>{
		return this.db.fetchMetadata(activeFile);
	}

	updateMetadata(activeFile: string | undefined, newVersion: Metadata) {
		if (activeFile) {
			this.db.saveMetadata(activeFile, newVersion);
		}
	}
}
