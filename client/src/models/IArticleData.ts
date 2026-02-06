export interface IArticleData {
  id: string
  content: string
  articleId: string
  imageUrl: string
  createdAt: {
    _seconds: number
    _nanoseconds: number
  }
}
