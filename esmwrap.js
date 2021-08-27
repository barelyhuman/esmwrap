#! /usr/bin/env node

const { mkdirSync, writeFileSync } = require('fs')
const glob = require('glob')
const { resolve, join, relative } = require('path')

async function cli () {
  const [source, destinationDirectory] = parseArgs()
  await esmwrap(source, destinationDirectory)
  console.log('✔ ESM Wrappers Created!')
}

async function esmwrap (source, destinationDirectory) {
  const matchingFiles = await parseGlob(source)
  matchingFiles.forEach((file) => {
    const _wrapperText = getWrapperText(file, destinationDirectory)
    mkdirSync(destinationDirectory, { recursive: true })
    const filePath = join(destinationDirectory, file)
    writeFileSync(filePath, _wrapperText)
  })
}

function getWrapperText (file, destination) {
  const cjsModule = require(resolve(file))
  const cjsModExports = new Set(Object.getOwnPropertyNames(cjsModule))
  let wrapperString = `import _module from '${relativePath(file, destination)}';
  
`

  for (const key of cjsModExports.keys()) {
    if (key === '__esModule') {
      continue
    }

    // key === "default"

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
      $ esmwrap ./dist/*.js ./dist/esm
    `)
}

async function parseGlob (pattern) {
  return new Promise((resolve) => {
    glob(pattern, (err, matches) => {
      if (err) throw err
      resolve(matches)
    })
  })
}

cli()

exports.esmwarp = esmwrap
