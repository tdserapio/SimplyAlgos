var request, articles;
var articleHolder = document.querySelector(".results");

function sort2DArrayFunc(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] > b[0]) ? -1 : 1;
    }
}

async function doAjaxThings() {
    request = new XMLHttpRequest();
    request.open("GET", "./availableArticles.json", false);
    request.send(null);
    articles = JSON.parse(request.responseText)["articles"];
}

function intersect(...sets) {
    if (!sets.length) return new Set();
    const i = sets.reduce((m, s, i) => s.size < sets[m].size ? i : m, 0);
    const [smallest] = sets.splice(i, 1);
    const res = new Set();
    for (let val of smallest)
        if (sets.every(s => s.has(val)))
             res.add(val);
    return res;
}

function sentenceSimilarity(s1, s2) {
    function sentenceJaccard(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
        let sets1 = new Set(s1.split(" "));
        let sets2 = new Set(s2.split(" "));
        let intersectionSize = intersect(sets1, sets2).size;
    
        return intersectionSize / (sets1.size + sets2.size - intersectionSize);
    }

    function normalizedLevenshteinDistance(s1, s2) {
        if (!s1.length) return s1.length;
        if (!s2.length) return s2.length;
        const arr = [];
        for (let i = 0; i <= s2.length; i++) {
          arr[i] = [i];
          for (let j = 1; j <= s1.length; j++) {
            if (i == 0) {
                arr[i][j] = j;
            } else {
                arr[i][j] = Math.min(
                    arr[i-1][j] + 1, 
                    arr[i][j-1] + 1, 
                    arr[i - 1][j - 1] + (s1[j - 1] !== s2[i - 1])
                )
            }
          }
        }
        return arr[s2.length][s1.length] / Math.max(s1.length, s2.length);
      };

    let actualSj = 3/4 * sentenceJaccard(s1, s2) + 1/4 * normalizedLevenshteinDistance(s1, s2);
    return actualSj;
}

doAjaxThings();

const checkLink = () => {
    let url_string = window.location.href; // www.test.com?filename=test
    let url = new URL(url_string);
    let paramValue = url.searchParams.get("query");

    if (paramValue == null) {
        document.querySelector(".results").innerHTML = `<h3>Alternatively, check out the <a href="?query=EVERYTHING">archives</a>.</h3>`;
        document.querySelector(".container").style.paddingTop = "34vh";
    } else {
        document.querySelector("h1").style.display = "none";
        document.querySelector(".container").style.paddingTop = "13vh";
        document.querySelector('input[type="text"]').value = paramValue;
        paramValue = paramValue.replace("+", " ");
        if (paramValue == "EVERYTHING") {
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
        } else {
            let searchResults = [];
            articles.forEach((article) => {
                let currSJ = sentenceSimilarity(article['title'], paramValue);
                if (currSJ > 0.2) {
                    searchResults.push([currSJ, article['title']]);
                }
            });
            searchResults.sort(sort2DArrayFunc);
            if (searchResults.length == 0) {
                document.querySelector(".results").innerHTML = `<h3>Alternatively, check out the <a href="?query=EVERYTHING">archives</a>.</h3>`;
                document.querySelector(".container").style.paddingTop = "34vh";
            } else {
                let cnt = 0;
                searchResults.forEach((article) => {
                    if (cnt >= searchResults.length / 2) return;
                    articleHolder.innerHTML += `
                    <br>
                    <hr>
                    <div class="result">
                        <h2>${article[1]}</h2>
                    </div>
                    `;
                    cnt++;
                });
            }
        }   
    }
}