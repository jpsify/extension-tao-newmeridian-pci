module.exports = function (grunt) {
    'use strict';

    var sass    = grunt.config('sass') || {};
    var watch   = grunt.config('watch') || {};
    var notify  = grunt.config('notify') || {};
    var root    = grunt.option('root') + '/nmcPci/views/';

    sass.nmcpci = {
        options : {},
        files : {}
    };
    sass.nmcpci.files[
       root + 'js/pciCreator/ims/nmcEquationEditorInteraction/runtime/css/nmcEquationEditorInteraction.css'
    ] = root + 'js/pciCreator/ims/nmcEquationEditorInteraction/runtime/scss/nmcEquationEditorInteraction.scss';

    sass.nmcpci.files[
       root + 'js/pciCreator/ims/nmcGraphGapMatchInteraction/runtime/css/nmcGraphGapMatchInteraction.css'
    ] = root + 'js/pciCreator/ims/nmcGraphGapMatchInteraction/runtime/scss/nmcGraphGapMatchInteraction.scss';

    sass.nmcpci.files[
       root + 'js/pciCreator/ims/nmcGraphGapMatchInteraction/creator/css/authoring.css'
    ] = root + 'js/pciCreator/ims/nmcGraphGapMatchInteraction/creator/scss/authoring.scss';

    sass.nmcpci.files[
       root + 'js/pciCreator/ims/nmcGapMatchInteraction/creator/css/form.css'
    ] = root + 'js/pciCreator/ims/nmcGapMatchInteraction/creator/scss/form.scss';

    watch.nmcpcisass = {
        files : [
            root + 'scss/**/*.scss',
            root + 'js/pciCreator/ims/**/*.scss'
        ],
        tasks : ['sass:nmcpci', 'notify:nmcpcisass'],
        options : {
            debounceDelay : 1000
        }
    };

    notify.nmcpcisass = {
        options: {
            title: 'Grunt SASS',
            message: 'SASS files compiled to CSS'
        }
    };

    grunt.config('sass', sass);
    grunt.config('watch', watch);
    grunt.config('notify', notify);

    grunt.registerTask('nmcpcisass', ['sass:nmcpci']);
};