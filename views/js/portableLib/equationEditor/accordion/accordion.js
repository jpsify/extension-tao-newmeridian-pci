/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */

define([
    'jquery',
    'lodash',
], function($, _){
    "use strict";
    // selectors and classes

    var heading = 'h2',
        section = 'section',
        panel = 'hr, .panel',
        closed = 'closed',
        ns = 'accordion';

    var init = function($sidebar){

        var $sections = $sidebar.find(section),
            $allPanels = $sidebar.children(panel).hide(),
            $allTriggers = $sidebar.find(heading);

        if($allTriggers.length === 0){
            return true;
        }

        // setup events
        $allTriggers.each(function(){
            var $heading = $(this),
                $section = $heading.parents(section),
                $panel = $section.children(panel),
                $closer = $('<span>', {'class' : 'icon-up'}),
                $opener = $('<span>', {'class' : 'icon-down'}),
                action = $panel.is(':visible') ? 'open' : 'close';

            $heading.append($closer).append($opener).addClass(closed);

            // this allows multiple calls, required when blocks are added dynamically
            if($heading.hasClass('_accordion')) {
                return;
            }
            else {
                $heading.addClass('_accordion');
            }

            // toggle heading class arrow (actually switch arrow)
            $panel.on('panelclose.' + ns + ' panelopen.' + ns, function(e, args){
                var fn = e.type === 'panelclose' ? 'add' : 'remove';
                args.heading[fn + 'Class'](closed);
            });

            $panel.trigger('panel' + action + '.' + ns, {heading : $heading});

        });

        $sections.each(function(){

            // assign click action to headings
            $(this).find(heading).on('click', function(e, args){

                var $heading = $(this),
                    $panel = $heading.parents(section).children(panel),
                    preserveOthers = !!(args && args.preserveOthers),
                    actions = {
                        close : 'hide',
                        open : 'fadeIn'
                    },
                action,
                    forceState = (args && args.forceState ? args.forceState : false),
                    classFn;

                if(forceState){
                    classFn = forceState === 'open' ? 'addClass' : 'removeClass';
                    $heading[classFn](closed);
                }

                action = $heading.hasClass(closed) ? 'open' : 'close';

                // whether or not to close other sections in the same sidebar
                // @todo (optional): remove 'false' in the condition below
                // to change the style to accordion, i.e. to allow for only one open section
                if(false && !preserveOthers){
                    $allPanels.not($panel).each(function(){
                        var $panel = $(this),
                            $heading = $panel.parent().find(heading),
                            _action = 'close';

                        $panel.trigger('panel' + _action + '.' + ns, {heading : $heading})[actions[_action]]();
                    });
                }

                $panel.trigger('panel' + action + '.' + ns, {heading : $heading})[actions[action]]();
            });

        });
    };

    var _toggleSections = function(sections, preserveOthers, state){
        sections.each(function(){
            $(this).find(heading).trigger('click', {preserveOthers : preserveOthers, forceState : state});
        });
    };

    var closeSections = function(sections, preserveOthers){
        _toggleSections(sections, !!preserveOthers, 'close');
    };

    return {
        init : init,
        closeSections: closeSections
    };

});
