export default async function handler(req, res) {
    const { id, type = 'movie', slug } = req.query;

    if (!id) {
        return res.redirect(302, '/');
    }

    const ua = req.headers['user-agent'] || '';
    const isSocialBot = /telegrambot|twitterbot|facebookexternalhit|linkedinbot|whatsapp|slackbot|discordbot|applebot|googlebot|bingbot|rogerbot|embedly|quora|outbrain|pinterest|vkshare|facebot|ia_archiver/i.test(ua);

    const slugParam = slug ? `&slug=${encodeURIComponent(slug)}` : '';
    const detailUrl = `/detail.html?id=${id}&type=${type}${slugParam}`;

    if (!isSocialBot) {
        // Human visitor → redirect to the actual interactive page
        return res.redirect(302, detailUrl);
    }

    // Social bot → fetch TMDB data and return OG-enriched HTML
    try {
        const API_KEY = 'a820f2b45d233c0cc0c97d078536074f';
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}`);
        const m = await tmdbRes.json();

        const title = (m.title || m.name || 'RegionalSearch').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const rawDesc = m.overview || 'Find where to stream this title worldwide on RegionalSearch.';
        const description = rawDesc.slice(0, 250).replace(/"/g, '&quot;').replace(/</g, '&lt;');
        const image = m.poster_path
            ? `https://image.tmdb.org/t/p/w780${m.poster_path}`
            : 'https://regional-search.vercel.app/og-default.svg';
        const year = (m.release_date || m.first_air_date || '').split('-')[0];
        const yearStr = year ? ` (${year})` : '';
        const canonicalUrl = `https://regional-search.vercel.app/detail?id=${id}&type=${type}${slugParam}`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}${yearStr} | Regional Search</title>
  <meta name="description" content="${description}">

  <!-- Open Graph -->
  <meta property="og:type" content="${type === 'tv' ? 'video.tv_show' : 'video.movie'}">
  <meta property="og:site_name" content="Regional Search">
  <meta property="og:title" content="${title}${yearStr}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="780">
  <meta property="og:image:height" content="1170">
  <meta property="og:url" content="${canonicalUrl}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}${yearStr}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">

  <!-- Redirect humans to the interactive page -->
  <meta http-equiv="refresh" content="0;url=${detailUrl}">
</head>
<body>
  <script>window.location.replace('${detailUrl}');</script>
  <p>Redirecting to <a href="${detailUrl}">${title}</a>...</p>
</body>
</html>`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
        return res.status(200).send(html);
    } catch (err) {
        return res.redirect(302, detailUrl);
    }
}
