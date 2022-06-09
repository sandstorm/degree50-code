<?php

namespace App\VideoEncoding\Service;

final class SubtitleEntry
{
    public readonly ?string $start;
    public readonly ?string $end;
    public readonly ?int $indexOfLineTimeEntryInBlock;
    /**
     * The complete block
     *
     * @var string
     */
    public readonly string $block;

    public function __construct(
        string $block,
        int $indexOfLineTimeEntryInBlock = null,
        string $start = null,
        string $end = null
    )
    {
        $this->block = $block;
        $this->indexOfLineTimeEntryInBlock = $indexOfLineTimeEntryInBlock;
        $this->start = $start;
        $this->end = $end;
    }
}
