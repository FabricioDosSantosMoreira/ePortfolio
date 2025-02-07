/**
 * @fileoverview 'main.js' is responsible for loading each project card inside the projects page
 * @author Fabricio dos Santos Moreira <dev.fabriciodossantosmoreira@gmail.com>
 * @version 1.0.0
*/


// Global Variables

// NOTE: Variable Structure for 'colorInfo'
// { 'languageName': { 
//         'color', 
//         'url' 
//     } 
// }
let colorInfo;  

// NOTE: Variable Structure for 'repoInfo'
// [ { 'name', 
//     'description', 
//     'url', 
//     'openGraphImageUrl', 
//     'stargazers': { 
//         'totalCount' 
//     }, 
//     'forks': {  
//         'totalCount' 
//     }, 
//     'watchers': { 
//          'totalCount' 
//     }, 
//     'languages': { 
//         'edges': [ { 
//             'node': {
//                 'name'
//             }, 
//         'size'
//         }] 
//     } 
// } ]
let repoInfo;  


document.addEventListener('DOMContentLoaded', async function () {
    colorInfo = await fetchDataOrFallbackData(
        '../../data/github_color_data.json',
        '../../data/backup/github_color_data.json'
    );
    repoInfo = await fetchDataOrFallbackData(
        '../../data/repo_data.json',
        '../../data/backup/repo_data.json'
    );

    let currentPage = window.location.pathname.split('/')[2];
    if (currentPage === 'projects') {
        const tag = document.getElementById('projects');
        buildRepoInfoAndRender(tag);
    }

    }
);


async function fetchDataOrFallbackData(path, fallbackPath) {
    
    // Either fetch from 'path' or fetch from 'fallbackPath'.
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to Load '${path}'`);
        return await response.json();

    } catch (error) {
        console.warn(`${error.message}. Trying to Load Fallback Data...`);
        
        // Fallback path must always contain a valid data file.
        const fallbackResponse = await fetch(fallbackPath);
        return await fallbackResponse.json();
    }
}


async function buildRepoInfoAndRender(tag) {
    let defaultSocialImagePath = '../../assets/utils/img/github-logo.png';
 
    for (let info of repoInfo) {
        // Get the most used language and the color for it.        
        info.mostUsedLanguageName = getMostUsedLanguageName(info.languages);
        info.mostUsedLanguageColor = getLanguageColor(info.mostUsedLanguageName);

        // Basically means that the repository doesn't have a custom social preview image.
        if (info.openGraphImageUrl.includes('https://opengraph.githubassets.com/')) {
            // Set the default social image.
            info.openGraphImageUrl = defaultSocialImagePath;
        }

        renderRepositoryInfo(tag, info);
    }
};


function renderRepositoryInfo(tag, repositoryInfo) {

    // Build a container div.
    const containerDiv = document.createElement('div');
    containerDiv.classList.add('gallery__project-card');

    // Build the language colors div.
    const colorsDiv = buildColorBar(repositoryInfo.languages);

    // Build the card div.
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');

    // Build the div with extra info.
    const statsDiv = buildRepoExtraInfoDiv(
        repositoryInfo.stargazers.totalCount, 
        repositoryInfo.forks.totalCount, 
        repositoryInfo.watchers.totalCount,
        repositoryInfo.mostUsedLanguageName,
        repositoryInfo.mostUsedLanguageColor,
    );

    // Build the div with the homepage link or not.
    let homepageUrlTag = document.createElement('a');
    homepageUrlTag.style.width = "0";

    if (repositoryInfo.homepageUrl != "") {
        homepageUrlTag.classList.add('card__title__homepage');

        homepageUrlTag.href = repositoryInfo.homepageUrl;
        homepageUrlTag.target = "_blank";
        homepageUrlTag.style.width = "12.5%";

        homepageUrlTag.innerHTML = `
            <img src="../../assets/utils/icons/external_link_2.png" alt="HomePage Link Icon">
        `;
    }
    
    // Build the left and right border div for this repo.
    const [leftBorderDiv, rightBorderDiv] = buildBorderDiv(repositoryInfo.languages);

    // Adding previously built divs to the card.
    cardDiv.innerHTML = `
        <img class="card__image" src="${repositoryInfo.openGraphImageUrl}" alt="Repository Preview Image"></img>

        ${colorsDiv.outerHTML}

        <div class="card__title">
            <a class="card__title__info" href="${repositoryInfo.url}" target="_blank">
                <img src="../../assets/utils/icons/external_link_1.png" alt="GitHub Link Icon">
                <span>${formatRepoName(repositoryInfo.name)}</span>
            </a>
            ${homepageUrlTag.outerHTML}
        </div>

        <div class="card__description">
            <p>${repositoryInfo.description || "Sem descrição"}</p>
        </div>
       
        <a href="${repositoryInfo.url}"></a>

        ${statsDiv.outerHTML}
    `;


    // Append all the divs to the container div.
    containerDiv.appendChild(leftBorderDiv);
    containerDiv.appendChild(rightBorderDiv);
    containerDiv.appendChild(cardDiv);
    
    // Append the container div to the tag.
    tag.appendChild(containerDiv);
}


function buildBorderDiv(languages) { 
    let LanguagesNameAndPercentage = getUsedLanguagesNameAndPercentage(languages);

    // Build the left and right borders div with styles based on the languages provided.
    const leftBorderDiv = document.createElement('div');
    const rightBorderDiv = document.createElement('div');

    leftBorderDiv.classList.add('gallery__border--bottom-left');
    rightBorderDiv.classList.add('gallery__border--top-right');
    
    var colorsList = [];
    for (let languageName in LanguagesNameAndPercentage) {
        let languageColor = getLanguageColor(languageName);
        
        colorsList.push(languageColor);
    }

    leftBorderDiv.style.borderImageSource = `
        conic-gradient(from var(--angle), transparent 50%, ${colorsList.join(', ')})
    `;
    rightBorderDiv.style.borderImageSource = `
        conic-gradient(from var(--angle), transparent 50%, ${colorsList.join(', ')})
    `;
    
    return [leftBorderDiv, rightBorderDiv];
}


function buildRepoExtraInfoDiv(stargazers, forksCount, watchers, languageName, languageColor) {

    // Build the stats div with styles based on the info provided.
    const statsDiv = document.createElement('div');
    statsDiv.classList.add('gallery__card-info');

    statsDiv.innerHTML = `
        <div class="gallery__card-info__language">
            <div class="gallery__card--colored-dot" style="background-color: ${languageColor}"></div>
            <span>${languageName}</span>
        </div>

        <div class="gallery__card-info__stats">
            <div class="gallery__card-info__stats-item gallery__card-info__stats-item--star">
                <img src="../../assets/utils//icons/star.png" alt="Stars Icon">
                <span>${stargazers}</span>
            </div>

            <div class="gallery__card-info__stats-item gallery__card-info__stats-item--eye">
                <img src="../../assets/utils//icons/eye.png" alt="Watchers Icon">
                <span>${watchers}</span>
            </div>

            <div class="gallery__card-info__stats-item gallery__card-info__stats-item--fork">
                <img src="../../assets/utils//icons/fork.png" alt="Forks Icon">
                <span>${forksCount}</span>
            </div>
        </div>
    `;

    return statsDiv;
}


function buildColorBar(languages) {
    let LanguagesNameAndPercentage = getUsedLanguagesNameAndPercentage(languages);

    // Build the language colors div based on the language provided.
    const colorDiv = document.createElement('div');
    colorDiv.classList.add('gallery__card--colored-bar');

    for (let languageName in LanguagesNameAndPercentage) {
        let languageColor = getLanguageColor(languageName);

        const segment = document.createElement('div');
        segment.style.width = `${LanguagesNameAndPercentage[languageName]}%`;
        segment.style.backgroundColor = languageColor;

        colorDiv.appendChild(segment);
    }

    return colorDiv;
}


function getLanguageColor(languageName) {

    // Fix: Set a default color when 'languageName' is 'Undefined'.
    if (languageName === 'Undefined') {
        return '#4D4D4D';
    }

    return colorInfo[languageName]['color'];
}


function getMostUsedLanguageName(languages) {
    let mostUsedLanguageName = '';

    let size = 0;
    for (let index in languages['edges']) {
        if (languages['edges'][index]['size'] > size) {
            size = languages['edges'][index]['size'];
            mostUsedLanguageName = languages['edges'][index]['node']['name'];     
        }
    }

    // Fix: When a repository doesn't have a language. So we set to 'Undefined'.
    if (mostUsedLanguageName == '') {
        mostUsedLanguageName = 'Undefined';
    }


    return mostUsedLanguageName;
}


function getUsedLanguagesNameAndPercentage(languages) {
    const evaluationMethod = 'min-value' // Either 'min-value' or 'normal'

    let totalSize = 0;
    let languagesArray = [];

    // Sum all the sizes in 'languages'.
    for (let index in languages['edges']) {
        totalSize += languages['edges'][index]['size'];
    }

    // Fix: When a repository doesn't have a language. So we set to 'Undefined'.
    if (totalSize == 0) {
        return { 'Undefined': 100 };
    }


    // Evaluating percentages
    if (evaluationMethod === 'min-value') {
        const minPercentageAllowed = 2.5;

        let languageSizesArray = [];
        for (let index in languages['edges']) {
            languageSizesArray.push(languages['edges'][index]['size']);
        }

        let initialPercentagesArray = [];
        for (let index = 0; index < languageSizesArray.length; index++) {
            let percentage = (languageSizesArray[index] / totalSize) * 100;

            initialPercentagesArray.push(percentage);
        }

        let adjustedPercentagesArray = [];
        for (let index = 0; index < initialPercentagesArray.length; index++) {
            let adjustedPercentage = 0;

            if (initialPercentagesArray[index] > minPercentageAllowed) {
                adjustedPercentage = initialPercentagesArray[index];
            } else {
                adjustedPercentage = minPercentageAllowed;
            }

            adjustedPercentagesArray.push(adjustedPercentage);
        }

        let totalSizeAdjusted = adjustedPercentagesArray.reduce((a, b) => a + b);

        let finalPercentagesArray = [];
        for (let index = 0; index < adjustedPercentagesArray.length; index++) {
            let finalPercentage = (adjustedPercentagesArray[index] / totalSizeAdjusted) * 100;

            finalPercentagesArray.push(finalPercentage);
        }

        for (let index in languages['edges']) {
            let languageName = languages['edges'][index]['node']['name'];
            let languagePercentage = finalPercentagesArray[index];

            languagesArray.push({ name: languageName, percentage: languagePercentage });
        }

    } else {
        for (let index in languages['edges']) {
            let languageName = languages['edges'][index]['node']['name'];
            let languageSize = languages['edges'][index]['size'];

            let percentage = (languageSize / totalSize) * 100;
            languagesArray.push({ name: languageName, percentage: parseFloat(percentage.toFixed(2)) });
        }
    }

    // Sort by percentage in descending order.
    languagesArray.sort((a, b) => b.percentage - a.percentage);

    // Convert back to an object.
    let LanguagesNameAndPercentage = {};
    languagesArray.forEach(lang => {
        LanguagesNameAndPercentage[lang.name] = lang.percentage;
    });

    return LanguagesNameAndPercentage;
}


function formatRepoName(string) {
    let splittedString = string.split('-');
    let newString = '';

    // Removes any '-' and adds a ' ' from a string. 
    // Also set the first word letter as upper case.
    for (let i = 0; i < splittedString.length; i++) {
        splittedString[i] = splittedString[i][0].toUpperCase() + splittedString[i].slice(1);

        newString += splittedString[i];
        if (i < splittedString.length - 1) {
            newString += ' ';
        }
    }

    return newString;
};