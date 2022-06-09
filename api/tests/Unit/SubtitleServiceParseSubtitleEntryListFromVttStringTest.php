<?php

namespace App\Tests\Unit;

use App\VideoEncoding\Service\SubtitleService;
use PHPUnit\Framework\TestCase;

final class SubtitleServiceParseSubtitleEntryListFromVttStringTest extends TestCase
{
    public function testCanExtractSubtitleBlock(): void
    {
        $subtitleService = new SubtitleService();

        $subtitles = <<<END
            WEBVTT - test file

            NOTE
            This file was created for testing

            1
            00:00.000 --> 00:05.000
            Lehrer: Gut, welche Zahlen liegen zwischen 145 und 130?

            1
            00:23.000 --> 00:26.000
            Lehrer: Mhm: 144, 141 und 139.

            NOTE test test
            END;

        $subtitleEntries = $subtitleService->parseSubtitleEntryListFromVttString($subtitles);

        $this->assertEquals("00:23.000", $subtitleEntries[3]->start);
        $this->assertEquals("00:26.000", $subtitleEntries[3]->end);
        $this->assertEquals(1, $subtitleEntries[3]->indexOfLineTimeEntryInBlock);
    }

    public function testCanExtractMetadataBlock(): void
    {
        $subtitleService = new SubtitleService();

        $subtitles = <<<END
            WEBVTT - test file

            NOTE
            This file was created for testing

            1
            00:00.000 --> 00:05.000
            Lehrer: Gut, welche Zahlen liegen zwischen 145 und 130?

            1
            00:23.000 --> 00:26.000
            Lehrer: Mhm: 144, 141 und 139.

            NOTE test test
            END;

        $subtitleEntries = $subtitleService->parseSubtitleEntryListFromVttString($subtitles);

        $this->assertEquals(null, $subtitleEntries[0]->start);
        $this->assertEquals(null, $subtitleEntries[0]->end);
        $this->assertEquals(null, $subtitleEntries[0]->indexOfLineTimeEntryInBlock);
        $this->assertEquals("WEBVTT - test file", $subtitleEntries[0]->block);
    }
}
