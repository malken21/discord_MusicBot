exports.URL = async (URLdata) => {


    console.log(URLdata.query.v)

    if (URLdata.query.v) {
        return false;
    } else {
        const slice = split[1].slice(0, 11);
        let result_GV = await req.getGAS("getVideo", slice);
        if (result_GV.error) {
            return false;
        }
    }
    return result_GV;
}