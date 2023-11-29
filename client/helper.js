const sendPost = async (url, data, handler) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.redirect) {
        window.location = result.redirect;
    }

    // if (result.error) {
    //     handleError(result.error);
    // }

    if (handler) {
        handler(result);
    }
};

const sendGet = async (url, handler) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });

    const result = await response.json();

    if (handler) {
        handler(result);
    }
    else { return result; }
};

module.exports = {
    sendPost,
    sendGet
};