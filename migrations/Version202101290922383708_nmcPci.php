<?php

declare(strict_types=1);

namespace oat\nmcPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use Doctrine\Migrations\Exception\IrreversibleMigration;
use oat\qtiItemPci\model\IMSPciModel;
use oat\nmcPci\scripts\install\RegisterPciEquationEditorInteraction;

final class Version202101290922383708_nmcPci extends AbstractMigration
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

        $this->addReport($this->propagate(new RegisterPciEquationEditorInteraction())([]));
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration(
            'In order to undo this migration, please revert the client-side changes and run ' . RegisterPciEquationEditorInteraction::class
        );
    }
}
