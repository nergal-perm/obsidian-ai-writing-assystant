import {Metadata} from '../types';

export class DbAdapter {
	db: DbWrapper;

	static create() {
		return new DbAdapter(new MockDb());
	}

	static createNullable() {
		return new DbAdapter(new MockDb());
	}

	private constructor(db: DbWrapper) {
		this.db = db;
	}


	fetchMetadata(activeFile: string | undefined) {
		return this.db.fetchMetadataFor(activeFile);
	}
}

interface DbWrapper {
	fetchMetadataFor(activeFile: string | undefined): Promise<Metadata>;
}

class MockDb implements DbWrapper {
	metadata: Map<string, Metadata> = new Map<string, Metadata>();

	constructor() {
		this.metadata.set('test.md', {title: 'Test'});
	}

	async fetchMetadataFor(activeFile: string | undefined): Promise<Metadata> {
		if (activeFile) {
			return Promise.resolve(this.metadata.get(activeFile) || {} as Metadata);
		}
		return Promise.resolve({} as Metadata);
	}
}
