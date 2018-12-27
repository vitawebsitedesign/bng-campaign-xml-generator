const webdriver = require('selenium-webdriver');
const browser = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'firefox' }).build();
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const expect = chai.expect;
const by = webdriver.By;
const until = webdriver.until;
const fs = require('fs');
const path = require('path');
chai.use(chaiAsPromised);
chai.should();

describe('bng campaign xml generation website', function() {
  this.timeout(100000);

  beforeEach(() => browser.get('file:///C:/Users/New/Desktop/d/gitlab-bng-campaign-xml-generator/dist/index.htm'));

  describe('loading templates', function() {
    it('should be able to load "New" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('new');
      expect(xml.length).to.equal(116);
    });
  
    it('should be able to load "BNGT" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('ballisticng gt (bngt)');
      expect(xml.length).to.equal(16355);
    });
  
    it('should be able to load "Enai" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('enai example');
      expect(xml.length).to.equal(1937);
    });
  
    it('should be able to load "kyra/evy/victor/shroom" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('kyra/evy/victor/shroom example');
      expect(xml.length).to.equal(2504);
    });
  
    it('should be able to load "wipeout64 race challenges" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('wipeout64 race challenges');
      expect(xml.length).to.equal(4320);
    });
  
    it('should be able to load "wipeout64 time trial challenges" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('wipeout64 time trial challenges');
      expect(xml.length).to.equal(4412);
    });
  
    it('should be able to load "wipeout64 elimination challenges" template', async () => {
      const xml = await canLoadXmlFromRemoteTemplatePromise('wipeout64 elimination challenges');
      expect(xml.length).to.equal(4380);
    });  
  });

  describe('loading raw xml', function() {
    it('should be able to load raw xml', async () => {
      const rawXml = await getXmlFromFile('raw-sample.xml');
      const xml = await canLoadRawXml(rawXml);
      expect(xml.length).to.equal(16732);
    });
  });

  after(() => browser.quit());
});

function getXmlFromFile(filename) {
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

function canLoadRawXml(rawXml) {
  return new Promise((resolve, reject) => {
    let prevXml = null;
    browser.findElement(by.id('campaign-xml')).getAttribute('value').then(xml => prevXml = xml);
    browser.findElement(by.className('load-raw-xml')).sendKeys(rawXml + webdriver.Key.CONTROL+ "a" + "x" + "v")
      .then(waitUntilPopupLoadElementRemoved)
      .then(() => waitUntilTemplateXmlLoaded(prevXml))
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
      .then(() => waitUntilTemplateXmlLoaded(prevXml))
      .then(() => browser.findElement(by.id('campaign-xml')).getAttribute('value'))
      .then(xml => resolve(xml))
      .catch(reject);
  });
}

function waitUntilPopupLoadElementRemoved() {
  const popupLoadEle = browser.findElement(by.className('popup-load'));
  return browser.wait(until.stalenessOf(popupLoadEle), 10000);
}

function waitUntilTemplateXmlLoaded(prevXml) {
  return browser.wait(() => {
    return browser.findElement(by.id('campaign-xml')).getAttribute('value').then(xml => {
      return xml !== prevXml;
    });
  }, 10000);
}
