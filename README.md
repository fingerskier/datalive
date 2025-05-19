# datalive
Living JSON file

## Events

Instances emit `change` and `delete` events whenever a top-level key is
modified.  Listen for a specific key using `change:<key>` or for all changes
with the generic `change` event.
