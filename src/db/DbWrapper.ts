export class DbWrapper {
	static create() {
		return new DbWrapper();
	}

	static createNullable() {
		return new DbWrapper();
	}

	fetchMetadata(activeFile: string | undefined) {
		return Promise.resolve(undefined);
	}
}
