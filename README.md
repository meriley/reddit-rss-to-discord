# Reddit To Discord Webhook

## Getting Started

### Define Your Confiuration

1. Create a Directory and file `config\config.json`
2. Populate configuration file with your target subreddits and filters

```
[
  {
    "id": "subreddit", // This MUST match the `category` returned from your reddit rss at http://reddit.com/<subreddit>/.rss
    "rss": {
      "subreddit": "subreddit",
      "sort": "new",
      "filters": {
        "author": {
          "exact": [
            "meriley",
          ],
          "regex": [
              ".*riley.*"
          ]
        }
      }
    },
    "webhooks": [
      {
        "title": "My Discord Server",
        "url": "http://MyDiscordWebhookUrl/"
      }
    ]
  }
]
```

### Start The Application

```
yarn start
```
