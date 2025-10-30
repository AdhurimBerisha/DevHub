import validator from "validator";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validatePassword = (password: string): ValidationResult => {
  if (!validator.isLength(password, { min: 8 })) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    return {
      isValid: false,
      message:
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    };
  }

  return { isValid: true };
};
