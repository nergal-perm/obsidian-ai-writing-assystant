import {DbWrapper} from '../db/DbWrapper';

export class CoreLogic {
	db: DbWrapper;

	constructor(mode: string) {
		if (mode === 'development') {
			this.db = DbWrapper.createNullable();
		} else {
			this.db = DbWrapper.create();
		}
	}

	metadataFor(activeFile: string | undefined) :Promise<void>{
		return this.db.fetchMetadata(activeFile);
	}
}
