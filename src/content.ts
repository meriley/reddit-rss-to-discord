function getEmbeddedImage(content: string): string | undefined {
  const match = content.match(/\[!\[.*?\]\((.*?) \".*?\"\)/m)
  if (match) {
    const link = content.match(/\[.*?link.*?\((.*?)\)/m)
    const isImage = link ? link[1].match(/\.(jpeg|jpg|gif|png)$/) != null : false
    return isImage && link ? link[1] : match[1]
  }

  return undefined
}

export function getEmbeddedContent(
  content: string
): { image: string | undefined; summary: string } {
  const image = getEmbeddedImage(content)
  const matchLinks = content.match(/(\[.*?link.*)/m)
  const summary = image && matchLinks ? matchLinks[1] : content

  return { image, summary }
}
