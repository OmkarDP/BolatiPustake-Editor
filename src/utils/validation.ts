import type { MergeOptions } from "@/types/audio-merge";

export type ValidationError = {
  field: string;
  message: string;
};

export const validateOutputFileName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return "Output file name is required";
  }
  if (name.length > 255) {
    return "Output file name must be less than 255 characters";
  }
  // Check for invalid filename characters
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(name)) {
    return "Output file name contains invalid characters";
  }
  return null;
};

export const validateConstantImageUrl = (url: string): string | null => {
  if (!url || url.trim().length === 0) {
    return null; // Optional field
  }
  try {
    new URL(url);
    return null;
  } catch {
    return "Invalid URL format";
  }
};

export const validateOptions = (options: MergeOptions): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (options.targetLoudnessLUFS !== null) {
    if (options.targetLoudnessLUFS < -70 || options.targetLoudnessLUFS > 0) {
      errors.push({
        field: "targetLoudnessLUFS",
        message: "Target loudness must be between -70 and 0 LUFS",
      });
    }
  }

  if (options.gapSeconds < 0 || options.gapSeconds > 60) {
    errors.push({
      field: "gapSeconds",
      message: "Gap must be between 0 and 60 seconds",
    });
  }

  return errors;
};

export const validateMergeRequest = (
  outputFileName: string,
  constantImageUrl: string,
  options: MergeOptions,
  selectedFiles: number
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const fileNameError = validateOutputFileName(outputFileName);
  if (fileNameError) {
    errors.push({ field: "outputFileName", message: fileNameError });
  }

  const urlError = validateConstantImageUrl(constantImageUrl);
  if (urlError) {
    errors.push({ field: "constantImageUrl", message: urlError });
  }

  if (selectedFiles === 0) {
    errors.push({ field: "selection", message: "Please select at least one audio file" });
  }

  errors.push(...validateOptions(options));

  return errors;
};
