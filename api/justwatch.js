export default async function handler(req, res) {
  const { title, year, type = 'movie', country = 'US' } = req.query;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const JW_GRAPHQL_ENDPOINT = 'https://apis.justwatch.com/graphql';

  const SEARCH_QUERY = `
    query GetSuggestions($query: String!, $country: Country!, $language: Language!) {
      suggestions(query: $query, country: $country, language: $language, first: 5) {
        edges {
          node {
            ... on Movie {
              id
              objectId
              objectType
              content(country: $country, language: $language) {
                title
                fullPath
                releaseDate
              }
            }
            ... on Show {
              id
              objectId
              objectType
              content(country: $country, language: $language) {
                title
                fullPath
                releaseDate
              }
            }
          }
        }
      }
    }`;

  const DETAILS_QUERY = `
    query GetUrlTitleDetails($fullPath: String!, $language: Language!, $platform: Platform! = WEB) {
      urlV2(fullPath: $fullPath) {
        node {
          ... on Movie {
            id
            objectId
            objectType
            content(country: "US", language: $language) {
              title
              fullPath
            }
            allOffers: offers(platform: $platform) {
              monetizationType
              presentationType
              retailPrice(language: $language)
              retailPriceValue
              currency
              country
              package {
                clearName
                shortName
              }
              standardWebURL
            }
          }
          ... on Show {
            id
            objectId
            objectType
            content(country: "US", language: $language) {
              title
              fullPath
            }
            allOffers: offers(platform: $platform) {
              monetizationType
              presentationType
              retailPrice(language: $language)
              retailPriceValue
              currency
              country
              package {
                clearName
                shortName
              }
              standardWebURL
            }
          }
        }
      }
    }`;

  try {
    console.log(`Searching JustWatch for: ${title} (${year || 'any year'})`);
    // Step 1: Search for the title
    const searchRes = await fetch(JW_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: {
          query: title,
          country: 'US',
          language: 'en'
        }
      })
    });

    const searchData = await searchRes.json();

    if (searchData.errors) {
      console.error('Search GraphQL Errors:', searchData.errors);
      return res.status(500).json({ error: 'Search failed', details: searchData.errors });
    }

    const results = searchData.data?.suggestions?.edges || [];
    console.log('Search Result Count:', results.length);

    // Find the best match by comparing title and year
    let match = results.find(edge => {
      const node = edge.node;
      const nodeTitle = node.content?.title?.toLowerCase();
      const nodeYear = node.content?.releaseDate ? node.content.releaseDate.split('-')[0] : null;
      const typeMatch = (type === 'movie' && node.objectType === 'MOVIE') || (type === 'tv' && node.objectType === 'SHOW');

      // Flexible matching: exact title OR title includes search query
      const titleMatch = nodeTitle === title.toLowerCase() || nodeTitle?.includes(title.toLowerCase()) || title.toLowerCase().includes(nodeTitle);
      const yearMatch = !year || !nodeYear || nodeYear === year || Math.abs(parseInt(nodeYear) - parseInt(year)) <= 1;

      return titleMatch && yearMatch && typeMatch;
    });

    // Fallback to first result if no perfect match but title is similar
    if (!match && results.length > 0) {
      const firstNode = results[0].node;
      const firstTitle = firstNode.content?.title?.toLowerCase();
      if (firstTitle?.includes(title.toLowerCase()) || title.toLowerCase().includes(firstTitle)) {
        console.log('No perfect match, falling back to similar first result:', firstNode.content?.title);
        match = results[0];
      }
    }

    if (!match) {
      console.log('No match found for query.');
      return res.status(404).json({ error: `Could not find "${title}" (${year}) on JustWatch.` });
    }

    const fullPath = match.node.content.fullPath;
    console.log('Fetching details for path:', fullPath);

    // Step 2: Get details for the match (all regions)
    const detailsRes = await fetch(JW_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        query: DETAILS_QUERY,
        variables: {
          fullPath: fullPath,
          language: 'en'
        }
      })
    });

    const detailsData = await detailsRes.json();
    if (detailsData.errors) {
      console.error('GraphQL Errors:', detailsData.errors);
      return res.status(500).json({ error: 'GraphQL Error', details: detailsData.errors });
    }

    const node = detailsData.data?.urlV2?.node;
    console.log('Details found:', !!node);

    if (!node) {
      return res.status(404).json({ error: 'Details not found' });
    }

    // Standardize the response to include all offers
    res.status(200).json({
      id: node.id,
      title: node.content.title,
      fullPath: node.content.fullPath,
      offers: node.allOffers || []
    });
  } catch (err) {
    console.error('JustWatch Proxy Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
