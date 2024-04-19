
var global_fonts = [];
var active_threads   = 0;
var last_worked_font = 0;

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function get_font_list()
{
    let stop = false;
    var page = 1;
    while(!stop)
    {
        var res = await fetch("https://www.fontspace.com/api/v3/fonts/search.json?page=" + page + "&type=all", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                "cache-control": "no-cache",
                "pragma": "no-cache",
                "request-starttime": "1713172213494",
                "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"macOS\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-xsrf-token": "qJJ169hz54EDtDEqm4S28al3YnL5BdR37P_bGfvr6JmdSXMVOuQxY9Vw4GmEmNhEhGm7VLvVDmnz2IFysoEzNiFagAE1:dtRfNO4ZCgB63xQCiX8wKd2iJgD1vCZjqHBAnrgjGlkkEwpwzNsXBob25fq2rLZcgSh4imSQxDW4FvDVdh6u558UJSM1"
            },
            "referrer": "https://www.fontspace.com/popular/fonts?p=2",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET",
            "mode": "cors",
            "credentials": "include"
        });
        res = await res.json();
        var fonts = res["fonts"];
        if(fonts.length == 0) stop = true;
        fonts.forEach(font => {
            // font["fonts"].forEach(f => {
            //     global_fonts.push(
            //         {
            //             "name": f["font"]["name"],
            //             "id": f["font"]["id"],
            //             "slug": f["font"]["slug"]
            //         }
            //     )
            // });
            // not taking all versions of the font, just the first one
            font = font["fonts"][0]["font"];
            
            fetch("https://www.fontspace.com/api/v3/font/" + font["id"]  + "/details.json", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
                    "cache-control": "no-cache",
                    "pragma": "no-cache",
                    "request-starttime": "1713430387042",
                    "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"macOS\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-xsrf-token": "jk-N3e8gbsOcVDGy3d9H78eJc_MWFGKb2nJhT4IjafD8zAJYGquyV_VxP_fEcFdHEcymOjBIioP0cmBA70hCCSQipHE1:GdfOrFtOnyQjU11qGarjacvARx5LDMVv_MtycyUTbRXJxqaNldELU2-Rb6B86dNEalHKP0J55QLk02lE9XIVOGHsFos1"
                },
                "referrer": "https://www.fontspace.com/autumn-flowers-font-f86879",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            }).then(res => res.json().then(res => {
                global_fonts.push({
                    id: font["id"],
                    name: font["name"],
                    slug: font["slug"],
                    url: res["webfont"]["url"]
                });
            }));
        });
        page++;
        console.log(page);
    }
    console.log(page);
}

function new_font_canvas()
{
    var canvas = document.createElement("canvas");
    canvas.width = 224;
    canvas.height = 224;
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.zIndex = "100000";
    canvas.style.backgroundColor = "white";
    var ctx = canvas.getContext("2d");
    return ctx;
}

function getLines(ctx, text, maxWidth)
{
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}


function draw_font(ctx, text, font)
{
    console.log(font);
    ctx.clearRect(0, 0, 224, 224);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 224, 224);
    ctx.font = "20px " + font;
    ctx.fillStyle = "black";
    var lines = getLines(ctx, text, 224);
    var y = 23;
    lines.forEach(line => {
        ctx.fillText(line, 0, y);
        y += 23;
    });
}

async function sendimage(fontid, text, data_uri)
{
    await fetch("http://127.0.0.1:5000/datauri", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            fontid: fontid,
            text: text,
            data_uri: data_uri
        })
    });
}

async function gen_font_image(ctx, text, fontid)
{
    draw_font(ctx, text, "webfont" + fontid);
    var data_uri = ctx.canvas.toDataURL();
    await sendimage(fontid, text, data_uri);
}

function inject_font(fontid, webfont_url)
{
    var i = webfont_url;
    var t = "webfont" + fontid;
    if (document.getElementById(t + '-css')) return;
    var n = document.createElement("style");
    n.id = t + '-css';
    n.innerHTML = "\n                @font-face \n                {\n                    font-family: '".concat(t, "';\n                    src: url('").concat(i, ".woff') format('woff'),\n                        url('").concat(i, ".otf')  format('opentype');\n                }\n                ");
    document.head.append(n)
}

function remove_font(fontid)
{
    var t = "webfont" + fontid + '-css';
    var n = document.getElementById(t);
    n.parentNode.removeChild(n)
}

async function gen_dataset_thread(font, texts)
{
    active_threads++;
    var ctx = new_font_canvas();
    inject_font(font.id, font.url);
    await sleep(5000);
    texts.forEach(async text => {
        await gen_font_image(ctx, text, font.id);
    });
    active_threads--;
    ctx.canvas.remove();
}

function start_generation(fonts, texts)
{
    for (var i = 0; i < fonts.length; i++)
    {
        setTimeout(gen_dataset_thread, 100, fonts[i], texts);
    }
}

start_generation(fonts, texts);