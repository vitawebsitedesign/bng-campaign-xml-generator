class XmlTokenAdapter {
  getShareUrl(xml) {
    const utf8 = forceStrToUtf8(xml);
    const token = xmlToShareableToken(xml);
    const viewablePenUrl = window.location.href
      .replace('s.codepen', 'codepen')
      .replace('fullpage', 'full');

    return `${viewablePenUrl}?token=${token}`;
  }

  xmlToShareableToken(xml) {
    return btoa(escape(xml));
  }
  
  shareableTokenToXml(str) {
    return unescape(atob(token));
  }
  
  forceStrToUtf8(str) {
    return JSON.parse(JSON.stringify(str));
  }
  
  getUrlParam(param) {
    return new URL(window.location.href).searchParams.get(param);
  }
}
