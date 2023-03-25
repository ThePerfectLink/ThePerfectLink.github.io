const mono = "SpotMonkey"

async function searchAnimal() {
    const response = fetch("https://api.gbif.org/v1/species/match?name=" + document.getElementById("searchBox").value + "&kingdom=Animalia")
        .then((response) => response.json())
        .then((text) => {return(text.family);});

    const family = await response;

    const imgResponse = fetch("https://en.wikipedia.org/api/rest_v1/page/media-list/" + document.getElementById("searchBox").value)
        .then((text) => {return(text.json());});

    const wikiHTMLResponse = fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + document.getElementById("searchBox").value)
        .then((text) => {return(text.json());});

    const imgBUpResponse = fetch("https://en.wikipedia.org/api/rest_v1/page/media-list/" + family)
        .then((text) => {return(text.json());});
    
    const printAddress = async () => {
        let imgResult;
        let img;
        let results = document.getElementById("results");
        const wiki = await wikiHTMLResponse;
        if(wiki.type == "disambiguation") {
            img = await imgBUpResponse;
            imgResult = document.createElement("img");
            console.log(img);
        } else {
            img = await imgResponse;
            imgResult = document.createElement("img");
            console.log(img);
        }
        console.log(family);
        if(document.getElementById("imgResult") || document.getElementById("textResult")) {
            document.getElementById("imgResult").src = img.items[0].srcset[0].src;
            document.getElementById("textResult").textContent = family;
        } else {
            const textResult = document.createElement("h2");
            imgResult.src = img.items[0].srcset[0].src;
            textResult.textContent = family;
            imgResult.id = "imgResult";
            textResult.id = "textResult";
            results.appendChild(imgResult);
            results.appendChild(textResult);
        }
    } 
    printAddress();
}

var wikiImgResponse = {
    term: "test",
    search: function() {
        return(fetch("https://en.wikipedia.org/api/rest_v1/page/media-list/" + this.term)
        .then((text) => {return(text.json());}));
    }
}

var wikiMetadataResponse = {
    term: "test",
    search: function() {
        return(fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + this.term)
        .then((text) => {return(text.json());}));
    }
}

var gbifResponse = {
    term: "test",
    search: function() {
            return (fetch("https://api.gbif.org/v1/species/suggest?q=" + this.term + "&kingdom=Animalia")
            .then((response) => response.json())
            .then((text) => {return(text);}));
    }
}


async function animalSuggestion(evt) {
    let searchDiv = document.getElementById("suggestionBox");
    let suggestions = document.getElementsByClassName("suggestion");
    
    while(suggestions[0]) {
        suggestions[0].parentNode.removeChild(suggestions[0]);
    }
    
    gbifResponse.term = evt.value
    response = await gbifResponse.search();

    for(let i = 0; i < 5; i++) {
        if(response[i] && response[i].kingdom == "Animalia") {
            if(searchDiv.childElementCount >= 5) {
                return;
            }
            if(response[i].family && response[i].genus) {
                wikiImgResponse.term = response[i].family;
                wikiMetadataResponse.term = response[i].family;
                let imgResponse = await wikiImgResponse.search()
                let textResponse = await wikiMetadataResponse.search();
                if (imgResponse.items.length > 0 && textResponse) { 
                    let result = document.createElement("div");
                    let resultImg = document.createElement("img");
                    let resultText = document.createElement("p");
                    resultImg.src = imgResponse.items[0].srcset[0].src; 
                    resultText.textContent = textResponse.title;
                    result.classList.add("suggestion");
                    result.appendChild(resultImg);
                    result.appendChild(resultText);
                    searchDiv.appendChild(result);
                }
            }
        }
    }
}