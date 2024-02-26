var request, articles;

async function doAjaxThings() {
    request = new XMLHttpRequest();
    request.open("GET", "./availableArticles.json", false);
    request.send(null);
    articles = JSON.parse(request.responseText)["articles"];
}

doAjaxThings();

const checkLink = () => {
    let url_string = window.location.href; // www.test.com?filename=test
    let url = new URL(url_string);
    let paramValue = url.searchParams.get("query");

    if (paramValue == null) {
        document.querySelector(".results").innerHTML = `<h3>... or check the <a href="?query=i+want+it+all">archives</a> for ✨variety✨</h3>`;
        document.querySelector(".container").style.paddingTop = "34vh";
    } else {
        document.querySelector("h1").style.display = "none";
        document.querySelector(".container").style.paddingTop = "13vh";
        paramValue = paramValue.replace("+", " ");
        if (paramValue == "i want it all") {
            let articleHolder = document.querySelector(".results");
            articles.forEach((article) => {
                articleHolder.innerHTML += `
                <br>
                <hr>
                <div class="result">
                    <h2>${article["title"]}</h2>
                </div>
                `
            })
            console.log(articles)
        }
    }
}