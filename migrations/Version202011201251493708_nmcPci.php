<?php

declare(strict_types=1);

namespace oat\nmcPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\model\IMSPciModel;
use oat\nmcPci\scripts\install\RegisterPciEquationEditorInteraction;
use oat\nmcPci\scripts\install\RegisterPciFractionModelInteraction;
use oat\nmcPci\scripts\install\RegisterPciGapMatchInteraction;
use oat\nmcPci\scripts\install\RegisterPciGraphBarInteraction;
use oat\nmcPci\scripts\install\RegisterPciGraphFunctionInteraction;
use oat\nmcPci\scripts\install\RegisterPciGraphGapMatchInteraction;
use oat\nmcPci\scripts\install\RegisterPciGraphLineAndPointInteraction;
use oat\nmcPci\scripts\install\RegisterPciGraphZoomNumberLineInteraction;
use oat\nmcPci\scripts\install\RegisterPciTextHighlightInteraction;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202011201251493708_nmcPci extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'New version of nmcPci extension';
    }

    public function up(Schema $schema): void
    {
        $registry = (new IMSPciModel())->getRegistry();
        if ($registry->has('nmcEquationEditorInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('nmcEquationEditorInteraction');
        }
        if ($registry->has('nmcFractionModelInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('nmcFractionModelInteraction');
        }
        if ($registry->has('nmcGapMatchInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('nmcGapMatchInteraction');
        }
        if ($registry->has('nmcGraphBarInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('nmcGraphBarInteraction');
        }
        if ($registry->has('nmcGraphFunctionInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('nmcGraphFunctionInteraction');
        }
        if ($registry->has('nmcGraphGapMatchInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('nmcGraphGapMatchInteraction');
        }
        if ($registry->has('nmcGraphLineAndPointInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('nmcGraphLineAndPointInteraction');
        }
        if ($registry->has('nmcGraphZoomNumberLineInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('nmcGraphZoomNumberLineInteraction');
        }
        if ($registry->has('nmcGraphZoomNumberLineInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('nmcGraphZoomNumberLineInteraction');
        }

        $this->addReport($this->propagate(new RegisterPciEquationEditorInteraction())([]));
        $this->addReport($this->propagate(new RegisterPciFractionModelInteraction())([]));
        $this->addReport($this->propagate(new RegisterPciGapMatchInteraction())([]));
        $this->addReport($this->propagate(new RegisterPciGraphBarInteraction())([]));
        $this->addReport($this->propagate(new RegisterPciGraphFunctionInteraction())([]));
        $this->addReport($this->propagate(new RegisterPciGraphGapMatchInteraction())([]));
        $this->addReport($this->propagate(new RegisterPciGraphLineAndPointInteraction())([]));
        $this->addReport($this->propagate(new RegisterPciGraphZoomNumberLineInteraction())([]));
        $this->addReport($this->propagate(new RegisterPciTextHighlightInteraction())([]));

    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run ' . RegisterPciEquationEditorInteraction::class
        );
    }
}
