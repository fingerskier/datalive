# livingjson
Living JSON file


## Issues

* Currently doesn't handle empty array items
  * This is an issue with JSON stringification ~ arrays that include empty items do not get padded with `null` and there is no way to represent a blank range
  * The work-around is to pad it beforehand:
    `a = a.map(X=> X? X: null)`