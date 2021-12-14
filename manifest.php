<?php

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
 *
 *
 */

use oat\nmcPci\scripts\install\RegisterPciEquationEditorInteraction;
use oat\nmcPci\scripts\install\RegisterPciFractionModelInteraction;
use oat\nmcPci\scripts\install\RegisterPciGapMatchInteraction;
use oat\nmcPci\scripts\install\RegisterPciGraphBarInteraction;
use oat\nmcPci\scripts\install\RegisterPciGraphFunctionInteraction;
use oat\nmcPci\scripts\install\RegisterPciGraphLineAndPointInteraction;
use oat\nmcPci\scripts\install\RegisterPciGraphZoomNumberLineInteraction;
use oat\nmcPci\scripts\install\RegisterPciTextHighlightInteraction;
use oat\nmcPci\scripts\install\RegisterPciGraphGapMatchInteraction;

/**
 * Generated using taoDevTools 6.5.0
 */
return array(
    'name' => 'nmcPci',
    'label' => 'NMC Pci extension',
    'description' => 'NMC Pci extension',
    'license' => 'GPL-2.0',
    'author' => 'Open Assessment Technologies SA',
    'managementRole' => 'http://www.tao.lu/Ontologies/generis.rdf#nmcPciManager',
    'acl' => array(
        array('grant', 'http://www.tao.lu/Ontologies/generis.rdf#nmcPciManager', array('ext' => 'nmcPci')),
    ),
    'install' => array(
        'php' => [
            RegisterPciEquationEditorInteraction::class,
            RegisterPciFractionModelInteraction::class,
            RegisterPciGapMatchInteraction::class,
            RegisterPciGraphBarInteraction::class,
            RegisterPciGraphFunctionInteraction::class,
            RegisterPciGraphLineAndPointInteraction::class,
            RegisterPciGraphZoomNumberLineInteraction::class,
            RegisterPciTextHighlightInteraction::class,
            RegisterPciGraphGapMatchInteraction::class,
        ]
    ),
    'update' => 'oat\\nmcPci\\scripts\\update\\Updater',
    'uninstall' => array(
    ),
    'routes' => array(
        '/nmcPci' => 'oat\\nmcPci\\controller'
    ),
    'constants' => array(
        # views directory
        "DIR_VIEWS" => dirname(__FILE__) . DIRECTORY_SEPARATOR . "views" . DIRECTORY_SEPARATOR,

        #BASE URL (usually the domain root)
        'BASE_URL' => ROOT_URL . 'nmcPci/',
    ),
    'extra' => array(
        //'structures' => dirname(__FILE__).DIRECTORY_SEPARATOR.'controller'.DIRECTORY_SEPARATOR.'structures.xml',
    )
);
