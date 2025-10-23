import validator from "validator";

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!validator.isEmail(email)) {
    return { isValid: false, message: "Invalid email format" };
  }
  return { isValid: true };
};

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

export const validateUsername = (username: string): ValidationResult => {
  if (validator.isEmpty(username.trim())) {
    return { isValid: false, message: "Username is required" };
  }

  if (!validator.isLength(username, { min: 3, max: 30 })) {
    return {
      isValid: false,
      message: "Username must be between 3 and 30 characters",
    };
  }

  return { isValid: true };
};

export const normalizeEmail = (email: string): string => {
  return validator.normalizeEmail(email) || email;
};

export const sanitizeString = (str: string): string => {
  return validator.trim(validator.escape(str));
};
