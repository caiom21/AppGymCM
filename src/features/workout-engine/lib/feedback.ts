import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

class EngineFeedback {
  private completeSound?: Audio.Sound;
  private restSound?: Audio.Sound;

  constructor() {
    this.initAudio();
  }

  async initAudio() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
      });

      const { sound: complete } = await Audio.Sound.createAsync(
        require("../../../../assets/audio/complete.mp3")
      );
      const { sound: rest } = await Audio.Sound.createAsync(
        require("../../../../assets/audio/rest.mp3")
      );
      this.completeSound = complete;
      this.restSound = rest;
    } catch (e) {
      console.warn("Failed to mount core UI audio cues:", e);
    }
  }

  async setComplete() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    this.completeSound?.replayAsync().catch(() => {});
  }

  async restEnd() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    this.restSound?.replayAsync().catch(() => {});
  }

  async workoutComplete() {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    this.completeSound?.replayAsync().catch(() => {});
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 200);
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 400);
  }

  async buttonPress() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
}

export const engineFeedback = new EngineFeedback();
