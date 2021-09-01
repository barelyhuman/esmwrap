# esmwrap

ESM wrapper generator that just get's the job done

**UNDER HEAVY DEVELOPMENT, THE API MIGHT CHANGE**

## Badges

<a href="/LICENSE"><img alt="GitHub" src="https://img.shields.io/github/license/barelyhuman/esmwrap?logoColor=000&colorA=000000&colorB=000000"></a>
<a href="https://standardjs.com"><img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg?colorA=000000&colorB=000000" alt="JavaScript Style Guide"></a>
<a href="https://www.npmjs.com/package/esmwrap"><img src="https://img.shields.io/npm/v/esmwrap?style=flat&amp;colorA=000000&amp;colorB=000000" alt="Version"></a>
<a href="https://www.npmjs.com/package/esmwrap"><img src="https://img.shields.io/npm/dt/esmwrap.svg?style=flat&amp;colorA=000000&amp;colorB=000000" alt="Downloads"></a>

## Features

- 🤏 Tiny, less than 1KB (**894B** brotli, **1KB** gzipped)
- ✨ Supports input globs
- 🌳 Tree Shakeable
- 📦 Programmable API supports ESM Module
- 🐕 Built by Dogfooding

## Installation

```bash
  npm install -D esmwrap
  #or
  yarn add -D esmwrap
```

## Usage/Examples

```bash
$ esmwrap <input-glob> <output-directory>

eg:
$ esmwrap ./dist/*.js ./dist/esm
```

## API Reference

#### `esmwrap(sourceGlob,destinationDirectory)`

**Require Syntax**

```js
const { esmwrap } = require("esmwrap");

esmwrap("./dist/*.js", "./dist/esm");
```

**Import Syntax**

```js
import { esmwrap } from "esmwrap";

esmwrap("./dist/*.js", "./dist/esm");
```

## Roadmap

- [ ] Add Tests
- [ ] Add suffix support (Folks might want it to output with a different name , eg: `index.esm.js`);
- [ ] Optimize the file matcher

## Contributing

Contributions are always welcome!

Follow the general github flow of Fork => PR, make sure that you let the authors know about the issue you pick to avoid overlaps.

## Authors

- [@barelyhuman](https://www.github.com/barelyhuman)

## Support

For support, email ahoy@barelyhuman.dev

## License

[MIT](https://choosealicense.com/licenses/mit/)
