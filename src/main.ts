import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'
import { context } from '@actions/github'

function refIsValidMajorVer(ref: string): boolean {
	if (!ref.match(/^refs\/tags\/.+$/)) {
		return false
	}
	return true
}
function refIsValidSemVer(ref: string): boolean {
	if (!ref.match(/^refs\/tags\/v\d+\.\d+\.\d+$/)) {
		return false
	}
	return true
}
function getTagFromRef(ref: string): { tag: string; major: string } {
	const tag = ref.split('/')[2]
	const major = tag.split('.')[0]
	return { tag, major }
}

export async function run(): Promise<void> {
	try {
		const isDryRun = core.getInput('dry-run') === 'true'
		const dryRunTag = 'refs/tags/v999.999.999'
		const token = core.getInput('github-token')
		const octokit = new Octokit({ auth: token })

		const isPullRequest =
			(context.eventName === 'pull_request' ||
				context.eventName === 'pull_request_target') &&
			context.payload.pull_request !== undefined
		const isCreateEvent =
			context.eventName === 'create' && context.payload.ref_type === 'tag'
		const isWorkflowDispatchEvent = context.eventName === 'workflow_dispatch'

		core.debug(`isPullRequest: ${isPullRequest}`)
		core.debug(`isCreateEvent: ${isCreateEvent}`)
		core.debug(`isWorkflowDispatchEvent: ${isWorkflowDispatchEvent}`)

		const contextRef = isDryRun ? dryRunTag : context.ref

		core.debug(`context: ${JSON.stringify(context)}`)
		core.info(`ref: ${contextRef}`)

		if (!refIsValidMajorVer(contextRef)) {
			core.error(`ref is not a valid major version tag: ${contextRef}`)
			core.setFailed('ref is not a valid major version tag')
			return
		}

		if (!refIsValidSemVer(contextRef)) {
			core.error(`ref is not a semantic versioning tag: ${contextRef}`)
			core.setFailed(`tags expect semantic versioning format like v1.2.3`)
			return
		}

		const { tag, major } = getTagFromRef(contextRef)

		core.info(`tag: ${tag}`)
		core.info(`major: ${major}`)

		// Set to current commit SHA by default, but override with head commit SHA
		let sha = context.sha

		if (isCreateEvent) {
			core.info(`Create event detected, using context.sha for tag: ${tag}`)
		} else if (isWorkflowDispatchEvent) {
			core.info(
				`Workflow dispatch event detected, using context.sha for tag: ${tag}`
			)
		} else if (isPullRequest) {
			const prNumber = context.payload.pull_request?.number

			if (prNumber) {
				core.info(`Pull request #${prNumber} detected, fetching full data...`)
				core.info(`Using head.sha for tag: ${tag}`)
				// Fetch the complete PR object containing the head metadata
				const { data: pullRequest } = await octokit.pulls.get({
					owner: context.repo.owner,
					repo: context.repo.repo,
					pull_number: prNumber,
				})

				sha = pullRequest.head.sha
			} else {
				core.error(`Pull request number not found in context payload`)
				core.setFailed('Pull request number not found')
				return
			}
		} else {
			core.info(
				`Not a pull request, create event, or workflow dispatch event, using head_commit.id for tag: ${tag}`
			)
			sha = context.payload.head_commit.id
		}

		core.info(`sha: ${sha}`)

		const getRefParams = {
			owner: context.repo.owner,
			repo: context.repo.repo,
			ref: `tags/${major}`,
		}

		let ref
		try {
			ref = await octokit.git.getRef(getRefParams)
			core.info(`tag ${major} already exists`)
		} catch (error) {
			core.info(`tag ${major} does not exist yet: ${error}`)
		}

		if (isDryRun) {
			core.notice(
				`dry-run: would have created/updated tag ${major} to point to ${sha}`
			)
			return
		}

		if (ref) {
			core.info(`Updating tag ${major} to point to ${sha}`)
			await octokit.git.updateRef({
				...getRefParams,
				sha,
				force: true,
			})
			core.notice(`Updated tag ${major} to point to ${sha}`)
		} else {
			core.info(`Creating tag ${major} pointing to ${sha}`)
			await octokit.git.createRef({
				...getRefParams,
				sha,
				ref: `refs/tags/${major}`,
			})
			core.notice(`Created tag ${major} pointing to ${sha}`)
		}
	} catch (error) {
		if (error instanceof Error) core.setFailed(error.message)
	}
}
