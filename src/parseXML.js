const parseXML = (xmlString) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(xmlString, 'application/xml');
  const errorNode = xmlDocument.querySelector('parsererror');
  if (errorNode) {
    return {
      ok: false,
      reason: 'parserError',
    };
  }

  const title = xmlDocument.querySelector('title').textContent;
  const description = xmlDocument.querySelector('description').textContent;
  const postNodes = xmlDocument.querySelectorAll('item');
  const posts = Array.from(postNodes).map((postNode) => {
    const postTitle = postNode.querySelector('title').textContent;
    const postDescription = postNode.querySelector('description').textContent;
    const postLink = postNode.querySelector('link').textContent;
    return {
      title: postTitle,
      description: postDescription,
      link: postLink,
    };
  });

  return {
    ok: true,
    title,
    description,
    posts,
  };
};

export default parseXML;
