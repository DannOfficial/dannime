import axios from "axios"
import * as cheerio from "cheerio"

const BASE_URL = "https://otakudesu.best"

const getHeaders = () => ({
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
  "Accept-Encoding": "gzip, deflate, br",
  Connection: "keep-alive",
  "Upgrade-Insecure-Requests": "1",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Cache-Control": "max-age=0",
  Referer: BASE_URL,
})

// Helper to clean text
function cleanText(text) {
  return text.trim().replace(/\s+/g, " ")
}

// Get latest anime
export async function getLatestAnime() {
  try {
    const response = await axios.get(BASE_URL, {
      headers: getHeaders(),
      timeout: 20000,
      validateStatus: (status) => status < 500,
    })

    if (response.status === 403 || response.status === 404) {
      return []
    }

    const $ = cheerio.load(response.data)
    const animeList = []

    $(".venz ul li").each((i, elem) => {
      const title = $(elem).find(".jdlflm").text().trim()
      const episode = $(elem).find(".epz").text().trim()
      const image = $(elem).find("img").attr("src")
      const link = $(elem).find("a").attr("href")
      const slug = link ? link.split("/").filter(Boolean).pop() : ""
      const day = $(elem).find(".epztipe").text().trim()

      if (title && link) {
        animeList.push({
          title,
          episode,
          image: image || "/placeholder-anime.jpg",
          slug,
          link,
          day,
          status: "Ongoing",
        })
      }
    })

    return animeList
  } catch (error) {
    return []
  }
}

// Helper to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// Get anime detail
export async function getAnimeDetail(slug) {
  try {
    const url = `${BASE_URL}/anime/${slug}`
    
    // Add small delay to avoid rate limiting
    await delay(500)
    
    const response = await axios.get(url, {
      headers: getHeaders(),
      timeout: 15000,
      validateStatus: (status) => status < 500,
    })

    if (response.status === 403 || response.status === 404) {
      console.error(`Failed to fetch anime detail for ${slug}: status ${response.status}`)
      // Return basic info from slug instead of null
      return {
        slug,
        title: slug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
        image: "/placeholder-anime.jpg",
        synopsis: "Anime details are temporarily unavailable due to access restrictions. Please try again later.",
        rating: "N/A",
        type: "TV",
        status: "Unknown",
        totalEpisodes: "Unknown",
        duration: "Unknown",
        genres: [],
        episodes: [],
        _unavailable: true,
      }
    }

    const $ = cheerio.load(response.data)

    const title = $(".jdlrx h1").text().trim() || $("h1.entry-title").text().trim()
    const image = $(".fotoanime img").attr("src") || $(".wp-post-image").attr("src")
    const synopsis = $(".sinopc p").text().trim() || $(".entry-content p").first().text().trim()

    const info = {}
    $(".infozingle p, .info p, .spe span").each((i, elem) => {
      const text = $(elem).text()
      if (text.includes("Japanese:")) info.japanese = text.replace("Japanese:", "").trim()
      if (text.includes("Judul:")) info.alternativeTitle = text.replace("Judul:", "").trim()
      if (text.includes("Skor:") || text.includes("Score:")) info.rating = text.replace(/Skor:|Score:/, "").trim()
      if (text.includes("Produser:") || text.includes("Producer:"))
        info.producer = text.replace(/Produser:|Producer:/, "").trim()
      if (text.includes("Tipe:") || text.includes("Type:")) info.type = text.replace(/Tipe:|Type:/, "").trim()
      if (text.includes("Status:")) info.status = text.replace("Status:", "").trim()
      if (text.includes("Total Episode:") || text.includes("Episodes:"))
        info.totalEpisodes = text.replace(/Total Episode:|Episodes:/, "").trim()
      if (text.includes("Durasi:") || text.includes("Duration:"))
        info.duration = text.replace(/Durasi:|Duration:/, "").trim()
      if (text.includes("Tanggal Rilis:") || text.includes("Released:"))
        info.releaseDate = text.replace(/Tanggal Rilis:|Released:/, "").trim()
      if (text.includes("Studio:")) info.studio = text.replace("Studio:", "").trim()
      if (text.includes("Genre:") || text.includes("Genres:")) {
        const genres = []
        $(elem)
          .find("a")
          .each((j, link) => {
            genres.push($(link).text().trim())
          })
        if (genres.length > 0) {
          info.genres = genres
        }
      }
    })

    const episodes = []
    $(".episodelist ul li, .eplister ul li, .lstepsiode ul li").each((i, elem) => {
      const episodeTitle = $(elem).find("a").text().trim()
      const episodeLink = $(elem).find("a").attr("href")
      const episodeSlug = episodeLink ? episodeLink.split("/").filter(Boolean).pop() : ""

      if (episodeTitle && episodeLink) {
        episodes.push({
          title: episodeTitle,
          slug: episodeSlug,
          link: episodeLink,
        })
      }
    })

    return {
      slug,
      title:
        title ||
        slug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      image: image || "/placeholder-anime.jpg",
      synopsis: synopsis || "No synopsis available.",
      rating: info.rating || "N/A",
      type: info.type || "TV",
      status: info.status || "Unknown",
      totalEpisodes: info.totalEpisodes || "Unknown",
      duration: info.duration || "24 min",
      ...info,
      genres: info.genres || [],
      episodes: episodes.length > 0 ? episodes.reverse() : [],
    }
  } catch (error) {
    console.error(`Error scraping anime detail for ${slug}:`, error.message)
    // Return basic info instead of null
    return {
      slug,
      title: slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      image: "/placeholder-anime.jpg",
      synopsis: "Anime details are temporarily unavailable. Please try again later.",
      rating: "N/A",
      type: "TV",
      status: "Unknown",
      totalEpisodes: "Unknown",
      duration: "Unknown",
      genres: [],
      episodes: [],
      _unavailable: true,
    }
  }
}

// Get episode streaming links
export async function getEpisodeLinks(episodeSlug) {
  try {
    const url = `${BASE_URL}/episode/${episodeSlug}`
    const response = await axios.get(url, {
      headers: getHeaders(),
      timeout: 15000,
    })

    const $ = cheerio.load(response.data)

    const title = $(".venutama h1").text().trim()
    const streamingLinks = []
    const downloadLinks = []

    // Streaming links
    $(".mirrorstream ul li").each((i, elem) => {
      const quality = $(elem).find("a").text().trim()
      const link = $(elem).find("a").attr("href")

      if (quality && link) {
        streamingLinks.push({
          quality,
          url: link,
        })
      }
    })

    // Download links
    $(".download ul li").each((i, elem) => {
      const quality = $(elem).find("strong").text().trim()
      const links = []

      $(elem)
        .find("a")
        .each((j, link) => {
          const host = $(link).text().trim()
          const url = $(link).attr("href")
          if (host && url) {
            links.push({ host, url })
          }
        })

      if (quality && links.length > 0) {
        downloadLinks.push({
          quality,
          links,
        })
      }
    })

    return {
      title,
      streaming: streamingLinks,
      download: downloadLinks,
    }
  } catch (error) {
    throw new Error("Failed to fetch episode links")
  }
}

// Search anime
export async function searchAnime(query) {
  try {
    const url = `${BASE_URL}/?s=${encodeURIComponent(query)}&post_type=anime`
    const response = await axios.get(url, {
      headers: getHeaders(),
      timeout: 15000,
      validateStatus: (status) => status < 500,
    })

    if (response.status === 403 || response.status === 404) {
      console.log(`Search blocked with status ${response.status}, trying alternative method`)
      
      // Try to get latest anime and filter by query as fallback
      try {
        const latestAnime = await getLatestAnime()
        const filtered = latestAnime.filter((anime) =>
          anime.title.toLowerCase().includes(query.toLowerCase())
        )
        console.log(`Fallback search found ${filtered.length} results`)
        return filtered
      } catch (fallbackError) {
        console.error("Fallback search also failed:", fallbackError.message)
        return []
      }
    }

    const $ = cheerio.load(response.data)
    const results = []

    const selectors = [
      { container: ".chivsrc li", title: "h2 a", image: "img", genreContainer: ".set" },
      { container: ".venz ul li", title: ".jdlflm", image: "img", genreContainer: null },
      { container: "ul.chivsrc li", title: "a", image: "img", genreContainer: ".set" },
    ]

    for (const selector of selectors) {
      $(selector.container).each((i, elem) => {
        const title = $(elem).find(selector.title).text().trim()
        const image = $(elem).find(selector.image).attr("src")
        const link = $(elem).find(selector.title).attr("href") || $(elem).find("a").attr("href")
        const slug = link ? link.split("/").filter(Boolean).pop() : ""
        const genres = []

        if (selector.genreContainer) {
          $(elem)
            .find(selector.genreContainer)
            .each((j, genreElem) => {
              const genreText = $(genreElem).text().trim()
              if (genreText.includes("Genres:") || genreText.includes("Genre:")) {
                const genreList = genreText
                  .replace(/Genres?:/, "")
                  .trim()
                  .split(",")
                genres.push(...genreList.map((g) => g.trim()))
              }
            })
        }

        const status = $(elem).find('.set:contains("Status:")').text().replace("Status:", "").trim() || "Unknown"
        const rating = $(elem).find('.set:contains("Rating:")').text().replace("Rating:", "").trim() || "N/A"

        if (title && link) {
          results.push({
            title,
            image: image || "/placeholder-anime.jpg",
            slug,
            link,
            genres: genres.length > 0 ? genres : [],
            status,
            rating,
          })
        }
      })

      if (results.length > 0) break
    }

    return results
  } catch (error) {
    console.error("Search error:", error.message)
    
    // Try fallback: filter from latest anime
    try {
      const latestAnime = await getLatestAnime()
      const filtered = latestAnime.filter((anime) =>
        anime.title.toLowerCase().includes(query.toLowerCase())
      )
      console.log(`Fallback search found ${filtered.length} results`)
      return filtered
    } catch (fallbackError) {
      console.error("Fallback search also failed:", fallbackError.message)
      return []
    }
  }
}

// Get genres list
export async function getGenres() {
  try {
    // Try genre list page first
    const genreListUrl = `${BASE_URL}/genre-list/`
    const response = await axios.get(genreListUrl, {
      headers: getHeaders(),
      timeout: 15000,
      validateStatus: (status) => status < 500,
    })

    if (response.status === 403 || response.status === 404) {
      console.error("Failed to fetch genres: status", response.status)
      return []
    }

    const $ = cheerio.load(response.data)
    const genres = []

    // Extract all links with /genres/ in href
    $("a[href*='/genres/']").each((i, elem) => {
      const name = $(elem).text().trim()
      const link = $(elem).attr("href")

      if (name && link && link.includes("/genres/")) {
        const slug = link.split("/").filter(Boolean).pop()
        const exists = genres.find((g) => g.slug === slug)
        if (!exists && name.length > 0 && name.length < 50) {
          genres.push({ name, slug, link })
        }
      }
    })

    console.log(`Found ${genres.length} genres from genre-list page`)
    return genres
  } catch (error) {
    console.error("Error fetching genres:", error.message)
    return []
  }
}

// Get anime by genre
export async function getAnimeByGenre(genreSlug) {
  try {
    const url = `${BASE_URL}/genres/${genreSlug}`
    const response = await axios.get(url, {
      headers: getHeaders(),
      timeout: 15000,
      validateStatus: (status) => status < 500,
    })

    if (response.status === 403 || response.status === 404) {
      return []
    }

    const $ = cheerio.load(response.data)
    const animeList = []

    const selectors = [
      {
        container: ".col-anime",
        title: ".col-anime-title a",
        image: ".col-anime-cover img",
        rating: ".col-anime-rating",
      },
      { container: ".venz ul li", title: ".jdlflm", image: "img", rating: ".epztipe" },
      { container: ".chivsrc li", title: "h2 a", image: "img", rating: '.set:contains("Rating:")' },
    ]

    for (const selector of selectors) {
      $(selector.container).each((i, elem) => {
        const title = $(elem).find(selector.title).text().trim()
        const image = $(elem).find(selector.image).attr("src")
        const titleLink = $(elem).find(selector.title).attr("href") || $(elem).find("a").attr("href")
        const slug = titleLink ? titleLink.split("/").filter(Boolean).pop() : ""
        const rating = $(elem).find(selector.rating).text().trim()

        if (title && titleLink) {
          animeList.push({
            title,
            image: image,
            slug,
            link: titleLink,
            rating: rating,
            status: "Available",
          })
        }
      })

      if (animeList.length > 0) break
    }

    return animeList
  } catch (error) {
    console.error(error)
    return []
  }
}
