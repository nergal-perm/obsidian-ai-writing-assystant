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

	saveMetadata(activeFile: string, newVersion: Metadata) {
		this.db.saveMetadataFor(activeFile, newVersion);
	}
}

interface DbWrapper {
	fetchMetadataFor(activeFile: string | undefined): Promise<Metadata>;

	saveMetadataFor(activeFile: string, newVersion: Metadata): void;
}

class MockDb implements DbWrapper {
	metadata: Map<string, Metadata> = new Map<string, Metadata>();

	constructor() {
		this.metadata.set('test.md', new Metadata());
	}

	async fetchMetadataFor(activeFile: string | undefined): Promise<Metadata> {
		if (activeFile) {
			return Promise.resolve(this.metadata.get(activeFile) || Metadata.create());
		}
		return Promise.resolve(Metadata.create());
	}

	async saveMetadataFor(activeFile: string, newVersion: Metadata): Promise<void> {
		this.metadata.set(activeFile, newVersion);
	}
}
