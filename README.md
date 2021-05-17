# ssm-lock

Simple class to create a mutex using AWS SSM Parameter Store(https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html) leveraging the fact that creating parameters is an atomic operation.

# Requirements

An execution role that allows creating/deleting SSM parameters

# Example

```
  const SSMLock = require('./ssm-lock');
  // Lock becomes stale after 60 seconds
  const ssml = new SSMLock('mylock', { debug: false, timeout: 60 });
  let result = await ssml.acquireLock();
  console.log('Acquired lock:', result);
  result = await ssml.releaseLock();
  console.log('Released lock:', result);

```
