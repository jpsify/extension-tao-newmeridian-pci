define( [
    'tpl!nmcTextHightLightInteraction/creator/lib/br',
    'jquery',
], function (
    brTpl,
    $
) {

    var methods = {};

    methods.replaceBr = function replaceBr( string ) {
        const rx = /<[ \t\r\n]*[Bb][Rr][ \t\r\n]*\/?[ \t\r\n]*>/g;
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
    methods.fixTable = function fixTable( container ) {
        if(!container){
            return;
        }
        var dom = $( container )[ 0 ];
        var rows = dom.querySelectorAll( 'tr' );
        rows.forEach( row => {
            var children = Array.prototype.slice.call(row.childNodes);
            var firstVal = row.firstElementChild.getAttribute('rowspan');
            var areSame;
            if ( !firstVal ) {
                return;
            }
            areSame = children.every( function ( td ) {
                var attr = td.getAttribute('rowspan');
                if ( !attr ) {
                    return false;
                }
                return attr === firstVal;
            } );
            if ( !areSame ) {
                return;
            }
            fixTr( row );
        } );
        var colgroups = dom.querySelectorAll('colgroup');
        colgroups.forEach(function(elem){
            elem.remove();
        })
        return removeSelection(dom.innerHTML);
    }
    function fixTr( trElem ) {
        trElem.childNodes.forEach( function ( td ) {
            td.removeAttribute( 'rowspan' );
        } );
    }
    function removeSelection(string){
        const rx = /class="cke_table-faked-selection"/g;
        return string.replace( rx, '' );
    }

    return methods;
} );