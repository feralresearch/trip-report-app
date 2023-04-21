/*
const info = await getInfo(id);
console.log(info.title);
*/

const cache = {};
const youTube = {
  resolveYoutubeInfo: async ({ key, url }) => {
    const id = youTube.extractYoutubeId(url);
    if (!id) return { title: url };
    const info = await youTube.getYoutubeInfo({ key, id });
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
  getYoutubeInfo: async ({ key, id }) => {
    if (cache[id]) {
      console.log("Found in cache...");
      return cache[id];
    }
    const url = `https://www.googleapis.com/youtube/v3/videos?key=${key}&part=snippet&id=${id}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });
    const json = await response.json();
    if (json.items?.length > 0) {
      cache[id] = json.items[0].snippet;
      return json.items[0].snippet;
    } else {
      return null;
    }
  }
};
export default youTube;
