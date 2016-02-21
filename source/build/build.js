"use strict";
//TODO: remove rimraf and mkdir now that you"re using fs-extra.
var fs = require("fs-extra"),
    mkdir = require("mkdirp"),
    rimraf = require("rimraf"),
    less = require("less"),
    Handlebars = require("handlebars"),
    UglifyJS = require("uglify-js"),
    imageMagick = require("imagemagick"),
    Imagemin = require("imagemin");


/**
 * Allows creation of JQuery style Deferred objects, adapting just the better parts of native JS promises.
 * @method Deferred
 */
function Deferred() {
    var controller = {};

    var promise = new Promise(function(resolve, reject) {
        let fired = false;
        controller.resolve = function(data) {
            if (!fired) {
                fired = true;
                resolve(data);
            }

            return controller;
        };

        controller.reject = function(data) {
            if (!fired) {
                fired = true;
                reject(data);
            }

            return controller;
        };

        controller.promise = function() {
            return promise;
        };
    });

    return controller;
}

//------------COMPILATION----------------
// Assume a flat structure for both less and hbs. No imports, nothing fancy - this site isn"t very big.
var build_less = {
        directory: "source/less/",
        output: "out/css/main.css",
        run: function() {
            var that=this,
                files = fs.readdirSync(that.directory),
                output = "",
                i;

            mkdir.sync("out/css"); //Clean
            for(i=0; i<files.length; i++) {
                output += fs.readFileSync(that.directory + files[i]);
            }

            less.render(output, {
                compress: true
            }, write);

            //Making callbacks look nicer.
            function write(err, output) {
                fs.writeFileSync(that.output, output.css);
            }
        }
    },

    build_handlebars = {
        templates: "source/templates/", //Location of all templates
        data: "source/site/", //Location of page-description JSON
        output: "out/", //Directory to write to
        base: "base.hbs", //Page wrapper for every page on the site
        index: "comic", //Which section should get the honor of being the homepage
        sections: {
            comic: {
                template: "comic.hbs",
                data: "comic.json",
            },
             about: {
                template: "about.hbs",
                data: "about.json",
            },
            //Enable once everything else is set up
            /*privacy: {
                template: "privacy.hbs",
                data: "privacy.json",
            },*/
        },

        //TODO: Clean directories before writing files to them.
        run: function() {
            var that=build_handlebars,
                base=Handlebars.compile( fs.readFileSync(that.templates + that.base, "utf8") );

            //Loop through each section.
            //Going a little "let" crazy here.  Not sure how I feel about it.
            for (let sectionName in that.sections) {
                //read data and template, re-use existing props for convenience.
                let section = that.sections[sectionName],
                    data = JSON.parse( fs.readFileSync(that.data + section.data) );

                rimraf.sync(that.output + sectionName); //Clean it.
                mkdir.sync(that.output + sectionName); //Make directory if it doesn"t exist.
                Handlebars.registerPartial("page", fs.readFileSync(that.templates + section.template, "utf8") );
                //For each page in the section.
                for (let i=0; i<data.pages.length; i++) {
                    let page = data.pages[i],
                        output;

                    //Append any other relevant data.
                    page.previous = (i > 0) ? "/" + sectionName + "/" + data.pages[i-1].url: null; //No previous URL if you"re on the first page
                    page.next = (i < data.pages.length - 1) ? "/" + sectionName + "/" + data.pages[i+1].url: null; //NO next url if you"re on the last page
                    page.current = "/" + sectionName + "/" + data.pages[i].url;
                    page.first = "/" + sectionName + "/" + data.pages[0].url;
                    page.last = "/" + sectionName + "/" + data.pages[ data.pages.length - 1 ].url;

                    //Compile.
                    output = base({ data:page });

                    /*
                    * Each page lives in its own directory and uses an index.html file to make filepaths look nice
                    * This is basically a clone of xkcd"s method, but if it ain"t broke, don"t fix it.
                    * The only real difference is the idea of having sections, so instead of crawlspace/2-2/, we have crawlspace/comic/2-2/
                    * Naturally, this only happens if there are multiple pages in the section (so about and privacy aren"t all weirdly pathed)
                    *
                    * If I ever add an archive or page selection feature, it should probably be the index of the section. See below...
                    */
                    if (data.pages.length > 1) {
                        mkdir.sync(that.output + sectionName + "/" + page.url);
                        fs.writeFileSync(that.output + sectionName + "/" + page.url + "/index.html", output);
                    } else {
                        fs.writeFileSync(that.output + sectionName + "/index.html", output);
                    }
                    /*
                    * Create index clone of final file (if there are multiple files)
                    * It"s not the prettiest, but it allows linking to generic sections (ie crawlspace/comic)
                    * Probably unnecessary because the homepage already points here?
                    */
                    // if (i === data.pages.length-1 && data.pages.length > 1) {
                    //     fs.writeFileSync(that.output + sectionName + "/index.html", output);
                    // }

                    //If this section has the honor of being the landing page, duplicate it"s most recent page into crawlspace/index.html
                    if (i === data.pages.length-1 && that.index === sectionName) {
                        console.log("building index");
                        fs.writeFileSync(that.output + "index.html", output);
                    }
                }
            }
        }
    },
    build_javascript = {
        input: "source/javascript/",
        output: "out/js/",

        run: function() {
            var that=build_javascript,
                files = fs.readdirSync(that.input),
                output = null;

            rimraf.sync(that.output); //Clean destination.
            mkdir.sync(that.output); //Make directory if it doesn"t exist.
            for(let i=0; i<files.length; i++) {
                output = UglifyJS.minify(that.input + files[i]); //Uglify each file (separately)
                fs.writeFileSync(that.output + files[i], output.code); //Write to new location.
            }
        }
    },
    build_images = {
        input: "source/images/",
        output: "out/img/",
        sections: {
            comic: {
                data: "comics/",
                width: 680,
            },
             about: {
                data: "about/",
                width: 150,
            },
            navigation: {
                data: "navigation/",
                width: 100,
            },
        },

        eachImage: function (modifier) {
            var that=build_images;

            for (let sectionName in that.sections) {
                let files = fs.readdirSync(that.input + that.sections[sectionName].data);
                ////Make directory if it doesn"t exist - TODO: consider moving this to a different method?
                mkdir.sync(that.output + that.sections[sectionName].data);
                for (let i=0; i<files.length; i++) {
                    modifier(that.sections[sectionName], files[i]);
                }
            }
        },

        resizeImages: function () {
            var that=build_images,
                imagesLeft = 0,
                def = Deferred();

            that.eachImage(function (section, file) {
                imagesLeft++;
                imageMagick.resize({
                    srcPath: that.input + section.data + file,
                    dstPath: that.output + section.data + file,
                    width: section.width,
                }, function (err) {
                    imagesLeft--;
                    if (imagesLeft <= 0) {
                        console.log("...images resized");
                        def.resolve();
                    }
                });
            });

            return def.promise();
        },

        optimizeImages: function () {
            var that=build_images,
                def = Deferred();

            new Imagemin()
                .src(that.output + "*/*.{jpg,png}")
                .dest(that.output)
                .use(Imagemin.jpegtran({
                    progressive: true,
                }))
                .use(Imagemin.optipng({
                    optimizationLevel: 3,
                }))
                .run(function () {
                    console.log("...images optimized");
                    def.resolve();
                });

            return def.promise();
        },

        run: function() {
            var that=build_images;

            rimraf.sync(that.output); //Clean output
            return that.resizeImages()
                .then(that.optimizeImages);
        }
    },
    build_misc = {
        sources: [
            {
                input: "source/misc/CNAME",
                output: "out/CNAME",
            }
        ],
        run: function() {
            let that=build_misc,
                def = Deferred(),
                files = that.sources.length;

            that.sources.forEach(function(file) {
                fs.copy(file.input, file.output, function (err) {
                    if(err) { console.log(err); }
                    if (--files <= 0) { def.resolve(); }
                }); //Write to new location.

            })

            return def.promise();
        }
    };


//-----------RUN-------------------
console.log("Compiling less");
build_less.run();
console.log("Compiling handlebars");
build_handlebars.run();
console.log("Compiling javascript");
build_javascript.run();
console.log("Compiling images");
build_images.run()
    .then(function () {
        console.log("Copying server info");
        return build_misc.run();
    })
    .then(function () {
        console.log("Have a wonderful day");
    });
