(function() {
    'use strict';

    var key = 'crawlspace-mode'; //for localstorage.
    window.comic = {
        mode : 'off', //default
        filters : ['off', 'on'], //total filters we can have.
        elements : {}, //autofilled at runtime

        //adds elements and variables.
        init : function() {
            var that=this, i;
            if(typeof(Storage) === "undefined") {
                return; //Sorry ie7.
            }

            for(i=0;i<that.filters.length;i++) {
                elements[that.filters[i]] = document.getElementById('comic-' + that.filters[i]);
            }

            document.getElementById('comic-base')
            that.loadLocalStorage();
        },
        //Refreshes images based on filters selected.
        updateComic : function() {
            var that=this, i;

            for(i=0;i<that.filters.length;i++) {
                if(that.filters[i] === that.mode) {
                    that.elements[that.filters[i]].style.display = 'block';
                } else {
                    that.elements[that.filters[i]].style.display = 'none';
                }
            }
        },
        //Reads from localStorage, and corrects any errors that might exist.
        loadLocalStorage : function() {
            var mode = localStorage.getItem(that.key);

            if (that.filters.indexOf(mode) === -1) {
                localStorage.setItem(that.key, that.mode);
            } else {
                that.mode = mode;
            }

            that.updateComic();
        },
        //saves to local
        saveLocalStorage : function(mode, toggle) {
            that.mode = mode;
            localStorage.setItem(that.key, mode);
            //toggle.class = //Swap buttons?
            that.updateComic();
        },
        //updates buttons on the page with their given classes.
        setPageState : function(classOn, classOff) {
            this.style.class = mode
        }
    };
}());
