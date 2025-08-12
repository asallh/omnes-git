import React, {useEffect, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import Spinner from 'ink-spinner';
import {Commit, getCommits} from './gitService.js';

type Props = {
	repoPath: string;
};

export default function App({repoPath}: Props) {
	const [commits, setCommits] = useState<Commit[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedIndex, setSelectedIndex] = useState(0);

	useEffect(() => {
		loadCommits();
	}, []);

	const loadCommits = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await getCommits(repoPath);
			setCommits(data);
		} catch (error) {
			setError((error as Error).message);
		} finally {
			setLoading(false);
		}
	};

	useInput((input, key) => {
		if (input === 'q') {
			process.exit(0);
		}

		// Navigation
		if (key.upArrow && selectedIndex > 0) {
			setSelectedIndex(selectedIndex - 1);
		}

		if (key.downArrow && selectedIndex < commits.length - 1) {
			setSelectedIndex(selectedIndex + 1);
		}
	});

	if (loading) {
		return (
			<Box justifyContent="center" alignItems="center" minHeight="5">
				<Spinner type="dots" />
				<Text>Loading Commits ...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Box flexDirection="column" alignItems="center" minHeight="5">
				<Text color="red">❌{error}</Text>
				<Text dimColor>Press 'q' to exit</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" minHeight={10}>
			{/* Header */}
			<Text color="blue" bold>
				🌿 omnes-git
			</Text>
			<Text dimColor>Repository: {repoPath}</Text>

			{/* Commits List */}
			<Box flexDirection="column" marginTop={1}>
				<Text bold>Recent Commits:</Text>
				{commits.slice(0, 10).map(commit => (
					<Box key={commit.hash} marginLeft={1}>
						<Text color="yellow">●</Text>
						<Text color="gray"> {commit.shortHash}</Text>
						<Text> {commit.message}</Text>
						<Text dimColor> ({commit.relativeDate})</Text>
					</Box>
				))}
			</Box>

			<Text dimColor>Press 'q' to quit</Text>
		</Box>
	);
}
