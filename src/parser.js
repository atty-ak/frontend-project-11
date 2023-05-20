const getInfo = (data) => {
  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const link = data.querySelector('link').textContent;
  return {
    title, description, link,
  };
};

export default (content) => {
  try {
    const parse = new DOMParser();
    const parsedData = parse.parseFromString(content, 'text/xml');
    const feed = getInfo(parsedData);
    const postItems = parsedData.querySelectorAll('item');
    const posts = Array.from(postItems).map((post) => getInfo(post));
    return { feed, posts };
  } catch {
    throw new Error('parseError');
  }
};
