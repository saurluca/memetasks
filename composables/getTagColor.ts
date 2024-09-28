export const getTagColorInactive = (tagId: string) => {
    if (!tagId) return ""
  const colorIndex = tagId.charCodeAt(0) % 5
  const colorVariants = {
      0: 'bg-rose-100 text-rose-900 dark:bg-rose-300 dark:text-rose-900',
      1: 'bg-blue-100 text-blue-900 dark:bg-blue-300 dark:text-blue-900',
      2: 'bg-green-100 text-green-900 dark:bg-green-300 dark:text-green-900',
      3: 'bg-orange-100 text-orange-900 dark:bg-orange-300 dark:text-orange-900',
      4: 'bg-fuchsia-100 text-fuchsia-900 dark:bg-fuchsia-300 dark:text-fuchsia-900',
  }
  return colorVariants[colorIndex]
}

export const getTagColorActive = (tagId: string) => {
    if (!tagId) return ""
  const colorIndex = tagId.charCodeAt(0) % 5
  const colorVariants = {
      0: 'bg-rose-400 text-rose-900 dark:bg-rose-600 dark:text-rose-100',
      1: 'bg-blue-400 text-blue-900 dark:bg-blue-600 dark:text-blue-100',
      2: 'bg-green-400 text-green-900 dark:bg-green-600 dark:text-green-100',
      3: 'bg-orange-400 text-orange-900 dark:bg-orange-600 dark:text-orange-100',
      4: 'bg-fuchsia-400 text-fuchsia-900 dark:bg-fuchsia-600 dark:text-fuchsia-100',
  }
  return colorVariants[colorIndex]
}