define( [
    'tpl!nmcPci/pciCreator/helper/ckEditor/br',
    'jquery',
], function (
    brTpl,
    $
) {

    var methods = {};

    methods.replaceBr = function replaceBr( string ) {
        const rx = /<[ \t\r\n]*[Bb][Rr][ \t\r\n]*\/[ \t\r\n]*>/g;
        return string.replace( rx, brTpl() );
    };

    methods.replaceBrElem = function replaceBrElem( $container ) {
        $container.find( 'br' ).replaceWith( brTpl() );
    };

    methods.saveStyles = function saveStyles( container ) {
        //save table styles added by tabletoolstoolbar plugin in data attribute 
        var styledElems = container.querySelectorAll( '[style]' );
        styledElems.forEach( function ( elem ) {
            elem.dataset.style = elem.getAttribute( 'style' );
        } );
    };

    methods.applyStyles = function applyStyles(container) {
        //restore table styles added by tabletoolstoolbar plugin for ckEditor 
        var styledElems = container.querySelectorAll( '[data-style]' );
        styledElems.forEach( function ( elem ) {
            if ( elem.getAttribute( 'style' ) ) {
                return;
            }
            elem.setAttribute( 'style', elem.dataset.style );
        } );
    };

    return methods;
} );