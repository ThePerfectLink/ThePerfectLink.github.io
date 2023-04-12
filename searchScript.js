const mono = "SpotMonkey"

var ninjaResponse = {
    term: "test",
    setTerm: function(q) {
        this.term = q;
    },
    getTerm: function() {
        return this.term;
    },
    search: function() {
        if(this.term) {
            return(
                fetch("https://api.api-ninjas.com/v1/animals?name=" + this.getTerm(), {headers: {'X-Api-Key': 'qfFqBnn8t82LDmB0lyh/4A==eaeKZpduCoGbegNz'}})
                .then((response) => { if(response.ok) {return response.json()}
                    else {throw new Error()}
                }).catch(() => {
                    return 0;
                })   
            )
        } else {
            return 0
        } 
    }
}

var wikiImgResponse = {
    term1: "test",
    term: "test",
    setTerm1: function(q) {
        this.term1 = q;
    },
    getTerm1: function() {
        return this.term1;
    },
    setTerm2: function(q) {
        this.term2 = q;
    },
    getTerm2: function() {
        return this.term2;
    },
    search1: function() {
        return(
            fetch("https://en.wikipedia.org/api/rest_v1/page/media-list/" + this.getTerm1())
            .then((response) => { if(response.ok) {return response.json()}
                else {throw new Error()}
            }).catch(() => {
                return this.search2();
            })   
        )
    },
    search2: function() {
        return(
            fetch("https://en.wikipedia.org/api/rest_v1/page/media-list/" + this.getTerm2())
            .then((response) => { if(response.ok) {return response.json()}
                else {throw new Error()}
            }).catch(() => {
                return 0;
            })   
        )
    }
}

// var wikiMetadataResponse = {
//     term: "test",
//     setTerm: function(q) {
//         this.term = q;
//     },
//     getTerm: function() {
//         return this.term;
//     },
//     search: function() {
//         return(fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + this.term)
//         .then((text) => {if(text.ok){return(text.json());}else{return 0}}));
//     }
// }

async function searchAnimal() {
    const response = fetch("https://api.api-ninjas.com/v1/animals?name=" + (document.getElementById("searchBox").value), {headers: {'X-Api-Key': 'qfFqBnn8t82LDmB0lyh/4A==eaeKZpduCoGbegNz'}})
        .then((response) => response.json())
        .then((text) => {return(text);});
    
    const data = await response;

    const wikiHTMLResponse = fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + data[0].name)
        .then((text) => {return(text.json());});

    const printAddress = async () => {
        let results = document.getElementById("results");
        results.innerHTML="";
        const wiki = await wikiHTMLResponse;
        wikiImgResponse.setTerm1(data[0].name.replace(/ +/g, "_"));
        wikiImgResponse.setTerm2(data[0].taxonomy.genus.replace(/ +/g, "_"));
        let img = await wikiImgResponse.search1();
        if(document.getElementById("imgResult") || document.getElementById("textResult")) {
            document.getElementById("imgResult").src = img.items[0].srcset[0].src;
            document.getElementById("textResult").textContent = data[0].name;
        } else {
            const textResult = document.createElement("h2");
            const imgResult = document.createElement("img");
            const lungResult = document.createElement("h2");
            imgResult.src = img.items[0].srcset[0].src;
            textResult.textContent = data[0].name + "";
            lungResult.textContent = await searchLung(data[0]);
            imgResult.id = "imgResult";
            textResult.id = "textResult";
            results.appendChild(imgResult);
            results.appendChild(textResult);
            results.appendChild(lungResult);
        }
    } 
    printAddress();
}

async function searchLung(data) {
    var lungs = await fetch('./lungs.json')
        .then(e => {
            return e.json();
        })
    for(var key in lungs.NoLungs.taxonomy) {
        for(var i = 0; i < lungs.NoLungs.taxonomy[key].length; i++) {
            if(lungs.NoLungs.taxonomy[key][i] == data.taxonomy[key]) {
                return "Has no lungs";
            }
        }  
    }
    for(var i = 0; i < lungs.NoLungs.name.length; i++) {
        if(lungs.NoLungs.name[i] == data.name) {
            return "Has no lungs";
        }
    }
    for(var key in lungs.Lungs.taxonomy) {
        for(var i = 0; i < lungs.Lungs.taxonomy[key].length; i++) {
            if(lungs.Lungs.taxonomy[key][i] == data.taxonomy[key]) {
                return "Has lungs";
            }
        }
    }
    for(var i = 0; i < lungs.Lungs.name.length; i++) {
        if(lungs.Lungs.name[i] == data.name) {
            return "Has lungs";
        }
    }
    return "Has no Lungs";
}

async function textGrab(value, e) {
    if(e.keyCode === 13){ 
        searchAnimal();
    } else {
        animalSuggestion(value+String.fromCharCode(e.keyCode))
    }
}

async function animalSuggestion(currentText) {
    const search = document.getElementById("autocomplete");
    const searchBox = document.getElementById("searchBox");
    //let textResponse;
    let imgResponse;
    let searchDiv = document.createElement('div');
    searchDiv.id ="suggestionBox";
    await ninjaResponse.setTerm(currentText);
    response = await ninjaResponse.search();
    if(response && currentText != "") {
        for(let responseI = 0, resultI = 0; resultI < 8 && responseI < response.length; responseI++) {
            if (searchBox.value != currentText){
                return;
            }
            if(response[responseI].taxonomy.genus && response[responseI].name) {
                wikiImgResponse.setTerm1(response[responseI].name.replace(/ +/g, "_"))
                wikiImgResponse.setTerm2(response[responseI].taxonomy.genus.replace(/ +/g, "_"));
                imgResponse = await wikiImgResponse.search1();
                if(imgResponse && imgResponse.items[0]) {
                    let result = document.createElement("div");
                    let resultImg = document.createElement("img");
                    let resultText = document.createElement("p");
                    let queryN = await response[responseI].name
                    let query = await response[responseI].name.replace(/ +/g, "_")
                    resultImg.src = await imgResponse.items[0].srcset[0].src; 
                    resultText.textContent = await queryN;
                    result.id = await query;
                    result.classList.add("suggestion");
                    result.appendChild(resultImg);
                    result.appendChild(resultText);
                    result.addEventListener("mousedown", function() {
                            const suggestion = queryN;
                            searchBox.value = suggestion;
                    });
                    searchDiv.appendChild(result);
                    resultI++
                }
            }
        }
    }
    if(document.getElementById("suggestionBox")){
        document.getElementById("suggestionBox").remove();
    }
    search.appendChild(searchDiv);
    searchDiv.classList.add("active");
}