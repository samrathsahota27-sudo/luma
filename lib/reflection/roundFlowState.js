/**
 * Restore per-round UI from stored answers (numeric round keys: 1, 2, …).
 */

export function deriveUiFromSavedRound(saved) {
  if (!saved || typeof saved !== "object") {
    return {
      selectedImage: null,
      selectedOption: null,
      selectedIndex: null,
      textValue: "",
      noneText: "",
      showNoneSection: false,
      tagsForRound: [],
    };
  }

  if (saved.selectedType === "none" || saved.selectedImage === "none") {
    const t = String(saved.noneText ?? saved.text ?? saved.userExplanation ?? "");
    return {
      selectedImage: "none",
      selectedOption: "none",
      selectedIndex: null,
      textValue: t,
      noneText: t,
      showNoneSection: true,
      tagsForRound: [],
    };
  }

  const img = saved.selectedImageId ?? saved.image;
  if (typeof img === "number") {
    return {
      selectedImage: img,
      selectedOption: "image",
      selectedIndex: img,
      textValue: String(saved.text ?? ""),
      noneText: "",
      showNoneSection: false,
      tagsForRound: Array.isArray(saved.tags) ? [...saved.tags] : [],
    };
  }

  return {
    selectedImage: null,
    selectedOption: null,
    selectedIndex: null,
    textValue: "",
    noneText: "",
    showNoneSection: false,
    tagsForRound: [],
  };
}

import { getRound5SelectionMeta } from "@/lib/reflection/round5Images";

/**
 * Merge current screen into answers before changing round (so Back can restore).
 */
export function persistCurrentRoundIntoAnswers({
  answers,
  currentRound,
  selectedOption,
  selectedImage,
  textValue,
  noneText,
  selectedTagsForRound,
  getRoundTag,
}) {
  if (selectedOption === "none") {
    return {
      ...answers,
      [currentRound]: {
        selectedType: "none",
        selectedImage: "none",
        image: null,
        selectedImageId: null,
        tag: undefined,
        tags: [],
        userExplanation: noneText,
        noneText,
        text: noneText,
      },
    };
  }

  if (selectedOption === "image" && typeof selectedImage === "number") {
    const prev = answers[currentRound] ?? {};
    const baseTag =
      (typeof getRoundTag === "function"
        ? getRoundTag(currentRound, selectedImage)
        : null) ?? prev.tag;
    const round5Meta =
      currentRound === 5 ? getRound5SelectionMeta(selectedImage) : null;
    return {
      ...answers,
      [currentRound]: {
        ...prev,
        selectedType: "image",
        image: selectedImage,
        selectedImageId: selectedImage,
        tag: baseTag ?? prev.tag,
        tags: selectedTagsForRound ?? [],
        userExplanation: "",
        text: textValue,
        ...(round5Meta && round5Meta.id
          ? {
              imageId: round5Meta.id,
              psychologicalTags: round5Meta.psychologicalTags,
            }
          : {}),
      },
    };
  }

  return answers;
}
