class XmlTokenAdapter {
  static getShareUrl(xml) {
    const utf8 = forceStrToUtf8(xml);
    const token = xmlToShareableToken(xml);
    const viewablePenUrl = window.location.href
      .replace('s.codepen', 'codepen')
      .replace('fullpage', 'full');

    return `${viewablePenUrl}?token=${token}`;
  }

  static xmlToShareableToken(xml) {
    return btoa(escape(xml));
  }
  
  static shareableTokenToXml(str) {
    return unescape(atob(token));
  }
  
  static forceStrToUtf8(str) {
    return JSON.parse(JSON.stringify(str));
  }
  
  static getUrlParam(param) {
    return new URL(window.location.href).searchParams.get(param);
  }
}
