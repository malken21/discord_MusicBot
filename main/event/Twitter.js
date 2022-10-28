const https = require("https");

const tx = require("../util/text")

const { Bearer_TOKEN } = require("../Config.json")

const Twitter_TOKEN = {
    headers: {
        "Authorization": `Bearer ${Bearer_TOKEN}`
    }
};


exports.getVideoURL = (url) => {

    const item = url.pathname.split("/status/");
    if (item.length < 1) return false;

    const request = `https://api.twitter.com/2/tweets/${item[1]}?tweet.fields=attachments,entities&expansions=attachments.media_keys&media.fields=variants,preview_image_url,duration_ms`;
    return new Promise((resolve) => {
        https.get(request, Twitter_TOKEN, (res) => {
            res.on('data', (data) => {
                const json = JSON.parse(data)

                if (!json.includes) { resolve(false); return }

                for (const media of json.includes.media)
                    if (media.type == "video") {
                        for (const variant of media.variants)
                            if (variant.bit_rate) {
                                resolve({
                                    title: json.data.entities.urls[0].url,
                                    url: variant.url,
                                    image: media.preview_image_url,
                                    duration: tx.ms(media.duration_ms)
                                });
                                return;
                            }
                    }
                resolve(false)
            });
        });
    });
}