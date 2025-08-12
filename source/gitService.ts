import {simpleGit} from 'simple-git';

export interface Commit {
	hash: string;
	shortHash: string;
	message: string;
	author: string;
	date: Date;
	relativeDate: string;
}

export async function getCommits(
	repoPath: string,
	limit = 20,
): Promise<Commit[]> {
	const git = simpleGit(repoPath);
	try {
		const log = await git.log({maxCount: limit});

		return log.all.map(commit => ({
			hash: commit.hash,
			shortHash: commit.hash.substring(0, 7),
			message: commit.message,
			author: commit.author_name,
			email: commit.author_email,
			date: new Date(commit.date),
			relativeDate: getRelativeTime(new Date(commit.date)),
		}));
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
