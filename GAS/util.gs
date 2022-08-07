//検索 動画
const searchVideo = (searchText) => {
  const youtube = YouTube.Search.list("snippet", { q: searchText, maxResults: 1, type: "video" });
  const item = youtube.items[0];
  return { main: { id: item.id.videoId, title: item.snippet.title }, data: { thumbnail: item.snippet.thumbnails.high.url } };
}

//検索 プレイリスト
const searchList = (searchText) => {
  const youtube = YouTube.Search.list("snippet", { q: searchText, maxResults: 1, type: "playlist" });
  const item = youtube.items[0];
  return getList(item.id.playlistId);
}

//情報表示 動画
const getVideo = (videoId) => {
  const youtube = YouTube.Videos.list("snippet,contentDetails", { id: videoId });
  const item = youtube.items[0];
  return { main: { id: item.id, title: item.snippet.title }, data: { thumbnail: item.snippet.thumbnails.high.url, duration: item.contentDetails.duration } };
}

//情報表示 プレイリスト
const getList = (listId) => {
  const youtube = YouTube.PlaylistItems.list("snippet,contentDetails", { playlistId: listId, pageToken: "" });
  let result = [];
  for (let loop = 0; loop < youtube.items.length; loop++) {
    const item = youtube.items[loop];
    result.push({ id: item.contentDetails.videoId, title: item.snippet.title });
  }
  let page = youtube;
  for (let loop = 0; page.nextPageToken != undefined; loop++) {
    page = YouTube.PlaylistItems.list("snippet,contentDetails", { playlistId: listId, pageToken: page.nextPageToken });
    for (let loop = 0; loop < page.items.length; loop++) {
      const item = page.items[loop];
      result.push({ id: item.contentDetails.videoId, title: item.snippet.title });
    }
  }
  const item = youtube.items[0];
  return { main: result, data: { id: item.snippet.playlistId, thumbnail: item.snippet.thumbnails.high.url } };
}