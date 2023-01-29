const fetch = require("node-fetch");
module.exports = {
  extractYoutubeId: (url) => {
    //https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : false;
  },
  resolveYoutubeInfo: (url) => {
    const cleanUrl = (url) => {
      const title = url.replace("https://", "").replace("http://", "");
      return title.toLowerCase().includes("youtube") ? `[YT] ${title}` : title;
    };

    const videoId = module.exports.extractYoutubeId(url);
    if (!videoId) return cleanUrl(url);
    console.log(videoId);

    fetch(
      `${process.env.REACT_APP_TRIPREPORT_SERVICE}/youtube?video_id=${videoId}`,
      {
        method: "GET"
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.log(data.error);
          //return cleanUrl(url);
        }
        if (data.playabilityStatus.status !== "OK") return `[XX] ${url}`;
        /*return data.videoDetails?.title
          ? `[YT] ${data.videoDetails.title}`
          : cleanUrl(url);*/
      })
      .catch((error) => {
        console.error("Error:", error);
        /*return cleanUrl(url);*/
      });
  }
};
