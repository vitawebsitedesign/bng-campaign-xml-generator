class BngCampaignXmlParser {
    convertBngCampaignXmlToXmlDoc(str)
    {
        const parser = new DOMParser();
        const wellFormedXmlStr = `<root>${str}</root>`;
        return parser.parseFromString(wellFormedXmlStr, 'text/xml');
    }

    setHtmlFieldsForXml(mappings, xml) {
            // Settings tag
            const settings = this.getSelectorValuesMapForTagName(mappings, xml, 'Settings');
            console.log(settings);    // dm
                // Set html field vals normally

            // For ea group
            const groupTags = xml.getElementsByTagName('Group');
            for (let groupTag of groupTags) {
                // addGroup();
                // Apply "PointsToUnlock"
                const group = this.getSelectorValuesMapForTag(mappings, xml, 'Group', groupTag);
                console.log(group);    // dm
                // For ea event childnode
                const eventTags = groupTag.getElementsByTagName('Event');
                for (let eventTag of eventTags) {
                    // Apply frontend
                    const frontendTag = eventTag.getElementsByTagName('Frontend')[0];
                    const frontend = this.getSelectorValuesMapForTag(mappings, xml, 'Frontend', frontendTag);
                    console.log(frontend);    // dm
                    // Apply awards
                    const awardsTag = eventTag.getElementsByTagName('Awards')[0];
                    const awards = this.getSelectorValuesMapForTag(mappings, xml, 'Awards', awardsTag);
                    console.log(awards);    // dm
                    // addEvent();
                    // Apply Mode/Modifiers/Ai
                    const eventSettingsTag = groupTag.getElementsByTagName('EventSettings')[0];

                    const modeTag = eventSettingsTag.getElementsByTagName('Mode')[0];
                    const modifiersTag = eventSettingsTag.getElementsByTagName('Modifiers')[0];
                    const aiTag = eventSettingsTag.getElementsByTagName('Ai')[0];

                    const mode = this.getSelectorValuesMapForTag(mappings, xml, 'Mode', modeTag);
                    const modifiers = this.getSelectorValuesMapForTag(mappings, xml, 'Modifiers', modifiersTag);
                    const ai = this.getSelectorValuesMapForTag(mappings, xml, 'Ai', aiTag);

                    console.log(mode);
                    console.log(modifiers);
                    console.log(ai);
                    // For ea Level childnode
                    const levelTags = eventSettingsTag.getElementsByTagName('Level');
                    for (let levelTag of levelTags) {
                        // addLevel();
                        // Apply level name
                        const level = this.getSelectorValuesMapForTag(mappings, xml, 'Level', levelTag);
                        console.log(level);
                    }
                }
            }
    }

    getSelectorValuesMapForTagName(mappings, xml, tagName) {
        return mappings.filter(m => m.xml.tag.toLowerCase() === tagName.toLowerCase())
            .map(m => ({
                selector: m.html.selector,
                val: this.getXmlAttr(xml, m.xml.tag, m.xml.attr)
            }));
    }

    getSelectorValuesMapForTag(mappings, xml, tagName, tag) {
        return mappings.filter(m => m.xml.tag.toLowerCase() === tagName.toLowerCase())
            .map(m => ({
                selector: m.html.selector,
                val: tag.getAttribute(m.xml.attr)
            }));
    }

    getXmlAttr(xml, tagName, attrName) {
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
    
export default BngCampaignXmlParser;
