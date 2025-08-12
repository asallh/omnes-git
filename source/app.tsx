import React, {useEffect, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import Spinner from 'ink-spinner';
import {Commit, getCommits, getRepoInfo, RepoInfo} from './gitService.js';

type Props = {
	repoPath: string;
};

export default function App({repoPath}: Props) {
	const [commits, setCommits] = useState<Commit[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);

	const banner = `
		####### #     # #     # #######  #####         #####  ### ####### 
		#     # ##   ## ##    # #       #     #       #     #  #     #    
		#     # # # # # # #   # #       #             #        #     #    
		#     # #  #  # #  #  # #####    #####  ##### #  ####  #     #    
		#     # #     # #   # # #             #       #     #  #     #    
		#     # #     # #    ## #       #     #       #     #  #     #    
		####### #     # #     # #######  #####         #####  ###    #    																
	`;

	useEffect(() => {
		loadCommits();
	}, []);

	const loadCommits = async () => {
		try {
			setLoading(true);
			setError(null);
			const [commitData, repoData] = await Promise.all([
				getCommits(repoPath),
				getRepoInfo(repoPath),
			]);
			setCommits(commitData);
			setRepoInfo(repoData);
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

		if (input === 'r') {
			loadCommits();
		}
		if (input === 'q') {
			process.exit(0);
		}

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
				<Box flexDirection="column" alignItems="center">
					<Spinner type="dots" />
					<Text>{commits.length > 0 ?'Refreshing...' : "Loading Commits ..."}</Text>
					{
						commits.length > 0 &&(
							<Text dimColor>Press 'q' to cancel</Text>
						)
					}
				</Box>
			</Box>
		);
	}

	if (error) {
		return (
			<Box flexDirection="column" alignItems="center" minHeight={10}>
				<Box borderStyle="round" borderColor="red" padding={1}>
					<Box flexDirection="column" alignItems="center">
						<Text color="red" bold>
							❌ Error
						</Text>
						<Text color="red">{error}</Text>
						<Text dimColor>Press 'r' to retry or 'q' to quit</Text>
					</Box>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" minHeight={10}>
			{/* Header */}
			<Box borderStyle={'round'} borderColor={'blue'} padding={1}>
				<Box flexDirection="column">
					<Box justifyContent="space-between">
						<Text color={'blue'}>{banner}</Text>
						<Text dimColor>↑↓ navigate • q quit</Text>
					</Box>
					{repoInfo && (
						<Box marginTop={1}>
							<Text>
								<Text color={'green'}>📁</Text>
								<Text>{repoPath.split('/').pop()}</Text>
								<Text color={'yellow'}>{repoInfo.currentBranch}</Text>
								<Text color={'gray'}>{repoInfo.totalCommits}</Text>
							</Text>
						</Box>
					)}
				</Box>
			</Box>

			{/* Commits List */}
			<Box flexDirection="column" marginTop={1}>
				<Text bold>Recent Commits:</Text>
				{commits.slice(0, 10).map((commit, index) => (
					<Box key={commit.hash} marginLeft={1}>
						<Text color={index === selectedIndex ? 'blue' : 'yellow'}>●</Text>
						<Text color="gray"> {commit.shortHash}</Text>
						<Text> {commit.message}</Text>
						<Text dimColor> ({commit.relativeDate})</Text>
					</Box>
				))}
			</Box>

			{commits[selectedIndex] && (
				<Box
					borderStyle={'round'}
					borderColor={'gray'}
					padding={1}
					marginTop={1}
				>
					<Box flexDirection="column">
						<Text bold color={'yellow'}>
							Selected Commit:
						</Text>
						<Text>
							<Text color={'gray'}>Hash:</Text>
							<Text bold>{commits[selectedIndex].hash} </Text>
						</Text>
						<Text>
							<Text color={'gray'}>Author:</Text>
							<Text bold>{commits[selectedIndex].author} </Text>
						</Text>
						<Text>
							<Text color={'gray'}>Date:</Text>
							<Text bold>
								{commits[selectedIndex].date.toLocaleDateString()}{' '}
								{commits[selectedIndex].date.toLocaleTimeString()}
							</Text>
						</Text>
						<Text>
							<Text color={'gray'}>Message:</Text>
							<Text bold>{commits[selectedIndex].message} </Text>
						</Text>
					</Box>
				</Box>
			)}
		</Box>
	);
}
