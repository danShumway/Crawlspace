'use strict';
//TODO: remove rimraf and mkdir now that you're using fs-extra.
var fs = require('fs-extra'),
    mkdir = require('mkdirp'),
    rimraf = require('rimraf'),
    less = require('less'),
    Handlebars = require('handlebars');

//------------COMPILATION----------------
// Assume a flat structure for both less and hbs. No imports, nothing fancy - this site isn't very big.
var build_less = {
        directory : 'source/less/',
        output : 'out/css/main.css',
        run : function() {
            var that=this,
                files = fs.readdirSync(that.directory),
                output = '',
                i;

            mkdir.sync('out/css'); //Clean
            for(i=0; i<files.length; i++) {
                output += fs.readFileSync(that.directory + files[i]);
            }

            less.render(output, {
                compress : true
            }, write);

            //Making callbacks look nicer.
            function write(err, output) {
                fs.writeFileSync(that.output, output.css);
            }
        }
    },

    build_handlebars = {
        templates : 'source/templates/',
        data : 'source/site/',
        output : 'out/',
        base : 'base.hbs',
        index : 'index.hbs',
        sections : {
            comic : {
                template : 'comic.hbs',
                data : 'comic.json'
            },
             about : {
                template : 'about.hbs',
                data : 'about.json'
            }
        },

        //TODO: Clean directories before writing files to them.
        run : function() {
            var that=build_handlebars,
                base=Handlebars.compile( fs.readFileSync(that.templates + that.base, 'utf8') ),
                index=Handlebars.compile( fs.readFileSync(that.templates + that.index, 'utf8') )();

            //Loop through each section.
            //Going a little 'let' crazy here.  Not sure how I feel about it.
            for (let sectionName in that.sections) {
                //read data and template, re-use existing props for convenience.
                let section = that.sections[sectionName],
                    data = JSON.parse( fs.readFileSync(that.data + section.data) );

                rimraf.sync(that.output + sectionName); //Clean it.
                mkdir.sync(that.output + sectionName); //Make directory if it doesn't exist.
                Handlebars.registerPartial('page', fs.readFileSync(that.templates + section.template, 'utf8') );
                //For each page in the section.
                for (let i=0; i<data.pages.length; i++) {
                    let page = data.pages[i],
                        output;

                        //Append any other relevant data.
                        page.previous = (i > 0) ? '../' + sectionName + '/' + data.pages[i-1].url + '.html': null;
                        page.next = (i < data.pages.length - 1) ? '../' + sectionName + '/' + data.pages[i+1].url + '.html'  : null;
                        page.first = '../' + sectionName + '/' + data.pages[0].url + '.html';
                        page.last = '../' + sectionName + '/' + data.pages[ data.pages.length - 1 ].url + '.html';

                        //Compile.
                        output = base({ data:page });

                    //Attach and output.
                    fs.writeFileSync(that.output + sectionName + '/' + page.url + '.html', output);

                    //Create index clone of final file. Yeah, it's not the prettiest.
                    if (i === data.pages.length-1) {
                        fs.writeFileSync(that.output + sectionName + '/index.html', output);
                    }
                }
            }

            //Create index.js (hardcoded just points to the most recent page)
            fs.writeFileSync(that.output + 'index.html', index);
        }
    },
    //ATM just copies javascript over to the other directory.
    //There are libraries set up to minify, but that's not a high priority right now.
    build_javascript = {
        input : 'source/javascript/',
        output : 'out/js/',

        run : function() {
            var that=build_javascript;

            rimraf.sync(that.output); //Clean it.
            mkdir.sync(that.output); //Make directory if it doesn't exist.
            fs.copySync(that.input, that.output); //Copy everything over.
        }
    },
    //Same deal as above, just copying images over, will resize and compress them later.
    build_images = {
        input : 'source/images/',
        output : 'out/img/',

        run : function() {
            var that=build_images;

            rimraf.sync(that.output); //Clean it.
            mkdir.sync(that.output); //Make directory if it doesn't exist.
            fs.copySync(that.input, that.output); //Copy everything over.
        }
    };


//-----------RUN-------------------
console.log('Compiling less')
build_less.run();
console.log('Compiling handlebars');
build_handlebars.run();
console.log('Compiling javascript');
build_javascript.run();
console.log('Compiling images');
build_images.run();
console.log('Have a wonderful day');
