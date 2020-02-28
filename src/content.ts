function getEmbeddedImage(content: string): string | undefined {
  const match = content.match(/\[!\[.*?\]\((.*?) \".*?\"\)/im)
  if (match) {
    const link = content.match(/\[.*?link.*?\((.*?)\)/im)
    const isImage = link ? link[1].match(/\.(jpeg|jpg|gif|png)$/) != null : false
    return isImage && link ? link[1] : match[1]
  }

  return undefined
}

export function getEmbeddedContent(
  message: string
): { image: string | undefined; summary: string } {
  const image = getEmbeddedImage(message)
  const summaryParse = message.match(/(.*)(\[\\\[.*?link.*)/ims)

  if (!summaryParse) {
    return { image: undefined, summary: message.substr(0, 1024) }
  }

  const footer: string = summaryParse[2]
  const content: string = summaryParse[1]
  const summary =
    image && summaryParse ? footer : `${content.substr(0, 1024 - `\n${footer}`.length)}\n${footer}`

  return { image, summary }
}
