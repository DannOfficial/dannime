import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  // If no code, redirect to GitHub OAuth
  if (!code) {
    const githubAuthUrl = new URL("https://github.com/login/oauth/authorize")
    githubAuthUrl.searchParams.set("client_id", "Ov23li1QizDqw21No79r")
    githubAuthUrl.searchParams.set(
      "redirect_uri",
      "https://dannime.biz.id/api/auth/github",
    )
    githubAuthUrl.searchParams.set("scope", "read:user user:email")

    return NextResponse.redirect(githubAuthUrl.toString())
  }

  // Handle OAuth callback
  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: "Ov23li1QizDqw21No79r",
        client_secret: "5b9acfb6b558a3eae646c2acb415a1bfa4a8a7f5",
        code,
        redirect_uri: "https://dannime.biz.id/api/auth/github",
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokens.access_token) {
      throw new Error("Failed to get access token")
    }

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/json",
      },
    })

    const userData = await userResponse.json()

    // Get user email if not public
    if (!userData.email) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: "application/json",
        },
      })
      const emails = await emailResponse.json()
      const primaryEmail = emails.find((email) => email.primary)
      userData.email = primaryEmail?.email
    }

    // TODO: Create or update user in database
    // For now, redirect to home with success message
    const redirectUrl = new URL("/", "https://dannime.biz.id")
    redirectUrl.searchParams.set("auth", "success")
    redirectUrl.searchParams.set("provider", "github")

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    const redirectUrl = new URL("/login", "https://dannime.biz.id")
    redirectUrl.searchParams.set("error", "oauth_failed")
    return NextResponse.redirect(redirectUrl.toString())
  }
}
