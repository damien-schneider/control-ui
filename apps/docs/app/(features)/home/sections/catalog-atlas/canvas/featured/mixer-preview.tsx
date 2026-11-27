"use client";

import { useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import {
  ChannelStrip,
  ChannelStripBody,
  ChannelStripControls,
  ChannelStripHeader,
  ChannelStripTitle,
  ChannelStripValue,
  Mixer,
} from "@/components/control-ui/ui/channel-strip";
import { LevelMeter, LevelMeterBar, LevelMeterPeak, LevelMeterScale, LevelMeterTrack } from "@/components/control-ui/ui/level-meter";
import { Slider } from "@/components/control-ui/ui/slider";
import { Text } from "@/components/control-ui/ui/typography";
import { PreviewPanel } from "./preview-panel";

const FADER_MIN_DB = -48;
const FADER_MAX_DB = 6;

type Channel = { name: string; gainDb: number; signalDb: number; solo: boolean };

const channels: readonly Channel[] = [
  { name: "Kick", gainDb: -6, signalDb: -14, solo: true },
  { name: "Bass", gainDb: -9.5, signalDb: -6, solo: false },
  { name: "Vox", gainDb: 1.2, signalDb: -4, solo: false },
];

function formatDb(db: number) {
  return `${db > 0 ? "+" : ""}${db.toFixed(1)}`;
}

function MixerChannel({ channel }: { channel: Channel }) {
  const [gainDb, setGainDb] = useState(channel.gainDb);
  const [muted, setMuted] = useState(false);
  const [solo, setSolo] = useState(channel.solo);

  return (
    <ChannelStrip className="w-auto">
      <ChannelStripHeader className="justify-center">
        <ChannelStripTitle className="flex-none">{channel.name}</ChannelStripTitle>
      </ChannelStripHeader>
      <ChannelStripBody className="h-44">
        <Slider
          aria-label={`${channel.name} volume`}
          orientation="vertical"
          min={FADER_MIN_DB}
          max={FADER_MAX_DB}
          step={0.1}
          value={gainDb}
          onValueChange={setGainDb}
          formatValue={(db) => `${formatDb(db)} dB`}
        />
        <LevelMeter aria-label={`${channel.name} level`} orientation="vertical" value={channel.signalDb + gainDb} muted={muted}>
          <LevelMeterTrack>
            <LevelMeterBar />
            <LevelMeterPeak />
          </LevelMeterTrack>
          <LevelMeterScale />
        </LevelMeter>
      </ChannelStripBody>
      <ChannelStripValue>
        <Text size="caption" mono numeric tone={gainDb > 0 ? "danger" : "default"}>
          {formatDb(gainDb)}
        </Text>
      </ChannelStripValue>
      <ChannelStripControls>
        <Button
          size="xs"
          variant={muted ? "solid" : "surface"}
          iconOnly
          aria-pressed={muted}
          aria-label={`Mute ${channel.name}`}
          onClick={() => setMuted(!muted)}
        >
          M
        </Button>
        <Button
          size="xs"
          variant={solo ? "solid" : "surface"}
          iconOnly
          aria-pressed={solo}
          aria-label={`Solo ${channel.name}`}
          onClick={() => setSolo(!solo)}
        >
          S
        </Button>
      </ChannelStripControls>
    </ChannelStrip>
  );
}

export function MixerPreview() {
  return (
    <PreviewPanel className="px-2 py-3">
      <Mixer aria-label="Drum bus mixer" className="w-full auto-cols-fr">
        {channels.map((channel) => (
          <MixerChannel key={channel.name} channel={channel} />
        ))}
      </Mixer>
    </PreviewPanel>
  );
}
