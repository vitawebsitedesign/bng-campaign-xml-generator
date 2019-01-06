const webdriver = require('selenium-webdriver');
const browser = new webdriver.Builder().usingServer().withCapabilities({ 'browserName': 'firefox' }).build();
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const by = webdriver.By;
const until = webdriver.until;
const path = require('path');
const fs = require('fs');
const parseString = require('xml2js').parseString;
const targetHtmlPath = path.join(__dirname, '../dist/index.htm');
const targetHtmlUri = `file:///${targetHtmlPath}`;
chai.use(chaiAsPromised);
chai.should();

describe('bng campaign xml generator', function () {
  this.timeout(100000);

  describe('loading templates', function () {
    beforeEach(() => browser.get(targetHtmlUri));

    it('should be able to load "New" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('new');
      expect(xml.length).to.equal(116);
    });

    it('should be able to load "BNGT" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('[by radracer] ballisticng gt (bngt)');
      expect(xml.length).to.equal(16355);
    });

    it('should be able to load "enai + kyratech" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('[enai+kyratech] campaign');
      expect(xml.length).to.equal(7217);
    });

    it('should be able to load "wipeout64 race challenges" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('wipeout64 race challenges');
      expect(xml.length).to.equal(4372);
    });

    it('should be able to load "wipeout64 time trial challenges" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('wipeout64 time trial challenges');
      expect(xml.length).to.equal(4561);
    });

    it('should be able to load "wipeout64 casual races" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('wipeout64 casual races');
      expect(xml.length).to.equal(2374);
    });
  });

  describe('loading raw xml', function () {
    beforeEach(() => browser.get(targetHtmlUri));

    it('should be able to load raw xml', async () => {
      const rawXml = await getXmlFromFilePromise('raw-sample.xml');
      const xml = await canLoadRawXmlPromise(rawXml);
      expect(xml.length).to.equal(4437);
    });
  });

  after(() => browser.quit());
});

function getXmlItemAfterChangingHtmlFieldPromise(prevVal, prevXml, htmlByFunc, htmlSelector, htmlVal) {
  return new Promise((resolve, reject) => {
    waitUntilElementUpdatedPromise(htmlByFunc, htmlSelector, 'value', prevVal)
      .then(() => browser.findElement(htmlByFunc(htmlSelector)).sendKeys(htmlVal))
      .then(() => waitUntilElementUpdatedPromise(by.id, 'campaign-xml', 'value', prevXml))
      .then(() => browser.findElement(by.id('campaign-xml')).getAttribute('value'))
      .then(xmlStr => convertBngCampaignXmlToXmlDocPromise(xmlStr))
      .then(resolve)
      .catch(reject);
  });
}

function convertBngCampaignXmlToXmlDocPromise(str) {
  return new Promise((resolve, reject) => {
    const wellFormedXmlStr = `<root>${str}</root>`;
    parseString(wellFormedXmlStr, (err, xmlDoc) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(xmlDoc);
      }
    });
  });
}

function getXmlItemPromise(xml, xmlTagName, xmlAttr) {
  return new Promise((resolve, reject) => {
    let item = xml['root'][xmlTagName];
    if (!item) {
      reject(`couldnt find xml tag ${xmlTagName}`);
    }

    if (xmlAttr) {
      item = item.getAttribute(xmlAttr);
      if (!item) {
        reject(`couldnt find xml attribute ${xmlAttr}`);
      }
    }

    resolve(item);
  });
}

function getXmlFromFilePromise(filename) {
  return new Promise((resolve, reject) => {
    const rawSample = path.join(__dirname, 'data', filename);
    fs.readFile(rawSample, { encoding: 'utf-8' }, (err, rawXml) => {
      if (err) {
        reject(err);
      }
      resolve(rawXml);
    });
  });
}

function canLoadRawXmlPromise(rawXml) {
  return new Promise((resolve, reject) => {
    let prevXml = null;
    browser.findElement(by.id('campaign-xml')).getAttribute('value').then(xml => prevXml = xml);
    browser.findElement(by.className('load-raw-xml')).sendKeys(rawXml + webdriver.Key.CONTROL + "a" + "x" + "v")
      .then(waitUntilPopupLoadElementRemoved)
      .then(() => waitUntilTemplateXmlLoadedPromise(prevXml))
      .then(() => browser.findElement(by.id('campaign-xml')).getAttribute('value'))
      .then(xml => resolve(xml))
      .catch(reject);
  });
}

function canLoadXmlFromRemoteTemplatePromise(openCampaignBtnText) {
  return new Promise((resolve, reject) => {
    let prevXml = null;
    browser.findElement(by.id('campaign-xml')).getAttribute('value')
      .then(xml => prevXml = xml)
      .then(() => browser.findElement(by.xpath(`//button[contains(text(), '${openCampaignBtnText}')]`)).click())
      .then(waitUntilPopupLoadElementRemoved)
      .then(() => waitUntilTemplateXmlLoadedPromise(prevXml))
      .then(() => browser.findElement(by.id('campaign-xml')).getAttribute('value'))
      .then(xml => resolve(xml))
      .catch(reject);
  });
}

function waitUntilPopupLoadElementRemoved() {
  const popupLoadEle = browser.findElement(by.className('popup-load'));
  return browser.wait(until.stalenessOf(popupLoadEle), 10000);
}

function waitUntilTemplateXmlLoadedPromise(prevXml) {
  return waitUntilElementUpdatedPromise(by.id, 'campaign-xml', 'value', prevXml);
}

function waitUntilElementUpdatedPromise(byFunc, htmlSelector, attr, prevVal) {
  return browser.wait(() => {
    return browser.findElement(byFunc(htmlSelector)).getAttribute(attr).then(val => {
      return val !== prevVal;
    });
  }, 10000);
}
