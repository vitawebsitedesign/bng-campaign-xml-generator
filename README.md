## About
This is a real-time XML generator for BallisticNG custom campaigns, and is [hosted on CodePen](https://codepen.io/thinkfast2008/full/vvKKwq)

## Usage overview
Instead of writing raw XML text to generate BNG campaigns, users can now interact with a non-technical user interface to generate xml.

Then users can save their xml to their computer & play the campaign in-game.

The basic use cases this app supports are:
* Load campaign JSON templates from remote repositories
* Parse user-defined JSON (& detect invalid XML)
* Build campaigns (event groups, events, races etc)
* Customize all event group, events & race XML attributes via a GUI
* Provide pre-generated campaign preview videos

Please note that in order to support CodePen hosting, Webpack is used to bundle html, javascript & css into their own files.

## Contributing
PR's are welcome. You can start by referring to [the documentation](https://ballisticng.gamepedia.com/Custom_Campaign_XML#troubleshooting), to begin understanding the json structures that this app needs to work with.

Please ensure the selenium test suite passes before opening a PR.
