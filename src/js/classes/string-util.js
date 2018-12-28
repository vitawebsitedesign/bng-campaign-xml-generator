class StringUtil {
  static randomizeWebsiteColour() {
    const btnColour = this.getRandomColour();
    const headerGradient = `linear-gradient(45deg, #043751 0%, #104f71 30%, ${btnColour} 80%, ${btnColour} 100%)`;
    $('.btn-primary').css({ 'background-color': btnColour, 'border-color': btnColour });
    $('header').css('background', headerGradient);
  }

  static getRandomColour() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  static slugify(str) {
    return str.toLowerCase().replace(/ /gi, '-');
  }

  static getCustomCampaignFilePath(campaignName) {
    const folder = `C:\\...\\BallisticNG\\UserData\\Custom Campaigns`;
    const fileName = this.slugify(campaignName);
    const fileWithExtension = `${fileName}.xml`;
    return `${folder}\\${fileWithExtension}`;
  }

  static capitaliseFirstLetter(bool) {
    let str = bool.toString();
    return this.replaceAt(str, 0, str[0].toUpperCase());
  }

  static replaceAt(str, index, replacement) {
    return str.substr(0, index) + replacement + str.substr(index + replacement.length);
  }
}

export default StringUtil;
