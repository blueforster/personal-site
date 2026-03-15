import { config, fields, collection } from '@keystatic/core'

const statusField = fields.select({
  label: '狀態',
  options: [
    { label: '草稿', value: 'draft' },
    { label: '已發布', value: 'published' },
    { label: '排程中', value: 'scheduled' },
    { label: '已封存', value: 'archived' },
  ],
  defaultValue: 'draft',
})

export default config({
  storage: process.env.NODE_ENV === 'development'
    ? { kind: 'local' }
    : {
        kind: 'github',
        repo: {
          owner: process.env.GITHUB_REPO_OWNER ?? '',
          name: process.env.GITHUB_REPO_NAME ?? '',
        },
      },
  collections: {
    posts: collection({
      label: '文章',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: '標題' } }),
        excerpt: fields.text({ label: '摘要', multiline: true }),
        coverImage: fields.image({
          label: '封面圖片',
          directory: 'public/images/posts',
          publicPath: '/images/posts/',
        }),
        category: fields.relationship({
          label: '分類',
          collection: 'categories',
        }),
        tags: fields.array(fields.text({ label: '標籤' }), {
          label: '標籤',
          itemLabel: (props) => props.value,
        }),
        status: statusField,
        publishedAt: fields.date({ label: '發布日期' }),
        scheduledAt: fields.datetime({ label: '排程發布時間' }),
        ogTitle: fields.text({ label: 'OG 標題' }),
        ogDescription: fields.text({ label: 'OG 描述', multiline: true }),
        ogImage: fields.image({
          label: 'OG 圖片',
          directory: 'public/images/og',
          publicPath: '/images/og/',
        }),
        seoKeywords: fields.text({ label: 'SEO 關鍵字' }),
        content: fields.mdx({
          label: '內容',
        }),
      },
    }),
    courses: collection({
      label: '課程',
      slugField: 'title',
      path: 'src/content/courses/*',
      format: { contentField: 'description' },
      schema: {
        title: fields.slug({ name: { label: '課程名稱' } }),
        excerpt: fields.text({ label: '簡介', multiline: true }),
        coverImage: fields.image({
          label: '封面圖片',
          directory: 'public/images/courses',
          publicPath: '/images/courses/',
        }),
        pricingType: fields.select({
          label: '定價類型',
          options: [
            { label: '免費', value: 'free' },
            { label: '付費', value: 'paid' },
          ],
          defaultValue: 'free',
        }),
        price: fields.integer({
          label: '價格 (TWD)',
          description: '免費課程填 0',
          defaultValue: 0,
          validation: { min: 0 },
        }),
        status: statusField,
        category: fields.relationship({
          label: '分類',
          collection: 'categories',
        }),
        videoUrl: fields.text({ label: '影片 URL' }),
        chapters: fields.array(
          fields.object({
            title: fields.text({ label: '章節標題' }),
            videoUrl: fields.text({ label: '影片 URL' }),
            duration: fields.text({ label: '時長' }),
            isFree: fields.checkbox({ label: '免費預覽', defaultValue: false }),
          }),
          {
            label: '章節',
            itemLabel: (props) => props.fields.title.value,
          }
        ),
        ogTitle: fields.text({ label: 'OG 標題' }),
        ogDescription: fields.text({ label: 'OG 描述', multiline: true }),
        publishedAt: fields.date({ label: '發布日期' }),
        description: fields.mdx({ label: '課程說明' }),
      },
    }),
    portfolio: collection({
      label: '作品集',
      slugField: 'title',
      path: 'src/content/portfolio/*',
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: '作品名稱' } }),
        type: fields.select({
          label: '類型',
          options: [
            { label: '圖像', value: 'image' },
            { label: '影片', value: 'video' },
            { label: '專案', value: 'project' },
          ],
          defaultValue: 'image',
        }),
        mediaUrl: fields.text({ label: '媒體 URL' }),
        coverImage: fields.image({
          label: '封面圖片',
          directory: 'public/images/portfolio',
          publicPath: '/images/portfolio/',
        }),
        category: fields.text({ label: '分類' }),
        status: statusField,
        publishedAt: fields.date({ label: '發布日期' }),
        body: fields.mdx({ label: '說明' }),
      },
    }),
    categories: collection({
      label: '分類',
      slugField: 'name',
      path: 'src/content/categories/*',
      schema: {
        name: fields.slug({ name: { label: '分類值（英文，不可更改）' } }),
        label: fields.text({ label: '顯示名稱' }),
        color: fields.text({ label: '顏色代碼（Hex）' }),
      },
    }),
  },
})
