# datalive
Living JSON with live in-memory access.


## Events

Instances emit `change` and `delete` events whenever a top-level key is
modified.  Listen for a specific key using `change:<key>` or for all changes
with the generic `change` event.


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
