<?php

namespace App\VideoEncoding\Service;

final class SubtitleEntry
{
    public function __construct(
        public readonly string  $block,
        public readonly ?int    $indexOfLineTimeEntryInBlock = null,
        public readonly ?string $start = null,
        public readonly ?string $end = null
    )
    {
    }
}
