
// const defaultCatalogUrl = "c_Pym7ms2gtmBR0IC0U7weYKqf_NZAbNYGpA-xkZoS4"
//const defaultCatalogUrl = "DDfls-8iAMKA1PJB0q8WS_9R2128xgdvBEyBAttF9hw"
//const defaultCatalogUrl = "L9JVfZLyDWF-LYXXuETUesL0iy8Vl30wE3ofRGswy8A"
//const defaultCatalogUrl = "c9E6VspwSAzs3c5A-98edUpZn7QO8ObWmDxP2uLSvSY"
//const defaultCatalogUrl = "ml7M7gdVcUicCgjqs99dJ4XcEDTBdPLl_v8BnoktMXc"
// const defaultCatalogUrl ="7eSh0cnB5OERsALcLvUpObdjIzONt7MLDzFgj5NwFrk"
// const defaultCatalogUrl ="vINZ_ESfgijb726bTLYS5VHEW8ZPYwlt7B2N5CEDYEU"
const defaultCatalogUrl = "g818owBdeXGuh7ssuz5cSj-nM1fWeL5Ow_kl1I2W52s"
//
// const defaultCatalogUrl = "http://localhost:3000/catalog.json"


const getCatalogUrl = () => {
    if (localStorage.getItem('catalogUrl')===null) {
        localStorage.setItem('catalogUrl', defaultCatalogUrl)
        localStorage.setItem('catalogHistory', JSON.stringify([defaultCatalogUrl]))
    }

    const history = getCatalorUrlHistory()
    if (history.includes(defaultCatalogUrl) === false) {
        history.push(defaultCatalogUrl)
        localStorage.setItem('catalogHistory', JSON.stringify(history))
        localStorage.setItem('catalogUrl', defaultCatalogUrl)
    }
    return localStorage.getItem('catalogUrl')
}



const getCatalorUrlHistory = (): Array<string> => {
    return JSON.parse(localStorage.getItem('catalogHistory') || "[]")
}

const newCatalogUrl = (url:string) => {
    // clearAllpatches
    localStorage.setItem('catalogUrl', url)
    const history = getCatalorUrlHistory()
    history.push(url)
    localStorage.setItem('catalogHistory', JSON.stringify(history))
    window.location.reload()
}


export {getCatalogUrl, newCatalogUrl, getCatalorUrlHistory}

