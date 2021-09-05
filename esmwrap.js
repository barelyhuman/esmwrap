const { lstatSync, mkdirSync, readdirSync, writeFileSync } = require('fs')
const { basename, join, relative, resolve } = require('path')
const picomatch = require('picomatch')

async function cli () {
  const [source, destinationDirectory] = parseArgs()
  await esmwrap(source, destinationDirectory)
  console.log('✔ ESM Wrappers Created!')
}

async function esmwrap (source, destinationDirectory) {
  const matchingFiles = await parseGlob(source)
  matchingFiles.forEach((file) => {
    const _file = basename(file)
    const _wrapperText = getWrapperText(file, destinationDirectory)
    mkdirSync(destinationDirectory, { recursive: true })
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

  if (_args.length !== 2) {
    printUsage()
    process.exit(1)
  }

  return _args
}

function printUsage () {
  console.log(`
Usage esmwrap
    $ esmwrap input-glob output-directory
    
    eg:
      $ esmwrap './dist/*.js' ./dist/esm
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

cli()

exports.esmwrap = esmwrap
