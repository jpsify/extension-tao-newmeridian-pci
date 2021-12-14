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

final class Version202102241526173708_nmcPci extends AbstractMigration
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

        $this->addReport($this->propagate(new RegisterPciEquationEditorInteraction())([]));
        $this->addReport($this->propagate(new RegisterPciFractionModelInteraction())([]));
        $this->addReport($this->propagate(new RegisterPciGapMatchInteraction())([]));
        $this->addReport($this->propagate(new RegisterPciGraphBarInteraction())([]));
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes'
        );
    }
}
