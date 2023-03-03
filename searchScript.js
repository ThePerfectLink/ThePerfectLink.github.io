async function searchAnimal() {
    let response = await fetch("https://api.gbif.org/v1/species?name=Puma%20concolor");
    let returnJson =  response.json;
    
    console.log(response);
}