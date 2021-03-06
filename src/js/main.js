import BngCampaignXmlParser from './classes/bng-campaign-xml-parser';
import CampaignList from './classes/campaign-list';
import StringUtil from './classes/string-util';
import XmlTokenAdapter from './classes/xml-token-adapter';

(function () {
	const mappingsUrl = 'https://gist.githubusercontent.com/vitawebsitedesign/8609996e29eec136b7658dd37f8448c2/raw/xml-html-mapping-metadata.json';
	init();

	function init() {
		bindStaticElementHandlers();
		showCampaigns();
		bindTooltips();
	}

	function showCampaigns() {
		const campaigns = CampaignList.get();
		$('.loading-campaign-templates-from-cloud').remove();

		campaigns.forEach((c, campaignNum) => {
			if (!c.url || c.url.length === 0) {
				console.warn(`Campaign ${campaignNum} doesnt have a url. Fix the json. This cmapaign will not show on the "open campaign" menu.`);
				return;
			}

			const clone = $('#templates .btn-open-campaign').clone();
			const host = getHostFromUrl(c.url);
			const fadeIn = `fadeIn ${campaignNum * 0.25}s ease-out forwards`;
			clone.text(c.name).attr('data-url', c.url);
			clone.attr('title', `Template will be loaded from ${host}`);
			clone.css('animation', fadeIn);
			clone.appendTo('.open-campaign-container');
		});

		$('.open-campaign-container .btn-open-campaign').on('click', loadCampaign);
	}

	function loadCampaign() {
		const dataUrl = $(this).attr('data-url');
		$('.btn-open-campaign').attr('disabled', 'disabled').removeClass('btn-primary').addClass('btn-secondary');
		$(this).text('fetching...');
		$.get(dataUrl)
			.done(async xml => await loadCampaignFromXmlAsync(xml))
			.fail(console.error);
	}

	function loadCampaignFromXmlAsync(xml) {
		return new Promise(resolve => {
			resolve(loadCampaignFromXml(xml));
		});
	}

	function loadCampaignFromXml(xml) {
		$('#campaign-xml').val(xml);
		removeAllTooltips();
		loadScreenTransitionPromise().then(switchToEditorMode, console.error);
	}

	function loadScreenTransitionPromise() {
		return new Promise(function (resolve, reject) {
			const loadScreen = $('.popup-load');
			if (!loadScreen) {
				reject('Couldnt find load screen element');
			}

			$('.xml-container').css('animation', 'resetoffset 2s ease-out forwards');
			loadScreen.on('transitionend', event => {
				if (event.originalEvent.propertyName === 'opacity') {
					loadScreen.remove();
					resolve();
				}
			});

			loadScreen.css('opacity', 0);
		});
	}

	function switchToEditorMode() {
		setCampaignXmlHeight();
		showHelperButtons();
		addHtmlFieldsForXmlPromise().then(addHtmlFieldsForXmlHook);
	}

	function showHelperButtons() {
		$('.header-nav').css('animation', 'slideup 2s ease-out forwards');
	}

	function share() {
		const xml = $('#campaign-xml').val();
		const shareUrl = XmlTokenAdapter.getShareUrl(xml);
		$('.share-token').val(shareUrl);
	}

	function addHtmlFieldsForXmlPromise() {
		return new Promise((resolve, reject) => {
			const xmlStr = $('#campaign-xml').val();
			const xml = BngCampaignXmlParser.convertBngCampaignXmlToXmlDoc(xmlStr);

			$.get(mappingsUrl).done(mappingsStr => {
				const mappings = JSON.parse(mappingsStr);
				BngCampaignXmlParser.setHtmlFieldsForXml(addGroup, addEvent, addTrack, mappings, xml);
				resolve();
			}).fail(reject);
		});
	}

	function addHtmlFieldsForXmlHook() {
		updateAutoGeneratedHtmlFields();
		rebindControlHandlers();
		$('.campaign-container .btn-toggle-all-options').click();
	}

	function addGroup(collapseOthers, shouldGenerateXml = true, shouldRebindControlHandlers = true) {
		const group = $('#templates .group').first().clone();
		const groupNum = $('.campaign-container .group').length;
		const groupNumEle = group.find('.group-num');
		const groupLetter = String.fromCharCode(97 + groupNum).toUpperCase();

		if (!groupNumEle.length) {
			console.warn('Tried to show event number for a non-existent event (is the group number selector correct?)');
		}

		groupNumEle.text(groupLetter);
		$('.campaign-container .groups').append(group);
		htmlChangedHook(shouldGenerateXml, shouldRebindControlHandlers);
	}

	function addTrack(tbody, shouldGenerateXml = true, shouldRemoveDeleteButton = false, shouldRebindControlHandlers = true) {
		if (!tbody) {
			console.warn('Tried to add track to a non-existent table body (is the tbody selector correct?)');
			return;
		}

		const clone = $('#templates .new-track-template-container .track-row').first().clone();
		if (shouldRemoveDeleteButton === true) {
			clone.find('.btn-rm-track').remove();
		}

		clone.appendTo(tbody);
		htmlChangedHook(shouldGenerateXml, shouldRebindControlHandlers);
	}

	function addEvent(btnEle, groupEle, shouldGenerateXml = true, shouldRebindControlHandlers = true) {
		const clone = $('#templates .event').first().clone();
		const newEventNum = $(this).closest('.group').find('.event').length + 1;
		const newEventName = `Event ${newEventNum}`;
		clone.find('.event-name').val(newEventName);

		if (btnEle) {
			groupEle = $(this).closest('.group');
		}

		if (!groupEle.length) {
			console.warn('Tried to add event to non-existent group (is the event group selector correct?)');
			return;
		}

		groupEle.find('.events').append(clone);
		const tbody = groupEle.find('.tracks tbody').last();
		addTrack(tbody, false, true, shouldRebindControlHandlers);
		htmlChangedHook(shouldGenerateXml, shouldRebindControlHandlers);
	}

	function htmlChangedHook(shouldGenerateXml, shouldRebindControlHandlers) {
		if (shouldRebindControlHandlers === true) {
			rebindControlHandlers();
		}
		if (shouldGenerateXml) {
			generateXml();
		}
	}

	function removeEventGroup() {
		removeConfirm('event group', $(this).closest('.group'));
	}

	function removeEvent() {
		removeConfirm('event', $(this).closest('.event'));
	}

	function removeTrack() {
		remove($(this).closest('.track-row'));
	}

	function removeConfirm(type, ele) {
		if (confirm(`Delete ${type}?`) === true) {
			remove(ele);
		}
	}

	function remove(ele) {
		ele.remove();
		removeAllTooltips();
		generateXml();
	}

	function updateAutoGeneratedHtmlFields() {
		const campaignName = $('#campaign-name').val();
		const campaignNameSlugified = StringUtil.slugify(campaignName);
		setCampaignFilename(campaignNameSlugified);
		setFallbackTextureFilename(campaignNameSlugified);
		updateEventTitles();
	}

	function getHostFromUrl(url) {
		var parser = document.createElement('a');
		parser.href = url;
		return parser.hostname;
	}

	function bindStaticElementHandlers() {
		$('.btn-share').on('click', share);
		$('.btn-randomize-website-colour').on('click', () => StringUtil.randomizeWebsiteColour());
		$('#campaign-xml, .video, .fallback-texture, .share-token').on('click', selectAll);

		$('.load-raw-xml').on('paste', async function (e) {

			const xml = e.originalEvent.clipboardData.getData('text');
			if (BngCampaignXmlParser.validXml(xml)) {
				await loadCampaignFromXmlAsync(xml);
				showXmlCleanupToast();
			} else {
				alert('this is invalid xml - check it carefully for syntax errors and please come again');
			}
		});
	}

	function showXmlCleanupToast() {
		$('.bng-toasts').css('display', 'block');
	}

	function hideXmlCleanupToast() {
		const toastContainer = $('.bng-toasts');
		if (!toastContainer.length) {
			console.warn('Failed to find toast container (is the selector correct?)');
		}

		var shown = toastContainer.css('animation-name') !== 'collapseUp';
		if (shown) {
			toastContainer.css('animation', 'collapseUp 2s ease-out forwards');
		}
	}

	function toggleOpts() {
		$(this).closest('article').find('.toggleable-item').slideToggle('slow');
	}

	function toggleAllOpts() {
		const stateAttr = 'data-state';
		const stateStr = $(this).attr(stateAttr);
		const state = parseFloat(stateStr);
		const newState = 1 - state;
		$(this).attr(stateAttr, newState);

		const items = $(this).closest('article').find('.toggleable-item');
		const speed = 'slow';

		if (state) {
			items.slideUp(speed);
		} else {
			items.slideDown(speed);
		}
	}

	function rebindControlHandlers() {
		const campaignOptsContainer = '.campaign-container';

		$(`${campaignOptsContainer} select`).off('change').on('change', generateXml);
		$(`${campaignOptsContainer} input`).off('keyup change').on('keyup change', generateXml);

		$(`${campaignOptsContainer} .game-mode`).off('change').on('change', setDefaultAwardValsBeforeGeneratingXml);

		$(`${campaignOptsContainer} .btn-toggle-options`).off('click').on('click', toggleOpts);
		$(`${campaignOptsContainer} .btn-toggle-all-options`).off('click').on('click', toggleAllOpts);
		$(`${campaignOptsContainer} .btn-hide-options`).off('click').on('click', toggleAllOpts);
		$(`${campaignOptsContainer} .btn-add-event, .btn-add-group`).off('click').on('click', generateXml);
		$(`${campaignOptsContainer} .btn-add-event`).off('click').on('click', addEvent);
		$(`${campaignOptsContainer} .btn-add-group`).off('click').on('click', addGroup);
		$(`${campaignOptsContainer} .btn-rm-event-group`).off('click').on('click', removeEventGroup);
		$(`${campaignOptsContainer} .btn-rm-event`).off('click').on('click', removeEvent);
		$(`${campaignOptsContainer} .btn-rm-track`).off('click').on('click', removeTrack);

		$(`${campaignOptsContainer} .track`).off('focusin').on('focusin', recordLastTrackValue);
		$(`${campaignOptsContainer} .track`).off('change').on('change', function (event) {
			if ($(this).val().trim().length) {
				const tbody = $(this).closest('.event').find('.tracks tbody');
				addTrack(tbody, true, false, true);
			}
		});

		removeAllTooltips();
		bindTooltips();
	}

	function recordLastTrackValue() {
		$(this).data('last-track-value', $(this).val());
	}

	function bindTooltips() {
		$('[data-toggle="tooltip"]').tooltip();
	}

	function setCampaignFilename(slugifiedCampaignName) {
		const path = StringUtil.getCustomCampaignFilePath(slugifiedCampaignName);
		$('#campaign-xml-filename').val(path);
	}

	function setFallbackTextureFilename(slugifiedCampaignName) {
		const filename = `${slugifiedCampaignName}.jpg`;
		$('.fallback-texture').val(filename);
	}

	function updateEventTitles() {
		$('.campaign-container .event-name').each(function (i) {
			const title = $(this).val();
			$(this).closest('.event').find('.event-name-title').text(title);
		});
	}

	function generateXml() {
		hideXmlCleanupToast();
		updateAutoGeneratedHtmlFields();
		$('#campaign-xml').val(getXmlForCampaign());
	}

	function setDefaultAwardValsBeforeGeneratingXml() {
		const awardSelectors = [
			'.bronze-value',
			'.silver-value',
			'.gold-value',
			'.platinum-value',
			'.easy-score',
			'.hard-score'
		];

		$.get(mappingsUrl).done(mappingsStr => {
			const mappings = JSON.parse(mappingsStr);
			const awardMaps = mappings.filter(m => awardSelectors.indexOf(m.html.selector.toLowerCase()) !== -1);
			const gamemodeLower = $(this).val().toLowerCase();

			awardSelectors.forEach(awardSelector => {
				const awardMapping = awardMaps.filter(m => m.html.selector.toLowerCase() === awardSelector)[0];
				const awardThreshold = awardMapping.html.val[gamemodeLower];
				$(this).closest('.event').find(awardSelector).val(awardThreshold);
			});

			generateXml();
		});
	}

	function getXmlForEvents(groupEle) {
		var eventCollection = $(groupEle).find('.event');
		var events = [...eventCollection];
		const eventsXmlArray = events.map(getXmlForEvent);
		return arrayToStringWithoutCommas(eventsXmlArray);
	}

	function getXmlForCampaign() {
		const name = $('#campaign-name').val();
		const groups = getXmlForGroups();
		const barracudaAllowed = $('.barracuda-allowed').val();
		const video = $('.video').val();
		const fallbackTexture = $('.fallback-texture').val();
		return `<Settings Name="${name}" BarracudaAllowed="${barracudaAllowed}" Video="${video}" FallbackTexture="${fallbackTexture}" />
	${groups}
		`;
	}

	function getXmlForGroups() {
		const groups = [...$('.campaign-container .group')];
		const xmlForGroupsArray = groups.map(groupEle => {
			const pointsToUnlock = $(groupEle).find('.points-to-unlock').val();
			const xmlForEvents = getXmlForEvents(groupEle);
			return `
<Group PointsToUnlock="${pointsToUnlock}">
${xmlForEvents}
</Group>
			`;
		});

		return arrayToStringWithoutCommas(xmlForGroupsArray);
	}

	function arrayToStringWithoutCommas(arr) {
		return arr.toString().replace(/,/g, '');
	}

	function getXmlForEvent(eventEle) {
		const name = $(eventEle).find('.event-name').val();
		const gamemode = $(eventEle).find('.game-mode').val();
		const xmlLevels = getLevelXmlForEvent(eventEle);
		const xmlEventModifiers = getEventModifiersXml(eventEle);
		const speedClass = $(eventEle).find('.speed-class').val();
		const modernPhysics = $(eventEle).find('.modern-physics').val();
		const bronzeValue = $(eventEle).find('.bronze-value').val();
		const silverValue = $(eventEle).find('.silver-value').val();
		const goldValue = $(eventEle).find('.gold-value').val();
		const platinumValue = $(eventEle).find('.platinum-value').val();
		const easyScore = $(eventEle).find('.easy-score').val();
		const hardScore = $(eventEle).find('.hard-score').val();

		return `
	<Event>
		<Frontend Name="${name}" />
		<Awards BronzeValue="${bronzeValue}" SilverValue="${silverValue}" GoldValue="${goldValue}" PlatinumValue="${platinumValue}" EasyScore="${easyScore}" HardScore="${hardScore}" />
		<EventSettings>
			<Mode Gamemode="${gamemode}" ModernPhysics="${modernPhysics}" SpeedClass="${speedClass}">
				<Levels>
					${xmlLevels}
				</Levels>
			</Mode>
			${xmlEventModifiers}
		</EventSettings>
	</Event>
		`;
	}

	function getLevelXmlForEvent(eventEle) {
		const trackCollection = $(eventEle).find('.track').filter((trackIndex, trackEle) => $(trackEle).val().trim() !== '');
		const trackEles = [...trackCollection];
		return trackEles.map(getXmlForLevel).reduce((acc, cur) => acc + cur, '');
	}

	function getEventModifiersXml(eventEle) {
		const forcePlayerShip = $(eventEle).find('.force-player-ship').val();
		const forceAiShip = $(eventEle).find('.force-ai-ship').val();
		const forcedShip = $(eventEle).find('.player-ship').first().val();
		const weapons = $(eventEle).find('.weapons').first().val();
		const numAi = $(eventEle).find('.number-of-ai').val();
		const hardcore = $(eventEle).find('.hardcore').val();
		const mirror = $(eventEle).find('.mirror').val();
		const extraLaps = $(eventEle).find('.extra-laps').val();
		const difficulty = $(eventEle).find('.difficulty').val();
		const useSpeedMult = $(eventEle).find('.use-speed-mult').val();
		const speedMult = $(eventEle).find('.speed-mult').val();

		return `<Modifiers Weapons="${weapons}" ForcePlayerShip="${forcePlayerShip}" ForceAiShip="${forceAiShip}" ForcedShip="${forcedShip}" Hardcore="${hardcore}" Mirror="${mirror}" ExtraLaps="${extraLaps}" />
		<Ai Difficulty="${difficulty}" Count="${numAi}" UseSpeedMult="${useSpeedMult}" SpeedMult="${speedMult}" />`;
	}

	function getXmlForLevel(trackEle) {
		return `<Level Name="${trackEle.value}" />`;
	}

	function selectAll() {
		$(this).select();
	}

	function setCampaignXmlHeight() {
		const paddingBottom = parseFloat($('body').css('padding-bottom'));
		const height = $('iframe').height() - $('header').height() - paddingBottom;
		const heightPx = `${height}px`;
		$('#campaign-xml').css('height', heightPx);
	}

	function removeAllTooltips() {
		$('.tooltip').remove();
	}
})();