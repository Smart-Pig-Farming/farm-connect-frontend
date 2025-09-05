// Utility functions for handling RTK Query errors

import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

/**
 * Type guard to check if error is a FetchBaseQueryError
 */
function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error != null && "status" in error;
}

/**
 * Type guard to check if error is a SerializedError
 */
function isSerializedError(error: unknown): error is SerializedError {
  return typeof error === "object" && error != null && "message" in error;
}

/**
 * Type guard to check if object has a string message property
 */
function hasStringMessage(obj: unknown): obj is { message: string } {
  return (
    typeof obj === "object" &&
    obj != null &&
    "message" in obj &&
    typeof (obj as Record<string, unknown>).message === "string"
  );
}

/**
 * Extract readable error message from RTK Query error
 */
export function getErrorMessage(error: unknown): string {
  if (!error) {
    return "An unknown error occurred";
  }

  // Handle RTK Query fetch errors
  if (isFetchBaseQueryError(error)) {
    // Handle HTTP status errors
    if (error.status === "FETCH_ERROR") {
      return "Network error - please check your connection";
    }

    if (error.status === "PARSING_ERROR") {
      return "Unable to parse server response";
    }

    if (error.status === "TIMEOUT_ERROR") {
      return "Request timed out - please try again";
    }

    if (typeof error.status === "number") {
      // Try to extract error message from response
      if (error.data && typeof error.data === "object") {
        const data = error.data as Record<string, unknown>;

        // Check for common error message patterns
        if (typeof data.message === "string") {
          return data.message;
        }

        if (data.error) {
          return typeof data.error === "string"
            ? data.error
            : hasStringMessage(data.error)
            ? data.error.message
            : "Server error";
        }

        if (typeof data.detail === "string") {
          return data.detail;
        }

        if (Array.isArray(data.errors)) {
          return data.errors
            .map((e: unknown) =>
              typeof e === "string"
                ? e
                : typeof e === "object" && e !== null
                ? (e as Record<string, unknown>).message || e
                : String(e)
            )
            .join(", ");
        }
      }

      // Fallback to HTTP status descriptions
      const statusMessages: Record<number, string> = {
        400: "Bad request - please check your input",
        401: "Authentication required - please sign in",
        403: "Permission denied - you don't have access to this resource",
        404: "Resource not found",
        409: "Conflict - resource already exists or is in use",
        422: "Invalid data provided",
        429: "Too many requests - please try again later",
        500: "Internal server error - please try again",
        502: "Server temporarily unavailable",
        503: "Service unavailable - please try again later",
      };

      return statusMessages[error.status] || `Server error (${error.status})`;
    }
  }

  // Handle serialized errors (network issues, etc.)
  if (isSerializedError(error)) {
    return error.message || "Request failed";
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Last resort for unknown error types
  return "An unexpected error occurred";
}

/**
 * Check if error indicates a network/connectivity issue
 */
export function isNetworkError(error: unknown): boolean {
  if (isFetchBaseQueryError(error)) {
    return error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR";
  }

  if (isSerializedError(error)) {
    const message = error.message?.toLowerCase() || "";
    return (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection") ||
      message.includes("timeout")
    );
  }

  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (isFetchBaseQueryError(error)) {
    return error.status === 400 || error.status === 422;
  }

  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (isFetchBaseQueryError(error)) {
    return error.status === 401 || error.status === 403;
  }

  return false;
}
