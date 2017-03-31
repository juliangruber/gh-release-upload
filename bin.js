#!/usr/bin/env node
'use strict'

const canonical = require('gh-canonical-repository')
const latest = require('gh-latest-release')
const ora = require('ora')
const gh = require('ghreleases')

const asset = process.argv[2]
const spinner = ora('').start()

spinner.text = 'Loading repository'
canonical(process.cwd(), (err, repo) => {
  if (err) throw err

  spinner.text = 'Loading release'
  latest(`${repo[0]}/${repo[1]}`)
  .then(release => setImmediate(() => {
    spinner.text = 'Uploading asset'
    gh.uploadAssets(
      {
        token: process.env.GITHUB_TOKEN
      },
      repo[0],
      repo[1],
      `tags/${release.tag_name}`,
      [asset],
      (err, res) => {
        if (err) {
          spinner.fail('Upload error')
          throw err
        }
        spinner.succeed('Asset uploaded')
      }
    )
  }))
  .catch(err => setImmediate(() => {
    throw err
  }))
})
