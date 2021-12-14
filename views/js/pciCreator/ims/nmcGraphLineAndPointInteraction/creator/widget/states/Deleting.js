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
 * Copyright (c) 2020 Open Assessment Technologies SA;
 */

define([
    'nmcGraphLineAndPointInteraction/creator/widget/helpers/responseCondition',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Deleting',
], function(responseCondition, stateFactory, Deleting) {
    'use strict';

    var StateDeleting = stateFactory.extend(Deleting, function initDeletingState() {

    }, function exitDeletingState() {
        var interaction = this.widget.element;
        responseCondition.removeResponseCondition(interaction);
    });

    return StateDeleting;
});