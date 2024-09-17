export const getTagColor = (tagId: string) => {
    const colorIndex = tagId.charCodeAt(0) % 5
    const colors = ['rose', 'blue', 'green', 'orange', 'fuchsia']
    return colors[colorIndex]
}