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

define([
    'lodash',
    'i18n',
    'nmcGraphGapMatchInteraction/runtime/js/Graphic',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/Question',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/graphicInteractionShapeEditor',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/model/choices/GapImg',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/resourceManager',
    'util/image',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/imageSelector',
    'taoQtiItem/qtiCreator/widgets/helpers/identifier',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'taoQtiItem/qtiCreator/helper/panel',

    'tpl!taoQtiItem/qtiCreator/tpl/toolbars/media',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/propertiesForm',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/associableHotspot',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/gapImgForm',
    'tpl!nmcGraphGapMatchInteraction/creator/tpl/gapImg',

    'ui/mediasizer',
    'css!nmcGraphGapMatchInteraction/creator/css/authoring',    
], function (
    _,
    __,
    GraphicHelper,
    stateFactory,
    Question,
    shapeEditor,
    formElement,
    GapImg,
    resourceManager,
    imageUtil,
    imageSelector,
    identifierHelper,
    minMaxComponentFactory,
    panel,
    mediaTlbTpl,
    formTpl,
    choiceFormTpl,
    gapImgFormTpl,
    gapImgTpl) {

    'use strict';

    var StateQuestion = stateFactory.extend(Question, function () {

    }, function () {
        if (this.widget._editor) {
            this.widget._editor.destroy();
        }
        //remove gapImg placeholder
        $('ul.source .empty', this.widget.$original).remove();

        this.widget.$container.find('.qti-gapImg').removeClass('active').find('.mini-tlb').remove();

    });

    /**
     * Extract a default label from a file/path name
     * @param {String} fileName - the file/path
     * @returns {String} a label
     */
    var _extractLabel = function extractLabel(fileName) {
        return fileName
            .replace(/\.[^.]+$/, '')
            .replace(/^(.*)\//, '')
            .replace(/\W/, ' ')
            .substr(0, 255);
    };

    /**
     * Apply size changes manually to mediasizer's target.
     *
     * @param {Object} params
     * @param {number} factor
     */
    function applyMediasizerValues(params, factor) {
        factor = factor || 1;

        // The mediasizer target maintains a height and width (i.e. attributes)
        // but is displayed according to a factor (i.e. styles). This matches
        // the behavior of hotspots.
        // This is because resize events utilize factor to adjust images, thus,
        // the target's dimensions need to be maintained.
        params.$target
            .css({
                width: params.width * factor,
                height: params.height * factor
            })
            .attr('width', params.width)
            .attr('height', params.height);
    }

    StateQuestion.prototype.initForm = function () {
        var widget = this.widget,
            $formInteractionPanel, $choiceForm, $formChoicePanel,
            $left, $top, $width, $height,
            interaction = widget.element,
            $form = widget.$form,
            backgroundImage = interaction.prop('backgroundImage'),
            doc = document.implementation.createHTMLDocument('virtual'),
            $src = $(backgroundImage, doc),
            src = $src.attr('src'),
            mime = $src.attr('type'),
            gapImgSelectorOptions = _.clone(widget.options),
            gaps = interaction.prop('gaps') || [];

        if (!_.isArray(gaps)) {
            gaps = [];
        }

        gapImgSelectorOptions.title = gapImgSelectorOptions.title
            ? gapImgSelectorOptions.title
            : __('Please select a choice picture for your interaction from the resource manager. \
                    You can add new files from your computer with the button "Add file(s)".');

        $form.html(formTpl({
            src: src,
            mime: mime,
            altText: interaction.prop('altText'),
            position: interaction.prop('position') || 'bottom',
            baseUrl: widget.options.baseUrl,
        }));

        $formInteractionPanel = $('#item-editor-interaction-property-bar');
        $formChoicePanel = $('#item-editor-choice-property-bar');
        $choiceForm = $('#item-editor-choice-property-bar section>.panel');

        formElement.initWidget($form);
        formElement.setChangeCallbacks($form, interaction, {
            altText: function(interaction, value) {
                interaction.prop('altText', value);
            },
            position: function(interaction, value) {
                interaction.prop('position', value);
                interaction.widgetRenderer.setGapPosition(value);
                widget.$container.trigger('resize.qti-widget.' + interaction.serial, [10]);
                widget.$container.trigger('resize.qti-widget.' + interaction.serial);
            },
            src: function (interaction, value) {
                var $mime = $form.find('input[name=mime]');

                imageUtil.getSize(widget.element.renderer.resolveUrl(value), function (size) {
                    var backgroundImage = '<img src="' + value + '" alt="Background"  type="' + $mime.val() + '" />';
                    if (interaction.prop('backgroundImage') !== backgroundImage) {
                        interaction.prop('backgroundImage', backgroundImage);
                        if (size) {
                            interaction.prop('width', size.width);
                            interaction.prop('height', size.height);
                        }
                        interaction.widgetRenderer.render(interaction.properties, true);
                        if (backgroundImage) {
                            _initShapeEditor();
                        }
                    }
                });

            }
        });

        _initUpload();
        if (interaction.paper) {
            _initShapeEditor();
        }
        createGapImgAddOption();

        _.forEach(
            _.map(gaps, function(gap) {
                var gapImg = new GapImg(),
                    doc = document.implementation.createHTMLDocument('virtual'),
                    $src = $(gap.data, doc),
                    src = $src.attr('src');

                gapImg.serial = gap.serial;
                gapImg.object.attr('data', src);
                gapImg.object.attr('type', gap.type);
                gapImg.object.attr('groupId', gap.groupId);
                gapImg.object.attr('altText', gap.altText);
                gapImg.object.attr('width', gap.width);
                gapImg.object.attr('height', gap.height);
                gapImg.attr('matchMin', gap.matchMin);
                gapImg.attr('matchMax', gap.matchMax);
                gapImg.attr('identifier', gap.identifier);
                return gapImg;
            }),
            setUpGapImg
        );

        function _initUpload() {
            var $form = widget.$form,
                options = widget.options,
                img = widget.element,
                $uploadTrigger = $form.find('[data-role="upload-trigger"]'),
                $src = $form.find('input[name=src]'),
                $mime = $form.find('input[name=mime]');

            var _openResourceMgr = function () {
                $uploadTrigger.resourcemgr({
                    title: __(
                        'Please select an image file from the resource manager. You can add files from your computer with the button "Add file(s)".'
                    ),
                    appendContainer: options.mediaManager.appendContainer,
                    mediaSourcesUrl: options.mediaManager.mediaSourcesUrl,
                    browseUrl: options.mediaManager.browseUrl,
                    uploadUrl: options.mediaManager.uploadUrl,
                    deleteUrl: options.mediaManager.deleteUrl,
                    downloadUrl: options.mediaManager.downloadUrl,
                    fileExistsUrl: options.mediaManager.fileExistsUrl,
                    params: {
                        uri: options.uri,
                        lang: options.lang,
                        filters: [
                            { mime: 'image/jpeg' },
                            { mime: 'image/png' },
                            { mime: 'image/gif' },
                            { mime: 'image/svg+xml' },
                            { mime: 'application/x-gzip', extension: 'svgz' }
                        ]
                    },
                    pathParam: 'path',
                    select: function (e, files) {
                        var file, mime;
                        if (files && files.length) {
                            file = files[0].file;
                            mime = files[0].mime;
                            $src.val(file);
                            $mime.val(mime);

                            _.defer(function () {
                                img.attr('off-media-editor', 1);
                                $src.trigger('change');
                            });
                        }
                    },
                    open: function () {
                        // hide tooltip if displayed
                        if ($src.data('$tooltip')) {
                            $src.blur().data('$tooltip').hide();
                        }
                    },
                    close: function () {
                        // triggers validation:
                        $src.blur();
                    }
                });
            };
            $uploadTrigger.on('click', _openResourceMgr);

            //if empty, open file manager immediately
            if (!$src.val()) {
                _openResourceMgr();
            }
        }

        function _initShapeEditor() {
            //instantiate the shape editor, attach it to the widget to retrieve it during the exit phase
            if (widget._editor) {
                widget._editor.destroy();
            }
            widget._editor = shapeEditor(widget, {
                shapeCreated: function (shape, type) {
                    var attr = {
                        shape: type === 'path' ? 'poly' : type,
                        coords: GraphicHelper.qtiCoords(shape)
                    };
                    var newChoice = widget.createChoice(interaction, attr);

                    //link the shape to the choice
                    shape.id = newChoice.serial;
                    choicesChanged();
                },
                shapeRemoved: function (id) {
                    interaction.removeChoice(id);
                    choicesChanged();
                },
                enterHandling: function (shape) {
                    enterChoiceForm(shape.id);
                },
                quitHandling: function () {
                    leaveChoiceForm();
                },
                shapeChange: function (shape) {
                    var bbox;
                    var choice = interaction.getChoice(shape.id);
                    if (choice) {
                        choice.attr('coords', GraphicHelper.qtiCoords(shape));
                        choicesChanged();

                        if ($left && $left.length) {
                            bbox = shape.getBBox();
                            $left.val(parseInt(bbox.x, 10));
                            $top.val(parseInt(bbox.y, 10));
                            $width.val(parseInt(bbox.width, 10));
                            $height.val(parseInt(bbox.height, 10));
                        }
                    }
                }
            });

            //and create an instance
            widget._editor.create();
        }

        /**
         * Create the 'add option' button
         */
        function createGapImgAddOption() {
            var $gapList = $('ul.source', widget.$original);
            var $addOption =
                $('<li class="empty add-option"><div><span class="icon-add"></span></div></li>');
            

            $addOption.on('click', function () {
                var gapImgObj = widget.createGapImg(interaction, {});
                gapImgObj.object.removeAttr('type');

                // on successful upload
                $addOption.off('selected.upload').on('selected.upload', function (e, args) {
                    var data = '<img src="' + args.selected.file + '" />'
                    var defaultSize = {width: 50, height: 50}; //fix error when args.size === null

                    $addOption.off('selected.upload');

                    gapImgObj.object.attr('data', args.selected.file);
                    gapImgObj.object.attr('type', args.selected.mime);
                    gapImgObj.object.attr('width', (args.size || defaultSize).width);
                    gapImgObj.object.attr('height', (args.size || defaultSize).height);
                    gaps.push(_.assign({
                        serial: gapImgObj.serial,
                        identifier: gapImgObj.id()
                    }, gapImgObj.object.attributes, { data: data }));
                    interaction.prop('gaps', gaps);
                    setUpGapImg(gapImgObj);
                });
                resourceManager($addOption, gapImgSelectorOptions);

            });
            $addOption.appendTo($gapList);
        }

        /**
         * Insert and setup the gap image
         *
         * @param gapImgObj
         */
        function setUpGapImg(gapImgObj) {

            var $gapList = $('ul.source', widget.$original),
                $addOption = $('.empty', $gapList),
                $gapImgBox = $('[data-serial="' + gapImgObj.serial + '"]', $gapList),
                $deleteBtn = $(mediaTlbTpl()),
                $img, src;

            if (!$gapImgBox.length) {
                $gapImgBox = $(gapImgTpl(_.assign({baseUrl: widget.options.baseUrl}, gapImgObj))).insertBefore($addOption);
            } else {
                $img = $gapImgBox.find('img');
                src = widget.options.baseUrl + gapImgObj.object.attr('data');
                if (src !== $img.attr('src')) {
                    $img.attr('src', src);
                }
            }

            //manage gap deletion
            $deleteBtn
                .appendTo($gapImgBox)
                .show()
                .click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $gapImgBox.remove();
                    _.remove(gaps, function(gap) { return gap.serial === gapImgObj.serial });
                    interaction.prop('gaps', gaps);
                });

            enterGapImgForm(gapImgObj.serial, gapImgObj);

            $gapImgBox.off('click').on('click', function () {
                if ($gapImgBox.hasClass('active')) {
                    $gapImgBox.removeClass('active');
                    leaveChoiceForm();
                }
                else {
                    $('.active', $gapList).removeClass('active');
                    $gapImgBox.addClass('active');
                    enterGapImgForm(gapImgObj.serial, gapImgObj);
                }
            });
        }

        /**
         * Set up the gapImg form
         * @private
         * @param {String} serial - the gapImg serial
         */
        function enterGapImgForm(serial, gapImgObj) {

            var callbacks,
                gapImg = gapImgObj || interaction.getGapImg(serial),
                initMediasizer,
                $gapImgBox,
                $gapImgElem,
                $mediaSizer;

            if (gapImg) {

                $choiceForm.empty().html(gapImgFormTpl({
                    identifier: gapImg.id(),
                    fixed: gapImg.attr('fixed'),
                    serial: serial,
                    baseUrl: widget.options.baseUrl,
                    data: gapImg.object.attr('data'),
                    width: gapImg.object.attr('width'),
                    height: gapImg.object.attr('height'),
                    type: gapImg.object.attr('type'),
                    groupId: gapImg.object.attr('groupId'),
                    altText: gapImg.object.attr('altText'),
                }));

                //controls the match min/max for the gap images
                minMaxComponentFactory($choiceForm.find('.min-max-panel'), {
                    min : {
                        fieldName:   'matchMin',
                        value:       _.parseInt(gapImg.attr('matchMin')) || 0,
                        helpMessage: __('The minimum number of choices this choice must be associated with to form a valid response.')
                    },
                    max : {
                        fieldName:   'matchMax',
                        value:       _.parseInt(gapImg.attr('matchMax')) || 0,
                        helpMessage: __('The maximum number of choices this choice may be associated with.')
                    },
                    upperThreshold :  NaN,
                });

                // <li/> that will contain the image
                $gapImgBox = $('li[data-serial="' + gapImg.serial + '"]');

                $gapImgElem = $gapImgBox.find('img');

                //init media sizer
                $mediaSizer = $choiceForm.find('.media-sizer-panel')
                    .on('create.mediasizer', function(e, params) {
                        // On creation, mediasizer uses style properties to set
                        // width and height, but our image needs to use the
                        // it's attributes to set and resize properly.
                        params.width = $gapImgElem.attr('width');
                        params.height = $gapImgElem.attr('height');

                        applyMediasizerValues(params, widget.$container.data('factor'));
                    });

                initMediasizer = function () {
                    // Hack to manually set mediasizer to use gapImg's height
                    // and width attributes (instead of it's style properties).
                    $gapImgElem.width($gapImgElem.attr('width'));
                    $gapImgElem.height($gapImgElem.attr('height'));

                    $mediaSizer.empty().mediasizer({
                        target: $gapImgElem,
                        showResponsiveToggle: false,
                        showSync: false,
                        responsive: false,
                        parentSelector: $gapImgBox,
                        // needs to be done on.sizechange.mediasizer to take in account the scale factor
                        applyToMedium: false,
                        //maxWidth: interaction.object.attr('width')
                    });
                };

                // Wait for image to load before initializing mediasizer
                if ($gapImgElem.get(0) && $gapImgElem.get(0).complete) {
                    initMediasizer();
                } else {
                    $gapImgElem.one('load', initMediasizer);
                }

                imageSelector($choiceForm, gapImgSelectorOptions);

                formElement.initWidget($choiceForm);

                // bind callbacks to ms
                // init data validation and binding
                callbacks = formElement.getMinMaxAttributeCallbacks($choiceForm, 'matchMin', 'matchMax', { callback: function(element, value, name) {
                    var gap = _.find(gaps, { serial: gapImgObj.serial});
                    if (gap) {
                        gap[name] = value;
                        interaction.prop('gaps', gaps);
                    }
                }});
                callbacks.identifier = function (element, value) {
                    var gap;
                    gap = _.find(gaps, { serial: gapImgObj.serial});
                    if (gap) {
                        gap.identifier = value;
                        interaction.prop('gaps', gaps);
                    }
                    identifierHelper.updateChoiceIdentifier(element, value);
                };
                callbacks.fixed = formElement.getAttributeChangeCallback();
                callbacks.data = function (element, value) {
                    var gap;
                    gapImg.object.attr('data', value);
                    gap = _.find(gaps, { serial: gapImgObj.serial});
                    if (gap) {
                        gap.data = '<img src="' + value + '" />';
                        interaction.prop('gaps', gaps);
                    }
                    setUpGapImg(gapImg);
                };

                callbacks.groupId = function (element, value) {
                    var gap = _.find(gaps, { serial: gapImgObj.serial});
                    if (gap) {
                        gap.groupId = value;
                        interaction.prop('gaps', gaps);
                    }
                    gapImg.object.attr('groupId', value);
                };

                callbacks.altText = function (element, value) {
                    var gap = _.find(gaps, { serial: gapImgObj.serial});
                    if (gap) {
                        gap.altText = value;
                        interaction.prop('gaps', gaps);
                    }
                    gapImg.object.attr('groupId', value);
                };
                // callbacks
                $mediaSizer.on('sizechange.mediasizer', function(e, params) {
                    var gap;
                    applyMediasizerValues(params, widget.$container.data('factor'));

                    gapImg.object.attr('width', params.width);
                    gapImg.object.attr('height', params.height);

                    gap = _.find(gaps, { serial: gapImgObj.serial});
                    if (gap) {
                        gap.width = params.width;
                        gap.height = params.height;
                        interaction.prop('gaps', gaps);
                    }
                });

                callbacks.type = function (element, value) {
                    if (!value) {
                        interaction.object.removeAttr('type');
                    }
                    else {
                        gapImg.object.attr('type', value);
                    }
                };

                formElement.setChangeCallbacks($choiceForm, gapImg, callbacks);

                $formChoicePanel.show();
                panel.openSections($formChoicePanel.children('section'));
                panel.closeSections($formInteractionPanel.children('section'));

                if (typeof window.scroll === 'function') {
                    window.scroll(0, $choiceForm.offset().top);
                }
            }
        }


        function choicesChanged() {
            var choices = _.map(interaction.getChoices(), function(choice) { return choice.attributes; });
            interaction.prop('choices', JSON.stringify(choices));
        }

        function choiceIdentifierchanged(choice, value) {
            identifierHelper.updateChoiceIdentifier(choice, value);
            choicesChanged();
        }

        function choicesAttributeChanged(element, value, name) {
            if (value === '') {
                element.removeAttr(name);
            } else {
                element.attr(name, value);
            }
            choicesChanged();
        };

        function choiceSizeChanged(element, value, name) {
            var shape = interaction.paper.getById(element.serial);
            var editor = _.find(widget._editor.editors, function(ed) { return ed.shape === shape });
            if (editor) {
                shape.attr(name, parseInt(value, 10));
                _.invoke(editor.handlers, 'remove');
                editor.handlers = [];
                editor.trigger('shapechange.qti-widget');
            }
        }

        /**
         * Set up the choice form
         *
         * @private
         * @param {String} serial - the choice serial
         */
        function enterChoiceForm(serial) {
            var choice = interaction.getChoice(serial);
            var element, bbox, callbacks;

            if (choice) {

                //get shape bounding box
                element = interaction.paper.getById(serial);
                bbox = element.getBBox();

                $choiceForm.empty().html(
                    choiceFormTpl({
                        identifier: choice.id(),
                        serial: serial,
                        x: parseInt(bbox.x, 10),
                        y: parseInt(bbox.y, 10),
                        width: parseInt(bbox.width, 10),
                        height: parseInt(bbox.height, 10),
                        groupId: choice.attr('groupId'),
                        altText: choice.attr('altText'),
                    })
                );

                //controls match min/max for the choices (the shapes)
                minMaxComponentFactory($choiceForm.find('.min-max-panel'), {
                    min: {
                        fieldName: 'matchMin',
                        value: _.parseInt(choice.attr('matchMin'), 10) || 0,
                        helpMessage: __('The minimum number of choices this choice must be associated with to form a valid response.')
                    },
                    max: {
                        fieldName: 'matchMax',
                        value: _.parseInt(choice.attr('matchMax'), 10) || 0,
                        helpMessage: __('The maximum number of choices this choice may be associated with.')
                    },
                    upperThreshold: NaN
                });

                formElement.initWidget($choiceForm);

                //init data validation and binding
                callbacks = formElement.getMinMaxAttributeCallbacks($choiceForm, 'matchMin', 'matchMax', {callback: function() { choicesChanged() } });
                callbacks.identifier = choiceIdentifierchanged;
                callbacks.groupId = choicesAttributeChanged;
                callbacks.altText = choicesAttributeChanged;
                callbacks.y = choiceSizeChanged;
                callbacks.x = choiceSizeChanged;
                callbacks.width = choiceSizeChanged;
                callbacks.height = choiceSizeChanged;

                formElement.setChangeCallbacks($choiceForm, choice, callbacks);

                $formChoicePanel.show();
                panel.openSections($formChoicePanel.children('section'));
                panel.closeSections($formInteractionPanel.children('section'));

                //change the nodes bound to the position fields
                $left = $('input[name=x]', $choiceForm);
                $top = $('input[name=y]', $choiceForm);
                $width = $('input[name=width]', $choiceForm);
                $height = $('input[name=height]', $choiceForm);
            }
        }

        /**
         * Leave the choice form
         * @private
         */
        function leaveChoiceForm() {
            if ($formChoicePanel.css('display') !== 'none') {
                panel.openSections($formInteractionPanel.children('section'));
                $formChoicePanel.hide();
                $choiceForm.empty();
            }
        }

    };

    return StateQuestion;
});
