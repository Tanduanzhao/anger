'use strict'

const test = require('tap').test
const anger = require('..')

test('failed auth', { timeout: 3000 }, (t) => {
  t.plan(3)

  require('./authServer')((err, server) => {
    t.error(err)

    t.tearDown(server.stop.bind(server))

    let uid = 0
    const instance = anger({
      url: server.info.uri,
      subscription: '/greet',
      senders: 1,
      connections: 10,
      identifier: (payload) => payload.meta.id,
      auth: { headers: { authorization: `Basic ${new Buffer('jane:jane').toString('base64')}` } },
      requests: 1,
      responses: 10,
      trigger: (sender) => {
        sender.request({
          method: 'POST',
          path: '/h',
          payload: {
            id: ++uid
          }
        })
        return uid
      },
      retryOpts: {
        retries: 1
      }
    })

    instance.on('error', (err) => {
      t.ok(err, 'error happened')
      t.equal(server.failedCount, 10)
    })

    instance.on('end', () => {
      t.fail('end never happens')
    })
  })
})
