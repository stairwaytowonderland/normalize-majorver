[**normalize-majorver**](../../README.md)

***

[normalize-majorver](../../README.md) / [main](../README.md) / run

# Function: run()

```ts
function run(): Promise<void>;
```

Defined in: [main.ts:21](https://github.com/stairwaytowonderland/normalize-majorver/blob/main/src/main.ts#L21)

Main entry point for the GitHub Action that handles tagging logic based on the event context.

Handles dry-run mode, pull request events, create events, and workflow dispatch events to determine the appropriate tag and commit SHA.

## Returns

`Promise`\<`void`\>

Promise that resolves when the action has completed or rejects if an error occurs
