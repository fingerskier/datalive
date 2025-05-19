# datalive

Persisted JSON with live in-memory access.

## Usage

```javascript
import DataLive from './index.js';

const store = new DataLive('settings.json', {
  defaultValue: { count: 0 }
});

const data = store.live();
data.count += 1; // automatically written to settings.json
```

Enable verbose logging by passing `verbose: true`. Log messages are emitted via
`console.debug` so they can be filtered or ignored as needed.
