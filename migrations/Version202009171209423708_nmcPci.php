<?php

declare(strict_types=1);

namespace oat\nmcPci\migrations;

use Doctrine\DBAL\Schema\Schema;
use oat\tao\scripts\tools\migrations\AbstractMigration;
use oat\qtiItemPci\model\IMSPciModel;
use oat\nmcPci\scripts\install\RegisterPciGapMatchInteraction;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version202009171209423708_nmcPci extends AbstractMigration
{

    public function getDescription(): string
    {
        return 'Register the PCI nmcGapMatchInteraction.';
    }

    public function up(Schema $schema): void
    {
        $registry = (new IMSPciModel())->getRegistry();
        if ($registry->has('nmcGapMatchInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('nmcGapMatchInteraction');
        }

        $this->addReport(
            $this->propagate(
                new RegisterPciGapMatchInteraction()
            )(
                []
            )
        );
    }

    public function down(Schema $schema): void
    {
        $registry = (new IMSPciModel())->getRegistry();
        if ($registry->has('nmcGapMatchInteraction')) {
            /** @noinspection PhpUnhandledExceptionInspection */
            $registry->removeAllVersions('nmcGapMatchInteraction');
        }
    }
}
