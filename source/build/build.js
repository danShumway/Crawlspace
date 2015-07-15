'use strict';
var fs = require('fs'),
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
                files = fs.readdirSync(build_less.directory),
                output = '',
                i;

            for(i=0; i<files.length; i++) {
                output += fs.readFileSync(build_less.directory + files[i]);
            }

            less.render(output, {
                compress : true
            }, write);

            //Making callbacks look nicer.
            function write(err, output) {
                fs.writeFileSync(build_less.output, output.css);
            }
        }
    },

    build_handlebars = {
        templates : 'source/templates/',
        data : 'source/site/',
        output : 'out/',
        base : 'index.hbs',
        sections : {
            comic : {
                template : 'comic.hbs',
                data : 'comic.json'
            },
            // about : {
            //     template : 'about.hbs',
            //     data : 'about.json'
            // }
        },

        //TODO: Clean directories before writing files to them.
        run : function() {
            var that=build_handlebars,
                base=Handlebars.compile( fs.readFileSync(that.templates + that.base, 'utf8') );

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
        }
    }



//-----------RUN-------------------
console.log('Compiling less')
build_less.run();
console.log('Compiling handlebars');
build_handlebars.run();
console.log('Have a wonderful day');
