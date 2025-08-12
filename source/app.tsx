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
	
		$$$$$$\  $$\      $$\ $$\   $$\ $$$$$$$$\  $$$$$$\           $$$$$$\  $$$$$$\ $$$$$$$$\ 
		$$  __$$\ $$$\    $$$ |$$$\  $$ |$$  _____|$$  __$$\         $$  __$$\ \_$$  _|\__$$  __|
		$$ /  $$ |$$$$\  $$$$ |$$$$\ $$ |$$ |      $$ /  \__|        $$ /  \__|  $$ |     $$ |   
		$$ |  $$ |$$\$$\$$ $$ |$$ $$\$$ |$$$$$\    \$$$$$$\  $$$$$$\ $$ |$$$$\   $$ |     $$ |   
		$$ |  $$ |$$ \$$$  $$ |$$ \$$$$ |$$  __|    \____$$\ \______|$$ |\_$$ |  $$ |     $$ |   
		$$ |  $$ |$$ |\$  /$$ |$$ |\$$$ |$$ |      $$\   $$ |        $$ |  $$ |  $$ |     $$ |   
		$$$$$$  |$$ | \_/ $$ |$$ | \$$ |$$$$$$$$\ \$$$$$$  |        \$$$$$$  |$$$$$$\    $$ |   
		\______/ \__|     \__|\__|  \__|\________| \______/          \______/ \______|   \__|   
                                                                                         
                                                                                         
                                                                                         
                                                                                  
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
		if (input === 'q' || key.escape) {
			process.exit(0);
		}

		if (input === 'r') {
			loadCommits();
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
			<Box
				justifyContent="center"
				alignItems="center"
				height="100%"
				padding={2}
			>
				<Box
					flexDirection="column"
					alignItems="center"
					borderStyle="double"
					borderColor="blue"
					padding={2}
				>
					<Spinner type="dots" />
					<Text color="blue" bold>
						{' '}
						{commits.length > 0
							? 'Refreshing commits...'
							: 'Loading repository...'}
					</Text>
					<Text color="gray">Please wait</Text>
				</Box>
			</Box>
		);
	}

	// Better error state
	if (error) {
		return (
			<Box
				justifyContent="center"
				alignItems="center"
				height="100%"
				padding={2}
			>
				<Box
					flexDirection="column"
					alignItems="center"
					borderStyle="double"
					borderColor="red"
					padding={2}
				>
					<Text color="red" bold>
						⚠️ Error Loading Repository
					</Text>
					<Box marginY={1} paddingX={2} borderLeft={true} borderColor="red">
						<Text color="red">{error}</Text>
					</Box>
					<Text color="gray">Press 'r' to retry • 'q' to quit</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" minHeight={10}>
			<Box justifyContent="center" width="100%">
				<Text color={'blue'}>{banner}</Text>
			</Box>
			{/* Header */}
			<Box borderStyle={'round'} borderColor={'blue'} padding={1}>
				<Box flexDirection="column">
					<Box justifyContent="space-between">
						<Text dimColor>↑↓ navigate • q quit</Text>
					</Box>
					{repoInfo && (
						<Box marginTop={1} justifyContent="space-between">
							<Box flexDirection="row" alignItems="center" gap={1}>
								<Text color="green">📁</Text>
								<Text bold>{repoPath.split('/').pop()}</Text>
								<Text color="yellow" dimColor>
									 {repoInfo.currentBranch}
								</Text>
							</Box>
							<Box flexDirection="row" alignItems="center" gap={1}>
								<Text color="gray">Total Commits:</Text>
								<Text color="white" bold>
									{repoInfo.totalCommits}
								</Text>
							</Box>
						</Box>
					)}
				</Box>
			</Box>

			{/* Main content area */}
			<Box flexGrow={1} marginTop={1}>
				<Box flexDirection="row" height="100%">
					{/* Left panel - Commits */}
					<Box
						flexDirection="column"
						borderStyle="round"
						borderColor="gray"
						padding={1}
						width="60%"
						marginRight={1}
					>
						<Text bold color="white" backgroundColor="gray">
							{' '}
							Recent Commits{' '}
						</Text>
						<Box flexDirection="column" marginTop={1}>
							{commits.slice(0, 12).map((commit, index) => (
								<Box key={commit.hash} paddingX={1}>
									<Box width={3}>
										{index > 0 && <Text color="gray">│</Text>}
										<Text
											color={
												commit.graphSymbol === '●'
													? 'green'
													: commit.graphSymbol === '◎'
													? 'yellow'
													: 'cyan'
											}
										>
											{commit.graphSymbol}
										</Text>
									</Box>
									<Text color={index === selectedIndex ? 'white' : 'yellow'}>
										●
									</Text>
									<Text color={index === selectedIndex ? 'white' : 'gray'}>
										{' '}
										{commit.shortHash}
									</Text>
									<Text color={index === selectedIndex ? 'white' : 'white'}>
										{' '}
										{commit.message.slice(0, 40)}
										{commit.message.length > 40 ? '...' : ''}
									</Text>
								</Box>
							))}
						</Box>
					</Box>

					{/* Right panel - Details */}
					<Box
						flexDirection="column"
						borderStyle="round"
						borderColor="yellow"
						padding={1}
						width="40%"
					>
						<Text bold color="black" backgroundColor="yellow">
							{' '}
							Commit Details{' '}
						</Text>
						{commits[selectedIndex] && (
							<Box flexDirection="column" marginTop={1}>
								<Box marginBottom={1}>
									<Text color="gray">Hash:</Text>
									<Text color="yellow" bold>
										{' '}
										{commits[selectedIndex].shortHash}
									</Text>
								</Box>

								<Box marginBottom={1}>
									<Text color="gray">Author:</Text>
									<Text color="cyan"> {commits[selectedIndex].author}</Text>
								</Box>

								<Box marginBottom={1}>
									<Text color="gray">When:</Text>
									<Text color="green">
										{' '}
										{commits[selectedIndex].relativeDate}
									</Text>
								</Box>

								<Box marginBottom={1}>
									<Text color="gray">Date:</Text>
									<Text>
										{' '}
										{commits[selectedIndex].date.toLocaleDateString()}
									</Text>
								</Box>

								<Box>
									<Text color="gray">Message:</Text>
									<Box
										marginTop={1}
										paddingX={1}
										borderLeft={true}
										borderColor="gray"
									>
										<Text italic>{commits[selectedIndex].message}</Text>
									</Box>
								</Box>
							</Box>
						)}
					</Box>
				</Box>
			</Box>

			{/* Footer status bar */}
			<Box borderStyle="round" borderColor="gray" padding={1} marginTop={1}>
				<Box justifyContent="space-between">
					<Text>
						<Text color="green">●</Text>
						<Text> Ready</Text>
					</Text>
					<Text>
						<Text color="gray">
							Showing {Math.min(commits.length, 12)} of {commits.length} commits
						</Text>
					</Text>
					<Text color="gray">{new Date().toLocaleTimeString()}</Text>
				</Box>
			</Box>
		</Box>
	);
}
