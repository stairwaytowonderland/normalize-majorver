/* eslint-disable @typescript-eslint/no-explicit-any */

import { expect, jest, test, describe, beforeEach } from '@jest/globals'
import { context } from '@actions/github'
import * as core from '../__fixtures__/core.js'

// Create constructor mock
const mockOctokitConstructor = jest.fn()

// Set up ALL module mocks before any imports happen
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => ({ context }))
jest.unstable_mockModule('@octokit/rest', () => ({
	Octokit: mockOctokitConstructor,
}))

// Dynamically import Octokit and main app code
const { Octokit } = await import('@octokit/rest')
const { run } = await import('../src/main.js')

const mockedContext = jest.mocked(context, { shallow: true })

describe('Normalize Major Version', () => {
	let updateRef: jest.Mock<any>
	let createRef: jest.Mock<any>

	beforeEach(() => {
		mockOctokitConstructor.mockReset()

		// Clear out old fixture call histories and values safely
		core.getInput.mockReset()
		core.setFailed.mockReset()
		core.info.mockReset()
		core.notice.mockReset()
		// Use parameter-aware mock implementation instead of fragile sequential mocking
		core.getInput.mockImplementation((name: string) => {
			if (name === 'github-token') return 'mygithubtoken'
			return 'false' // default dry-run to false for standard paths
		})

		Object.defineProperty(mockedContext, 'repo', {
			get: () => ({ owner: 'fake-owner', repo: 'fake-repo' }),
			configurable: true,
		})

		Object.defineProperty(context, 'ref', {
			get: () => 'refs/tags/v1.2.3',
			configurable: true,
		})

		Object.defineProperty(context, 'payload', {
			get: () => ({ head_commit: { id: 'commit_sha' } }),
			configurable: true,
		})

		updateRef = jest.fn<any>()
		createRef = jest.fn<any>()
	})

	test('Create a new major tag', async () => {
		const github = {
			git: {
				// Returns a rejected Promise simulating a 404 error
				getRef: jest.fn<any>().mockRejectedValue(new Error('Not Found')),
				createRef,
			},
		}

		jest.mocked(Octokit).mockImplementation(() => github as any)

		await run()

		expect(createRef).toHaveBeenCalledWith({
			owner: 'fake-owner',
			repo: 'fake-repo',
			ref: 'refs/tags/v1',
			sha: 'commit_sha',
		})
	})

	test('Update an existing major tag', async () => {
		const github = {
			git: {
				getRef: jest.fn<any>().mockResolvedValue(true),
				createRef,
				updateRef,
			},
		}
		jest.mocked(Octokit).mockImplementation(() => github as any)

		await run()

		expect(updateRef).toHaveBeenCalledWith({
			owner: 'fake-owner',
			repo: 'fake-repo',
			ref: 'tags/v1',
			sha: 'commit_sha',
			force: true,
		})
	})

	test('Fails', async () => {
		const github = {
			git: {
				getRef: jest.fn<any>().mockResolvedValue(true),
				updateRef: jest.fn<any>().mockRejectedValue(new Error('error')),
			},
		}
		jest.mocked(Octokit).mockImplementation(() => github as any)

		await run()

		expect(core.setFailed).toHaveBeenCalledWith('error')
	})

	test('Fails with not tag reference', async () => {
		Object.defineProperty(context, 'ref', {
			get: () => 'refs/heads/master',
			configurable: true,
		})

		await run()

		expect(core.setFailed).toHaveBeenCalledWith(
			'ref is not a valid major version tag'
		)
	})

	test('Fails with not semantic versioning tag', async () => {
		Object.defineProperty(context, 'ref', {
			get: () => 'refs/tags/v1.2',
			configurable: true,
		})

		await run()

		expect(core.setFailed).toHaveBeenCalledWith(
			`tags expect semantic versioning format like v1.2.3`
		)
	})

	// test for dry-run mode with the tag already existing
	test('Dry-run mode with existing tag', async () => {
		const github = {
			git: {
				getRef: jest.fn<any>().mockResolvedValue(true),
				updateRef,
			},
		}
		jest.mocked(Octokit).mockImplementation(() => github as any)

		// Safely set dry-run to true without clearing the github-token
		core.getInput.mockImplementation((name: string) => {
			if (name === 'dry-run') return 'true'
			if (name === 'github-token') return 'mygithubtoken'
			return ''
		})

		await run()

		expect(updateRef).not.toHaveBeenCalled()
		expect(core.notice).toHaveBeenCalledWith(
			expect.stringContaining(
				'dry-run: would have created/updated tag v999 to point to commit_sha'
			)
		)
	})

	// test for dry-run mode with the tag not existing
	test('Dry-run mode with non-existing tag', async () => {
		const github = {
			git: {
				getRef: jest.fn<any>().mockRejectedValue(new Error('Not Found')),
				createRef,
			},
		}
		jest.mocked(Octokit).mockImplementation(() => github as any)

		// Safely set dry-run to true without clearing the github-token
		core.getInput.mockImplementation((name: string) => {
			if (name === 'dry-run') return 'true'
			if (name === 'github-token') return 'mygithubtoken'
			return ''
		})

		await run()

		expect(createRef).not.toHaveBeenCalled()
		expect(core.notice).toHaveBeenCalledWith(
			expect.stringContaining(
				'dry-run: would have created/updated tag v999 to point to commit_sha'
			)
		)
	})

	test('Fails with unexpected errors', async () => {
		// 1. Force the very first line of your action to crash violently
		core.getInput.mockImplementation(() => {
			throw new Error('Something went terribly wrong')
		})

		await run()

		// 2. Verify it skipped normal validation and landed directly in line 67's catch block
		expect(core.setFailed).toHaveBeenCalledWith('Something went terribly wrong')
	})

	test('Fails with raw string exceptions', async () => {
		// 1. Force a raw string throw instead of a standard Error object
		core.getInput.mockImplementation(() => {
			throw 'Uncaught string exception'
		})

		await run()

		// 2. Verify that it safely catches it but skips the setFailed condition
		expect(core.setFailed).not.toHaveBeenCalled()
	})

	test('Pull request event uses head.sha instead of head_commit.id with PR number', async () => {
		Object.defineProperty(context, 'eventName', {
			get: () => 'pull_request',
			configurable: true,
		})
		Object.defineProperty(context, 'payload', {
			get: () => ({
				head_commit: { id: 'head_commit_id' },
				head: { sha: 'head_sha' },
				pull_request: { number: 123 },
			}),
			configurable: true,
		})

		const github = {
			git: {
				getRef: jest.fn<any>().mockRejectedValue(new Error('Not Found')),
				createRef,
			},
			pulls: {
				// Mock the API call that fetches the full PR details
				get: jest.fn<any>().mockResolvedValue({
					data: {
						head: { sha: 'head_sha' },
					},
				}),
			},
		}
		jest.mocked(Octokit).mockImplementation(() => github as any)

		await run()

		// Verify the API was called with the correct PR number
		expect(github.pulls.get).toHaveBeenCalledWith({
			owner: 'fake-owner',
			repo: 'fake-repo',
			pull_number: 123,
		})

		expect(createRef).toHaveBeenCalledWith({
			owner: 'fake-owner',
			repo: 'fake-repo',
			ref: 'refs/tags/v1',
			sha: 'head_sha',
		})
	})

	test('Pull request event fails when PR number is missing', async () => {
		Object.defineProperty(context, 'eventName', {
			get: () => 'pull_request',
			configurable: true,
		})
		Object.defineProperty(context, 'payload', {
			get: () => ({
				head_commit: { id: 'head_commit_id' },
				head: { sha: 'head_sha' },
				pull_request: {}, // Missing number
			}),
			configurable: true,
		})

		await run()

		expect(core.setFailed).toHaveBeenCalledWith('Pull request number not found')
		expect(core.error).toHaveBeenCalledWith(
			'Pull request number not found in context payload'
		)
	})

	test('Create event uses context.sha instead of head_commit.id', async () => {
		Object.defineProperty(context, 'eventName', {
			get: () => 'create',
			configurable: true,
		})
		Object.defineProperty(context, 'sha', {
			get: () => 'context_sha',
			configurable: true,
		})
		Object.defineProperty(context, 'payload', {
			get: () => ({
				ref_type: 'tag',
			}),
			configurable: true,
		})

		const github = {
			git: {
				getRef: jest.fn<any>().mockRejectedValue(new Error('Not Found')),
				createRef,
			},
		}
		jest.mocked(Octokit).mockImplementation(() => github as any)

		await run()

		expect(createRef).toHaveBeenCalledWith({
			owner: 'fake-owner',
			repo: 'fake-repo',
			ref: 'refs/tags/v1',
			sha: 'context_sha',
		})
	})

	test('Workflow dispatch event uses context.sha instead of head_commit.id', async () => {
		Object.defineProperty(context, 'eventName', {
			get: () => 'workflow_dispatch',
			configurable: true,
		})
		Object.defineProperty(context, 'sha', {
			get: () => 'context_sha',
			configurable: true,
		})

		const github = {
			git: {
				getRef: jest.fn<any>().mockRejectedValue(new Error('Not Found')),
				createRef,
			},
		}
		jest.mocked(Octokit).mockImplementation(() => github as any)

		await run()

		expect(createRef).toHaveBeenCalledWith({
			owner: 'fake-owner',
			repo: 'fake-repo',
			ref: 'refs/tags/v1',
			sha: 'context_sha',
		})
	})
})
