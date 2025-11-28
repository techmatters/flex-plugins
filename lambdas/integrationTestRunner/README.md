# Integration Tests

Integration tests for Lambda webhook functionality using Mockttp.

## Structure

- `*.test.ts` - Integration test files
- `jest.config.js` - Jest configuration
- `setTestEnvVars.js` - Environment variable setup
- `package.json` - Dependencies (Jest, Mockttp, ts-jest)

## Running Tests

### Locally

```bash
cd lambdas/integrationTests
npm test
```

### In Lambda (via integrationTestRunner)

The `integrationTestRunner` Lambda executes these tests and returns the results.

Set the `ALB_URL` environment variable to point to the Lambda under test.

## Writing Tests

Tests use Mockttp to mock webhook endpoints:

```typescript
import * as mockttp from 'mockttp';

describe('My webhook test', () => {
  let webhookServer: mockttp.Mockttp;

  beforeEach(async () => {
    webhookServer = mockttp.getLocal();
    await webhookServer.start();
  });

  afterEach(async () => {
    await webhookServer.stop();
  });

  test('should send webhook', async () => {
    const webhookEndpoint = await webhookServer
      .forPost('/webhook')
      .thenReply(200, JSON.stringify({ success: true }));

    const webhookUrl = `http://localhost:${webhookServer.port}/webhook`;

    // Call your Lambda under test via ALB
    const response = await fetch(`${process.env.ALB_URL}/your-endpoint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl }),
    });

    // Verify webhook was called
    const requests = await webhookEndpoint.getSeenRequests();
    expect(requests.length).toBe(1);
  });
});
```

## Environment Variables

- `ALB_URL` - URL of the ALB in front of the Lambda under test
- `AWS_REGION` - AWS region (default: us-east-1)
- `NODE_ENV` - Node environment (default: test)
