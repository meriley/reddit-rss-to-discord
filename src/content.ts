function getEmbeddedImage(content: string): string | undefined {
  const match = content.match(/\[\\\[link\\\]\]\((https.*?(jpeg|jpg|gif|png))\)/im)
  return match ? match[1] : undefined
}

export function getEmbeddedContent(
  message: string
): { image: string | undefined; summary: string } {
  const image = getEmbeddedImage(message)
  const summaryParse = message.match(/(.*)(\[\\\[.*?link.*)/ims)

  if (!summaryParse) {
    return { image, summary: message.substr(0, 1024) }
  }

  const footer: string = summaryParse[2]
  const content: string = summaryParse[1]
  const summary =
    image && summaryParse ? footer : `${content.substr(0, 1024 - `\n${footer}`.length)}\n${footer}`

  return { image, summary }
}
