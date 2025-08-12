import {simpleGit} from 'simple-git';

export interface Commit {
	hash: string;
	shortHash: string;
	message: string;
	author: string;
	date: Date;
	relativeDate: string;
	parent: string[];
	graphSymbol: string;
}

export interface RepoInfo {
	currentBranch: string;
	totalCommits: number;
}

export async function getCommits(
	repoPath: string,
	limit = 20,
): Promise<Commit[]> {
	const git = simpleGit(repoPath);

	try {
		const log = await git.log({
			maxCount: limit,
			format: {
				hash: '%H',
				date: '%ai',
				message: '%s',
				author_name: '%an',
				author_email: '%ae',
				parents: '%P',
			},
		});

		return log.all.map((commit, index) => {
			const parents = commit.parents ? commit.parents.split(' ') : [];
			const isFirstCommit = index === 0;
			const isMerge = parents.length > 1;

			let graphSymbol = '●';
			if (isFirstCommit) graphSymbol = '●'; 
			else if (isMerge) graphSymbol = '◎'; 
			else graphSymbol = '○'; 

			return {
				hash: commit.hash,
				shortHash: commit.hash.substring(0, 7),
				message: commit.message,
				author: commit.author_name,
				date: new Date(commit.date),
				relativeDate: getRelativeTime(new Date(commit.date)),
				parent: parents,
				graphSymbol,
			};
		});
	} catch (error) {
		throw new Error(`Failed to load commits: ${(error as Error).message}`);
	}
}
function getRelativeTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays > 0) return `${diffDays}d ago`;
	if (diffHours > 0) return `${diffHours}h ago`;
	if (diffMins > 0) return `${diffMins}m ago`;
	return 'just now';
}

export async function getRepoInfo(repoPath: string): Promise<RepoInfo> {
	const git = simpleGit(repoPath);

	try {
		const status = await git.status();
		const log = await git.log();

		return {
			currentBranch: status.current || 'unknown',
			totalCommits: log.total,
		};
	} catch (error) {
		throw new Error(`Failed to get repo Info: ${(error as Error).message}`);
	}
}
