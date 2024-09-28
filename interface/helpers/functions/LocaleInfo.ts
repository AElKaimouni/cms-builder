const localeInfo = (locale: string) : { locale: string; lang: string } | undefined => {
    switch(locale.toLowerCase()) {
        case "fr" : return  {
            locale: "en",
            lang: "Français"
        };
        case "ar" : return {
            locale: "ar",
            lang: "العربية"
        };
        case "en" : return {
            locale: "fr",
            lang: "English"
        }
    }
}

export default localeInfo;