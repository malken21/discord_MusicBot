function doGet(e) {
  const p = e.parameter;
  let result = {};
  result.error = false;
  try {
    //検索 動画
    if (p.searchVideo != null) {
      result.searchVideo = searchVideo(p.searchVideo);
    }

    //検索 プレイリスト
    if (p.searchList != null) {
      result.searchList = searchList(p.searchList);
    }

    //情報表示 動画
    if (p.getVideo != null) {
      result.getVideo = getVideo(p.getVideo);
    }

    //情報表示 プレイリスト
    if (p.getList != null) {
      result.getList = getList(p.getList);
    }
  } catch {
    result.error = true;
  }

  return ContentService.createTextOutput(JSON.stringify(result));
}