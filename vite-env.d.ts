declare global {
	namespace globalThis {
		var GIT_BRANCH: string
		var GIT_REPOSITORY: string
		var GIT_COMMIT_HASH: string
	}
}
export {}