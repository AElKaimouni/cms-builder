const gridSpliter = (itemsLength: number) => {

    if(itemsLength % 3 === 0) return 4;
    if(itemsLength % 4 === 0) return 3;

    if(itemsLength % 3 > itemsLength % 4) return 4;
    else return 3;

}

export default gridSpliter; 