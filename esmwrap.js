const { lstatSync, mkdirSync, readdirSync, writeFileSync } = require('fs')
const { basename, join, relative, resolve } = require('path')
const picomatch = require('picomatch')

async function cli () {
  const [source, destinationDirectory, options] = parseArgs()

  if (options.printHelp) {
    return printUsage()
  }

  await esmwrap(source, destinationDirectory, { extension: options.extension })
  console.log('✔ ESM Wrappers Created!')
}

async function esmwrap (
  source,
  destinationDirectory,
  options = { extension: '.esm.js' }
) {
  const matchingFiles = await parseGlob(source)
  matchingFiles.forEach((file) => {
    let _file = basename(file)
    const _wrapperText = getWrapperText(file, destinationDirectory)
    mkdirSync(destinationDirectory, { recursive: true })

    if (options.extension) {
      _file = _file.replace(/(.js|.cjs)$/, options.extension)
    }

    const filePath = join(destinationDirectory, _file)
    writeFileSync(filePath, _wrapperText)
  })
}

function getWrapperText (file, destination) {
  const cjsModule = require(resolve(file))
  const cjsModExports = new Set(Object.getOwnPropertyNames(cjsModule))
  let wrapperString = `import _module from '${relativePath(
    file,
    destination
  )}';\n\n`

  for (const key of cjsModExports.keys()) {
    if (key === '__esModule') {
      continue
    }
    wrapperString += `export const ${key} = _module.${key};\n`
  }
  wrapperString += 'export default _module;'
  return wrapperString
}

function relativePath (file, destination) {
  return join(relative(destination, normalizeFileName(file)))
}

function normalizeFileName (file) {
  return file.replace(/\.\//g, '').replace(/\.\.\//g, '')
}

function parseArgs () {
  const _args = process.argv.slice(2)

  const flags = {
    '-ext': {
      type: 'string',
      key: 'extension'
    },
    '-h': {
      type: 'boolean',
      key: 'printHelp'
    },
    '-help': {
      type: 'boolean',
      key: 'printHelp'
    }
  }

  const options = parseCLIFlags(flags, _args)

  if (_args.length < 2) {
    printUsage()
    process.exit(1)
  }

  const source = _args[0]
  const destination = _args[1]

  return [source, destination, options]
}

function printUsage () {
  console.log(`
Usage esmwrap
    $ esmwrap input-glob output-directory
    
    Options
      -ext the target file extension (eg: .mjs)
      -h   print this help doc 

    eg:
      $ esmwrap './dist/*.js' ./dist/esm
        ✔ ESM Wrappers Created!

      $ esmwrap './dist/*.js' ./dist/esm -ext .mjs
        ✔ ESM Wrappers Created!
    `)
}

async function parseGlob (pattern) {
  const matchingFiles = findMatchingFiles(pattern, '.', '{.git,node_modules}')
  return matchingFiles
}

function findMatchingFiles (pattern, directory, ignorePattern) {
  const matcher = picomatch(pattern)
  const ignoreMatcher = picomatch(ignorePattern)
  const directoryTree = readdirSync(directory)
  let matchedItems = []
  const pendingDirectories = []
  directoryTree.forEach((item) => {
    const fullItemPath = join(directory, item)

    if (ignoreMatcher(item)) {
      return
    }
    if (matcher(fullItemPath)) {
      return matchedItems.push(fullItemPath)
    }
    const stat = lstatSync(fullItemPath)
    if (stat.isDirectory()) {
      pendingDirectories.push(fullItemPath)
    }
    return true
  })

  while (pendingDirectories.length > 0) {
    const dir = pendingDirectories.shift()
    const _matchingFiles = findMatchingFiles(pattern, dir, ignorePattern)
    matchedItems = matchedItems.concat(_matchingFiles)
  }

  return matchedItems
}

function parseCLIFlags (flags, args) {
  const result = {}

  const delimiterRegex = /[= ]/

  args.forEach((argItem, index) => {
    const withDelimSplit = argItem.split(delimiterRegex)

    const typeEnum = {
      DELIMITED: 'DELIMITED',
      NON_DELIMITED: 'NON_DELIMITED'
    }

    const parseOptions = {
      flag: null,
      type: null
    }

    if (flags[argItem]) {
      parseOptions.flag = flags[argItem]
      parseOptions.type = typeEnum.NON_DELIMITED
    } else if (flags[withDelimSplit[0]]) {
      parseOptions.flag = flags[withDelimSplit[0]]
      parseOptions.type = typeEnum.DELIMITED
    }

    if (!parseOptions.flag) {
      return true
    }

    switch (parseOptions.flag.type) {
      case 'boolean': {
        result[parseOptions.flag.key] = true
        break
      }
      default: {
        if (parseOptions.type === typeEnum.NON_DELIMITED) {
          result[parseOptions.flag.key] = args[index + 1] || null
        }
        if (parseOptions.type === typeEnum.DELIMITED) {
          result[parseOptions.flag.key] = withDelimSplit[1] || null
        }
        break
      }
    }
  })
  return result
}

cli()

exports.esmwrap = esmwrap
