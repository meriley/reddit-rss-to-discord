import { compact, flatten } from 'lodash'
import { ConfigType, FiltersType } from './static/schema.js'
import TurndownService from 'turndown'
import { Hook } from 'hookcord'
import config from '../config/config.json'
import RssFeedEmitter from 'rss-feed-emitter'
import { getEmbeddedContent } from './content'
import { isExactMatch, isRegexMatch } from './filters.js'

type RssType = {
  [key: string]: {
    id: string
    name: string
    url: string
    filters?: FiltersType
    webhooks: string[]
  }
}

function getConfig(): ConfigType {
  return config as ConfigType
}

function main() {
  const feeder = new RssFeedEmitter()

  const rss: RssType = getConfig().reduce(
    (acc, { id, rss: { subreddit, sort, filters }, webhooks }) => {
      const item = {
        id,
        name: subreddit,
        filters,
        url: `https://www.reddit.com/r/${subreddit}/${sort}/.rss`,
        webhooks: webhooks.map(webhook => webhook.url),
      }
      acc[id] = item

      return acc
    },
    {}
  )

  Object.values(rss).forEach(r => {
    feeder.add({
      url: r.url,
      refresh: 30000,
    })
    console.log('Started watching', r.name, 'RSS feed at', r.url)
  })

  feeder.on('new-item', function(item: any) {
    const {
      title,
      link: url,
      description,
      author: uAuthor,
      categories,
      meta: {
        image: { url: imgUrl },
      },
    } = item

    const author = uAuthor.substring(3) // Remove the `/u/`
    const hasAuthorMatch =
      isExactMatch(author, rss[categories]?.filters?.author?.exact) ||
      isRegexMatch(author, rss[categories].filters?.author?.regex)
    const hasTitleMatch =
      isExactMatch(title, rss[categories]?.filters?.title?.exact) ||
      isRegexMatch(title, rss[categories].filters?.title?.regex)

    if (!hasAuthorMatch && !hasTitleMatch) {
      return
    }

    const contentMarkDown = new TurndownService().turndown(description)
    const embeddedContent = getEmbeddedContent(contentMarkDown)

    const discordMessage = {
      content: url,
      embeds: [
        {
          title,
          url,
          author: { name: author },
          thumbnail: { url: embeddedContent.image || imgUrl },
          fields: [{ name: 'Summary:', value: embeddedContent.summary }],
        },
      ],
    }

    const webhookUrls = flatten(
      compact(categories.map((category: string) => rss[category]?.webhooks))
    )

    webhookUrls.forEach(url =>
      new Hook()
        .setOptions({
          handler: function(err: any) {
            console.log('Ratelimit Request Limit: ' + err.limit)
            console.log('Remaining Requests: ' + err.remaining)
            console.log('Time until Reset: ' + err.reset)
          },
        })
        .setLink(url)
        .setPayload(discordMessage)
        .fire()
        .then(function(response: any) {
          //console.log('response', response)
        })
        .catch(function(e: any) {
          console.log(e)
        })
    )
  })
}

main()
