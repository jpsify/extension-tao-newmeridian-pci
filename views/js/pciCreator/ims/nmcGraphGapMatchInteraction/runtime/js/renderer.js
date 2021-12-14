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
 * Copyright (c) 2020 (original work) Open Assessment Technologies SA;
 */

define(
    [
        'taoQtiItem/portableLib/jquery_2_1_1',
        'taoQtiItem/portableLib/lodash',
        'taoQtiItem/portableLib/handlebars',
        'nmcGraphGapMatchInteraction/runtime/js/Graphic',
        'taoQtiItem/qtiCreator/helper/dummyElement',
        'css!nmcGraphGapMatchInteraction/runtime/css/nmcGraphGapMatchInteraction',
    ],
    function ($, _, Handlebars, graphic, dummyElement) {
        'use strict';

        /**
         * Replace all identified relative media urls by the absolute one.
         * For now only images are supported.
         *
         * @param {String} html - the html to parse
         * @param {Object} renderer
         * @returns {String} the html without updated URLs
         */
        var fixMarkupMediaSources = function fixMarkupMediaSources(html, renderer) {
            html = html || '';

            return html.replace(/(<img[^>]*src=["'])([^"']+)(["'])/ig, function (substr, $1, $2, $3) {
                var resolved = renderer.resolveUrl($2) || $2;
                return $1 + resolved + $3;
            });
        };

        return function (options) {
            var self = this,
                defaultOptions = {
                    state: 'sleep',
                    templates: {},
                    serial: '',
                    width: 300,
                    height: 300,
                };

            this.backgroundImage = undefined;
            this.options = {};
            this.$gapList = null;

            this.init = function () {
                var gapTpl;
                _.assign(self.options, defaultOptions, options);

                gapTpl = $('.gap-match-gaps-tpl').html().replace("<![CDATA[", "").replace("]]>", "");
                self.options.templates.gaps = Handlebars.compile(gapTpl);

            };

            this.onResize = function(width, factor) {
                if (self.$gapList) {
                    self.$gapList.css('max-width', width + 'px');
                    if (factor !== 1) {
                        self.$gapList.find('img').each(function() {
                            var $img = $(this);
                            $img.width($img.attr('width') * factor);
                            $img.height($img.attr('height') * factor);
                        });
                    }
                    self.options.$container.data('factor', factor);
                }
            };

            this.renderBackground = function (img, width, height, altText, renderer) {
                var fixedImg = fixMarkupMediaSources(img, renderer),
                    $img = $(fixedImg), bgImg, desc;
                if ($img.length) {
                    var src = $img[0].getAttribute('src'),
                        imgWidth = width || self.options.width,
                        imgHeight = height || self.options.height,
                        serial = self.options.interaction.serial,
                        $imgContainer = $('.image-container', self.options.$container);

                    var paper = graphic.responsivePaper($('.main-image-box', self.options.$container)[0], serial, {
                        width: imgWidth,
                        height: imgHeight,
                        img: src,
                        imgId: 'bg-image-' + serial,
                        container: $imgContainer,
                        resize: this.onResize,
                    });

                    //Remove Raphaël description
                    paper.desc.remove();

                    if (altText) {
                        bgImg = paper.getById('bg-image-' + serial);
                        bgImg[0].setAttribute('alt', altText);

                        this._createDesc(paper, altText);
                    }

                    self.options.interaction.paper = paper;
                }
            }

            this._createDesc = function(paper, altText) {
                var desc = document.createElementNS("http://www.w3.org/2000/svg", 'desc');
                desc.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
                desc.appendChild(document.createTextNode(altText));
                paper.canvas.appendChild(desc);
            }

            this._createPlaceholder = function() {
                var $container = $('.image-container', self.options.$container);
                var $imageBox  = $container.find('.main-image-box');
                var $editor    = $container.find('.image-editor');
                var diff       = ($editor.outerWidth() - $editor.width()) + ($container.outerWidth() - $container.width()) + 1;
                dummyElement.get({
                    icon: 'image',
                    css: {
                        width  : $container.innerWidth() - diff,
                        height : 200
                    },
                    title : 'Select an image first.'
                })
                .click(function(){
                    var $upload  = $('[data-role="upload-trigger"]', self.$form);
                    if($upload.length){
                        $upload.trigger('click');
                    }
                })
                .appendTo($imageBox);
            }

            this.renderChoices = function() {
                _.forEach(self.options.interaction.getChoices(), function(choice) {
                    var el = graphic.createElement(self.options.interaction.paper, choice.attributes.shape, choice.attributes.coords, {
                        id          : choice.serial,
                        touchEffect : false
                    })
                    .data('max', parseInt(choice.attributes.matchMax, 10))
                    .data('matching', [])
                    .data('fillers', [])
                    .data('groupId', choice.attributes.groupId);

                    if (choice.attributes.altText) {
                        el[0].setAttribute('alt', choice.attributes.altText);

                        self._createDesc(self.options.interaction.paper, choice.attributes.altText);
                    }
                });
            }

            this.renderGaps = function(renderer) {
                var gaps = self.options.interaction.prop('gaps') || [];
                self.$gapList = self.options.$container.find('ul.source');

                _.forEach(gaps, function(gap) {
                    var gapData = _.clone(gap),
                        $addOption,
                        fixedImg = fixMarkupMediaSources(gapData.data, renderer),
                        $img = $(fixedImg);
                    if ($img.length) {
                        gapData.imgPath = self.options.interaction.renderer.resolveUrl($img[0].getAttribute('src'));
                        gapData.objectLabel = gap.altText;
                        $addOption = $(self.options.templates.gaps(gapData));
                        $addOption.appendTo(self.$gapList);
                    }
                });
            }
    
            /**
             * Function renders whole interaction
             * @param {object} data - interaction properties
             * @return {object} - this
             */
            this.render = function (data, skipGaps) {
                if (self.backgroundImage !== data.backgroundImage) {
                    self.backgroundImage = data.backgroundImage;
                    if (self.paper) {
                        self.paper.clear();
                    }
                    this.setGapPosition(data.position);
                    if (data.backgroundImage) {
                        if (!skipGaps) {
                            this.renderGaps(self.options.interaction.renderer);
                        }
                        this.renderBackground(data.backgroundImage, data.width, data.height, data.altText, self.options.interaction.renderer);
                        this.renderChoices();
                    } else {
                        if (!skipGaps) {
                            this.renderGaps(self.options.interaction.renderer);
                        }
                        this._createPlaceholder();
                    }
                }
                return this;
            };

            this.setGapPosition = function (position) {
                var $interaction = $('.nmc-graph-gap-match-interaction', self.options.$container),
                    $gaps = $('.block-listing', self.options.$container);

                if (!$interaction.length) {
                    $interaction = self.options.$container;
                }

                $interaction.removeClass(function (index, className) {
                        return (className.match (/(^|\s)gap-position-\S+/g) || []).join(' ');
                    }
                );
                switch (position) {
                    case 'top':
                        $interaction.addClass('gap-position-top');
                        $gaps.addClass('horizontal');
                        break;
                    case 'left':
                        $interaction.addClass('gap-position-left');
                        $gaps.removeClass('horizontal');
                        break;
                    case 'right':
                        $interaction.addClass('gap-position-right');
                        $gaps.removeClass('horizontal');
                        break;
                    default:
                        $interaction.addClass('gap-position-bottom');
                        $gaps.addClass('horizontal');
                        break;
                }
            }

            this.init();

        }
    }
);
