export default {
	preset: 'ts-jest',
	testEnvironment: 'jsdom', // For IndexedDB support
	transform: {
		'^.+\\.tsx?$': 'ts-jest',
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
