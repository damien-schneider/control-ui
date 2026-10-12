"use client";

import { HeadphonesIcon, Volume2Icon, VolumeXIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/control-ui/ui/button";
import {
  ChannelStrip,
  ChannelStripActions,
  ChannelStripBody,
  ChannelStripControls,
  ChannelStripHeader,
  ChannelStripTitle,
  ChannelStripValue,
  Mixer,
} from "@/components/control-ui/ui/channel-strip";
import {
  LevelMeter,
  LevelMeterBar,
  LevelMeterPeak,
  LevelMeterScale,
  type LevelMeterSource,
  LevelMeterTrack,
} from "@/components/control-ui/ui/level-meter";
import { Slider } from "@/components/control-ui/ui/slider";

const FADER_MIN_DB = -60;
const FADER_MAX_DB = 0;

function speechLikeLevel(gainDb: number): LevelMeterSource {
  return {
    subscribe(listener) {
      let frame = 0;
      const emitLevel = (nowMs: number) => {
        const syllable = Math.abs(Math.sin(nowMs / 170)) * Math.abs(Math.sin(nowMs / 1300));
        listener(-46 + syllable * 40 + Math.random() * 4 + gainDb);
        frame = requestAnimationFrame(emitLevel);
      };
      frame = requestAnimationFrame(emitLevel);
      return () => cancelAnimationFrame(frame);
    },
  };
}

function formatFaderDb(db: number) {
  return db <= FADER_MIN_DB ? "\u2212\u221e dB" : `${db.toFixed(1).replace("-", "\u2212")} dB`;
}

type ExampleChannelProps = {
  name: string;
  variant?: "default" | "master";
  onRemove?: () => void;
};

function ExampleChannel({ name, variant = "default", onRemove }: ExampleChannelProps) {
  const [gainDb, setGainDb] = useState(-6);
  const [muted, setMuted] = useState(false);
  const source = useMemo(() => speechLikeLevel(gainDb), [gainDb]);
  return (
    <ChannelStrip variant={variant}>
      <ChannelStripHeader>
        <ChannelStripTitle title={name}>{name}</ChannelStripTitle>
        {onRemove ? (
          <ChannelStripActions>
            <Button variant="ghost" size="xs" iconOnly aria-label={`Remove ${name}`} onClick={onRemove}>
              <XIcon />
            </Button>
          </ChannelStripActions>
        ) : null}
      </ChannelStripHeader>
      <ChannelStripBody>
        <Slider
          aria-label={`${name} volume`}
          orientation="vertical"
          min={FADER_MIN_DB}
          max={FADER_MAX_DB}
          step={0.5}
          value={gainDb}
          onValueChange={setGainDb}
          formatValue={formatFaderDb}
        />
        <LevelMeter aria-label={`${name} level`} orientation="vertical" source={source} muted={muted}>
          <LevelMeterTrack>
            <LevelMeterBar />
            <LevelMeterPeak />
          </LevelMeterTrack>
          <LevelMeterScale />
        </LevelMeter>
      </ChannelStripBody>
      <ChannelStripValue>{formatFaderDb(gainDb)}</ChannelStripValue>
      <ChannelStripControls>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          tone={muted ? "danger" : "neutral"}
          active={muted}
          aria-pressed={muted}
          aria-label={`Mute ${name}`}
          onClick={() => setMuted(!muted)}
        >
          {muted ? <VolumeXIcon /> : <Volume2Icon />}
        </Button>
        {variant === "master" ? null : (
          <Button variant="ghost" size="sm" iconOnly aria-label={`Monitor ${name}`}>
            <HeadphonesIcon />
          </Button>
        )}
      </ChannelStripControls>
    </ChannelStrip>
  );
}

export function PrimitiveChannelStripExample() {
  const [channels, setChannels] = useState(["Shure MV7+", "Desktop audio"]);
  return (
    <Mixer aria-label="Audio mixer" className="max-w-full">
      {channels.map((name) => (
        <ExampleChannel key={name} name={name} onRemove={() => setChannels(channels.filter((channel) => channel !== name))} />
      ))}
      <ExampleChannel name="Master" variant="master" />
    </Mixer>
  );
}
