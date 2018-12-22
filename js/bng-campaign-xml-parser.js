  class BngCampaignXmlParser {
      static convertBngCampaignXmlToXmlDoc(str) {
          const parser = new DOMParser();
          const wellFormedXmlStr = `<root>${str}</root>`;
          return parser.parseFromString(wellFormedXmlStr, 'text/xml');
      }

      static setHtmlFieldsForXml(addGroup, addEvent, addLevel, mappings, xml) {
        // Settings tag
        const settings = this.getSelectorValuesMapForTagName(mappings, xml, 'Settings');
        this.setHtmlFieldsForMap('.campaign-options-container', settings);

        // For ea group
        const groupTags = xml.getElementsByTagName('Group');
        for (let groupTag of groupTags) {
          addGroup(false, false);
          // Apply "PointsToUnlock"
          const group = this.getSelectorValuesMapForTag(mappings, xml, 'Group', groupTag);
          this.setHtmlFieldsForMap('.group', group);
          // For ea event childnode
          const eventTags = groupTag.getElementsByTagName('Event');
          for (let eventTag of eventTags) {
            const latestGroupEle = $('.campaign-container .group').last();
            addEvent(false, latestGroupEle);

            // Apply frontend
            const frontendTag = eventTag.getElementsByTagName('Frontend')[0];
            const frontend = this.getSelectorValuesMapForTag(mappings, xml, 'Frontend', frontendTag);
            this.setHtmlFieldsForMap('.event', frontend);
            // Apply awards
            const awardsTag = eventTag.getElementsByTagName('Awards')[0];
            const awards = this.getSelectorValuesMapForTag(mappings, xml, 'Awards', awardsTag);
            this.setHtmlFieldsForMap('.event', awards);
            // Apply Mode/Modifiers/Ai
            const eventSettingsTag = groupTag.getElementsByTagName('EventSettings')[0];

            const modeTag = eventSettingsTag.getElementsByTagName('Mode')[0];
            const modifiersTag = eventSettingsTag.getElementsByTagName('Modifiers')[0];
            const aiTag = eventSettingsTag.getElementsByTagName('Ai')[0];

            const mode = this.getSelectorValuesMapForTag(mappings, xml, 'Mode', modeTag);
            const modifiers = this.getSelectorValuesMapForTag(mappings, xml, 'Modifiers', modifiersTag);
            const ai = this.getSelectorValuesMapForTag(mappings, xml, 'Ai', aiTag);
            this.setHtmlFieldsForMap('.event', mode);
            this.setHtmlFieldsForMap('.event', modifiers);
            this.setHtmlFieldsForMap('.event', ai);
            
            // For ea Level childnode
            const levelTags = eventSettingsTag.getElementsByTagName('Level');
            for (let levelTag of levelTags) {
              const addLevelBtnEle = $('.campaign-container .btn-add-level').last();
              addLevel(false, addLevelBtnEle);
              // Apply level name
              const level = this.getSelectorValuesMapForTag(mappings, xml, 'Level', levelTag);
              this.setHtmlFieldsForMap('.event', level);
            }
          }
        }
      }

      static setHtmlFieldsForMap(parentSelector, mappingsForXmlTag) {
        for (let mapping of mappingsForXmlTag) {
          const parent = $(`.campaign-container ${parentSelector}`).last();
          parent.find(mapping.selector).val(mapping.val);
        }
      }

      static getSelectorValuesMapForTagName(mappings, xml, tagName) {
          return mappings.filter(m => m.xml.tag.toLowerCase() === tagName.toLowerCase())
              .map(m => ({
                  selector: m.html.selector,
                  val: this.getXmlAttr(xml, m.xml.tag, m.xml.attr)
              }));
      }

      static getSelectorValuesMapForTag(mappings, xml, tagName, tag) {
          return mappings.filter(m => m.xml.tag.toLowerCase() === tagName.toLowerCase())
              .map(m => ({
                  selector: m.html.selector,
                  val: tag.getAttribute(m.xml.attr)
              }));
      }

      static getXmlAttr(xml, tagName, attrName) {
          const tag = xml.getElementsByTagName(tagName)[0];
          if (tag) {
              const attrVal = tag.getAttribute(attrName);
              if (attrVal !== undefined) {
                  return attrVal;
              }
          }

          console.warn(`Tag "${tagName}" with attribute "${attrName}" not found in xml`);
          return null;
      }
  }