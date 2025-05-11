const documentsCache = new Map();

exports.handler = async (event) => {
  const sessionId = event.queryStringParameters?.session_id;
  
  if (!sessionId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        error: 'Le paramètre session_id est requis' 
      })
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      
      if (!body.slides_url || !body.pdf_url) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            error: 'Les URLs des documents sont requises' 
          })
        };
      }

      documentsCache.set(sessionId, {
        slides_url: body.slides_url,
