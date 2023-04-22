/*
const info = await getInfo(id);
console.log(info.title);
*/

const youTube = {
  resolveYoutubeInfo: async ({ cache, key, url, cacheUpdate }) => {
    const id = youTube.extractYoutubeId(url);
    if (!id) return { title: url };
    const info = await youTube.getYoutubeInfo({ cache, key, id, cacheUpdate });
    return info ? info : { title: url };
  },
  extractYoutubeId: (url) => {
    if (!url) return;
    //https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : false;
  },
  getYoutubeInfo: async ({ key, id, cache, cacheUpdate }) => {
    const cached = cache.find((item) => item.media_id === id);
    if (cached) {
      return JSON.parse(cached.data).snippet;
    } else {
      const url = `https://www.googleapis.com/youtube/v3/videos?key=${key}&part=snippet&id=${id}`;
      const response = await fetch(url, {
        headers: {
          Accept: "application/json"
        }
      });
      const json = await response.json();
      if (json.items?.length > 0) {
        cache[id] = json.items[0].snippet;
        cacheUpdate({
          media_id: id,
          source: "youtube",
          data: JSON.stringify(json.items[0])
        });
        return json.items[0].snippet;
      } else {
        return null;
      }
    }
  }
};
export default youTube;
