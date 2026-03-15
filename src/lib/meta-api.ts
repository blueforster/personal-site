const META_API_BASE = 'https://graph.facebook.com/v18.0'

interface PublishResult {
  platform: string
  success: boolean
  id?: string
  error?: string
}

export async function publishToFacebook(
  message: string,
  link: string
): Promise<PublishResult> {
  try {
    const response = await fetch(
      `${META_API_BASE}/${process.env.META_PAGE_ID}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          link,
          access_token: process.env.META_ACCESS_TOKEN,
        }),
      }
    )
    const data = await response.json()
    if (data.error) {
      return { platform: 'facebook', success: false, error: data.error.message }
    }
    return { platform: 'facebook', success: true, id: data.id }
  } catch (error) {
    return {
      platform: 'facebook',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function publishToInstagram(
  imageUrl: string,
  caption: string
): Promise<PublishResult> {
  try {
    // Step 1: Create media container
    const containerRes = await fetch(
      `${META_API_BASE}/${process.env.META_IG_USER_ID}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: process.env.META_ACCESS_TOKEN,
        }),
      }
    )
    const container = await containerRes.json()
    if (container.error) {
      return { platform: 'instagram', success: false, error: container.error.message }
    }

    // Step 2: Publish
    const publishRes = await fetch(
      `${META_API_BASE}/${process.env.META_IG_USER_ID}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: process.env.META_ACCESS_TOKEN,
        }),
      }
    )
    const result = await publishRes.json()
    if (result.error) {
      return { platform: 'instagram', success: false, error: result.error.message }
    }
    return { platform: 'instagram', success: true, id: result.id }
  } catch (error) {
    return {
      platform: 'instagram',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function publishToThreads(
  text: string
): Promise<PublishResult> {
  try {
    // Step 1: Create thread container
    const containerRes = await fetch(
      `${META_API_BASE}/${process.env.META_IG_USER_ID}/threads`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'TEXT',
          text,
          access_token: process.env.META_ACCESS_TOKEN,
        }),
      }
    )
    const container = await containerRes.json()
    if (container.error) {
      return { platform: 'threads', success: false, error: container.error.message }
    }

    // Step 2: Publish
    const publishRes = await fetch(
      `${META_API_BASE}/${process.env.META_IG_USER_ID}/threads_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: container.id,
          access_token: process.env.META_ACCESS_TOKEN,
        }),
      }
    )
    const result = await publishRes.json()
    if (result.error) {
      return { platform: 'threads', success: false, error: result.error.message }
    }
    return { platform: 'threads', success: true, id: result.id }
  } catch (error) {
    return {
      platform: 'threads',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
