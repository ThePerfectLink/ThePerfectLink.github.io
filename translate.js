
var lang = "";

function translate() {
    lang = userLang = navigator.language || navigator.userLanguage; 
}

function getLang() {
    return lang;
}

function getTranslation(section) {
    fetch("./translate_" + lang + "/section.json").then((resonse) => resones.json).then((json) => console.log(json));
}