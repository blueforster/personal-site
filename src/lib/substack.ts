interface PublishResult {
  platform: string
  success: boolean
  id?: string
  error?: string
}

/**
 * Publish content to Substack.
 *
 * Substack does not offer a public API for programmatic posting.
 * This implementation uses the Substack API endpoint that powers their editor,
 * which requires an API key (session token) from a logged-in Substack account.
 *
 * If no API key is configured, this function returns a result
 * with the generated content for manual cross-posting.
 */
export async function publishToSubstack(
  title: string,
  content: string,
  postUrl: string
): Promise<PublishResult> {
  const apiKey = process.env.SUBSTACK_API_KEY
  const publicationUrl = process.env.SUBSTACK_PUBLICATION_URL

  if (!apiKey || !publicationUrl) {
    return {
      platform: 'substack',
      success: false,
      error:
        'Substack credentials not configured. Please set SUBSTACK_API_KEY and SUBSTACK_PUBLICATION_URL.',
    }
  }

  try {
    // Convert content to simple HTML for Substack
    const htmlContent = `
      <p>${content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />')}</p>
      <hr />
      <p><em>原文連結：<a href="${postUrl}">${postUrl}</a></em></p>
    `.trim()

    const response = await fetch(`${publicationUrl}/api/v1/drafts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `substack.sid=${apiKey}`,
      },
      body: JSON.stringify({
        draft_title: title,
        draft_body: htmlContent,
        type: 'newsletter',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        platform: 'substack',
        success: false,
        error: `Substack API error: ${response.status} ${errorText}`,
      }
    }

    const data = await response.json()
    return {
      platform: 'substack',
      success: true,
      id: data.id?.toString(),
    }
  } catch (error) {
    return {
      platform: 'substack',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
