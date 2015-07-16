# [Crawlspace](http://danshumway.github.io/Crawlspace)
Katheryn discovers that not everything in her new apartment is what it seems to be.

#About
Crawlspace is a very light-horror webcomic I'm creating for personal enjoyment and personal development as an artist and a writer. It's being distributed under the moniker of Latinforimagination, a pseudo-entity that I use to distribute and market nearly all of my game-related and media projects.

Crawlspace is intended for a general audience, but contains some mature situations and language that isn't suitable for younger children.  If you're bothered by language, I'm including an optional filter that tones down the majority of language and shows alternate dialog whenever a character would outright swear.

#Legal
Images, artwork, audio, and other media files found on this repository (unless otherwise noted) are licensed under the [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](http://creativecommons.org/licenses/by-nc-nd/4.0/).  Names, locations, and narrative concepts are owned exclusively by their author. You should not attempt to rename or remix this comic without my permission; you should not distribute it without proper attribution.

Code on this repository (unless otherwise noted) has been licensed under the [MIT License](http://opensource.org/licenses/MIT), with specific relation to the hosting platform for Crawlspace.

#Building

Crawlspace is updated via a series of templates and JSON files that are compiled into a static website before distribution.  This makes it easy for me to add new pages and build fun little features like the swearing filter that work universally across the site.

If you're interested in copying my site's structure for your own use, you'll likely want to try building it.  You can do so by running ``npm install`` and then ``npm run build`` in the root of the repository.  I use a custom nodejs script (as opposed to something like Grunt) to convert the templates you'll find in the source to a finished site under the 'out' directory.

I use [Travis](https://travis-ci.org/) to automatically build and publish the site to the gh-pages branch whenever I make a commit, adapted from a rather fantastic [tutorial by Domenic Denicola](https://gist.github.com/domenic/ec8b0fc8ab45f39403dd).
