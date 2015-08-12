//TODO: this website supports IE10 and above.
(function() {
    'use strict';

    var key = 'crawlspace-mode'; //for localstorage.
    window.comic = {
        mode : 'off', //default
        filters : ['off', 'on'], //total filters we can have.
        elements : {}, //autofilled at runtime
        base : null, //autofilled at runtime.
        buttonToggle : null, //autofilled at runtime

        //adds elements and variables.
        init : function() {
            var that=this, i;
            if(typeof(Storage) === "undefined") {
                return; //Sorry ie7.
            }

            for(i=0;i<that.filters.length;i++) {
                that.elements[that.filters[i]] = document.getElementById('comic-' + that.filters[i]);
            }

            that.base = document.getElementById('comic-base');


            that.buttonToggle = document.getElementById('toggle-switch')
            that.loadLocalStorage();
        },
        //Refreshes images based on filters selected.
        updateComic : function() {
            var that=this, i;

            that.base.style.display = 'block';
            for(i=0;i<that.filters.length;i++) {
                if(that.filters[i] === that.mode) {
                    that.elements[that.filters[i]].style.display = 'block';
                } else {
                    that.elements[that.filters[i]].style.display = 'none';
                }
            }
        },
        //Reads from localStorage, and corrects any errors that might exist.
        //TODO: should fail gracefully if no localStorage exists.
        loadLocalStorage : function() {
            var that=this,
                mode = localStorage.getItem(that.key);

            if(that.filters.indexOf(mode) === -1) {
                localStorage.setItem(that.key, that.mode);
            } else {
                that.mode = mode;
            }

            that.updateComic();
            that.setButtonState();
        },
        //saves to local - if mode is not specified, will simply loop through filters.
        saveLocalStorage : function(mode) {
            if(mode) {
                that.mode = mode;
            } else {
                var index = ( that.filters.indexOf(that.mode) + 1 ) % that.filters.length;
                that.mode = that.filters[index];
            }

            localStorage.setItem(key, that.mode);
            that.updateComic();
            that.setButtonState();
        },
        //updates buttons on the page with their given classes.
        setButtonState : function() {
            var that=this, i;

            for(i=0;i<that.filters.length;i++) {
                that.buttonToggle.classList.remove(that.filters[i]);
            }
            that.buttonToggle.classList.add(that.mode);
        }
    };
}());
