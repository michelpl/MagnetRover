import { GameObjects, Input, Scene } from 'phaser';
import { Audio } from '../audio/Audio';
import { GameConfig } from '../config/GameConfig';
import { Save } from '../save/Save';

export type VolumeKind = 'sfx' | 'music';

type SliderHandle = {
  kind: VolumeKind;
  fill: GameObjects.Rectangle;
  knob: GameObjects.Arc;
  track: GameObjects.Rectangle;
  valueText: GameObjects.Text;
};

/**
 * Shared MUSIC / SOUND EFFECTS sliders used on hub settings and in-run pause.
 */
export class VolumeSliderPair {
  public readonly objects: GameObjects.GameObject[];
  private readonly sliders: SliderHandle[] = [];
  private active: SliderHandle | null = null;
  private readonly sliderLeft: number;
  private readonly sliderWidth: number;

  public constructor(
    scene: Scene,
    layout: { left: number; width: number; sfxY: number; musicY: number },
  ) {
    this.sliderLeft = layout.left;
    this.sliderWidth = layout.width;

    const sfx = this.createSlider(scene, 'SOUND EFFECTS', layout.sfxY, 'sfx');
    const music = this.createSlider(scene, 'MUSIC', layout.musicY, 'music');
    this.sliders.push(sfx, music);
    this.objects = this.sliders.flatMap((slider) => [
      slider.track,
      slider.fill,
      slider.knob,
      slider.valueText,
    ]);

    const labelSfx = this.labels[0];
    const labelMusic = this.labels[1];
    if (labelSfx && labelMusic) {
      this.objects.unshift(labelSfx, labelMusic);
    }

    this.refreshFromSave();

    scene.input.on('pointermove', this.onPointerMove, this);
    scene.input.on('pointerup', this.onPointerUp, this);
    scene.events.once('shutdown', () => {
      scene.input.off('pointermove', this.onPointerMove, this);
      scene.input.off('pointerup', this.onPointerUp, this);
    });
  }

  public refreshFromSave(): void {
    const save = Save.load();
    for (const slider of this.sliders) {
      this.setSliderValue(
        slider,
        slider.kind === 'sfx' ? save.sfxVolume : save.musicVolume,
        false,
      );
    }
  }

  public setInputEnabled(enabled: boolean): void {
    if (!enabled) {
      this.active = null;
    }
    for (const slider of this.sliders) {
      if (slider.track.input) {
        slider.track.input.enabled = enabled;
      }
      if (slider.knob.input) {
        slider.knob.input.enabled = enabled;
      }
    }
  }

  private readonly labels: GameObjects.Text[] = [];

  private createSlider(
    scene: Scene,
    label: string,
    y: number,
    kind: VolumeKind,
  ): SliderHandle {
    const settings = GameConfig.settings;
    const labelText = scene.add
      .text(this.sliderLeft, y - 58, label, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#d9ecff',
      })
      .setOrigin(0, 0.5);
    this.labels.push(labelText);

    const track = scene.add
      .rectangle(this.sliderLeft, y, this.sliderWidth, settings.sliderHeight, 0x07192f)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x3a628c)
      .setInteractive({ useHandCursor: true });
    const fill = scene.add
      .rectangle(this.sliderLeft, y, 0, settings.sliderHeight - 8, 0x7df000)
      .setOrigin(0, 0.5);
    const knob = scene.add
      .circle(this.sliderLeft, y, settings.knobRadius, 0xffd22f)
      .setStrokeStyle(3, 0xfff3a3)
      .setInteractive({ useHandCursor: true });
    const valueText = scene.add
      .text(this.sliderLeft + this.sliderWidth, y - 58, '', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#ffd22f',
      })
      .setOrigin(1, 0.5);

    const slider: SliderHandle = { kind, fill, knob, track, valueText };
    const startDrag = (pointer: Input.Pointer): void => {
      this.active = slider;
      this.setSliderValue(slider, this.pointerToValue(pointer.x), true);
    };
    track.on('pointerdown', startDrag);
    knob.on('pointerdown', startDrag);
    return slider;
  }

  private onPointerMove(pointer: Input.Pointer): void {
    if (this.active) {
      this.setSliderValue(this.active, this.pointerToValue(pointer.x), true);
    }
  }

  private onPointerUp(): void {
    this.active = null;
  }

  private pointerToValue(pointerX: number): number {
    return Math.max(0, Math.min(1, (pointerX - this.sliderLeft) / this.sliderWidth));
  }

  private setSliderValue(slider: SliderHandle, value: number, persist: boolean): void {
    slider.fill.width = this.sliderWidth * value;
    slider.knob.x = this.sliderLeft + this.sliderWidth * value;
    slider.valueText.setText(`${Math.round(value * 100)}%`);
    if (!persist) {
      return;
    }
    Save.update((data) => {
      if (slider.kind === 'sfx') {
        data.sfxVolume = value;
        data.sfxMuted = value <= 0;
        return;
      }
      data.musicVolume = value;
    });
    Audio.applySavedVolumes();
  }
}
